// Every audio cue in the film, in frames @30fps. Edit here to retime the mix.
// VOICEOVER: drop the real recordings into public/assets/voiceover/ and set `ready: true`.
export const VOICEOVER = [
  { id: 'vo-01', file: 'voiceover/vo-01-opening.wav', from: 66, ready: false,
    text: 'شركة نت لحلول الأعمال… NET Business Solutions.' },
];
export const MUSIC = [
  { file: 'music/opening-music.wav', from: 0, volume: 0.34 },
];
export const SFX = [
  { file: 'sound-effects/digital-pulse.wav',   from: 8,  volume: 0.5 },
  { file: 'sound-effects/whoosh-a.wav',        from: 12, volume: 0.34 },
  { file: 'sound-effects/whoosh-b.wav',        from: 26, volume: 0.28 },
  { file: 'sound-effects/riser.wav',           from: 12, volume: 0.22 },
  { file: 'sound-effects/deep-impact.wav',     from: 54, volume: 0.62 },
  { file: 'sound-effects/metallic-reveal.wav', from: 54, volume: 0.34 },
  { file: 'sound-effects/whoosh-a.wav',        from: 136, volume: 0.31 },
];
// Music is ducked by this factor while any voiceover line is playing.
export const DUCK = 0.45;
