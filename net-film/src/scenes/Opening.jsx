import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { clamp, lerp, easeInOut } from '../components/fx';
import { LogoReveal } from '../components/LogoReveal';
import { LightPulse, LightTrails, FlareHandoff } from '../components/Transitions';
import { Particles } from '../components/Particles';
import { FilmGrade } from '../components/FilmGrade';
import { LuxuryStage, GoldRibbon } from '../components/LuxuryStage';
import { CameraMotionBlur } from '@remotion/motion-blur';

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
const W = 3840;
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

  return (
    <AbsoluteFill style={{ background: '#010205', overflow: 'hidden' }}>
      <LuxuryStage f={f} layer={layer} env={env} impact={impact} haloDraw={haloDraw} ringDraw={ringDraw} />
      {/* gold ribbon flows through the logo zone (behind the artwork, visible through and around it) */}
      <div style={layer(0.9)}>
        <GoldRibbon f={f} at={40} dur={44} />
        <GoldRibbon f={f} at={100} dur={50} opacity={0.55} d="M -300 1200 C 900 1250, 1400 700, 2000 650 S 3200 760, 4200 520" />
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
      {/* true multi-sample motion blur (180° shutter) on the racing light trails */}
      {f < 64 && <CameraMotionBlur shutterAngle={200} samples={8}><LightTrails from={12} cy={930} /></CameraMotionBlur>}
      <LightPulse at={8} cy={930} />
      {/* impact flash */}
      <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: interpolate(f, [53, 55, 66], [0, 0.55, 0], clamp),
        background: 'radial-gradient(ellipse at 50% 43%, rgba(255,240,214,0.9) 0%, rgba(217,180,122,0.3) 30%, rgba(0,0,0,0) 65%)' }} />
      <FlareHandoff at={138} dur={12} />
      <FilmGrade />
    </AbsoluteFill>
  );
};
