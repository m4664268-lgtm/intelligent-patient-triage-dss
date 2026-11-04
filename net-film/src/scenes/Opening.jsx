import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { clamp, lerp, easeInOut } from '../components/fx';
import { LogoReveal } from '../components/LogoReveal';
import { LightPulse, LightTrails, FlareHandoff } from '../components/Transitions';
import { Particles } from '../components/Particles';
import { FilmGrade } from '../components/FilmGrade';

/*
 * SCENE 1 · 00:00–00:05 (150 frames) — beat grid 15f
 *  f0–8    black, sub rumble
 *  f8      light pulse (digital pulse SFX)
 *  f12–56  gold / electric-blue light trails converge (whooshes f14, f28)
 *  f28–70  environment fades up: fluted bronze wall, Riyadh window plate, halo arc, pedestal ring
 *  f54     DEEP IMPACT — logo machined in by a light seam (metallic reveal SFX)
 *  f62/104 specular sweeps across the metal
 *  f138    flare hand-off into scene 2
 */
const W = 3840, H = 2160;
const LOGO = 1440, LOGO_LEFT = (W - LOGO) / 2, LOGO_TOP = 202;
const MIRROR_Y = 1532;

export const Opening = () => {
  const f = useCurrentFrame();

  // Camera: slow 3D push-in with lateral drift; each layer gets its own parallax depth.
  const push = lerp(f, [20, 150], [0, 1], easeInOut);
  const camX = interpolate(push, [0, 1], [40, -40]);
  const camY = interpolate(push, [0, 1], [20, -10]);
  const zoom = 1 + push * 0.06 + interpolate(f, [136, 150], [0, 0.05], { ...clamp, easing: (t) => t * t });
  const layer = (depth) => ({
    position: 'absolute', inset: 0,
    transform: `translate(${camX * depth}px, ${camY * depth}px) scale(${1 + (zoom - 1) * depth})`,
    transformOrigin: '50% 45%',
  });

  const env = lerp(f, [26, 72], [0, 1]);
  const impact = interpolate(f, [54, 58, 90], [0, 1, 0.55], clamp) * (f >= 54 ? 1 : 0);
  const ringDraw = lerp(f, [34, 76], [1, 0]);
  const haloDraw = lerp(f, [30, 84], [1, 0]);
  const haloSpin = f * 0.9;
  const beam = 0.5 + 0.2 * Math.sin(f * 0.05);

  return (
    <AbsoluteFill style={{ background: '#010205', overflow: 'hidden' }}>
      {/* ---------- FAR: architecture ---------- */}
      <div style={{ ...layer(0.35), opacity: env }}>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 42%, #0e1a33 0%, #070d1c 45%, #020409 100%)' }} />
        {/* fluted bronze wall panels */}
        <AbsoluteFill style={{
          background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 104px, rgba(190,140,80,0.10) 108px, rgba(255,214,150,0.32) 110px, rgba(190,140,80,0.10) 112px, rgba(0,0,0,0) 116px)',
          WebkitMaskImage: 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.7) 22%, rgba(0,0,0,0) 42%)',
          maskImage: 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.7) 22%, rgba(0,0,0,0) 42%)',
        }} />
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(1,2,5,0.85) 0%, rgba(1,2,5,0) 30%, rgba(1,2,5,0) 60%, rgba(1,2,5,0.9) 76%)' }} />
        {/* Riyadh window plate (cropped from the approved reference; no baked text/logo) */}
        <div style={{ position: 'absolute', right: -120, top: -40, width: 1420, height: 2420,
          WebkitMaskImage: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 26%)', maskImage: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 26%)' }}>
          <Img src={staticFile('assets/skyline-plate.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover',
            filter: 'blur(7px) brightness(0.78) saturate(0.95) contrast(1.05)' }} />
        </div>
        {/* volumetric beams from the window */}
        <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: beam * env }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: 'absolute', left: 1500 + i * 420, top: -500, width: 380 - i * 60, height: 3400,
              transform: `rotate(${28 + i * 3}deg)`, filter: 'blur(60px)',
              background: 'linear-gradient(180deg, rgba(255,205,140,0.0) 0%, rgba(255,205,140,0.16) 35%, rgba(255,205,140,0.0) 80%)' }} />
          ))}
        </AbsoluteFill>
      </div>

      {/* ---------- MID: glossy black marble stage ---------- */}
      <div style={{ ...layer(0.6), opacity: env }}>
        <div style={{ position: 'absolute', left: -400, right: -400, top: MIRROR_Y, bottom: -200,
          background: 'linear-gradient(180deg, #0b0f18 0%, #05070c 30%, #020306 100%)',
          boxShadow: 'inset 0 6px 30px rgba(217,180,122,0.18)' }} />
        {/* skyline reflected in the polished floor */}
        <div style={{ position: 'absolute', right: -120, top: MIRROR_Y, width: 1420, height: 700, overflow: 'hidden', opacity: 0.22,
          WebkitMaskImage: 'linear-gradient(180deg, #000 0%, rgba(0,0,0,0) 85%), linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 30%)',
          WebkitMaskComposite: 'source-in', maskComposite: 'intersect',
          maskImage: 'linear-gradient(180deg, #000 0%, rgba(0,0,0,0) 85%), linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 30%)' }}>
          <Img src={staticFile('assets/skyline-plate.jpg')} style={{ position: 'absolute', top: -(2420 - (MIRROR_Y + 40)), width: 1420, height: 2420,
            objectFit: 'cover', transform: 'scaleY(-1)', transformOrigin: '50% 50%', filter: 'blur(14px) brightness(0.9)' }} />
        </div>
        {/* polished stage edge */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: MIRROR_Y - 2, height: 4,
          background: 'linear-gradient(90deg, rgba(217,180,122,0) 0%, rgba(217,180,122,0.55) 30%, rgba(255,236,196,0.85) 50%, rgba(217,180,122,0.55) 70%, rgba(217,180,122,0) 100%)',
          boxShadow: '0 0 40px 8px rgba(217,180,122,0.18)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: MIRROR_Y - 260, height: 260,
          background: 'linear-gradient(180deg, rgba(2,4,9,0) 0%, rgba(2,4,9,0.55) 100%)' }} />
        {/* window light on the floor */}
        <div style={{ position: 'absolute', left: 2500, top: MIRROR_Y + 30, width: 1500, height: 520, mixBlendMode: 'screen', filter: 'blur(40px)',
          background: 'radial-gradient(ellipse at 60% 30%, rgba(255,190,130,0.22), rgba(0,0,0,0) 70%)' }} />
      </div>

      {/* ---------- light rings (halo + pedestal) ---------- */}
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
          {/* halo arc above (echoes the reference's ceiling ring) */}
          <ellipse cx={W / 2} cy={70} rx={1640} ry={330} fill="none" stroke="url(#goldStroke)" strokeWidth={9} filter="url(#glow)"
            pathLength={1} strokeDasharray="1" strokeDashoffset={haloDraw} opacity={0.85} />
          {/* pedestal ring on the floor */}
          <ellipse cx={W / 2} cy={MIRROR_Y + 120} rx={1350} ry={118} fill="none" stroke="url(#goldStroke)" strokeWidth={7} filter="url(#glow)"
            pathLength={1} strokeDasharray="1" strokeDashoffset={ringDraw} opacity={0.9} />
          <ellipse cx={W / 2} cy={MIRROR_Y + 120} rx={1150} ry={92} fill="none" stroke="#5fe1ff" strokeOpacity={0.35} strokeWidth={2}
            pathLength={1} strokeDasharray="1" strokeDashoffset={-ringDraw} />
        </svg>
        {/* light pool on the pedestal (blooms on impact) */}
        <div style={{ position: 'absolute', left: W / 2 - 1100, top: MIRROR_Y + 40, width: 2200, height: 170, borderRadius: '50%', mixBlendMode: 'screen',
          filter: 'blur(30px)', opacity: env * 0.25 + impact * 0.6,
          background: 'radial-gradient(ellipse, rgba(255,236,196,0.9) 0%, rgba(217,180,122,0.35) 35%, rgba(0,0,0,0) 70%)' }} />
      </div>

      {/* ---------- NEAR: logo with backlight + reflection ---------- */}
      <div style={layer(1)}>
        <div style={{ position: 'absolute', left: W / 2 - 1500, top: 330, width: 3000, height: 1300, mixBlendMode: 'screen', filter: 'blur(40px)',
          opacity: impact * 0.55 + env * 0.18,
          background: 'radial-gradient(ellipse, rgba(217,170,105,0.30) 0%, rgba(120,80,40,0.16) 40%, rgba(0,0,0,0) 70%)' }} />
        <LogoReveal revealAt={54} size={LOGO} left={LOGO_LEFT} top={LOGO_TOP} shines={[8, 50]}
          reflection={{ mirrorY: MIRROR_Y, opacity: 0.32 }} />
      </div>

      {/* ---------- FX ---------- */}
      <div style={layer(1.25)}><Particles start={18} camX={camX * 3} /></div>
      <LightTrails from={12} cy={930} />
      <LightPulse at={8} cy={930} />
      {/* impact flash */}
      <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: interpolate(f, [53, 55, 66], [0, 0.55, 0], clamp),
        background: 'radial-gradient(ellipse at 50% 43%, rgba(255,240,214,0.9) 0%, rgba(217,180,122,0.3) 30%, rgba(0,0,0,0) 65%)' }} />
      <FlareHandoff at={138} dur={12} />
      <FilmGrade />
    </AbsoluteFill>
  );
};
