let tabId;

const $ = (id) => document.getElementById(id);

function bytes(value) {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

async function load() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  tabId = tab.id;
  const { state, settings } = await chrome.runtime.sendMessage({ type: "getState", tabId });
  $("enabled").checked = state.enabled;
  $("status").textContent = state.status;
  $("fetched").textContent = state.fetched;
  $("bytes").textContent = bytes(state.bytes);
  $("failed").textContent = state.failed;
  $("maxSegments").value = settings.maxSegments;
  $("concurrency").value = settings.concurrency;
  $("maxResourceMB").value = settings.maxResourceMB;
  $("retry").disabled = !state.manifests.length;
  $("empty").hidden = Boolean(state.manifests.length);
  $("manifests").replaceChildren(...state.manifests.map((item) => {
    const li = document.createElement("li");
    li.textContent = item.url;
    li.title = item.url;
    return li;
  }));
  if (state.lastResult?.note) $("hint").textContent = "页面跨域受限，已使用兼容模式。";
}

$("enabled").addEventListener("change", async (event) => {
  await chrome.runtime.sendMessage({ type: "setTabEnabled", tabId, enabled: event.target.checked });
  load();
});

$("save").addEventListener("click", async () => {
  const settings = {
    maxSegments: Math.max(1, Math.min(50, Number($("maxSegments").value))),
    concurrency: Math.max(1, Math.min(8, Number($("concurrency").value))),
    maxResourceMB: Math.max(1, Math.min(500, Number($("maxResourceMB").value)))
  };
  await chrome.runtime.sendMessage({ type: "saveSettings", settings });
  $("hint").textContent = "设置已保存";
});

$("retry").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "retry", tabId });
  $("hint").textContent = "已开始预拉取";
  setTimeout(load, 800);
});

load();
