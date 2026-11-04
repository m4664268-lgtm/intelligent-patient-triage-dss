# NET Business Solutions — Cinematic Film (Remotion)

45 s · 3840×2160 · 30 fps · H.264 MP4 · AAC 48 kHz

## Setup
```bash
npm install
npm run audio          # regenerate the procedural music / SFX stems (python3 + numpy)
npm run studio         # live editor in the browser
```

## Render
```bash
npm run preview:opening   # 00:00–00:05 at 1080p preview (out/preview-opening-1080p.mp4)
npm run render:4k         # full film, native 3840×2160, CRF 14
```

## Structure
- `src/timeline.js` — all scene timings (120 BPM grid: 1 beat = 15 frames)
- `src/audioManifest.js` — every music/SFX/VO cue + music ducking
- `src/scenes/*` — one component per scene; `src/components/*` — shared building blocks
- `public/assets/net-logo.png` — the official logo, used untouched (never redrawn)

## Voiceover
Put real recordings in `public/assets/voiceover/` (WAV 48 kHz), then set `ready: true` on the line in
`src/audioManifest.js`. Music ducks automatically while each line plays.

## Arabic text
Fonts come bundled via npm (`@fontsource/alexandria`, `@fontsource/ibm-plex-sans-arabic`), so no system
fonts are needed. Rendering waits until they have loaded, so no frame ever falls back to another font.
Text is RTL (`.ar` class) and animates word by word, so letter joins never break.
