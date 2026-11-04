import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';

/** Out-of-focus city/office bokeh (depth-of-field highlights). */
export const Bokeh = ({ count = 36, seed = 'bokeh', warmRatio = 0.7, top = 0, height = 2160, opacity = 1, drift = 0.4 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity }}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k) => random(`${seed}-${i}-${k}`);
        const size = 60 + r('s') * 220;
        const warm = r('w') < warmRatio;
        const x = r('x') * 4200 - 180 + f * drift * (r('v') - 0.3);
        const y = top + r('y') * height;
        const tw = 0.6 + 0.4 * Math.sin(f * 0.04 + r('p') * 6.28);
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%',
          opacity: (0.08 + r('o') * 0.22) * tw, filter: `blur(${4 + r('b') * 10}px)`,
          background: warm ? 'radial-gradient(circle, rgba(255,214,160,0.9) 0%, rgba(217,160,90,0.5) 55%, rgba(217,160,90,0) 72%)'
                           : 'radial-gradient(circle, rgba(170,230,255,0.9) 0%, rgba(47,140,255,0.45) 55%, rgba(47,140,255,0) 72%)',
          border: warm ? '2px solid rgba(255,220,170,0.25)' : '2px solid rgba(150,220,255,0.2)' }} />;
      })}
    </AbsoluteFill>
  );
};

/** Receding perspective floor grid that streams toward the camera. */
export const PerspectiveGrid = ({ speed = 6, color = '217,180,122', alpha = 0.32, top = 1250, cell = 220, tilt = 74 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: -3000, right: -3000, top, height: 3400, transformOrigin: '50% 0%',
      transform: `perspective(1200px) rotateX(${tilt}deg)`,
      backgroundImage: `linear-gradient(rgba(${color},${alpha}) 3px, transparent 3px), linear-gradient(90deg, rgba(${color},${alpha}) 3px, transparent 3px)`,
      backgroundSize: `${cell}px ${cell}px`, backgroundPosition: `0px ${(f * speed) % cell}px`,
      WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 22%, #000 60%, rgba(0,0,0,0) 100%)' }} />
  );
};

/** Ceiling light rows converging to a vanishing point (office corridor / factory hall). */
export const CeilingLights = ({ rows = 9, vpX = 1500, vpY = 760, color = '255,226,180', alpha = 0.8, speed = 0.012, width = 3840 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={width} height={2160} style={{ position: 'absolute', inset: 0 }}>
      <defs><filter id="clb"><feGaussianBlur stdDeviation="6" /></filter></defs>
      {new Array(rows).fill(0).map((_, i) => {
        const z = ((i / rows + f * speed) % 1);
        const k = Math.pow(z, 2.2); // perspective spacing
        const y = vpY - 40 - k * 900;
        const half = 60 + k * 2600;
        return (
          <g key={i} opacity={alpha * Math.min(1, z * 3)}>
            <line x1={vpX - half} y1={y} x2={vpX + half} y2={y} stroke={`rgba(${color},0.9)`} strokeWidth={2 + k * 18} filter="url(#clb)" strokeDasharray={`${20 + k * 260} ${30 + k * 380}`} />
            <line x1={vpX - half} y1={y} x2={vpX + half} y2={y} stroke="#fff8ea" strokeWidth={1 + k * 5} strokeDasharray={`${20 + k * 260} ${30 + k * 380}`} />
          </g>
        );
      })}
    </svg>
  );
};
