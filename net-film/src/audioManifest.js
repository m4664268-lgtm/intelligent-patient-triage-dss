import { SCENES } from './timeline';
import { CUES } from './cues';
import VO_STATUS from './voiceover.json';

// ---------------------------------------------------------------------------------------------
// VOICEOVER — 7 lines. Files live in public/assets/voiceover/ and are produced/imported by
// scripts/generate-voiceover.py, which also writes src/voiceover.json (ready flag + duration).
// To swap in a real Saudi narrator later: record vo-01 … vo-07, run
//   python3 scripts/generate-voiceover.py --engine files --input <folder>
// and re-render. No scene code changes are needed.
// `from` = global frame where the line starts, `max` = longest the line may run (frames).
// ---------------------------------------------------------------------------------------------
const g = (scene, local) => SCENES[scene].from + local;
export const VO_LINES = [
  { id: 'vo-01', from: 56,                  max: 92,  text: 'شركة نت لحلول الأعمال… NET Business Solutions.' },
  { id: 'vo-02', from: g('business', 16),   max: 200, text: 'نقدم خدمات تأسيس الشركات وتعديل الكيانات، وخدمات المستثمرين.' },
  { id: 'vo-03', from: g('hr', 14),         max: 180, text: 'ونتولى إدارة الموارد البشرية، من الموظفين والرواتب إلى العقود.' },
  { id: 'vo-04', from: g('government', 10), max: 190, text: 'ونساعد المنشآت في إدارة متطلباتها الحكومية عبر منصات قوى ومدد والتأمينات ومقيم.' },
  { id: 'vo-05', from: g('consulting', 8),  max: 160, text: 'ونقدم الاستشارات الإدارية لتطوير الهيكلة والإجراءات.' },
  { id: 'vo-06', from: g('industrial', 10), max: 156, text: 'كما نقدم خدمات التراخيص الصناعية وخدمات المصانع.' },
  { id: 'vo-07', from: g('closing', 6),     max: 162, text: 'شركة متخصصة في تقديم حلول الأعمال والخدمات الإدارية والتنظيمية للمنشآت والمستثمرين.' },
];
export const VOICEOVER = VO_LINES.map((l) => ({
  ...l, file: `voiceover/${l.id}.wav`, ready: !!VO_STATUS[l.id]?.ready, dur: VO_STATUS[l.id]?.frames ?? l.max,
}));

export const MUSIC = [{ file: 'music/score-45s.wav', from: 0, volume: 0.42 }];
export const DUCK = 0.42; // music gain while narration plays

// ---------------------------------------------------------------------------------------------
// SFX — every hit is tied to a visual cue (title, item, transition) so picture and sound stay locked.
// ---------------------------------------------------------------------------------------------
const fx = (file, from, volume) => ({ file: `sound-effects/${file}.wav`, from, volume });
const items = (scene, file = 'ui-tick', v = 0.22) => CUES[scene].items.map((it) => fx(file, g(scene, it), v));
export const SFX = [
  // 1 · opening
  fx('digital-pulse', 8, 0.5), fx('riser', 12, 0.22), fx('whoosh-a', 12, 0.34), fx('whoosh-b', 26, 0.28),
  fx('deep-impact', 54, 0.62), fx('metallic-reveal', 54, 0.36), fx('whoosh-a', 136, 0.32),
  // 2 · business
  fx('impact-soft', g('business', 0), 0.35), fx('title-hit', g('business', CUES.business.title), 0.4), ...items('business'),
  fx('stamp', g('business', CUES.business.items[0] + 34), 0.4), fx('whoosh-b', g('business', 216), 0.32),
  // 3 · HR
  fx('digital-pulse', g('hr', 0), 0.25), fx('title-hit', g('hr', CUES.hr.title), 0.4), ...items('hr'),
  fx('digital-swipe', g('hr', 194), 0.4),
  // 4 · government
  fx('impact-soft', g('government', 0), 0.3), fx('title-hit', g('government', CUES.government.title), 0.4),
  ...items('government', 'confirm-blip', 0.24), fx('riser-short', g('government', 190), 0.3),
  // 5 · consulting
  fx('impact-soft', g('consulting', 0), 0.35), fx('title-hit', g('consulting', CUES.consulting.title), 0.4), ...items('consulting'),
  fx('whoosh-fast', g('consulting', 166), 0.4),
  // 6 · industrial
  fx('whoosh-fast', g('industrial', 0), 0.28), fx('title-hit', g('industrial', CUES.industrial.title), 0.4), ...items('industrial'),
  fx('stamp', g('industrial', CUES.industrial.items[0] + 26), 0.4), fx('riser', g('industrial', 140), 0.3),
  // 7 · closing
  fx('deep-impact', g('closing', 0), 0.6), fx('metallic-reveal', g('closing', 4), 0.32),
  fx('ui-tick', g('closing', CUES.closing.text), 0.18),
  fx('deep-impact', g('closing', CUES.closing.finalHit), 0.7), fx('metallic-reveal', g('closing', CUES.closing.finalHit), 0.4),
];
