import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame, random } from 'remotion';

// Shared finishing layer: lens vignette + animated film grain (keeps every scene in one "film").
export const FilmGrade = ({ grain = 0.07, vignette = 0.75 }) => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ pointerEvents: 'none',
        background: `radial-gradient(ellipse 75% 70% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)` }} />
      <AbsoluteFill style={{ pointerEvents: 'none', opacity: grain, mixBlendMode: 'overlay',
        backgroundImage: `url(${staticFile('assets/grain.png')})`, backgroundSize: '1024px 1024px',
        backgroundPosition: `${Math.floor(random(`gx${f}`) * 1024)}px ${Math.floor(random(`gy${f}`) * 1024)}px` }} />
    </>
  );
};
