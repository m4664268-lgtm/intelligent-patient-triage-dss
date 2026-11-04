import React from 'react';
import { Audio, Sequence, staticFile, interpolate } from 'remotion';
import { MUSIC, SFX, VOICEOVER, DUCK } from '../audioManifest';

const FADE = 8;
// Music ducks under each ready VO line (assumes ~3 s line length; adjust `dur` per line once recorded).
const duckAt = (frame) => {
  let g = 1;
  for (const v of VOICEOVER.filter((x) => x.ready)) {
    const dur = v.dur ?? 90;
    g = Math.min(g, interpolate(frame, [v.from - FADE, v.from, v.from + dur, v.from + dur + FADE], [1, DUCK, DUCK, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  }
  return g;
};

export const AudioManager = () => (
  <>
    {MUSIC.map((m, i) => (
      <Sequence key={`m${i}`} from={m.from} layout="none">
        <Audio src={staticFile(`assets/${m.file}`)} volume={(f) => m.volume * duckAt(f + m.from)} />
      </Sequence>
    ))}
    {SFX.map((s, i) => (
      <Sequence key={`s${i}`} from={s.from} layout="none">
        <Audio src={staticFile(`assets/${s.file}`)} volume={s.volume} />
      </Sequence>
    ))}
    {VOICEOVER.filter((v) => v.ready).map((v) => (
      <Sequence key={v.id} from={v.from} layout="none">
        <Audio src={staticFile(`assets/${v.file}`)} volume={1} />
      </Sequence>
    ))}
  </>
);
