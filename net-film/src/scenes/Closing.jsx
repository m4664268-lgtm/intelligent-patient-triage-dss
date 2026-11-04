import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { clamp, ease, lerp, easeInOut } from '../components/fx';
import { LogoReveal } from '../components/LogoReveal';
import { LuxuryStage, GoldRibbon } from '../components/LuxuryStage';
import { Particles } from '../components/Particles';
import { FilmGrade } from '../components/FilmGrade';
import { CUES } from '../cues';
import { ArabicText } from '../components/ArabicTypography';

/*
 * SCENE 7 · 00:39–00:45 (180f) — Closing
 * The home set returns. Light lines gather into a frame around the untouched official logo,
 * the company name is set below in Arabic + English, a final shine lands on the closing hit,
 * then the logo holds still for the last ~1 s.
 */
const DUR = 180;
const C = CUES.closing;
const W = 3840;
const LOGO = 1150, LOGO_LEFT = (W - LOGO) / 2, LOGO_TOP = 90;
// frame around the visible artwork (bbox x 37–1228, y 151–1117 of the 1254px source)
const k = LOGO / 1254;
const FR = { x0: LOGO_LEFT + 37 * k - 150, x1: LOGO_LEFT + 1228 * k + 150, y0: LOGO_TOP + 151 * k - 110, y1: LOGO_TOP + 1117 * k + 90 };

export const Closing = () => {
  const f = useCurrentFrame();
  const settle = interpolate(f, [0, DUR - 30], [0, 1], { ...clamp, easing: easeInOut });
  const zoom = interpolate(settle, [0, 1], [0.05, 0]); // gentle pull-back that comes to rest
  const layer = (depth) => ({ position: 'absolute', inset: 0, transformOrigin: '50% 40%', transform: `scale(${1 + zoom * depth})` });
  const flash = interpolate(f, [0, 3, 18], [0.9, 0.7, 0], clamp);
  const env = interpolate(f, [0, 14], [0.4, 1], clamp);

  // frame lines: four light lines fly in from outside and lock onto the frame edges
  const fp = (i) => interpolate(f - C.frame - i * 4, [0, 26], [0, 1], { ...clamp, easing: ease });
  const corner = interpolate(f - C.frame, [30, 42], [0, 1], clamp);
  const textP = (i) => interpolate(f - C.text - i * 8, [0, 20], [0, 1], { ...clamp, easing: ease });
  const final = interpolate(f, [C.finalHit, C.finalHit + 3, C.finalHit + 24], [0, 0.5, 0], clamp);
  const fw = FR.x1 - FR.x0, fh = FR.y1 - FR.y0;

  return (
    <AbsoluteFill style={{ background: '#010205', overflow: 'hidden' }}>
      <LuxuryStage f={f + 200} layer={layer} env={env} impact={final * 1.6} haloDraw={0} ringDraw={0} />
      <div style={layer(0.9)}><GoldRibbon f={f} at={6} dur={50} opacity={0.6} d="M -300 1350 C 900 1300, 1500 900, 2000 820 S 3200 560, 4200 420" /></div>

      <div style={layer(1)}>
        {/* backlight */}
        <div style={{ position: 'absolute', left: W / 2 - 1400, top: 160, width: 2800, height: 1200, mixBlendMode: 'screen', filter: 'blur(40px)', opacity: 0.35 + final,
          background: 'radial-gradient(ellipse, rgba(217,170,105,0.30) 0%, rgba(120,80,40,0.16) 40%, rgba(0,0,0,0) 70%)' }} />
        {/* gathering frame */}
        <svg width={3840} height={2160} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs><filter id="fglow"><feGaussianBlur stdDeviation="8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
          <g filter="url(#fglow)" stroke="#e9c48a" strokeWidth="4" strokeLinecap="round">
            <line x1={FR.x0 - (1 - fp(0)) * 2400} y1={FR.y0} x2={FR.x0 - (1 - fp(0)) * 2400 + fw * fp(0)} y2={FR.y0} />
            <line x1={FR.x1 + (1 - fp(1)) * 2400} y1={FR.y1} x2={FR.x1 + (1 - fp(1)) * 2400 - fw * fp(1)} y2={FR.y1} />
            <line x1={FR.x1} y1={FR.y0 - (1 - fp(2)) * 1400} x2={FR.x1} y2={FR.y0 - (1 - fp(2)) * 1400 + fh * fp(2)} opacity={0.8} />
            <line x1={FR.x0} y1={FR.y1 + (1 - fp(3)) * 1400} x2={FR.x0} y2={FR.y1 + (1 - fp(3)) * 1400 - fh * fp(3)} opacity={0.8} />
          </g>
          {[[FR.x0, FR.y0], [FR.x1, FR.y0], [FR.x1, FR.y1], [FR.x0, FR.y1]].map(([x, y], i) => (
            <rect key={i} x={x - 16} y={y - 16} width={32} height={32} transform={`rotate(45 ${x} ${y})`} fill="#f6e2b3" opacity={corner} style={{ filter: 'drop-shadow(0 0 14px rgba(246,226,179,0.9))' }} />
          ))}
        </svg>
        <LogoReveal revealAt={4} size={LOGO} left={LOGO_LEFT} top={LOGO_TOP} shines={[18, C.finalHit - 4]} settleTo={1} endAt={DUR - 30} />
        {/* company name */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: FR.y1 + 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <ArabicText text="شركة نت لحلول الأعمال" at={C.text} size={112} />
          <div className="lat" style={{ fontSize: 50, fontWeight: 300, letterSpacing: '0.5em', color: 'rgba(239,217,176,0.85)', opacity: textP(1), paddingLeft: '0.5em' }}>
            NET BUSINESS SOLUTIONS
          </div>
        </div>
      </div>
      <div style={layer(1.2)}><Particles count={110} seed="close-dust" start={0} intensity={1} /></div>
      <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: flash, background: 'radial-gradient(ellipse at center, rgba(255,244,220,1) 0%, rgba(217,180,122,0.4) 35%, rgba(0,0,0,0) 70%)' }} />
      <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: final, background: 'radial-gradient(ellipse at 50% 35%, rgba(255,240,214,0.7) 0%, rgba(0,0,0,0) 55%)' }} />
      <FilmGrade />
    </AbsoluteFill>
  );
};
