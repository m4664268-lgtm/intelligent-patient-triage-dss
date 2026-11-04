import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, random } from 'remotion';
import { clamp, ease, lerp } from '../components/fx';
import { useCamera } from '../components/camera';
import { ServiceText } from '../components/ServiceText';
import { GlassPanel, UiLines } from '../components/GlassPanel';
import { GoldIcon } from '../components/Icons';
import { Particles } from '../components/Particles';
import { FilmGrade } from '../components/FilmGrade';
import { ScenePlate } from '../components/ScenePlate';
import { CUES } from '../cues';

/*
 * SCENE 4 · 00:20–00:27 (210f) — Government Services
 * Set: digital operations space — falling data streams, radar rings, deep electric-blue atmosphere.
 * Hero: four abstract administrative windows (generic icons only — NO official platform logos),
 *       each completes a task (progress → check) as its platform name is spoken.
 * Out: data lines converge into a geometric diagram (→ scene 5 blueprint).
 */
const DUR = 210;
const C = CUES.government;
const WINDOWS = [
  { icon: 'briefcase', x: 260, y: 360 },
  { icon: 'wallet', x: 1180, y: 300 },
  { icon: 'shield', x: 340, y: 1180 },
  { icon: 'idcard', x: 1260, y: 1120 },
];

const DataStreams = ({ f }) => (
  <AbsoluteFill style={{ opacity: 0.55 }}>
    {new Array(46).fill(0).map((_, i) => {
      const r = (k) => random(`ds-${i}-${k}`);
      const x = r('x') * 3840;
      const speed = 6 + r('s') * 14;
      const len = 200 + r('l') * 600;
      const y = ((r('y') * 2600 + f * speed) % 2900) - 500;
      const blue = r('c') < 0.7;
      return <div key={i} style={{ position: 'absolute', left: x, top: y, width: 3, height: len, opacity: 0.25 + r('o') * 0.5,
        background: `linear-gradient(180deg, rgba(0,0,0,0), ${blue ? 'rgba(95,225,255,0.8)' : 'rgba(217,180,122,0.8)'})` }} />;
    })}
  </AbsoluteFill>
);

const AdminWindow = ({ f, at, doneAt, x, y, icon, idx }) => {
  const p = interpolate(f - at, [0, 18], [0, 1], { ...clamp, easing: ease });
  const prog = lerp(f, [at + 8, doneAt], [0, 1]);
  const done = interpolate(f, [doneAt, doneAt + 8], [0, 1], clamp);
  const float = Math.sin((f + idx * 20) * 0.05) * 10;
  return (
    <div style={{ position: 'absolute', left: x, top: y + float, width: 820, height: 640, opacity: p,
      transform: `perspective(2600px) rotateY(${16 - p * 4}deg) rotateX(${(1 - p) * 25}deg) translateZ(${(p - 1) * 700}px)`,
      filter: p < 1 ? `blur(${(1 - p) * 12}px)` : 'none' }}>
      <GlassPanel style={{ inset: 0 }} accent={done > 0.5 ? 'gold' : 'cyan'} glow={0.6 + done * 0.6}>
        {/* window chrome */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 74, background: 'rgba(95,225,255,0.06)', borderBottom: '2px solid rgba(95,225,255,0.18)' }}>
          {[0, 1, 2].map((k) => <div key={k} style={{ position: 'absolute', left: 34 + k * 40, top: 28, width: 18, height: 18, borderRadius: '50%', background: k === 0 ? 'rgba(217,180,122,0.8)' : 'rgba(239,217,176,0.25)' }} />)}
        </div>
        {/* sidebar */}
        <div style={{ position: 'absolute', top: 74, right: 0, bottom: 0, width: 190, borderLeft: '2px solid rgba(95,225,255,0.12)', background: 'rgba(5,10,22,0.4)' }}>
          {[0, 1, 2, 3, 4].map((k) => <div key={k} style={{ margin: '34px 36px 0', height: 14, borderRadius: 7, background: k === 1 ? 'rgba(95,225,255,0.55)' : 'rgba(239,217,176,0.14)' }} />)}
        </div>
        <div style={{ position: 'absolute', top: 120, left: 70 }}><GoldIcon name={icon} size={150} at={at + 4} color={done > 0.5 ? 'gold' : 'cyan'} /></div>
        <div style={{ position: 'absolute', top: 130, right: 250 }}><UiLines rows={3} width={280} p={p} /></div>
        {/* progress + completion */}
        <div style={{ position: 'absolute', left: 70, right: 250, bottom: 90, height: 18, borderRadius: 9, background: 'rgba(239,217,176,0.1)' }}>
          <div style={{ width: `${prog * 100}%`, height: '100%', borderRadius: 9, background: 'linear-gradient(90deg, #2f8cff, #5fe1ff 70%, #f6e2b3)', boxShadow: '0 0 20px rgba(95,225,255,0.6)' }} />
        </div>
        <div style={{ position: 'absolute', left: 70, bottom: 150, width: 90, height: 90, borderRadius: '50%', transform: `scale(${0.5 + done * 0.5})`, opacity: done,
          border: '5px solid #d9b47a', boxShadow: '0 0 30px rgba(217,180,122,0.7)' }}>
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 14 }}><path d="M22 52 L42 72 L80 30" fill="none" stroke="#f6e2b3" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </GlassPanel>
    </div>
  );
};

export const GovernmentServices = () => {
  const f = useCurrentFrame();
  const { layer } = useCamera(f, DUR, { push: [0.0, 0.08], x: [-40, 50], y: [20, -20], rot: [0.3, -0.3], origin: '30% 50%' });
  const enter = interpolate(f, [0, 16], [0, 1], { ...clamp, easing: ease });
  // data lines converge into a geometric figure at the end
  const conv = interpolate(f, [DUR - 26, DUR - 4], [0, 1], { ...clamp, easing: ease });
  // windows arrive early (on the title), then each completes on its spoken name
  const arrive = [C.title + 26, C.title + 34, C.title + 42, C.title + 50];

  return (
    <AbsoluteFill style={{ background: '#020611', overflow: 'hidden' }}>
      <div style={{ ...layer(0.2), opacity: enter }}>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 70% at 32% 45%, #0b2450 0%, #061329 45%, #02050d 100%)' }} />
        <DataStreams f={f} />
        <svg width={3840} height={2160} style={{ position: 'absolute', inset: 0 }}>
          {[400, 700, 1000, 1300].map((r, i) => (
            <circle key={i} cx={1150} cy={1080} r={r} fill="none" stroke={i % 2 ? 'rgba(217,180,122,0.12)' : 'rgba(95,225,255,0.14)'} strokeWidth="3"
              strokeDasharray={i % 2 ? '4 22' : '60 30'} transform={`rotate(${f * (i % 2 ? -0.3 : 0.4)} 1150 1080)`} />
          ))}
          <line x1={1150 + Math.cos(f * 0.04) * 1300} y1={1080 + Math.sin(f * 0.04) * 1300} x2={1150} y2={1080} stroke="rgba(95,225,255,0.25)" strokeWidth="4" />
        </svg>
      </div>
      <ScenePlate scene="government" dur={DUR} />

      <div style={{ ...layer(1), opacity: 1 - conv }}>
        {WINDOWS.map((w, i) => <AdminWindow key={i} f={f} at={arrive[i]} doneAt={C.items[i]} idx={i} {...w} />)}
      </div>

      {/* convergence: every window's data line flies to a hexagon blueprint */}
      {conv > 0 && (
        <svg width={3840} height={2160} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen' }}>
          {WINDOWS.map((w, i) => {
            const sx = w.x + 410, sy = w.y + 320;
            return <line key={i} x1={sx} y1={sy} x2={sx + (1920 - sx) * conv} y2={sy + (1080 - sy) * conv} stroke="#5fe1ff" strokeWidth="5" opacity={1 - conv * 0.4} />;
          })}
          <polygon points={new Array(6).fill(0).map((_, k) => `${1920 + Math.cos(k * Math.PI / 3) * 520 * conv},${1080 + Math.sin(k * Math.PI / 3) * 520 * conv}`).join(' ')}
            fill="none" stroke="#f6e2b3" strokeWidth="5" opacity={conv} style={{ filter: 'drop-shadow(0 0 20px rgba(246,226,179,0.8))' }} />
        </svg>
      )}

      <div style={{ ...layer(0.3), opacity: 1 - conv }}>
        <ServiceText index="03" label="GOVERNMENT SERVICES" title="الخدمات الحكومية" titleAt={C.title}
          items={['قوى', 'مدد', 'التأمينات', 'مقيم']} itemsAt={C.items} top={470} />
      </div>
      <div style={layer(1.3)}><Particles count={70} seed="gov-dust" cyanRatio={0.6} /></div>
      <FilmGrade />
    </AbsoluteFill>
  );
};
