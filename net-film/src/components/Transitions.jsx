import React from 'react';
import { AbsoluteFill, random, useCurrentFrame, interpolate } from 'remotion';
import { clamp, lerp } from './fx';

const W = 3840, H = 2160, CX = W / 2, CY = H / 2;

// Opening light pulse: a seed of light that detonates into a shockwave ring + anamorphic streak.
export const LightPulse = ({ at = 8, cy = CY }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 60) return null;
  const core = interpolate(f, [0, 4, 14, 30], [0, 1, 0.8, 0], clamp);
  const ring = lerp(f, [2, 40], [0, 3200]);
  const ringO = interpolate(f, [2, 10, 40], [0, 0.9, 0], clamp);
  const flareW = lerp(f, [0, 16], [200, 4200]);
  const flareO = interpolate(f, [0, 5, 34], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen' }}>
      <div style={{ position: 'absolute', left: CX - 500, top: cy - 500, width: 1000, height: 1000, borderRadius: '50%', opacity: core,
        background: 'radial-gradient(circle, #ffffff 0%, #cfefff 4%, rgba(95,225,255,0.55) 12%, rgba(217,180,122,0.25) 30%, rgba(0,0,0,0) 62%)' }} />
      <div style={{ position: 'absolute', left: CX - ring / 2, top: cy - ring / 2, width: ring, height: ring, borderRadius: '50%', opacity: ringO,
        border: '5px solid rgba(246,226,179,0.75)', filter: 'blur(3px)', boxShadow: '0 0 120px 30px rgba(217,180,122,0.35), inset 0 0 160px 20px rgba(95,225,255,0.30)' }} />
      <div style={{ position: 'absolute', left: CX - flareW / 2, top: cy - 5, width: flareW, height: 10, opacity: flareO, filter: 'blur(2px)',
        background: 'linear-gradient(90deg, rgba(47,140,255,0) 0%, rgba(95,225,255,0.85) 35%, #ffffff 50%, rgba(95,225,255,0.85) 65%, rgba(47,140,255,0) 100%)',
        boxShadow: '0 0 40px 12px rgba(95,225,255,0.35)' }} />
    </AbsoluteFill>
  );
};

// Racing light trails that converge on the brand's centre line (built-in motion blur via long tails).
export const LightTrails = ({ from = 12, count = 18, seed = 'trail', cy = CY }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen', overflow: 'hidden' }}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k) => random(`${seed}-${i}-${k}`);
        const delay = from + Math.floor(r('d') * 26);
        const dur = 16 + Math.floor(r('dur') * 12);
        const p = (frame - delay) / dur;
        if (p < 0 || p > 1.25) return null;
        const dir = i % 2 === 0 ? 1 : -1;
        const len = 1100 + r('l') * 1600;
        const thick = 3 + r('t') * 9;
        const blue = r('b') < 0.32;
        const y0 = (r('y') - 0.5) * 1700;
        const pe = 1 - Math.pow(1 - Math.min(p, 1), 2.2);
        const x = dir > 0 ? -len + pe * (W + len * 2) : W + len - pe * (W + len * 2) - len;
        const y = cy + y0 * (1 - pe * 0.82);
        const angle = Math.atan2(-y0 * 0.82, W) * (180 / Math.PI) * dir;
        const o = interpolate(p, [0, 0.12, 0.85, 1.2], [0, 1, 1, 0], clamp);
        const c = blue ? '95,225,255' : '238,204,146';
        const grad = dir > 0
          ? `linear-gradient(90deg, rgba(${c},0) 0%, rgba(${c},0.75) 78%, #fff 98%, rgba(255,255,255,0) 100%)`
          : `linear-gradient(270deg, rgba(${c},0) 0%, rgba(${c},0.75) 78%, #fff 98%, rgba(255,255,255,0) 100%)`;
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y - thick / 2, width: len, height: thick, opacity: o,
            transform: `rotate(${angle}deg)`, background: grad, borderRadius: thick,
            boxShadow: `0 0 ${18 + thick * 3}px ${thick}px rgba(${c},0.35)`, filter: `blur(${thick > 9 ? 1.5 : 0.6}px)` }} />
        );
      })}
    </AbsoluteFill>
  );
};

// Fast cinematic push + gold flash used to hand over to the next scene (last ~12 frames).
export const FlareHandoff = ({ at, dur = 12 }) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  const o = interpolate(f, [0, dur * 0.75, dur], [0, 0.85, 1], clamp);
  const w = lerp(f, [0, dur], [600, 6000]);
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: CX - w / 2, top: CY - 3, width: w, height: 6, opacity: o,
        background: 'linear-gradient(90deg, transparent, #f6e2b3 40%, #fff 50%, #f6e2b3 60%, transparent)',
        boxShadow: '0 0 120px 40px rgba(217,180,122,0.5)' }} />
      <AbsoluteFill style={{ opacity: interpolate(f, [dur * 0.5, dur], [0, 0.55], clamp),
        background: 'radial-gradient(ellipse at center, rgba(246,226,179,0.9) 0%, rgba(138,90,43,0.2) 40%, transparent 70%)' }} />
    </AbsoluteFill>
  );
};
