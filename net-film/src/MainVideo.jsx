import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { SCENES } from './timeline';
import { Opening } from './scenes/Opening';
import { BusinessServices } from './scenes/BusinessServices';
import { HRServices } from './scenes/HRServices';
import { GovernmentServices } from './scenes/GovernmentServices';
import { Consulting } from './scenes/Consulting';
import { IndustrialLicenses } from './scenes/IndustrialLicenses';
import { Closing } from './scenes/Closing';
import { AudioManager } from './components/AudioManager';
import { useBundledFonts } from './fonts';

const ORDER = [
  ['opening', Opening], ['business', BusinessServices], ['hr', HRServices], ['government', GovernmentServices],
  ['consulting', Consulting], ['industrial', IndustrialLicenses], ['closing', Closing],
];

export const MainVideo = () => {
  useBundledFonts();
  return (
  <AbsoluteFill style={{ background: '#000' }}>
    {ORDER.map(([key, Scene]) => (
      <Sequence key={key} from={SCENES[key].from} durationInFrames={SCENES[key].duration} name={key}>
        <Scene />
      </Sequence>
    ))}
    <AudioManager />
  </AbsoluteFill>
  );
};
