// Single source of truth for timing. 120 BPM grid: 1 beat = 15 frames.
export const FPS = 30;
export const WIDTH = 3840;
export const HEIGHT = 2160;
export const TOTAL_FRAMES = 45 * FPS; // 1350 — exactly 45 s
const s = (sec) => Math.round(sec * FPS);
export const SCENES = {
  opening:    { from: s(0),  duration: s(5) },
  business:   { from: s(5),  duration: s(8) },
  hr:         { from: s(13), duration: s(7) },
  government: { from: s(20), duration: s(7) },
  consulting: { from: s(27), duration: s(6) },
  industrial: { from: s(33), duration: s(6) },
  closing:    { from: s(39), duration: s(6) },
};
