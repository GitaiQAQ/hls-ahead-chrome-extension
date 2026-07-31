# Chrome Web Store privacy and permission disclosures

This file is a paste-ready worksheet for the Developer Dashboard. It reflects version `0.1.0`; re-audit it whenever behavior or permissions change.

## Data disclosure selections

Select these data categories:

- **Authentication information** — temporary `Authorization`, `X-Auth-Token`, or `X-API-Key` request headers may be processed solely to request the original playback resource; they are not persisted.
- **Web history** — URLs of m3u8 playlists and media resources requested by the active page are processed in memory.
- **User activity** — network request activity in the active tab is observed to detect HLS playback; clicks, typing, and scrolling are not recorded.
- **Website content** — m3u8 playlist text is read to identify upcoming media segments.

Do not select personally identifiable information, health information, financial and payment information, personal communications, location, or user-generated content unless a future version actually begins processing it.

## Data-use certifications

- Sold to third parties: **No**
- Used or transferred for purposes unrelated to the single purpose: **No**
- Used for creditworthiness, lending, or insurance eligibility: **No**
- Used for personalized advertising or remarketing: **No**
- Sent to developer-operated servers: **No**
- Allowed to be read by the developer or other people: **No**
- Used only to provide the prominently disclosed user-facing feature: **Yes**
- Complies with the Chrome Web Store User Data Policy Limited Use requirements: **Yes**

Requests made to the video origin or its CDN are required to deliver the prefetch feature and are not transfers to the extension publisher.

## Permission justifications

### `storage`

Stores only the user's segment-count, request-concurrency, and per-resource-size preferences locally on the device. It is not used to store video content, browsing history, or authentication information.

### `webRequest`

Detects completed HLS/m3u8 requests in the active tab, their response type, and temporary authentication headers needed for the same playback resource. This information is used only to parse and prefetch that playback resource.

### `scripting`

Runs the prefetch operation in the active page's network context so it can use that page's cookies, authentication environment, and Chrome cache partition. It does not modify page content or inject advertising.

### `tabs`

The current implementation uses the active tab ID and removes temporary state when a tab closes. Before submission, remove this permission if Chrome testing confirms those operations work without it; retaining an unnecessary permission conflicts with least-privilege review expectations.

### Host permission: `<all_urls>`

HLS playlists and media segments can be hosted by any CDN domain, separate from the page the user visits. This access is used to detect HLS requests that the page actually makes and to prefetch resources from their original servers. The Extension does not scan websites the user has not visited and does not send URLs or page data to the publisher.

## Remote code

- Uses remote code: **No**
- Explanation: **All JavaScript is packaged with the Extension. Remotely retrieved m3u8 playlists and media segments are processed only as data and are never executed as code. The Extension does not use eval, remote scripts, or WebAssembly.**

## Policy URL

Host `PRIVACY-POLICY-ZH.md` and `PRIVACY-POLICY-EN.md` at a public, login-free HTTPS URL. Replace every bracketed publisher and contact placeholder before publishing, and enter the resulting URL in the dashboard.
