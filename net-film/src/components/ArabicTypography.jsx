import React, { useEffect, useState } from 'react';
import { delayRender, continueRender, useCurrentFrame, interpolate } from 'remotion';
import { clamp, ease } from './fx';

// Blocks rendering until the Arabic web fonts are really loaded (prevents fallback-font frames).
export const useArabicFonts = () => {
  const [h] = useState(() => delayRender('Loading Arabic fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load('800 100px Alexandria', 'نت لحلول الأعمال'),
      document.fonts.load('500 100px Alexandria', 'تأسيس'),
      document.fonts.load('700 100px "IBM Plex Sans Arabic"', 'الموارد'),
    ]).then((r) => {
      if (r.some((x) => x.length === 0)) console.error('Arabic font missing — check @fontsource packages are installed');
      continueRender(h);
    }).catch(() => continueRender(h));
  }, [h]);
};

// RTL headline that animates word-by-word (words are whole shaped units, so letter joins never break).
export const ArabicHeadline = ({ text, at = 0, size = 150, weight = 800, color = '#f6e2b3', stagger = 5, style }) => {
  useArabicFonts();
  const f = useCurrentFrame() - at;
  const words = text.split(' ');
  return (
    <div className="ar" style={{ fontSize: size, fontWeight: weight, color, display: 'flex', gap: size * 0.28, flexWrap: 'wrap', ...style }}>
      {words.map((w, i) => {
        const p = interpolate(f - i * stagger, [0, 16], [0, 1], { ...clamp, easing: ease });
        return (
          <span key={i} style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 60}px)`, filter: `blur(${(1 - p) * 12}px)` }}>{w}</span>
        );
      })}
    </div>
  );
};
