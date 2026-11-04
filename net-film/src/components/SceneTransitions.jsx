import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { clamp, ease } from './fx';

const W = 3840, H = 2160;

/** Entry: the incoming scene emerges from a gold-white bloom while the camera pulls back. */
export const BloomIn = ({ dur = 16 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, dur], [1, 0], { ...clamp, easing: ease });
  if (o <= 0) return null;
  return <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: o,
    background: 'radial-gradient(ellipse at center, rgba(255,244,220,1) 0%, rgba(217,180,122,0.55) 35%, rgba(20,14,6,0) 75%)' }} />;
};

/** 2→3: a gold light wall sweeps right→left and leaves a digital grid behind it. */
export const GoldToGrid = ({ at, dur = 20, mode = 'out' }) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  const p = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: ease });
  const gridO = mode === 'out' ? p : 1 - p;
  const x = mode === 'out' ? interpolate(p, [0, 1], [W + 300, -600]) : -9999;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ opacity: gridO,
        background: '#040914',
        backgroundImage: 'linear-gradient(rgba(95,225,255,0.22) 2px, transparent 2px), linear-gradient(90deg, rgba(217,180,122,0.22) 2px, transparent 2px)',
        backgroundSize: '160px 160px',
        WebkitMaskImage: mode === 'out' ? `linear-gradient(90deg, rgba(0,0,0,0) ${((x + 300) / W) * 100}%, #000 ${((x + 700) / W) * 100}%)` : 'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, #000 70%)' }} />
      {mode === 'out' && (
        <div style={{ position: 'absolute', left: x, top: 0, width: 600, height: H, mixBlendMode: 'screen', filter: 'blur(6px)',
          background: 'linear-gradient(90deg, rgba(217,180,122,0) 0%, rgba(246,226,179,0.9) 45%, #fff 50%, rgba(95,225,255,0.6) 56%, rgba(47,140,255,0) 100%)' }} />
      )}
    </AbsoluteFill>
  );
};

/** 3→4: beat-synced digital swipe — scan band with RGB-split edge travelling right→left. */
export const DigitalSwipe = ({ at, dur = 14 }) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  const p = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const x = interpolate(p, [0, 1], [W, -1600]);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: x + 1400, top: 0, right: 0 - 2000, height: H, background: '#030713' }} />
      <div style={{ position: 'absolute', left: x, top: 0, width: 1400, height: H, mixBlendMode: 'screen',
        background: 'linear-gradient(90deg, rgba(47,140,255,0) 0%, rgba(47,140,255,0.35) 60%, rgba(95,225,255,0.9) 92%, #fff 96%, rgba(217,180,122,0.8) 100%)' }} />
      <div style={{ position: 'absolute', left: x, top: 0, width: 1400, height: H, opacity: 0.5,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 2px, transparent 2px, transparent 12px)' }} />
    </AbsoluteFill>
  );
};

/** 5→6 / 6 entry: whip-pan glare. mode 'out' streaks to the left, 'in' resolves from the right. */
export const WhipGlare = ({ at, dur = 12, mode = 'out' }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > dur) return null;
  const p = f / dur;
  const o = mode === 'out' ? interpolate(p, [0, 1], [0, 1], clamp) : interpolate(p, [0, 1], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen', opacity: o }}>
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(217,180,122,0) 0%, rgba(246,226,179,0.65) 50%, rgba(217,180,122,0) 100%)', filter: 'blur(30px)' }} />
      {new Array(14).fill(0).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: 120 + i * 140, height: 4 + (i % 3) * 4,
          background: `linear-gradient(90deg, transparent, rgba(255,236,196,${0.4 + (i % 4) * 0.12}), transparent)` }} />
      ))}
    </AbsoluteFill>
  );
};
