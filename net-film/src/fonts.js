import { useEffect, useState } from 'react';
import { staticFile, delayRender, continueRender } from 'remotion';

// Fonts are bundled inside the project (public/assets/fonts) — no system or network fonts needed.
const AR = 'U+0600-06FF, U+0750-077F, U+0870-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200E, U+2010-2011, U+204F, U+2E41';
const LAT = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const FACES = [
  ['Alexandria', 'alexandria-arabic-800-normal.woff2', '800', AR],
  ['Alexandria', 'alexandria-arabic-500-normal.woff2', '500', AR],
  ['Alexandria', 'alexandria-latin-600-normal.woff2', '600', LAT],
  ['Alexandria', 'alexandria-latin-300-normal.woff2', '300', LAT],
  ['IBM Plex Sans Arabic', 'ibm-plex-sans-arabic-arabic-700-normal.woff2', '700', AR],
  ['IBM Plex Sans Arabic', 'ibm-plex-sans-arabic-arabic-500-normal.woff2', '500', AR],
];

let loading = null;
const loadAll = () => {
  if (!loading) {
    loading = Promise.all(FACES.map(([family, file, weight, range]) => {
      const face = new FontFace(family, `url(${staticFile(`assets/fonts/${file}`)}) format('woff2')`, { weight, unicodeRange: range });
      return face.load().then((f) => document.fonts.add(f)).catch((e) => console.error(`Font failed: assets/fonts/${file}`, e));
    }));
  }
  return loading;
};

/** Holds the frame until every bundled font is ready (so no frame is ever drawn with a fallback font). */
export const useBundledFonts = () => {
  const [h] = useState(() => delayRender('Loading bundled Arabic fonts', { timeoutInMilliseconds: 120000 }));
  useEffect(() => { loadAll().then(() => continueRender(h)); }, [h]);
};
