import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';

export const W = 3840, H = 2160;
export const MIRROR_Y = 1532;

/**
 * The film's "home" set (used by the opening and the closing): fluted bronze wall, Riyadh window,
 * volumetric beams, glossy black marble stage, halo arc and pedestal ring.
 * The window plate is cropped from the approved reference image (no baked logo / no flag).
 */
export const LuxuryStage = ({ f, layer, env = 1, impact = 0, haloDraw = 0, ringDraw = 0, warm = 1 }) => {
  const haloSpin = f * 0.9;
  const beam = 0.5 + 0.2 * Math.sin(f * 0.05);
  return (
    <>
      <div style={{ ...layer(0.35), opacity: env }}>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 42%, #0e1a33 0%, #070d1c 45%, #020409 100%)' }} />
        <AbsoluteFill style={{
          background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 104px, rgba(190,140,80,0.10) 108px, rgba(255,214,150,0.32) 110px, rgba(190,140,80,0.10) 112px, rgba(0,0,0,0) 116px)',
          WebkitMaskImage: 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.7) 22%, rgba(0,0,0,0) 42%)',
          maskImage: 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.7) 22%, rgba(0,0,0,0) 42%)' }} />
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(1,2,5,0.85) 0%, rgba(1,2,5,0) 30%, rgba(1,2,5,0) 60%, rgba(1,2,5,0.9) 76%)' }} />
        <div style={{ position: 'absolute', right: -120, top: -40, width: 1420, height: 2420,
          WebkitMaskImage: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 26%)', maskImage: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 26%)' }}>
          <Img src={staticFile('assets/skyline-plate.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover',
            filter: `blur(7px) brightness(${0.78 * warm}) saturate(0.95) contrast(1.05)` }} />
        </div>
        <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: beam * env }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: 'absolute', left: 1500 + i * 420, top: -500, width: 380 - i * 60, height: 3400,
              transform: `rotate(${28 + i * 3}deg)`, filter: 'blur(60px)',
              background: 'linear-gradient(180deg, rgba(255,205,140,0.0) 0%, rgba(255,205,140,0.16) 35%, rgba(255,205,140,0.0) 80%)' }} />
          ))}
        </AbsoluteFill>
      </div>

      <div style={{ ...layer(0.6), opacity: env }}>
        <div style={{ position: 'absolute', left: -400, right: -400, top: MIRROR_Y, bottom: -200,
          background: 'linear-gradient(180deg, #0b0f18 0%, #05070c 30%, #020306 100%)', boxShadow: 'inset 0 6px 30px rgba(217,180,122,0.18)' }} />
        <div style={{ position: 'absolute', right: -120, top: MIRROR_Y, width: 1420, height: 700, overflow: 'hidden', opacity: 0.22,
          WebkitMaskImage: 'linear-gradient(180deg, #000 0%, rgba(0,0,0,0) 85%), linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 30%)',
          WebkitMaskComposite: 'source-in', maskComposite: 'intersect',
          maskImage: 'linear-gradient(180deg, #000 0%, rgba(0,0,0,0) 85%), linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 30%)' }}>
          <Img src={staticFile('assets/skyline-plate.jpg')} style={{ position: 'absolute', top: -(2420 - (MIRROR_Y + 40)), width: 1420, height: 2420,
            objectFit: 'cover', transform: 'scaleY(-1)', transformOrigin: '50% 50%', filter: 'blur(14px) brightness(0.9)' }} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: MIRROR_Y - 2, height: 4,
          background: 'linear-gradient(90deg, rgba(217,180,122,0) 0%, rgba(217,180,122,0.55) 30%, rgba(255,236,196,0.85) 50%, rgba(217,180,122,0.55) 70%, rgba(217,180,122,0) 100%)',
          boxShadow: '0 0 40px 8px rgba(217,180,122,0.18)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: MIRROR_Y - 260, height: 260,
          background: 'linear-gradient(180deg, rgba(2,4,9,0) 0%, rgba(2,4,9,0.55) 100%)' }} />
        <div style={{ position: 'absolute', left: 2500, top: MIRROR_Y + 30, width: 1500, height: 520, mixBlendMode: 'screen', filter: 'blur(40px)',
          background: 'radial-gradient(ellipse at 60% 30%, rgba(255,190,130,0.22), rgba(0,0,0,0) 70%)' }} />
      </div>

      <div style={layer(0.75)}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            <linearGradient id="goldStroke" x1="0" x2="1" gradientTransform={`rotate(${haloSpin % 360} .5 .5)`}>
              <stop offset="0" stopColor="#6e4620" stopOpacity="0.2" />
              <stop offset="0.45" stopColor="#e9c48a" />
              <stop offset="0.52" stopColor="#fff6e0" />
              <stop offset="0.6" stopColor="#e9c48a" />
              <stop offset="1" stopColor="#6e4620" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="14" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <ellipse cx={W / 2} cy={70} rx={1640} ry={330} fill="none" stroke="url(#goldStroke)" strokeWidth={9} filter="url(#glow)"
            pathLength={1} strokeDasharray="1" strokeDashoffset={haloDraw} opacity={0.85 * env} />
          <ellipse cx={W / 2} cy={MIRROR_Y + 120} rx={1350} ry={118} fill="none" stroke="url(#goldStroke)" strokeWidth={7} filter="url(#glow)"
            pathLength={1} strokeDasharray="1" strokeDashoffset={ringDraw} opacity={0.9 * env} />
          <ellipse cx={W / 2} cy={MIRROR_Y + 120} rx={1150} ry={92} fill="none" stroke="#5fe1ff" strokeOpacity={0.35 * env} strokeWidth={2}
            pathLength={1} strokeDasharray="1" strokeDashoffset={-ringDraw} />
        </svg>
        <div style={{ position: 'absolute', left: W / 2 - 1100, top: MIRROR_Y + 40, width: 2200, height: 170, borderRadius: '50%', mixBlendMode: 'screen',
          filter: 'blur(30px)', opacity: env * 0.25 + impact * 0.55,
          background: 'radial-gradient(ellipse, rgba(255,236,196,0.9) 0%, rgba(217,180,122,0.35) 35%, rgba(0,0,0,0) 70%)' }} />
      </div>
    </>
  );
};

/** A flowing gold ribbon of light along an S-curve; a bright comet segment travels its length. */
export const GoldRibbon = ({ f, at = 40, dur = 46, opacity = 1, d = 'M -300 1460 C 700 1420, 1300 980, 1950 860 S 3100 520, 4200 360' }) => {
  const p = (f - at) / dur;
  if (p < -0.05 || p > 1.35) return null;
  const head = Math.min(1.3, Math.max(0, p)) * 1.3 - 0.15;
  const o = Math.min(1, Math.max(0, p * 6)) * Math.min(1, Math.max(0, (1.35 - p) * 3)) * opacity;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible', mixBlendMode: 'screen', opacity: o }}>
      <defs>
        <linearGradient id="ribbonG" x1="0" x2="1">
          <stop offset="0" stopColor="#8a5a2b" stopOpacity="0" />
          <stop offset="0.5" stopColor="#f6e2b3" />
          <stop offset="1" stopColor="#d9b47a" stopOpacity="0.2" />
        </linearGradient>
        <filter id="ribbonBlur"><feGaussianBlur stdDeviation="22" /></filter>
      </defs>
      {/* faint full trail left behind */}
      <path d={d} fill="none" stroke="url(#ribbonG)" strokeWidth={3} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - Math.min(1, Math.max(0, head))} opacity={0.35} />
      {/* glow + core of the travelling segment */}
      <path d={d} fill="none" stroke="#e9c48a" strokeWidth={60} strokeLinecap="round" pathLength={1} strokeDasharray="0.22 2" strokeDashoffset={-(head - 0.22)} filter="url(#ribbonBlur)" opacity={0.55} />
      <path d={d} fill="none" stroke="#fff4dc" strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="0.2 2" strokeDashoffset={-(head - 0.2)} />
    </svg>
  );
};
