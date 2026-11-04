import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, random } from 'remotion';
import { clamp, ease, lerp } from '../components/fx';
import { useCamera } from '../components/camera';
import { ServiceText } from '../components/ServiceText';
import { GlassPanel, UiLines } from '../components/GlassPanel';
import { GoldIcon } from '../components/Icons';
import { Bokeh, PerspectiveGrid } from '../components/Atmosphere';
import { Particles } from '../components/Particles';
import { FilmGrade } from '../components/FilmGrade';
import { ScenePlate } from '../components/ScenePlate';
import { BloomIn, GoldToGrid } from '../components/SceneTransitions';
import { CUES } from '../cues';

/*
 * SCENE 2 · 00:05–00:13 (240f) — Business Services
 * Set: glass atrium of a business tower at night — tall glass fins, streaming gold floor grid, city bokeh.
 * Hero: three floating glass "dossiers" in 3D (establishment → entity change → investors), each lands on its VO word.
 * Out: gold light wall sweeps and leaves a digital grid (→ scene 3).
 */
const DUR = 240;
const C = CUES.business;

const Card = ({ f, at, x, y, rotY, z, icon, children, w = 760, h = 900 }) => {
  const p = interpolate(f - at, [0, 22], [0, 1], { ...clamp, easing: ease });
  const float = Math.sin((f + at) * 0.045) * 14;
  return (
    <div style={{ position: 'absolute', left: x, top: y + float, width: w, height: h, opacity: p,
      transform: `perspective(2600px) translateZ(${z - (1 - p) * 900}px) rotateY(${rotY + (1 - p) * 35}deg) rotateX(${(1 - p) * -10}deg)`,
      filter: p < 1 ? `blur(${(1 - p) * 14}px)` : 'none' }}>
      <GlassPanel style={{ inset: 0 }} glow={0.8}>
        <div style={{ position: 'absolute', top: 70, right: 70 }}><GoldIcon name={icon} size={190} at={at + 6} /></div>
        <div style={{ position: 'absolute', top: 330, right: 70 }}><UiLines rows={5} width={560} p={lerp(f, [at + 10, at + 40], [0, 1])} accentRow={0} /></div>
        {children}
      </GlassPanel>
    </div>
  );
};

export const BusinessServices = () => {
  const f = useCurrentFrame();
  const { layer } = useCamera(f, DUR, { push: [0.0, 0.09], x: [-60, 60], y: [10, -20], origin: '35% 50%' });
  const pullBack = interpolate(f, [0, 18], [0.12, 0], { ...clamp, easing: ease });

  // stamp of approval on the establishment dossier (abstract seal, no text)
  const st = f - (C.items[0] + 34);
  const stampS = st < 0 ? 0 : interpolate(st, [0, 6, 10], [1.8, 0.94, 1], clamp);
  const stampRing = interpolate(st, [6, 26], [0, 1], clamp);

  // entity blocks swap places
  const sw = interpolate(f, [C.items[1] + 26, C.items[1] + 50], [0, 1], { ...clamp, easing: ease });
  // investor growth line
  const gl = lerp(f, [C.items[2] + 18, C.items[2] + 56], [0, 1]);

  return (
    <AbsoluteFill style={{ background: '#03060e', overflow: 'hidden', transform: `scale(${1 + pullBack})` }}>
      <div style={layer(0.2)}>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 60% at 30% 35%, #13213f 0%, #070d1c 50%, #02040a 100%)' }} />
        <Bokeh count={44} seed="biz" top={150} height={1100} warmRatio={0.75} />
      </div>
      <ScenePlate scene="business" dur={DUR} />
      {/* tall glass fins of the atrium */}
      <div style={layer(0.45)}>
        {new Array(9).fill(0).map((_, i) => {
          const x = -200 + i * 480 + (random(`fin${i}`) - 0.5) * 120;
          return <div key={i} style={{ position: 'absolute', left: x, top: -200, width: 150 + random(`fw${i}`) * 90, height: 2600,
            transform: 'skewX(-4deg)', opacity: 0.55,
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(160,200,255,0.05) 40%, rgba(255,226,180,0.13) 50%, rgba(160,200,255,0.04) 60%, rgba(255,255,255,0) 100%)' }} />;
        })}
      </div>
      <div style={layer(0.6)}>
        <PerspectiveGrid speed={5} top={1330} cell={240} alpha={0.26} />
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(3,6,14,0) 50%, rgba(3,6,14,0.6) 62%, rgba(3,6,14,0) 100%)' }} />
      </div>

      {/* hero dossiers */}
      <div style={layer(1)}>
        <Card f={f} at={C.items[0]} x={260} y={560} rotY={20} z={0} icon="building">
          <div style={{ position: 'absolute', left: 90, bottom: 90, width: 220, height: 220, transform: `scale(${stampS})`, opacity: stampS ? 1 : 0 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '6px solid #d9b47a', boxShadow: '0 0 30px rgba(217,180,122,0.6), inset 0 0 30px rgba(217,180,122,0.35)' }} />
            <div style={{ position: 'absolute', inset: 28, borderRadius: '50%', border: '2px dashed rgba(246,226,179,0.7)' }} />
            <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 50 }}><path d="M24 52 L42 70 L78 32" fill="none" stroke="#f6e2b3" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ position: 'absolute', left: 200 - stampRing * 160, bottom: 200 - stampRing * 160, width: 20 + stampRing * 320, height: 20 + stampRing * 320, borderRadius: '50%',
            border: '3px solid rgba(246,226,179,0.8)', opacity: (1 - stampRing) * (st > 6 ? 1 : 0) }} />
        </Card>
        <Card f={f} at={C.items[1]} x={880} y={420} rotY={14} z={-260} icon="modify" w={700} h={840}>
          <div style={{ position: 'absolute', left: 80, bottom: 90, width: 540, height: 200 }}>
            {[0, 1].map((k) => {
              const from = k === 0 ? 0 : 300, to = k === 0 ? 300 : 0;
              const xx = from + (to - from) * sw;
              return <div key={k} style={{ position: 'absolute', left: xx, top: Math.sin(sw * Math.PI) * (k ? 60 : -60) + 50, width: 220, height: 110, borderRadius: 18,
                border: `3px solid ${k ? 'rgba(95,225,255,0.8)' : 'rgba(217,180,122,0.9)'}`, background: k ? 'rgba(47,140,255,0.12)' : 'rgba(217,180,122,0.12)' }} />;
            })}
          </div>
        </Card>
        <Card f={f} at={C.items[2]} x={1460} y={600} rotY={8} z={-520} icon="investor" w={680} h={820}>
          <svg width={560} height={260} style={{ position: 'absolute', left: 60, bottom: 70, overflow: 'visible' }}>
            <path d="M0 230 L90 200 L170 214 L260 150 L340 160 L430 80 L540 30" fill="none" stroke="#5fe1ff" strokeWidth="7" strokeLinecap="round"
              pathLength={1} strokeDasharray="1" strokeDashoffset={1 - gl} style={{ filter: 'drop-shadow(0 0 12px rgba(95,225,255,0.8))' }} />
            <path d="M0 230 L90 200 L170 214 L260 150 L340 160 L430 80 L540 30 L540 260 L0 260 Z" fill="url(#invFill)" opacity={gl * 0.5} />
            <defs><linearGradient id="invFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f8cff" stopOpacity="0.6" /><stop offset="1" stopColor="#2f8cff" stopOpacity="0" /></linearGradient></defs>
          </svg>
        </Card>
      </div>

      <div style={layer(0.3)}>
        <ServiceText index="01" label="BUSINESS SERVICES" title="خدمات الأعمال" titleAt={C.title}
          items={['تأسيس الشركات', 'تعديل الكيانات', 'خدمات المستثمرين']} itemsAt={C.items} exit={DUR - 24} />
      </div>
      <div style={layer(1.3)}><Particles count={90} seed="biz-dust" start={0} camX={0} /></div>
      <FilmGrade />
      <BloomIn dur={16} />
      <GoldToGrid at={DUR - 22} dur={22} mode="out" />
    </AbsoluteFill>
  );
};
