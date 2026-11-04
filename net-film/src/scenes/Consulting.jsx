import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { clamp, ease, lerp } from '../components/fx';
import { useCamera } from '../components/camera';
import { ServiceText } from '../components/ServiceText';
import { GoldIcon } from '../components/Icons';
import { Particles } from '../components/Particles';
import { FilmGrade } from '../components/FilmGrade';
import { ScenePlate } from '../components/ScenePlate';
import { WhipGlare } from '../components/SceneTransitions';
import { CUES } from '../cues';

/*
 * SCENE 5 · 00:27–00:33 (180f) — Management Consulting
 * Set: executive strategy room as an architectural blueprint — drafting grid, compass arcs, warm key light.
 * Hero: an organisation chart that builds itself, then RESTRUCTURES (nodes re-align) on "الهيكلة";
 *       a process chain whose steps streamline on "تطوير الإجراءات".
 * In: hexagon from scene 4 dissolves into the blueprint.  Out: fast whip-pan with gold glare.
 */
const DUR = 180;
const C = CUES.consulting;

const Node = ({ x, y, w = 250, h = 110, p, hi }) => (
  <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: 20, opacity: p,
    transform: `scale(${0.7 + p * 0.3})`, background: hi ? 'linear-gradient(180deg, rgba(217,180,122,0.35), rgba(60,40,20,0.5))' : 'rgba(12,20,38,0.85)',
    border: `3px solid ${hi ? '#f6e2b3' : 'rgba(95,225,255,0.45)'}`, boxShadow: hi ? '0 0 40px rgba(217,180,122,0.55)' : '0 0 20px rgba(47,140,255,0.2)' }}>
    <div style={{ position: 'absolute', left: 30, right: 30, top: 34, height: 12, borderRadius: 6, background: hi ? 'rgba(255,240,214,0.7)' : 'rgba(239,217,176,0.25)' }} />
    <div style={{ position: 'absolute', left: 30, right: 90, top: 62, height: 10, borderRadius: 5, background: 'rgba(239,217,176,0.14)' }} />
  </div>
);

export const Consulting = () => {
  const f = useCurrentFrame();
  const { layer } = useCamera(f, DUR, { push: [0.03, 0.11], x: [40, -40], y: [-20, 10], origin: '30% 45%' });
  const whip = interpolate(f, [DUR - 12, DUR], [0, 1], { ...clamp, easing: (t) => t * t });
  const hexOut = interpolate(f, [0, 16], [1, 0], clamp);

  const build = (k) => interpolate(f - 6 - k * 4, [0, 16], [0, 1], { ...clamp, easing: ease });
  const restructure = interpolate(f, [C.items[0] + 6, C.items[0] + 30], [0, 1], { ...clamp, easing: ease });
  const proc = interpolate(f - C.items[1], [0, 18], [0, 1], { ...clamp, easing: ease });
  const streamline = interpolate(f, [C.items[1] + 24, C.items[1] + 46], [0, 1], { ...clamp, easing: ease });

  // org chart geometry: before = uneven tree, after = balanced structure
  const top = { x: 1050, y: 470 };
  const midBefore = [[520, 800], [880, 860], [1500, 780]];
  const midAfter = [[560, 820], [1050, 820], [1540, 820]];
  const mid = midBefore.map(([x, y], i) => [x + (midAfter[i][0] - x) * restructure, y + (midAfter[i][1] - y) * restructure]);
  const leafOff = [[-115, 300], [115, 300]];

  const steps = 5;
  const stepX = (i) => {
    const base = 300 + i * 330;
    const merged = 300 + Math.min(i, 3) * 400 + (i === 4 ? 0 : 0); // step 4 merges into 3 → leaner flow
    return base + (merged - base) * streamline;
  };

  return (
    <AbsoluteFill style={{ background: '#030711', overflow: 'hidden', transform: `translateX(${-whip * 900}px)`, filter: whip > 0 ? `blur(${whip * 30}px)` : 'none' }}>
      <div style={layer(0.2)}>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 80% at 20% 10%, rgba(120,84,44,0.35) 0%, rgba(6,12,26,0) 55%), radial-gradient(ellipse 90% 80% at 40% 60%, #0b1934 0%, #050a17 60%, #02040a 100%)' }} />
        <AbsoluteFill style={{ backgroundImage: 'linear-gradient(rgba(95,225,255,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(95,225,255,0.07) 2px, transparent 2px), linear-gradient(rgba(95,225,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(95,225,255,0.035) 1px, transparent 1px)',
          backgroundSize: '400px 400px, 400px 400px, 80px 80px, 80px 80px' }} />
        <svg width={3840} height={2160} style={{ position: 'absolute', inset: 0 }}>
          <circle cx={1050} cy={1000} r={lerp(f, [0, 40], [0, 820])} fill="none" stroke="rgba(217,180,122,0.18)" strokeWidth="3" strokeDasharray="14 20" />
          <path d={`M 120 ${1880} L ${120 + lerp(f, [10, 50], [0, 1900])} 1880`} stroke="rgba(217,180,122,0.35)" strokeWidth="3" />
          <path d="M 120 1850 V 1910 M 2020 1850 V 1910" stroke="rgba(217,180,122,0.35)" strokeWidth="3" opacity={lerp(f, [40, 50], [0, 1])} />
        </svg>
      </div>
      <ScenePlate scene="consulting" dur={DUR} />
      {/* hexagon carried over from scene 4 */}
      {hexOut > 0 && (
        <svg width={3840} height={2160} style={{ position: 'absolute', inset: 0, opacity: hexOut }}>
          <polygon points={new Array(6).fill(0).map((_, k) => `${1920 + Math.cos(k * Math.PI / 3) * (520 + (1 - hexOut) * 900)},${1080 + Math.sin(k * Math.PI / 3) * (520 + (1 - hexOut) * 900)}`).join(' ')}
            fill="none" stroke="#f6e2b3" strokeWidth="5" />
        </svg>
      )}

      <div style={layer(1)}>
        <svg width={3840} height={2160} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {mid.map(([x, y], i) => (
            <g key={i}>
              <path d={`M ${top.x} ${top.y + 55} V ${(top.y + y) / 2} H ${x} V ${y - 55}`} fill="none" stroke={restructure > 0.5 ? 'rgba(246,226,179,0.8)' : 'rgba(95,225,255,0.5)'} strokeWidth="4"
                pathLength={1} strokeDasharray="1" strokeDashoffset={1 - build(1 + i)} />
              {leafOff.map(([dx, dy], j) => (
                <path key={j} d={`M ${x} ${y + 55} V ${y + dy / 2} H ${x + dx} V ${y + dy - 45}`} fill="none" stroke="rgba(95,225,255,0.4)" strokeWidth="3"
                  pathLength={1} strokeDasharray="1" strokeDashoffset={1 - build(4 + i * 2 + j)} />
              ))}
            </g>
          ))}
        </svg>
        <Node x={top.x} y={top.y} p={build(0)} hi w={300} />
        {mid.map(([x, y], i) => <Node key={i} x={x} y={y} p={build(1 + i)} hi={restructure > 0.5} />)}
        {mid.map(([x, y], i) => leafOff.map(([dx, dy], j) => <Node key={`${i}${j}`} x={x + dx} y={y + dy} w={180} h={86} p={build(4 + i * 2 + j)} />))}

        {/* process chain */}
        <div style={{ position: 'absolute', left: 0, top: 1560, width: 2200, height: 260, opacity: proc }}>
          {new Array(steps).fill(0).map((_, i) => {
            const o = i === 4 ? 1 - streamline : 1;
            return (
              <div key={i} style={{ position: 'absolute', left: stepX(i), top: 40, width: 300, height: 150, opacity: o * interpolate(proc, [i * 0.12, i * 0.12 + 0.4], [0, 1], clamp),
                clipPath: 'polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%, 18% 50%)',
                background: i === Math.floor(((f - C.items[1]) / 8) % steps) ? 'linear-gradient(90deg, #8a5a2b, #f6e2b3)' : 'linear-gradient(90deg, rgba(47,140,255,0.35), rgba(95,225,255,0.18))' }} />
            );
          })}
          <div style={{ position: 'absolute', left: 1900, top: 20 }}><GoldIcon name="process" size={190} at={C.items[1] + 10} /></div>
        </div>
        <div style={{ position: 'absolute', left: 1700, top: 380 }}><GoldIcon name="org" size={200} at={C.items[0]} /></div>
      </div>

      <div style={layer(0.3)}>
        <ServiceText index="04" label="MANAGEMENT CONSULTING" title="الاستشارات الإدارية" titleAt={C.title}
          items={['الهيكلة', 'تطوير الإجراءات']} itemsAt={C.items} />
      </div>
      <div style={layer(1.3)}><Particles count={70} seed="con-dust" cyanRatio={0.25} /></div>
      <FilmGrade />
      <WhipGlare at={DUR - 12} dur={12} mode="out" />
    </AbsoluteFill>
  );
};
