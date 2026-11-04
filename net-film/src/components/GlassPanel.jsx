import React from 'react';

// Dark smoked-glass panel with a bronze hairline edge and inner specular highlight.
export const GlassPanel = ({ style, children, accent = 'gold', glow = 0.5 }) => (
  <div style={{
    position: 'absolute', borderRadius: 36, overflow: 'hidden',
    background: 'linear-gradient(160deg, rgba(28,38,62,0.78) 0%, rgba(10,16,30,0.86) 60%, rgba(6,10,20,0.92) 100%)',
    border: `2px solid ${accent === 'cyan' ? 'rgba(95,225,255,0.35)' : 'rgba(217,180,122,0.38)'}`,
    boxShadow: `0 40px 120px rgba(0,0,0,0.55), 0 0 ${80 * glow}px rgba(${accent === 'cyan' ? '47,140,255' : '217,180,122'},${0.18 * glow}), inset 0 2px 0 rgba(255,240,214,0.12)`,
    ...style,
  }}>
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
      background: 'linear-gradient(115deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.03) 100%)' }} />
    {children}
  </div>
);

// Abstract UI "text" lines (never real writing) for interface mock-ups.
export const UiLines = ({ rows = 4, width = 400, gap = 26, p = 1, accentRow = -1 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, alignItems: 'flex-end' }}>
    {new Array(rows).fill(0).map((_, i) => (
      <div key={i} style={{ height: 14, borderRadius: 7, width: width * (0.55 + ((i * 37) % 40) / 100) * Math.min(1, Math.max(0, p * 1.6 - i * 0.15)),
        background: i === accentRow ? 'linear-gradient(270deg, #d9b47a, rgba(217,180,122,0.2))' : 'rgba(239,217,176,0.16)' }} />
    ))}
  </div>
);
