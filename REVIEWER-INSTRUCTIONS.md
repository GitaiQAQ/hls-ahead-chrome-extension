# Chrome Web Store reviewer instructions

No account, payment, or test credentials are required.

1. Install the Extension and open `https://hlsjs.video-dev.org/demo/`.
2. Start an HLS sample video.
3. Select the HLS Ahead toolbar icon.
4. Confirm that a detected m3u8 URL appears under the recent-playlist section and that the status changes to prefetching or completed.
5. Confirm that the fetched-resource or transferred-data values increase. A failure count or compatibility-mode message may appear if the test server or browser blocks a cross-origin request.
6. Turn off the switch. Confirm that the active tab shows a paused status and no new prefetch starts.
7. Expand the settings, change the segment count, save it, and select the retry button. Confirm that the setting remains and the latest playlist is retried.

Expected behavior: the Extension temporarily requests resources from the same origin/CDN already serving the selected video. It does not permanently download, export, or upload media.

## Reviewer contact

- Contact name: `[review contact name]`
- Contact email: `[review contact email]`
- Optional notes or alternate test page: `[details]`
