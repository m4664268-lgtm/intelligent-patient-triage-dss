import { interpolate, Easing } from 'remotion';
export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
export const ease = Easing.bezier(0.22, 1, 0.36, 1);      // expo-out feel
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const lerp = (f, inR, outR, e = ease) => interpolate(f, inR, outR, { ...clamp, easing: e });
