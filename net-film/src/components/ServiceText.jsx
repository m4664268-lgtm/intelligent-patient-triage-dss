import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { clamp, ease, lerp } from './fx';

const Diamond = ({ size = 30, glow = 1 }) => (
  <div style={{ width: size, height: size, transform: 'rotate(45deg)', flexShrink: 0,
    background: 'linear-gradient(135deg, #fff3d6 0%, #d9b47a 45%, #8a5a2b 100%)',
    boxShadow: `0 0 ${24 * glow}px ${6 * glow}px rgba(217,180,122,0.45)` }} />
);

/**
 * RTL service block: index label, gold Arabic headline (word-by-word), self-drawing underline,
 * and bullet items that enter in sync with the narration. `exit` = frame where the block leaves.
 */
export const ServiceText = ({ index, label, title, items, titleAt = 8, itemsAt = [], exit, exitStyle = 'blur',
  right = 300, top = 560, width = 1700, titleSize = 176 }) => {
  const f = useCurrentFrame();
  const out = exit != null ? interpolate(f, [exit, exit + 12], [0, 1], { ...clamp, easing: ease }) : 0;
  const words = title.split(' ');
  const lineP = lerp(f, [titleAt + 10, titleAt + 34], [0, 1]);
  const labelP = lerp(f, [titleAt - 4, titleAt + 14], [0, 1]);

  const exitTransform = exitStyle === 'swipe' ? `translateX(${out * -900}px)` : exitStyle === 'up' ? `translateY(${out * -160}px)` : `scale(${1 + out * 0.06})`;

  return (
    <div style={{ position: 'absolute', right, top, width, display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
      opacity: 1 - out, filter: out > 0 ? `blur(${out * 24}px)` : 'none', transform: exitTransform }}>
      {/* index + English section label */}
      <div className="lat" style={{ display: 'flex', alignItems: 'center', gap: 28, opacity: labelP, transform: `translateX(${(1 - labelP) * -40}px)`,
        fontSize: 46, fontWeight: 300, letterSpacing: '0.42em', color: 'rgba(239,217,176,0.78)', marginBottom: 34 }}>
        <span style={{ fontWeight: 600, color: '#5fe1ff', letterSpacing: '0.2em' }}>{index}</span>
        <span>{label}</span>
        <div style={{ width: 120 * labelP, height: 3, background: 'linear-gradient(90deg, rgba(217,180,122,0), #d9b47a)' }} />
      </div>
      {/* headline */}
      <div className="ar" style={{ display: 'flex', gap: titleSize * 0.26, fontSize: titleSize, fontWeight: 800, lineHeight: 1.25, paddingBottom: 10 }}>
        {words.map((w, i) => {
          const p = interpolate(f - titleAt - i * 5, [0, 18], [0, 1], { ...clamp, easing: ease });
          return (
            <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: 24, marginBottom: -24 }}>
              <span className="gold-text" style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`, opacity: Math.min(1, p * 1.6),
                filter: `blur(${(1 - p) * 10}px) drop-shadow(0 10px 30px rgba(0,0,0,0.55))` }}>{w}</span>
            </span>
          );
        })}
      </div>
      {/* underline drawn right-to-left with a travelling spark */}
      <div style={{ position: 'relative', width: width * 0.72, height: 6, marginTop: 30, marginBottom: 70 }}>
        <div style={{ position: 'absolute', right: 0, top: 0, height: 5, width: `${lineP * 100}%`, borderRadius: 3,
          background: 'linear-gradient(270deg, #f6e2b3 0%, #d9b47a 40%, rgba(138,90,43,0) 100%)', boxShadow: '0 0 24px rgba(217,180,122,0.5)' }} />
        <div style={{ position: 'absolute', right: `calc(${lineP * 100}% - 14px)`, top: -11, opacity: lineP > 0 && lineP < 1 ? 1 : 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle, #fff, rgba(95,225,255,0.6) 40%, rgba(0,0,0,0) 70%)' }} />
        </div>
      </div>
      {/* items */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 34 }}>
        {items.map((it, i) => {
          const at = itemsAt[i] ?? titleAt + 30 + i * 18;
          const p = interpolate(f - at, [0, 16], [0, 1], { ...clamp, easing: ease });
          const sweep = interpolate(f - at, [6, 30], [-30, 130], clamp);
          return (
            <div key={i} className="ar" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 40, padding: '26px 56px 30px 52px',
              borderRadius: 30, overflow: 'hidden', opacity: p, transform: `translateX(${(1 - p) * 90}px)`, filter: `blur(${(1 - p) * 8}px)`,
              background: 'linear-gradient(270deg, rgba(138,90,43,0.34) 0%, rgba(20,26,44,0.55) 55%, rgba(10,16,30,0.15) 100%)',
              border: '2px solid rgba(217,180,122,0.28)', boxShadow: '0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,236,196,0.12)' }}>
              <Diamond size={26} />
              <span style={{ fontSize: 88, fontWeight: 500, color: '#f3ebdd', lineHeight: 1.3 }}>{it}</span>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen',
                background: `linear-gradient(100deg, rgba(0,0,0,0) ${sweep - 12}%, rgba(255,236,196,0.22) ${sweep}%, rgba(0,0,0,0) ${sweep + 12}%)` }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
