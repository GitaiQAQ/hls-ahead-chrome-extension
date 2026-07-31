const DEFAULTS = {
  enabled: true,
  maxSegments: 12,
  concurrency: 3,
  maxResourceMB: 40
};

const tabState = new Map();
const requestHeaders = new Map();
const running = new Set();

function stateFor(tabId) {
  if (!tabState.has(tabId)) {
    tabState.set(tabId, {
      enabled: true,
      manifests: [],
      status: "等待发现 m3u8",
      fetched: 0,
      skipped: 0,
      failed: 0,
      bytes: 0,
      updatedAt: Date.now()
    });
  }
  return tabState.get(tabId);
}

async function settings() {
  return { ...DEFAULTS, ...(await chrome.storage.local.get(DEFAULTS)) };
}

function isManifestUrl(url) {
  try {
    const parsed = new URL(url);
    return /\.m3u8(?:$|[?#])/i.test(url) || /(?:^|[?&])[^=]*(?:m3u8|manifest)[^=]*=/i.test(parsed.search);
  } catch {
    return false;
  }
}

function isManifestResponse(details) {
  const contentType = (details.responseHeaders || [])
    .find((header) => header.name.toLowerCase() === "content-type")?.value || "";
  return isManifestUrl(details.url) || /(?:mpegurl|m3u8)/i.test(contentType);
}

function safeHeaders(headers = []) {
  const allowed = new Set(["authorization", "x-auth-token", "x-api-key"]);
  return Object.fromEntries(
    headers
      .filter((header) => allowed.has(header.name.toLowerCase()))
      .map((header) => [header.name, header.value || ""])
  );
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (details.tabId >= 0) requestHeaders.set(details.requestId, safeHeaders(details.requestHeaders));
  },
  { urls: ["<all_urls>"], types: ["xmlhttprequest", "media", "other"] },
  ["requestHeaders", "extraHeaders"]
);

chrome.webRequest.onCompleted.addListener(
  (details) => {
    const headers = requestHeaders.get(details.requestId) || {};
    requestHeaders.delete(details.requestId);
    if (details.tabId < 0 || details.statusCode >= 400 || !isManifestResponse(details)) return;
    discover(details.tabId, details.url, headers);
  },
  { urls: ["<all_urls>"], types: ["xmlhttprequest", "media", "other"] },
  ["responseHeaders", "extraHeaders"]
);

chrome.webRequest.onErrorOccurred.addListener(
  (details) => requestHeaders.delete(details.requestId),
  { urls: ["<all_urls>"] }
);

async function discover(tabId, url, headers = {}, force = false) {
  const config = await settings();
  const state = stateFor(tabId);
  if (!config.enabled || !state.enabled) return;

  const key = `${tabId}:${url}`;
  if (running.has(key)) return;
  const previous = state.manifests.find((item) => item.url === url);
  if (!force && previous && Date.now() - previous.seenAt < 10_000) return;

  state.manifests = [
    { url, seenAt: Date.now() },
    ...state.manifests.filter((item) => item.url !== url)
  ].slice(0, 8);
  state.status = "正在预拉取";
  state.updatedAt = Date.now();
  running.add(key);
  updateBadge(tabId, state);

  try {
    let result;
    try {
      result = await runInPage(tabId, url, headers, config, false);
    } catch (pageError) {
      const resources = await parseInBackground(url, headers, config);
      result = await runInPage(tabId, url, headers, config, true, resources);
      result.fallback = true;
      result.note = pageError.message;
    }

    state.fetched += result.fetched || 0;
    state.skipped += result.skipped || 0;
    state.failed += result.failed || 0;
    state.bytes += result.bytes || 0;
    state.status = result.fallback ? "预拉取完成（兼容模式）" : "预拉取完成";
    state.lastResult = result;
  } catch (error) {
    state.failed += 1;
    state.status = `无法预拉取：${error.message}`;
    state.lastResult = { error: error.message };
  } finally {
    state.updatedAt = Date.now();
    running.delete(key);
    updateBadge(tabId, state);
  }
}

async function runInPage(tabId, manifestUrl, headers, config, opaqueOnly, resources = []) {
  const injection = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: pagePrefetch,
    args: [{ manifestUrl, headers, config, opaqueOnly, resources }]
  });
  const result = injection?.[0]?.result;
  if (!result) throw new Error("页面脚本未返回结果");
  if (result.error) throw new Error(result.error);
  return result;
}

async function pagePrefetch(input) {
  const { manifestUrl, headers, config, opaqueOnly } = input;
  const maxBytes = config.maxResourceMB * 1024 * 1024;
  const output = { fetched: 0, skipped: 0, failed: 0, bytes: 0, resources: [] };

  async function fetchResource(item, opaque = false) {
    try {
      const response = await fetch(item.url || item, {
        method: "GET",
        headers: opaque ? {} : headers,
        credentials: "include",
        cache: "force-cache",
        mode: opaque ? "no-cors" : "cors"
      });
      const length = Number(response.headers?.get("content-length") || 0);
      if (length > maxBytes) {
        output.skipped += 1;
        return;
      }
      if (!opaque && !response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.arrayBuffer();
      output.fetched += 1;
      output.bytes += body.byteLength || length;
      output.resources.push((item.url || item).slice(0, 300));
    } catch {
      output.failed += 1;
    }
  }

  async function pool(items, worker) {
    let cursor = 0;
    const count = Math.min(config.concurrency, items.length);
    await Promise.all(Array.from({ length: count }, async () => {
      while (cursor < items.length) {
        const item = items[cursor++];
        await worker(item);
      }
    }));
  }

  if (opaqueOnly) {
    await pool(input.resources.slice(0, config.maxSegments + 2), (item) => fetchResource(item, true));
    return output;
  }

  function absolute(uri, base) {
    return new URL(uri.trim(), base).href;
  }

  function attribute(line, name) {
    const match = line.match(new RegExp(`${name}=(?:"([^"]+)"|([^,]+))`, "i"));
    return match ? (match[1] || match[2]) : null;
  }

  function parse(text, base) {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const variants = [];
    const media = [];
    const segments = [];
    const extras = [];
    let pendingBandwidth = null;
    for (const line of lines) {
      if (line.startsWith("#EXT-X-STREAM-INF:")) {
        pendingBandwidth = Number(attribute(line, "BANDWIDTH") || 0);
      } else if (!line.startsWith("#")) {
        if (pendingBandwidth !== null) variants.push({ url: absolute(line, base), bandwidth: pendingBandwidth });
        else segments.push({ url: absolute(line, base) });
        pendingBandwidth = null;
      } else if (/^#EXT-X-(?:MAP|KEY):/i.test(line)) {
        const uri = attribute(line, "URI");
        if (uri && !/^data:/i.test(uri)) extras.push({ url: absolute(uri, base) });
      }
    }
    const live = !lines.includes("#EXT-X-ENDLIST");
    return { variants, media, segments, extras, live };
  }

  async function loadManifest(url, depth = 0) {
    if (depth > 2) throw new Error("m3u8 嵌套层级过深");
    const response = await fetch(url, { headers, credentials: "include", cache: "default" });
    if (!response.ok) throw new Error(`m3u8 HTTP ${response.status}`);
    const parsed = parse(await response.text(), url);
    if (parsed.variants.length) {
      const selected = parsed.variants.sort((a, b) => b.bandwidth - a.bandwidth)[0];
      return loadManifest(selected.url, depth + 1);
    }
    const chosen = parsed.live
      ? parsed.segments.slice(-config.maxSegments)
      : parsed.segments.slice(0, config.maxSegments);
    const unique = [...new Map([...parsed.extras, ...chosen].map((item) => [item.url, item])).values()];
    await pool(unique, (item) => fetchResource(item));
  }

  await loadManifest(manifestUrl);
  return output;
}

async function parseInBackground(manifestUrl, headers, config) {
  const seen = new Set();
  async function load(url, depth = 0) {
    if (depth > 2) throw new Error("m3u8 嵌套层级过深");
    const response = await fetch(url, { headers, credentials: "include", cache: "no-store" });
    if (!response.ok) throw new Error(`后台读取 m3u8 失败：HTTP ${response.status}`);
    const text = await response.text();
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const variants = [];
    const segments = [];
    const extras = [];
    let pendingBandwidth = null;
    const attr = (line, name) => {
      const match = line.match(new RegExp(`${name}=(?:"([^"]+)"|([^,]+))`, "i"));
      return match ? (match[1] || match[2]) : null;
    };
    for (const line of lines) {
      if (line.startsWith("#EXT-X-STREAM-INF:")) {
        pendingBandwidth = Number(attr(line, "BANDWIDTH") || 0);
      } else if (!line.startsWith("#")) {
        const item = { url: new URL(line, url).href };
        if (pendingBandwidth !== null) {
          variants.push({ ...item, bandwidth: pendingBandwidth });
          pendingBandwidth = null;
        } else segments.push(item);
      } else if (/^#EXT-X-(?:MAP|KEY):/i.test(line)) {
        const uri = attr(line, "URI");
        if (uri && !/^data:/i.test(uri)) extras.push({ url: new URL(uri, url).href });
      }
    }
    if (variants.length) {
      variants.sort((a, b) => b.bandwidth - a.bandwidth);
      return load(variants[0].url, depth + 1);
    }
    const live = !lines.includes("#EXT-X-ENDLIST");
    const chosen = live ? segments.slice(-config.maxSegments) : segments.slice(0, config.maxSegments);
    return [...extras, ...chosen].filter((item) => !seen.has(item.url) && seen.add(item.url));
  }
  return load(manifestUrl);
}

function updateBadge(tabId, state) {
  const text = state.status === "正在预拉取" ? "…" : state.fetched ? String(Math.min(state.fetched, 99)) : "";
  chrome.action.setBadgeText({ tabId, text }).catch(() => {});
  chrome.action.setBadgeBackgroundColor({ tabId, color: state.failed ? "#c2410c" : "#1677ff" }).catch(() => {});
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    const tabId = message.tabId ?? sender.tab?.id;
    if (message.type === "getState") {
      sendResponse({ state: stateFor(tabId), settings: await settings() });
    } else if (message.type === "setTabEnabled") {
      const state = stateFor(tabId);
      state.enabled = Boolean(message.enabled);
      state.status = state.enabled ? "等待发现 m3u8" : "此页面已暂停";
      updateBadge(tabId, state);
      sendResponse({ ok: true });
    } else if (message.type === "saveSettings") {
      await chrome.storage.local.set(message.settings);
      sendResponse({ ok: true });
    } else if (message.type === "retry") {
      const state = stateFor(tabId);
      const item = state.manifests[0];
      if (item) discover(tabId, item.url, {}, true);
      sendResponse({ ok: Boolean(item) });
    }
  })();
  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => tabState.delete(tabId));
