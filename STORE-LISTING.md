# HLS Ahead — localized Chrome Web Store listing

Use Simplified Chinese as the default store language and add English as a localized listing. The text below is ready to paste into the Chrome Web Store Developer Dashboard after replacing publisher placeholders in the privacy policies.

## Simplified Chinese (`zh_CN`)

### 名称

HLS Ahead

### 简短说明

检测当前页面的 HLS 播放清单并预取后续媒体分片，尝试减少网络波动造成的播放等待。

### 详细说明

HLS Ahead 检测当前标签页正在使用的 HLS（m3u8）播放清单，并提前请求接下来可能播放的媒体分片，尝试利用浏览器临时缓存减少播放过程中的等待。

主要功能：

- 自动识别当前页面中的 m3u8/HLS 请求
- 解析主清单和媒体清单
- 默认选择最高码率线路，避免同时请求所有清晰度
- 可设置预取分片数量、并发数和单个资源大小上限
- 显示最近发现的清单、预取数量、流量和失败状态
- 可按当前标签页随时暂停或重新开始预取

所有处理均在用户设备上完成。扩展不会将播放地址、清单、鉴权信息或统计数据发送给开发者，也不会永久保存或导出视频。扩展不绕过 DRM、付费限制或网站访问控制。

预取效果取决于网站、播放器和资源服务器的缓存策略。使用 `Cache-Control: no-store`、一次性链接或 DRM 的内容可能无法获得改善。请仅在你有权访问和播放相关内容的网站上使用。

### 单一用途

检测当前标签页正在使用的 HLS 播放清单，并从原资源服务器预取后续媒体分片，以减少播放缓冲等待。

## English (`en`)

### Name

HLS Ahead

### Short description

Detect HLS playlists on the current page and prefetch upcoming media segments to help reduce playback buffering.

### Detailed description

HLS Ahead detects the HLS (m3u8) playlist used by the active tab and requests media segments that are likely to play next. This can let Chrome's temporary HTTP cache reduce playback interruptions caused by network variation.

Features:

- Detect m3u8/HLS requests made by the active page
- Parse master and media playlists
- Select the highest-bandwidth variant by default instead of requesting every quality
- Configure segment count, request concurrency, and per-resource size limits
- View recently detected playlists, prefetched resources, transferred bytes, and failures
- Pause or retry prefetching for the active tab at any time

Processing happens on the user's device. The Extension does not send playback URLs, playlists, authentication information, or statistics to the developer. It does not permanently save or export videos and does not bypass DRM, paywalls, or website access controls.

Results depend on the website, player, and resource server cache policy. Content using `Cache-Control: no-store`, one-time URLs, or DRM may not benefit. Use the Extension only for content you are authorized to access and play.

### Single purpose

Detect the HLS playlist used by the active tab and prefetch upcoming media segments from the original resource server to reduce playback buffering.

## Classification and distribution

- Category: **Tools**
- Mature content: **No**
- Pricing: **Free**
- In-app purchases: **None**
- Recommended initial visibility: **Unlisted**, followed by **Public** after testing
- Regions: **All regions**, subject to the publisher's legal and content obligations
- Default language: **Chinese (Simplified)**

## Suggested search concepts

HLS, m3u8, video buffering, media prefetch, playback optimization. Do not repeat these unnaturally or make unsupported performance claims.
