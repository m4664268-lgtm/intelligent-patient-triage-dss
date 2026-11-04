import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { clamp, ease, lerp } from '../components/fx';
import { useCamera } from '../components/camera';
import { ServiceText } from '../components/ServiceText';
import { GlassPanel, UiLines } from '../components/GlassPanel';
import { GoldIcon } from '../components/Icons';
import { Bokeh, CeilingLights } from '../components/Atmosphere';
import { Particles } from '../components/Particles';
import { FilmGrade } from '../components/FilmGrade';
import { ScenePlate } from '../components/ScenePlate';
import { GoldToGrid, DigitalSwipe } from '../components/SceneTransitions';
import { CUES } from '../cues';

/*
 * SCENE 3 · 00:13–00:20 (210f) — Human Resources
 * Set: open-plan executive office at night — linear ceiling lights receding, glass partitions, warm/cool bokeh.
 * Hero: a living team network (employees), a payroll dashboard (abstract bars, no fake figures),
 *       and a contract that signs itself in gold.
 * In: digital grid resolves (from scene 2).  Out: beat-synced digital swipe (→ scene 4).
 */
const DUR = 210;
const C = CUES.hr;

const Person = ({ x, y, p, hub }) => (
  <div style={{ position: 'absolute', left: x - 70, top: y - 70, width: 140, height: 140, borderRadius: '50%', opacity: p,
    transform: `scale(${0.6 + p * 0.4})`, background: 'radial-gradient(circle at 50% 35%, rgba(40,54,86,0.95), rgba(10,16,30,0.95))',
    border: `3px solid ${hub ? '#f6e2b3' : 'rgba(217,180,122,0.65)'}`, boxShadow: `0 0 ${hub ? 60 : 30}px rgba(217,180,122,${hub ? 0.6 : 0.3})` }}>
    <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 22 }}>
      <circle cx="50" cy="36" r="15" fill="none" stroke="#e9c48a" strokeWidth="5" />
      <path d="M22 86 C22 62 78 62 78 86" fill="none" stroke="#e9c48a" strokeWidth="5" strokeLinecap="round" />
    </svg>
  </div>
);

export const HRServices = () => {
  const f = useCurrentFrame();
  const { layer } = useCamera(f, DUR, { push: [0.02, 0.1], x: [50, -60], y: [-10, 10], rot: [-0.4, 0.3], origin: '22% 50%' });

  // team network (item 1)
  const t0 = C.items[0];
  const hub = { x: 560, y: 960 };
  const nodes = [[220, 680], [180, 1120], [400, 1430], [760, 1450], [960, 1150], [940, 700], [560, 500]];
  const net = (i) => interpolate(f - t0 - i * 3, [0, 16], [0, 1], { ...clamp, easing: ease });

  // payroll dashboard (item 2)
  const t1 = C.items[1];
  const dash = interpolate(f - t1, [0, 20], [0, 1], { ...clamp, easing: ease });
  const bars = [0.42, 0.58, 0.5, 0.72, 0.64, 0.86, 0.78];

  // contract (item 3)
  const t2 = C.items[2];
  const doc = interpolate(f - t2, [0, 20], [0, 1], { ...clamp, easing: ease });
  const sign = lerp(f, [t2 + 16, t2 + 50], [0, 1]);

  return (
    <AbsoluteFill style={{ background: '#03060e', overflow: 'hidden' }}>
      <div style={layer(0.2)}>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 90% 70% at 35% 30%, #111f3c 0%, #060b18 55%, #02040a 100%)' }} />
        <CeilingLights rows={10} vpX={1300} vpY={820} alpha={0.32} speed={0.006} />
        <Bokeh count={34} seed="hr" top={500} height={900} warmRatio={0.5} opacity={0.9} />
      </div>
      <ScenePlate scene="hr" dur={DUR} />
      {/* glass partitions */}
      <div style={layer(0.5)}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: 'absolute', left: -200 + i * 1150, top: 820, width: 900, height: 1500, transform: 'perspective(2000px) rotateY(32deg)',
            background: 'linear-gradient(110deg, rgba(160,200,255,0.05), rgba(255,226,180,0.08) 40%, rgba(160,200,255,0.02) 70%)',
            borderLeft: '3px solid rgba(217,180,122,0.18)', opacity: 0.8 }} />
        ))}
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(3,6,14,0) 55%, rgba(3,6,14,0.85) 100%)' }} />
      </div>

      <div style={layer(1)}>
        {/* network */}
        <svg width={3840} height={2160} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {nodes.map(([x, y], i) => {
            const p = net(i);
            const pulse = ((f - t0 - i * 4) % 30) / 30;
            return (
              <g key={i} opacity={p}>
                <line x1={hub.x} y1={hub.y} x2={hub.x + (x - hub.x) * p} y2={hub.y + (y - hub.y) * p} stroke="rgba(217,180,122,0.55)" strokeWidth="4" />
                {f > t0 + 18 && <circle cx={hub.x + (x - hub.x) * pulse} cy={hub.y + (y - hub.y) * pulse} r="10" fill="#5fe1ff" style={{ filter: 'drop-shadow(0 0 10px #5fe1ff)' }} />}
              </g>
            );
          })}
          <circle cx={hub.x} cy={hub.y} r={300 * net(0)} fill="none" stroke="rgba(95,225,255,0.25)" strokeWidth="3" />
          <circle cx={hub.x} cy={hub.y} r={560 * net(2)} fill="none" stroke="rgba(217,180,122,0.14)" strokeWidth="3" strokeDasharray="10 18" transform={`rotate(${f * 0.6} ${hub.x} ${hub.y})`} />
        </svg>
        {nodes.map(([x, y], i) => <Person key={i} x={x} y={y} p={net(i)} />)}
        <Person x={hub.x} y={hub.y} p={net(0)} hub />

        {/* payroll dashboard */}
        <div style={{ position: 'absolute', left: 1050, top: 440, width: 640, height: 480, opacity: dash,
          transform: `perspective(2400px) rotateY(${18 - dash * 6}deg) translateZ(${(dash - 1) * 500}px)` }}>
          <GlassPanel style={{ inset: 0 }} glow={0.7}>
            <div style={{ position: 'absolute', top: 50, right: 60 }}><GoldIcon name="payroll" size={120} at={t1 + 4} /></div>
            <div style={{ position: 'absolute', top: 70, left: 60 }}><UiLines rows={2} width={300} p={dash} /></div>
            <div style={{ position: 'absolute', left: 70, right: 70, bottom: 50, height: 240, display: 'flex', alignItems: 'flex-end', gap: 34 }}>
              {bars.map((b, i) => {
                const h = lerp(f, [t1 + 10 + i * 3, t1 + 34 + i * 3], [0, b]);
                return <div key={i} style={{ flex: 1, height: `${h * 100}%`, borderRadius: '12px 12px 4px 4px',
                  background: i === 5 ? 'linear-gradient(180deg, #5fe1ff, rgba(47,140,255,0.25))' : 'linear-gradient(180deg, #e9c48a, rgba(138,90,43,0.25))',
                  boxShadow: i === 5 ? '0 0 30px rgba(95,225,255,0.5)' : 'none' }} />;
              })}
            </div>
          </GlassPanel>
        </div>

        {/* contract */}
        <div style={{ position: 'absolute', left: 1130, top: 1020, width: 540, height: 700, opacity: doc,
          transform: `perspective(2400px) rotateY(${14 - doc * 4}deg) rotateZ(${(1 - doc) * 6}deg) translateY(${(1 - doc) * 200}px)` }}>
          <GlassPanel style={{ inset: 0 }} glow={0.6}>
            <div style={{ position: 'absolute', top: 60, right: 60 }}><GoldIcon name="contract" size={130} at={t2 + 4} /></div>
            <div style={{ position: 'absolute', top: 240, right: 60 }}><UiLines rows={6} width={420} p={doc} gap={30} /></div>
            <svg width={420} height={150} style={{ position: 'absolute', left: 50, bottom: 50, overflow: 'visible' }}>
              <line x1="0" y1="120" x2="420" y2="120" stroke="rgba(239,217,176,0.3)" strokeWidth="3" />
              <path d="M20 100 C60 20 90 130 130 70 C160 30 170 110 210 80 C250 50 270 100 320 70 C360 50 380 90 470 60" fill="none" stroke="#f6e2b3" strokeWidth="6"
                strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - sign} style={{ filter: 'drop-shadow(0 0 10px rgba(246,226,179,0.8))' }} />
            </svg>
          </GlassPanel>
        </div>
      </div>

      <div style={layer(0.3)}>
        <ServiceText index="02" label="HUMAN RESOURCES" title="إدارة الموارد البشرية" titleAt={C.title} titleSize={150}
          items={['إدارة الموظفين', 'الرواتب', 'العقود']} itemsAt={C.items} exit={DUR - 16} exitStyle="swipe" width={1800} />
      </div>
      <div style={layer(1.3)}><Particles count={80} seed="hr-dust" cyanRatio={0.3} /></div>
      <FilmGrade />
      <GoldToGrid at={0} dur={20} mode="in" />
      <DigitalSwipe at={DUR - 14} dur={14} />
    </AbsoluteFill>
  );
};
