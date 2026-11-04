// Local (per-scene) frame cues for titles and bullet items — aligned with the narration and the
// 120 BPM grid (15 frames per beat). Audio hits in audioManifest.js are derived from these.
export const CUES = {
  business:   { title: 12, items: [45, 82, 120] },
  hr:         { title: 18, items: [52, 84, 112] },
  government: { title: 14, items: [92, 108, 124, 142] },
  consulting: { title: 12, items: [60, 92] },
  industrial: { title: 16, items: [64, 104] },
  closing:    { frame: 8, text: 50, finalHit: 138 },
};
