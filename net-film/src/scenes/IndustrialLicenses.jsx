import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, random } from 'remotion';
import { clamp, ease, lerp } from '../components/fx';
import { useCamera } from '../components/camera';
import { ServiceText } from '../components/ServiceText';
import { GlassPanel, UiLines } from '../components/GlassPanel';
import { GoldIcon } from '../components/Icons';
import { CeilingLights } from '../components/Atmosphere';
import { FilmGrade } from '../components/FilmGrade';
import { ScenePlate } from '../components/ScenePlate';
import { WhipGlare } from '../components/SceneTransitions';
import { CUES } from '../cues';

/*
 * SCENE 6 · 00:33–00:39 (180f) — Industrial Licensing
 * Set: modern factory hall — steel trusses in perspective, sodium-gold high-bay lights, haze,
 *      a production line streaming toward camera, sparks.
 * Hero: precision gears (machined bronze), a factory blueprint drafting itself, a licence card sealed in gold.
 * In: resolves from the whip-pan.  Out: production-line light rushes to the centre (→ closing logo).
 */
const DUR = 180;
const C = CUES.industrial;

const gearPath = (teeth, rOut, rIn) => {
  const pts = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const r = i % 4 < 2 ? rOut : rIn;
    pts.push(`${Math.cos(a) * r},${Math.sin(a) * r}`);
  }
  return `M ${pts.join(' L ')} Z`;
};

const Gear = ({ x, y, teeth, r, speed, f }) => (
  <svg width={r * 2.4} height={r * 2.4} viewBox={`${-r * 1.2} ${-r * 1.2} ${r * 2.4} ${r * 2.4}`} style={{ position: 'absolute', left: x - r * 1.2, top: y - r * 1.2, overflow: 'visible' }}>
    <defs>
      <linearGradient id={`gm${teeth}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f6e2b3" /><stop offset="0.35" stopColor="#b98a52" /><stop offset="0.7" stopColor="#5a3a1c" /><stop offset="1" stopColor="#d9b47a" />
      </linearGradient>
    </defs>
    <g transform={`rotate(${f * speed})`}>
      <path d={gearPath(teeth, r, r * 0.86)} fill={`url(#gm${teeth})`} stroke="#f6e2b3" strokeWidth="2" opacity="0.92" />
      <circle r={r * 0.62} fill="#0a0f1b" stroke="rgba(246,226,179,0.6)" strokeWidth="3" />
      <circle r={r * 0.2} fill={`url(#gm${teeth})`} />
      {[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={Math.cos(k * Math.PI / 3) * r * 0.42} cy={Math.sin(k * Math.PI / 3) * r * 0.42} r={r * 0.07} fill="#2a1c0e" stroke="rgba(246,226,179,0.4)" />)}
    </g>
  </svg>
);

export const IndustrialLicenses = () => {
  const f = useCurrentFrame();
  const { layer } = useCamera(f, DUR, { push: [0.0, 0.1], x: [-50, 40], y: [10, -15], origin: '35% 55%' });
  const whipIn = interpolate(f, [0, 12], [1, 0], { ...clamp, easing: ease });
  const rush = interpolate(f, [DUR - 18, DUR], [0, 1], { ...clamp, easing: (t) => t * t });

  const lic = interpolate(f - C.items[0], [0, 20], [0, 1], { ...clamp, easing: ease });
  const seal = interpolate(f - C.items[0], [26, 34], [0, 1], clamp);
  const bp = lerp(f, [C.items[1], C.items[1] + 40], [0, 1]);

  const VP = { x: 1250, y: 980 };
  return (
    <AbsoluteFill style={{ background: '#04060b', overflow: 'hidden', transform: `translateX(${whipIn * 900}px)`, filter: whipIn > 0.02 ? `blur(${whipIn * 30}px)` : 'none' }}>
      <div style={layer(0.25)}>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 60% at 33% 42%, #2a2216 0%, #0e1018 45%, #03050a 100%)' }} />
        {/* steel trusses converging on the vanishing point */}
        <svg width={3840} height={2160} style={{ position: 'absolute', inset: 0 }}>
          {new Array(12).fill(0).map((_, i) => {
            const a = -Math.PI * 0.95 + (i / 11) * Math.PI * 0.9;
            return <line key={i} x1={VP.x} y1={VP.y} x2={VP.x + Math.cos(a) * 4200} y2={VP.y + Math.sin(a) * 4200} stroke="rgba(160,150,140,0.16)" strokeWidth={3 + (i % 3) * 3} />;
          })}
          {new Array(9).fill(0).map((_, i) => {
            const k = Math.pow(((i / 9) + f * 0.004) % 1, 2);
            const s = 80 + k * 3400;
            return <rect key={i} x={VP.x - s} y={VP.y - s * 0.55} width={s * 2} height={s * 0.55} fill="none" stroke="rgba(170,160,150,0.12)" strokeWidth={2 + k * 8} />;
          })}
        </svg>
        <CeilingLights rows={8} vpX={VP.x} vpY={VP.y} color="255,190,110" alpha={0.75} speed={0.008} />
        {/* haze */}
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 50% 30% at 33% 42%, rgba(255,190,120,0.18), rgba(0,0,0,0) 70%)' }} />
      </div>
      <ScenePlate scene="industrial" dur={DUR} />
      {/* production line streaming toward camera */}
      <div style={layer(0.6)}>
        <div style={{ position: 'absolute', left: VP.x - 3000, width: 6000, top: VP.y + 120, height: 3000, transformOrigin: '50% 0%', transform: 'perspective(900px) rotateX(78deg)',
          backgroundImage: 'linear-gradient(90deg, transparent 46%, rgba(255,200,130,0.5) 46.3%, transparent 46.6%, transparent 53.4%, rgba(255,200,130,0.5) 53.7%, transparent 54%), repeating-linear-gradient(0deg, rgba(95,225,255,0.0) 0px, rgba(95,225,255,0.0) 140px, rgba(95,225,255,0.35) 150px, rgba(95,225,255,0) 160px)',
          backgroundPosition: `0 ${(f * 14) % 160}px`, WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 25%)', opacity: 1 - rush * 0.5 }} />
        {/* sparks */}
        {new Array(40).fill(0).map((_, i) => {
          const r = (k) => random(`sp-${i}-${k}`);
          const life = ((f + r('o') * 60) % 36) / 36;
          const x0 = 300 + r('x') * 700, y0 = 1350;
          const vx = (r('vx') - 0.3) * 600, vy = -300 - r('vy') * 500;
          const x = x0 + vx * life, y = y0 + vy * life + 900 * life * life;
          return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 8, height: 26, borderRadius: 4, opacity: (1 - life) * 0.9,
            transform: `rotate(${Math.atan2(vy + 1800 * life, vx) * 57.3 + 90}deg)`, background: 'linear-gradient(#fff3d6, #ff9a3c)', boxShadow: '0 0 14px #ffb060' }} />;
        })}
      </div>

      <div style={{ ...layer(1), opacity: 1 - rush }}>
        <Gear x={520} y={760} teeth={18} r={300} speed={0.9} f={f} />
        <Gear x={900} y={1120} teeth={12} r={200} speed={-1.35} f={f + 7} />
        <Gear x={1180} y={760} teeth={10} r={150} speed={1.6} f={f} />
        {/* licence card */}
        <div style={{ position: 'absolute', left: 1400, top: 520, width: 700, height: 860, opacity: lic,
          transform: `perspective(2400px) rotateY(${16 - lic * 4}deg) translateZ(${(lic - 1) * 600}px)` }}>
          <GlassPanel style={{ inset: 0 }} glow={0.8}>
            <div style={{ position: 'absolute', top: 70, right: 70 }}><GoldIcon name="license" size={190} at={C.items[0] + 6} /></div>
            <div style={{ position: 'absolute', top: 320, right: 70 }}><UiLines rows={5} width={540} p={lic} accentRow={0} /></div>
            <div style={{ position: 'absolute', left: 80, bottom: 80, width: 200, height: 200, borderRadius: '50%', opacity: seal, transform: `scale(${1.6 - seal * 0.6})`,
              border: '6px solid #d9b47a', boxShadow: '0 0 40px rgba(217,180,122,0.7), inset 0 0 30px rgba(217,180,122,0.4)' }}>
              <div style={{ position: 'absolute', inset: 26, borderRadius: '50%', border: '2px dashed rgba(246,226,179,0.7)' }} />
              <div style={{ position: 'absolute', inset: 60 }}><GoldIcon name="factory" size={80} at={C.items[0] + 26} dur={12} /></div>
            </div>
          </GlassPanel>
        </div>
        {/* factory blueprint drafting itself */}
        <svg width={1300} height={520} viewBox="0 0 1300 520" style={{ position: 'absolute', left: 240, top: 1450, overflow: 'visible', opacity: interpolate(bp, [0, 0.1], [0, 1], clamp) }}>
          {['M 20 500 H 1280', 'M 60 500 V 260 L 260 160 V 260 L 460 160 V 260 L 660 160 V 500', 'M 760 500 V 60 H 840 V 500', 'M 900 500 V 300 H 1240 V 500',
            'M 120 380 H 220 M 320 380 H 420 M 520 380 H 620', 'M 960 360 H 1180 M 960 420 H 1180'].map((d, i) => (
            <path key={i} d={d} fill="none" stroke={i === 0 ? 'rgba(217,180,122,0.8)' : 'rgba(95,225,255,0.75)'} strokeWidth="5" pathLength={1} strokeDasharray="1"
              strokeDashoffset={1 - Math.min(1, Math.max(0, bp * 1.5 - i * 0.1))} style={{ filter: 'drop-shadow(0 0 8px rgba(95,225,255,0.6))' }} />
          ))}
        </svg>
      </div>

      {/* rush: production-line light streaks converge to the centre */}
      {rush > 0 && (
        <svg width={3840} height={2160} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen' }}>
          {new Array(16).fill(0).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const r0 = 2600 * (1 - rush), r1 = 2600 * (1 - rush) + 900 * (1 - rush * 0.7);
            return <line key={i} x1={1920 + Math.cos(a) * r0} y1={1080 + Math.sin(a) * r0} x2={1920 + Math.cos(a) * r1} y2={1080 + Math.sin(a) * r1}
              stroke={i % 3 ? '#f6e2b3' : '#5fe1ff'} strokeWidth="8" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 16px rgba(246,226,179,0.9))' }} />;
          })}
          <circle cx={1920} cy={1080} r={30 + rush * 140} fill="url(#rushG)" />
          <defs><radialGradient id="rushG"><stop offset="0" stopColor="#fff" /><stop offset="0.4" stopColor="#f6e2b3" stopOpacity="0.8" /><stop offset="1" stopColor="#d9b47a" stopOpacity="0" /></radialGradient></defs>
        </svg>
      )}

      <div style={{ ...layer(0.3), opacity: 1 - rush }}>
        <ServiceText index="05" label="INDUSTRIAL LICENSING" title="التراخيص الصناعية" titleAt={C.title}
          items={['التراخيص الصناعية', 'خدمات المصانع']} itemsAt={C.items} />
      </div>
      <FilmGrade />
      <WhipGlare at={0} dur={12} mode="in" />
    </AbsoluteFill>
  );
};
