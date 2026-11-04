import React from 'react';
import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';
import { FPS, WIDTH, HEIGHT, TOTAL_FRAMES, SCENES } from './timeline';
import './styles/global.css';


export const RemotionRoot = () => (
  <>
    {/* Full film: 45 s × 30 fps = 1350 frames, 3840×2160 */}
    <Composition id="NETFilm" component={MainVideo} durationInFrames={TOTAL_FRAMES}
      fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* Isolated opening (00:00–00:05) for previewing */}
    <Composition id="OpeningPreview" component={MainVideo} durationInFrames={SCENES.opening.duration}
      fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
