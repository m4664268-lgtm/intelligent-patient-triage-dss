import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { PLATES } from '../plates';

/**
 * Optional photographic background plate per scene. Drop a text-free 16:9 image into
 * public/assets/plates/ and register it in src/plates.js — it is graded into the scene's palette
 * automatically (darkened, depth-of-field blur, slow push) underneath all motion graphics.
 */
export const ScenePlate = ({ scene, dur }) => {
  const f = useCurrentFrame();
  const file = PLATES[scene];
  if (!file) return null;
  const s = interpolate(f, [0, dur], [1.04, 1.12]);
  return (
    <AbsoluteFill>
      <Img src={staticFile(`assets/plates/${file}`)} style={{ width: '100%', height: '100%', objectFit: 'cover',
        transform: `scale(${s})`, filter: 'blur(6px) brightness(0.5) saturate(0.85) contrast(1.08)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(3,6,14,0.55) 0%, rgba(3,6,14,0.25) 45%, rgba(3,6,14,0.85) 100%)' }} />
    </AbsoluteFill>
  );
};
