# HLS Ahead Privacy Policy

Effective date: July 31, 2026

HLS Ahead (the “Extension”) detects HLS (m3u8) playlists used by the active tab and prefetches upcoming media segments in an effort to reduce playback buffering.

Publisher: `[individual or company name]`  
Privacy contact: `[privacy contact email]`

## 1. Information processed

To provide this feature, the Extension may process the following information locally on the user's device:

- URLs of HLS/m3u8 playlists and related media resources requested by the active tab;
- the text content of m3u8 playlists;
- temporary authentication request headers required to request the same resource, such as `Authorization`, `X-Auth-Token`, or `X-API-Key`;
- network request activity in the active tab;
- user-selected limits for segment count, concurrency, and resource size; and
- temporary runtime statistics such as successful requests, failures, and transferred bytes.

The Extension does not read form entries, keystrokes, private communications, payment information, health information, or precise location.

## 2. How information is used

The information above is used only to identify and parse HLS playlists, request upcoming media resources from their original servers, show local runtime status, and save the user's Extension settings. It is not used for advertising, cross-site tracking, profiling, or decisions about credit or insurance eligibility, and it is not sold.

## 3. Transmission and sharing

The Extension has no developer-operated data collection server. It does not send page URLs, playlists, authentication information, or runtime statistics to the publisher.

To perform prefetching requested by the user, the Extension sends network requests to the server or CDN that already hosts the video content. These requests may use cookies or temporary authentication information already associated with the page. This transmission is limited to what is necessary for the feature, and the destination service's own privacy policy may also apply.

The publisher does not disclose user data to unrelated third parties except when required by law, needed to protect users or service security, or permitted during a business transfer with any consent required by applicable law.

## 4. Retention

- Playlist URLs, temporary authentication headers, and runtime statistics exist only in Extension memory. Authentication headers are deleted after the corresponding request completes or fails. Tab state is removed when the tab closes or when Chrome terminates the background service worker.
- Prefetch settings are stored locally by Chrome until the user changes them, clears Extension data, or uninstalls the Extension.
- Media resources may enter Chrome's temporary HTTP cache. Retention is controlled by Chrome and the resource server's cache policy; the publisher cannot access that cache.

## 5. Security

The Extension does not permanently store authentication information. All executable code is included in the installed package; the Extension does not download and execute remote code. Users should use the Extension only on trusted websites and sensitive information should be transmitted only over connections protected by modern encryption.

## 6. User choices

Users can pause prefetching for the active tab, change prefetch limits, close a tab to clear its temporary state, clear Extension storage, or uninstall the Extension to stop all processing.

Privacy questions and applicable data-rights requests may be sent to `[privacy contact email]`. Because the publisher does not receive browsing or playback data, the publisher normally has no corresponding server-side data to retrieve or delete.

## 7. Children

The Extension is not directed to children and does not knowingly collect children's personal information. Contact the publisher if you believe such information was received accidentally.

## 8. Chrome Web Store Limited Use

The Extension's use of information received from Chrome APIs complies with the Chrome Web Store User Data Policy, including the Limited Use requirements. Information is used only to provide or improve the prominently disclosed single-purpose feature. It is not used for personalized advertising and is not made available for human review except with the user's affirmative agreement for support, for security purposes, when required by law, or for other policy-permitted aggregated internal operations.

## 9. Changes

If the Extension's data practices change, the publisher will update this policy and the Chrome Web Store disclosures and will provide prominent notice or request consent where required. The effective date will also be updated.
