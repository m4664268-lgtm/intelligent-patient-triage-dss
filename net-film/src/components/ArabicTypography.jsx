import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { clamp, ease } from './fx';

/**
 * RTL Arabic line, animated per WORD (never per letter), so letter joins are always shaped correctly.
 * Fonts are bundled (src/fonts.js) and rendering waits for them, so no fallback-font frames appear.
 */
export const ArabicText = ({ text, at = 0, size = 112, weight = 800, gold = true, stagger = 4, style }) => {
  const f = useCurrentFrame() - at;
  return (
    <div className="ar" style={{ display: 'flex', gap: size * 0.26, fontSize: size, fontWeight: weight, color: gold ? undefined : '#f3ebdd', ...style }}>
      {text.split(' ').map((w, i) => {
        const p = interpolate(f - i * stagger, [0, 18], [0, 1], { ...clamp, easing: ease });
        return <span key={i} className={gold ? 'gold-text' : undefined}
          style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 40}px)`, filter: `blur(${(1 - p) * 10}px)` }}>{w}</span>;
      })}
    </div>
  );
};
