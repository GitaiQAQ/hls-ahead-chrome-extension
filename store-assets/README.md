# Chrome Web Store visual assets

Binary image files are intentionally **not committed** because this repository's review/MR channel does not support binary diffs. `prompts.jsonl` is the source specification for all visual assets and is designed for `gpt-image-2`.

## Generate with GPT Image 2

Set `OPENAI_API_KEY` in your shell; never commit it or paste it into an issue. Then run the installed image-generation skill CLI:

```bash
export IMAGE_GEN="${CODEX_HOME:-$HOME/.codex}/skills/.system/imagegen/scripts/image_gen.py"
mkdir -p output/imagegen/store-assets
python "$IMAGE_GEN" generate-batch \
  --model gpt-image-2 \
  --input store-assets/prompts.jsonl \
  --out-dir output/imagegen/store-assets \
  --concurrency 3
```

Review every generated image for text accuracy and faithful representation of the extension. Regenerate any incorrect image with a more targeted prompt rather than editing misleading text into it.

## Required exports

Generated source artwork must be cropped or resized into these final deliverables outside Git:

- icons: transparent or opaque PNG at 16×16, 32×32, 48×48, and 128×128;
- screenshots: four PNG/JPEG files at 1280×800 (or 640×400);
- small promotional tile: PNG/JPEG at 440×280;
- optional marquee tile: PNG/JPEG at 1400×560.

Before packaging the extension, place the four icon exports in `icons/` and add their paths to `manifest.json`. Store screenshots and promotional images should be uploaded directly in the Chrome Web Store Developer Dashboard, not included in the extension ZIP.

## Prompt mapping

The six JSONL rows produce, in order: the app-icon source, automatic detection screenshot, statistics screenshot, settings screenshot, paused-state screenshot, and crop-safe promotional source.
