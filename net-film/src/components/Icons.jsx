import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { clamp, ease } from './fx';

// Minimal line-art icons (generic, not imitating any authority's branding), self-drawing in gold.
const P = {
  building: ['M20 88 V30 L50 14 L80 30 V88', 'M12 88 H88', 'M34 40 H42 M58 40 H66 M34 54 H42 M58 54 H66 M34 68 H42 M58 68 H66', 'M44 88 V74 H56 V88'],
  modify: ['M14 22 H46 V54 H14 Z', 'M54 46 H86 V78 H54 Z', 'M50 30 C66 30 70 34 70 42', 'M64 36 L70 44 L76 36', 'M50 70 C34 70 30 66 30 58', 'M36 64 L30 56 L24 64'],
  investor: ['M50 50 m-34 0 a34 34 0 1 0 68 0 a34 34 0 1 0 -68 0', 'M16 50 H84', 'M50 16 C36 30 36 70 50 84 C64 70 64 30 50 16', 'M60 70 L72 58 L80 64 L92 46', 'M84 46 H92 V54'],
  people: ['M50 34 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0', 'M26 84 C26 62 74 62 74 84', 'M20 42 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0', 'M4 78 C4 64 30 60 34 66', 'M80 42 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0', 'M96 78 C96 64 70 60 66 66'],
  payroll: ['M12 26 H88 V74 H12 Z', 'M50 50 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0', 'M22 36 H30 M70 64 H78', 'M20 82 H80'],
  contract: ['M24 10 H64 L80 26 V90 H24 Z', 'M64 10 V26 H80', 'M34 40 H70 M34 52 H70 M34 64 H56', 'M34 80 C42 72 46 84 52 76 C56 72 60 80 68 76'],
  briefcase: ['M10 32 H90 V84 H10 Z', 'M36 32 V20 H64 V32', 'M10 54 H90', 'M44 50 H56 V60 H44 Z'],
  wallet: ['M12 28 H80 V82 H12 Z', 'M12 28 L66 14 L72 28', 'M62 46 H90 V64 H62 Z', 'M72 55 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0'],
  shield: ['M50 10 L84 22 V48 C84 70 68 84 50 92 C32 84 16 70 16 48 V22 Z', 'M34 50 L46 62 L68 38'],
  idcard: ['M8 22 H92 V80 H8 Z', 'M32 46 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0', 'M16 70 C16 58 48 58 48 70', 'M58 40 H82 M58 52 H82 M58 64 H74'],
  org: ['M38 10 H62 V28 H38 Z', 'M8 70 H32 V88 H8 Z', 'M38 70 H62 V88 H38 Z', 'M68 70 H92 V88 H68 Z', 'M50 28 V50 M20 70 V50 H80 V70 M50 50 V70'],
  process: ['M8 38 H34 L44 50 L34 62 H8 L18 50 Z', 'M40 38 H66 L76 50 L66 62 H40 L50 50 Z', 'M72 38 H90 L98 50 L90 62 H72 L82 50 Z', 'M20 80 C40 92 60 92 80 80', 'M74 76 L80 80 L74 86'],
  factory: ['M8 88 V50 L30 38 V50 L52 38 V50 L74 38 V88 Z', 'M74 88 V18 H86 V88', 'M4 88 H96', 'M18 64 H28 M40 64 H50 M62 64 H70', 'M80 12 C78 6 86 6 84 0'],
  license: ['M18 10 H82 V70 H18 Z', 'M30 26 H70 M30 38 H70 M30 50 H54', 'M66 62 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0', 'M58 72 L54 92 L66 84 L78 92 L74 72'],
  gear: ['M50 50 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0', 'M50 8 V22 M50 78 V92 M8 50 H22 M78 50 H92 M20 20 L30 30 M70 70 L80 80 M80 20 L70 30 M30 70 L20 80', 'M50 50 m-28 0 a28 28 0 1 0 56 0 a28 28 0 1 0 -56 0'],
};

export const GoldIcon = ({ name, size = 160, at = 0, dur = 26, color = 'gold', strokeWidth = 3.2 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f - at, [0, dur], [0, 1], { ...clamp, easing: ease });
  const id = `gi-${name}-${color}`;
  return (
    <svg width={size} height={size} viewBox="-4 -4 108 108" style={{ overflow: 'visible', filter: `drop-shadow(0 0 ${10 * p}px ${color === 'cyan' ? 'rgba(95,225,255,0.6)' : 'rgba(217,180,122,0.55)'})` }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {color === 'cyan'
            ? (<><stop offset="0" stopColor="#d6f6ff" /><stop offset="1" stopColor="#2f8cff" /></>)
            : (<><stop offset="0" stopColor="#fff3d6" /><stop offset="0.5" stopColor="#d9b47a" /><stop offset="1" stopColor="#9a6a36" /></>)}
        </linearGradient>
      </defs>
      {P[name].map((d, i) => (
        <path key={i} d={d} fill="none" stroke={`url(#${id})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
          pathLength={1} strokeDasharray="1" strokeDashoffset={1 - Math.min(1, Math.max(0, p * 1.4 - i * 0.08))} />
      ))}
    </svg>
  );
};
