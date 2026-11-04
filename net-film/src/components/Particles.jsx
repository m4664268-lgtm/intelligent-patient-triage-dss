import React from 'react';
import { AbsoluteFill, random, useCurrentFrame, interpolate } from 'remotion';
import { clamp } from './fx';

// Deterministic depth-sorted dust: far = small + blurred, near = large + bokeh.
export const Particles = ({ count = 140, seed = 'dust', start = 0, cyanRatio = 0.14, camX = 0, intensity = 1 }) => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [start, start + 30], [0, 1], clamp) * intensity;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k) => random(`${seed}-${i}-${k}`);
        const z = 0.15 + r('z') * 0.85;
        const size = 3 + z * z * 26;
        const x = ((r('x') * 4400 - 280 + frame * (r('vx') - 0.5) * 3 * z - camX * z) % 4400 + 4400) % 4400 - 280;
        const y = ((r('y') * 2500 - frame * (0.6 + r('vy') * 2.2) * z) % 2500 + 2500) % 2500 - 170;
        const tw = 0.55 + 0.45 * Math.sin(frame * (0.05 + r('t') * 0.12) + r('p') * 6.28);
        const cyan = r('c') < cyanRatio;
        const blur = z > 0.85 ? (z - 0.85) * 60 : (1 - z) * 3;
        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%',
            background: cyan ? 'radial-gradient(circle, #d6f6ff 0%, #5fe1ff 40%, rgba(47,140,255,0) 70%)'
                             : 'radial-gradient(circle, #fff4d8 0%, #e2b874 42%, rgba(160,105,45,0) 72%)',
            opacity: appear * tw * (0.25 + z * 0.6), filter: `blur(${blur}px)`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};
