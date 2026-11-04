import React from 'react';
import { Audio, Sequence, staticFile, interpolate } from 'remotion';
import { MUSIC, SFX, VOICEOVER, DUCK } from '../audioManifest';

const FADE = 8;
const ready = VOICEOVER.filter((v) => v.ready);
// Music ducks smoothly under every narration line that is present.
const duckAt = (frame) => {
  let gain = 1;
  for (const v of ready) {
    gain = Math.min(gain, interpolate(frame, [v.from - FADE, v.from, v.from + v.dur, v.from + v.dur + FADE * 2], [1, DUCK, DUCK, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  }
  return gain;
};

export const AudioManager = () => (
  <>
    {MUSIC.map((m, i) => (
      <Sequence key={`m${i}`} from={m.from} layout="none" name="music">
        <Audio src={staticFile(`assets/${m.file}`)} volume={(f) => m.volume * duckAt(f + m.from)} />
      </Sequence>
    ))}
    {SFX.map((s, i) => (
      <Sequence key={`s${i}`} from={s.from} layout="none" name={`sfx ${s.file}`}>
        <Audio src={staticFile(`assets/${s.file}`)} volume={s.volume} />
      </Sequence>
    ))}
    {ready.map((v) => (
      <Sequence key={v.id} from={v.from} layout="none" name={`VO ${v.id}`}>
        <Audio src={staticFile(`assets/${v.file}`)} volume={1} />
      </Sequence>
    ))}
  </>
);
