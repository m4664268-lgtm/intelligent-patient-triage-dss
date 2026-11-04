import { interpolate } from 'remotion';
import { clamp, easeInOut } from './fx';

/**
 * Cinematic virtual camera. Returns a function layer(depth) that gives each layer its own parallax:
 * depth 0 = infinitely far (static), 1 = subject plane, >1 = foreground (moves faster than subject).
 */
export const useCamera = (frame, dur, { push = [0, 0.07], x = [50, -50], y = [15, -15], rot = [0, 0], origin = '50% 50%' } = {}) => {
  const p = interpolate(frame, [0, dur], [0, 1], { ...clamp, easing: easeInOut });
  const zoom = interpolate(p, [0, 1], push);
  const cx = interpolate(p, [0, 1], x);
  const cy = interpolate(p, [0, 1], y);
  const r = interpolate(p, [0, 1], rot);
  const layer = (depth) => ({
    position: 'absolute', inset: 0, transformOrigin: origin,
    transform: `translate(${cx * depth}px, ${cy * depth}px) scale(${1 + zoom * depth}) rotate(${r * depth}deg)`,
  });
  return { layer, cx, cy, zoom };
};
