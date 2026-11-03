// Story music: a short tune for every Kahani, synthesised live, in a raga and a rhythm from where
// the craft comes from: santoor and tabla for rangoli, veena and mridangam for kolam, chenda drums
// for pookalam, a garba for bandhani, bhangra for the truck, the tarpa for Warli, and so on. Nothing
// is recorded; each part is a few oscillators and some filtered noise.
//
// A tune is a drone, a lead voice playing two-bar phrases in a set order, and layers of drum
// patterns. A little sequencer schedules a bar at a time, about half a second ahead, so the timing
// never stumbles. It isn't a plain loop: two bars of rhythm open it, every eighth bar is a drum
// fill, every sixteenth drops the drums for a bar, and the lead adds a grace note now and then.
// Everything goes through the site's master output, so the sound toggle mutes it too.
import { audioOut, dholakHit, noise, tanpuraString } from './sfx';
import type { ToyId } from './toys';

type Lead = 'santoor' | 'veena' | 'flute' | 'shehnai' | 'harmonium' | 'bowed' | 'brass' | 'tumbi' | 'reed';
type Kit = 'tabla' | 'dholak' | 'dhol' | 'chenda' | 'mridangam' | 'none';
export type Tune = {
  name: string;
  note: string; // one line about what you're hearing, shown while it plays
  bpm: number;
  beats: number; // beats in a bar
  res: number; // melody slots per beat
  sa: number; // the tonic, Hz
  scale: number[]; // the raga's notes, semitones above Sa
  lead: Lead;
  drone: 'tanpura' | 'harmonium' | 'none';
  kit: Kit;
  // two-bar phrases, one character per slot: 0-9 scale degrees (7+ is the next octave up for a
  // seven-note raga), A-E above that, a-g below Sa (a is the note just under it), '-' holds, '.' rests
  melody: string[];
  form: number[]; // the order the phrases are played in
  beat: string[][]; // drum layers; each is a list of one-bar patterns, cycled
  fill: string; // replaces the first layer every eighth bar
  vol?: number;
};

const BHUPALI = [0, 2, 4, 7, 9]; // Mohanam in Carnatic music: the same five notes
const MAJOR = [0, 2, 4, 5, 7, 9, 11]; // Bilawal / Shankarabharanam
const KAFI = [0, 2, 3, 5, 7, 9, 10];
const KHAMAJ = [0, 2, 4, 5, 7, 9, 10];
const YAMAN = [0, 2, 4, 6, 7, 9, 11];
const MAYAMALAVAGOWLA = [0, 1, 4, 5, 7, 8, 11];

export const TUNES: Record<ToyId, Tune> = {
  rangoli: {
    name: 'Santoor and tabla', note: 'Raga Bhupali, five bright notes, on the santoor over tabla in keherwa, an eight-beat taal.',
    bpm: 96, beats: 4, res: 2, sa: 293.66, scale: BHUPALI, lead: 'santoor', drone: 'tanpura', kit: 'tabla',
    melody: ['2-345-432-1-0---', '3-456-543-2-3---', '5-6-7-654-321---', '0-123-210-a-0---'], form: [0, 1, 0, 3, 2, 1, 2, 3],
    beat: [['DgntnkDn'], ['m...m...']], fill: 'DtDtDDnn',
  },
  kolam: {
    name: 'Veena and mridangam', note: 'Raga Mayamalavagowla, the first raga Carnatic students learn, on the veena, with a mridangam in adi talam (eight beats).',
    bpm: 84, beats: 4, res: 2, sa: 261.63, scale: MAYAMALAVAGOWLA, lead: 'veena', drone: 'tanpura', kit: 'mridangam',
    melody: ['0-1-2-3-4---3-2-', '4-5-6-7-6-5-4---', '7-6-5-4-3-2-1-2-', '2-1-0-a-0-------'], form: [0, 1, 2, 3],
    beat: [['T.ndT.dn', 'T.ndTddn']], fill: 'TdTdTnTn',
  },
  pookalam: {
    name: 'Chenda and flute', note: 'Kerala’s chenda drums and ilathalam cymbals, the sound of Onam and temple festivals, under a flute tune.',
    bpm: 112, beats: 4, res: 2, sa: 587.33, scale: MAJOR, lead: 'flute', drone: 'none', kit: 'chenda',
    melody: ['4-5-4-2-0-2-4---', '5-7-5-4-2-4-5---', '7-8-7-5-4-5-4-2-', '2-1-0-a-b-a-0---'], form: [0, 1, 0, 3, 2, 2, 1, 3],
    beat: [['C.c.C.ccC.c.Cccc'], ['m...m...m...m...']], fill: 'CrCrCrCrCCCCCCCC',
  },
  bandhani: {
    name: 'Garba on the dhol', note: 'A dhol rhythm in six with claps and dandiya sticks, as at a Gujarati garba, and a harmonium tune in raga Kafi.',
    bpm: 260, beats: 6, res: 1, sa: 261.63, scale: KAFI, lead: 'harmonium', drone: 'harmonium', kit: 'dhol',
    melody: ['4-5-4-3-2-1-', '2-3-4-5-4---', '7-6-5-4-3-4-', '2-1-0-1-0---'], form: [0, 1, 0, 3, 2, 1, 2, 3],
    beat: [['B.cB.c'], ['h..h..'], ['..s..s']], fill: 'BcBcBB',
  },
  block: {
    name: 'Rajasthani folk', note: 'Dholak and khartal (wooden clappers) with a bowed tune, like a kamaicha’s, in raga Khamaj.',
    bpm: 100, beats: 4, res: 2, sa: 220, scale: KHAMAJ, lead: 'bowed', drone: 'harmonium', kit: 'dholak',
    melody: ['0-2-4-5-4-2-4---', '4-5-6-7-6-4-5---', '7-7-6-5-4-5-6-5-', '4-2-1-0-a-0-0---'], form: [0, 1, 0, 3, 2, 1, 2, 3],
    beat: [['DgntnkDn'], ['x.xxx.xx']], fill: 'DgDgDnDn',
  },
  warli: {
    name: 'Tarpa and drum', note: 'The tarpa’s circling tune over a drum, the music Warli dancers wind round in a spiral.',
    bpm: 84, beats: 4, res: 2, sa: 196, scale: BHUPALI, lead: 'reed', drone: 'none', kit: 'dholak',
    melody: ['0-1-2-1-0-1-3-2-', '3-4-3-2-3-4-5-4-'], form: [0, 0, 1, 0, 0, 1, 1, 0],
    beat: [['g...g.n.', 'g...g.nn']], fill: 'gngngngg', vol: 1.3,
  },
  poster: {
    name: 'Band baaja', note: 'A wedding brass band: trumpets over a marching dhol, the sound of a baaraat going through the bazaar.',
    bpm: 126, beats: 4, res: 2, sa: 233.08, scale: MAJOR, lead: 'brass', drone: 'none', kit: 'dhol',
    melody: ['4.4.5-4-2.2.4---', '5.5.6-5-4.4.5---', '7-7-6-5-4-5-6---', '5-4-2-1-0-0-0---'], form: [0, 1, 0, 3, 2, 1, 2, 3],
    beat: [['B.cBB.c.'], ['m...m...']], fill: 'BcBcBBBB', vol: 0.85,
  },
  truck: {
    name: 'Bhangra', note: 'The dhol’s chaal rhythm and handclaps, with a riff on the tumbi, a one-string Punjabi lute.',
    bpm: 104, beats: 4, res: 2, sa: 440, scale: KHAMAJ, lead: 'tumbi', drone: 'none', kit: 'dhol',
    melody: ['7.77.5.7.77.9.7.', '9.99.7.9.99.A.9.', '7.6.5.4.5.6.7---', '4.5.7.5.4.2.0---'], form: [0, 1, 0, 1, 2, 3, 2, 3],
    beat: [['B..cB.c.B..cB.cB'], ['....h.......h...']], fill: 'BcBcBcBcBBccBBcc', vol: 1.25,
  },
  selfie: {
    name: 'Qawwali claps', note: 'Handclaps, dholak and harmonium in the style of a qawwali, in raga Kafi.',
    bpm: 108, beats: 4, res: 2, sa: 277.18, scale: KAFI, lead: 'harmonium', drone: 'harmonium', kit: 'dholak',
    melody: ['0-2-3-5-3-2-0---', '5-6-7-6-5-3-5---', '7-9-7-6-5-6-7---', '5-3-2-0-2-0-0---'], form: [0, 1, 0, 3, 2, 1, 2, 3],
    beat: [['DgntnkDn'], ['h.h.h.h.']], fill: 'DnDnDDDD',
  },
  naam: {
    name: 'A lori', note: 'A gentle lullaby (lori) on the bansuri, the bamboo flute, over a tanpura, in raga Yaman.',
    bpm: 66, beats: 4, res: 2, sa: 587.33, scale: YAMAN, lead: 'flute', drone: 'tanpura', kit: 'none',
    melody: ['2---1-0-a---0---', '2-3-4---3-2-1---', '4-5-4-3-2---1-2-', '1-0-a-b-a---0---'], form: [0, 1, 2, 3],
    beat: [['m.......']], fill: 'm.......',
  },
  pulli: {
    name: 'Violin and mridangam', note: 'Raga Mohanam on the violin, played as in Carnatic music, with a mridangam keeping time.',
    bpm: 92, beats: 4, res: 2, sa: 293.66, scale: BHUPALI, lead: 'bowed', drone: 'tanpura', kit: 'mridangam',
    melody: ['0-1-2-3-2-1-0---', '2-3-4-5-4-3-2---', '5-6-5-4-3-4-3-2-', '1-0-a-0-1-0-0---'], form: [0, 1, 2, 3],
    beat: [['T.n.d.n.', 'T.ndd.n.']], fill: 'TnTnddnn',
  },
  phuljhadi: {
    name: 'Shehnai and dhol', note: 'The shehnai, played at weddings and festivals, over a dhol and ghungroo, in Yaman, an evening raga.',
    bpm: 92, beats: 4, res: 2, sa: 293.66, scale: YAMAN, lead: 'shehnai', drone: 'tanpura', kit: 'dhol',
    melody: ['4-5-6-7-6-5-4---', '7-8-9-8-7-6-7---', '6-5-4-3-4-2-1---', '2-1-0-a-0---0---'], form: [0, 1, 0, 3, 2, 1, 2, 3],
    beat: [['B.c.B.ccB.c.B.c.'], ['j...j...j...j...']], fill: 'BcBcBcBcBBBBcccc',
  },
  kathputli: {
    name: 'Puppet-show dholak', note: 'Dholak and khartal in keherwa with a harmonium tune, as at a Rajasthani puppet show.',
    bpm: 104, beats: 4, res: 2, sa: 233.08, scale: MAJOR, lead: 'harmonium', drone: 'harmonium', kit: 'dholak',
    melody: ['0-2-4-4-5-4-2---', '4-5-7-7-8-7-5---', '7-6-5-4-5-4-2-1-', '2-1-0-0-a-0-0---'], form: [0, 1, 0, 3, 2, 1, 2, 3],
    beat: [['DgntnkDn'], ['..x...x.']], fill: 'DDnnDgDn',
  },
  patang: {
    name: 'Rooftop dhol', note: 'A fast dhol beat with clacking sticks and a bansuri riff in raga Bhupali, for a day on the roof.',
    bpm: 120, beats: 4, res: 2, sa: 392, scale: BHUPALI, lead: 'flute', drone: 'none', kit: 'dhol',
    melody: ['5.5.6.5.3.2.3---', '6.6.7.6.5.3.5---', '7-8-7-6-5-6-5-3-', '3-2-0-2-3-2-0---'], form: [0, 1, 0, 3, 2, 1, 2, 3],
    beat: [['B.cBB.cBB.cBB.cc'], ['..s...s...s...s.']], fill: 'BcBcBcBcBBBBBBBB',
  },
};
export const tuneFor = (toy: ToyId) => TUNES[toy];

// ---------- the score: phrase strings into notes ----------
type Note = { at: number; len: number; deg: number }; // in slots
const DEG = (c: string): number | null => {
  if (c >= '0' && c <= '9') return +c;
  if (c >= 'A' && c <= 'E') return 10 + c.charCodeAt(0) - 65;
  if (c >= 'a' && c <= 'g') return -(c.charCodeAt(0) - 96);
  return null;
};
const parsed = new Map<string, Note[]>();
function notes(phrase: string): Note[] {
  let out = parsed.get(phrase);
  if (out) return out;
  out = [];
  for (let i = 0; i < phrase.length; i++) {
    const c = phrase[i], d = DEG(c);
    if (d != null) out.push({ at: i, len: 1, deg: d });
    else if (c === '-' && out.length && out[out.length - 1].at + out[out.length - 1].len === i) out[out.length - 1].len++;
  }
  parsed.set(phrase, out);
  return out;
}
const freqOf = (tn: Tune, deg: number) => {
  const n = tn.scale.length, o = Math.floor(deg / n), k = ((deg % n) + n) % n;
  return tn.sa * 2 ** ((tn.scale[k] + 12 * o) / 12);
};

// ---------- voices: each plays into node o at time t ----------
type A = AudioContext;
function voiceGain(a: A, o: AudioNode, t: number, peak: number, attack: number, hold: number, release: number) {
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.setValueAtTime(peak, t + Math.max(attack, hold));
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(attack, hold) + release);
  g.connect(o);
  return g;
}
function osc(a: A, type: OscillatorType, f: number, t: number, end: number, to: AudioNode) {
  const s = a.createOscillator();
  s.type = type; s.frequency.setValueAtTime(f, t);
  s.connect(to); s.start(t); s.stop(end + 0.05);
  return s;
}
function vibrato(a: A, t: number, end: number, rate: number, depth: number, targets: OscillatorNode[], from = 0.2) {
  const l = a.createOscillator(), g = a.createGain();
  l.frequency.value = rate;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(depth, t + from);
  l.connect(g); targets.forEach((s) => g.connect(s.frequency));
  l.start(t); l.stop(end + 0.05);
}
// a struck or plucked string: bright attack, then it dies away
function pluck(a: A, o: AudioNode, t: number, f: number, decay: number, vol: number, types: [OscillatorType, number, number][], cutoff: number) {
  const lp = a.createBiquadFilter(), g = a.createGain();
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(cutoff, t); lp.frequency.exponentialRampToValueAtTime(Math.max(300, f * 1.5), t + decay * 0.6);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  lp.connect(g); g.connect(o);
  return types.map(([type, k, v]) => { const s = a.createOscillator(), sg = a.createGain(); s.type = type; s.frequency.setValueAtTime(f * k, t); sg.gain.value = v; s.connect(sg); sg.connect(lp); s.start(t); s.stop(t + decay + 0.05); return s; });
}

function playLead(kind: Lead, a: A, o: AudioNode, t: number, f: number, dur: number, vol: number, prev: number | null) {
  const end = t + dur;
  switch (kind) {
    case 'santoor': {
      // hammered strings; a long note is a tremolo of quick strikes, as santoor players do
      pluck(a, o, t, f, 1.3, 0.16 * vol, [['triangle', 1, 1], ['sine', 2.003, 0.35], ['sine', 3.01, 0.12]], f * 9);
      for (let s = t + 0.11; dur > 0.4 && s < end - 0.05; s += 0.11) pluck(a, o, s, f, 0.5, 0.07 * vol, [['triangle', 1, 1], ['sine', 2.003, 0.3]], f * 6);
      return;
    }
    case 'veena': {
      // a plucked string with a slide (meend) up from the last note now and then
      const ss = pluck(a, o, t, f, 1.7, 0.2 * vol, [['sawtooth', 1, 0.6], ['triangle', 1, 0.6], ['sine', 2, 0.2]], 2600);
      if (prev && Math.random() < 0.4) ss.forEach((s, i) => { const k = [1, 1, 2][i]; s.frequency.setValueAtTime(prev * k, t); s.frequency.exponentialRampToValueAtTime(f * k, t + 0.09); });
      return;
    }
    case 'tumbi': {
      pluck(a, o, t, f, 0.32, 0.24 * vol, [['square', 1, 0.6], ['sawtooth', 2, 0.25]], 4200);
      return;
    }
    case 'flute': {
      const g = voiceGain(a, o, t, 0.12 * vol, 0.07, dur - 0.08, 0.12);
      const s1 = osc(a, 'sine', f, t, end + 0.12, g), s2 = a.createOscillator(), g2 = a.createGain();
      s2.frequency.setValueAtTime(f * 2, t); g2.gain.value = 0.12; s2.connect(g2); g2.connect(g); s2.start(t); s2.stop(end + 0.15);
      vibrato(a, t, end + 0.12, 5, f * 0.008, [s1, s2], 0.25);
      // breath
      const n = a.createBufferSource(), bp = a.createBiquadFilter(), ng = voiceGain(a, o, t, 0.025 * vol, 0.03, Math.min(0.12, dur), 0.08);
      n.buffer = noise(a); bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 2;
      n.connect(bp); bp.connect(ng); n.start(t, Math.random() * 0.5, 0.3);
      return;
    }
    case 'shehnai':
    case 'reed': {
      // a double reed: buzzy, nasal, with a scoop up into each note
      const g = voiceGain(a, o, t, (kind === 'reed' ? 0.1 : 0.06) * vol, 0.03, dur - 0.05, 0.08);
      const bp = a.createBiquadFilter(), lp = a.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = kind === 'reed' ? 1100 : 1500; bp.Q.value = kind === 'reed' ? 1.2 : 0.9;
      lp.type = 'lowpass'; lp.frequency.value = 4200;
      bp.connect(lp); lp.connect(g);
      const s1 = osc(a, 'sawtooth', f, t, end + 0.08, bp), s2 = osc(a, 'square', f * 1.003, t, end + 0.08, bp);
      for (const s of [s1, s2]) { s.frequency.setValueAtTime(s.frequency.value * 0.97, t); s.frequency.exponentialRampToValueAtTime(s === s1 ? f : f * 1.003, t + 0.05); }
      vibrato(a, t, end, kind === 'reed' ? 5.5 : 6, f * 0.012, [s1, s2], 0.18);
      return;
    }
    case 'harmonium': {
      const g = voiceGain(a, o, t, 0.06 * vol, 0.04, dur - 0.05, 0.07), lp = a.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 2200; lp.connect(g);
      osc(a, 'sawtooth', f, t, end + 0.07, lp); osc(a, 'sawtooth', f * 1.004, t, end + 0.07, lp);
      const s3 = a.createOscillator(), g3 = a.createGain(); s3.type = 'square'; s3.frequency.value = f * 2; g3.gain.value = 0.35; s3.connect(g3); g3.connect(lp); s3.start(t); s3.stop(end + 0.1);
      return;
    }
    case 'bowed': {
      // a bowed string (kamaicha, violin): a slow bow-in, sliding from the last note, then vibrato;
      // long notes get a wider shake, like a gamaka
      const g = voiceGain(a, o, t, 0.08 * vol, 0.09, dur - 0.06, 0.1), lp = a.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1900; lp.Q.value = 2; lp.connect(g);
      const s1 = osc(a, 'sawtooth', f, t, end + 0.1, lp), s2 = osc(a, 'sawtooth', f * 1.005, t, end + 0.1, lp);
      if (prev) for (const s of [s1, s2]) { const k = s === s1 ? 1 : 1.005; s.frequency.setValueAtTime(prev * k, t); s.frequency.exponentialRampToValueAtTime(f * k, t + 0.07); }
      vibrato(a, t, end, dur > 0.5 ? 6 : 5.5, f * (dur > 0.5 ? 0.025 : 0.01), [s1, s2], 0.15);
      return;
    }
    case 'brass': {
      // trumpets: two detuned saws through a filter that opens on every note
      const g = voiceGain(a, o, t, 0.07 * vol, 0.02, dur - 0.04, 0.06), lp = a.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(500, t); lp.frequency.exponentialRampToValueAtTime(2800, t + 0.05); lp.frequency.exponentialRampToValueAtTime(1500, t + 0.25);
      lp.connect(g);
      osc(a, 'sawtooth', f, t, end + 0.06, lp); osc(a, 'sawtooth', f * 1.006, t, end + 0.06, lp); osc(a, 'sawtooth', f / 2, t, end + 0.06, lp);
      return;
    }
  }
}

// ---------- drums ----------
function thud(a: A, o: AudioNode, t: number, f0: number, f1: number, dec: number, vol: number) {
  const s = a.createOscillator(), g = a.createGain();
  s.frequency.setValueAtTime(f0, t); s.frequency.exponentialRampToValueAtTime(f1, t + dec);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
  s.connect(g); g.connect(o); s.start(t); s.stop(t + dec + 0.05);
}
function hiss(a: A, o: AudioNode, t: number, type: BiquadFilterType, f: number, q: number, dec: number, vol: number) {
  const n = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  n.buffer = noise(a); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
  n.connect(fl); fl.connect(g); g.connect(o); n.start(t, Math.random() * 0.8, dec + 0.05);
}
function ring(a: A, o: AudioNode, t: number, fs: number[], dec: number, vol: number) {
  for (const f of fs) {
    const s = a.createOscillator(), g = a.createGain();
    s.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
    s.connect(g); g.connect(o); s.start(t); s.stop(t + dec + 0.05);
  }
}
function hit(kit: Kit, c: string, a: A, o: AudioNode, t: number, step: number, v: number) {
  // the little percussion everyone shares
  switch (c) {
    case 'm': ring(a, o, t, [3150, 4730, 6280], 0.7, 0.03 * v); return; // manjira, small cymbals
    case 'x': hiss(a, o, t, 'bandpass', 2400, 2, 0.04, 0.3 * v); ring(a, o, t, [5200], 0.08, 0.025 * v); return; // khartal
    case 'h': hiss(a, o, t, 'bandpass', 1300, 0.8, 0.03, 0.32 * v); hiss(a, o, t + 0.012, 'bandpass', 1500, 0.8, 0.04, 0.26 * v); return; // a handclap
    case 's': hiss(a, o, t, 'bandpass', 3200, 3, 0.03, 0.3 * v); ring(a, o, t, [1900], 0.05, 0.07 * v); return; // sticks
    case 'j': for (let k = 0; k < 4; k++) ring(a, o, t + k * 0.02 + Math.random() * 0.01, [2600 + Math.random() * 2600], 0.3, 0.02 * v); return; // ghungroo
    case 'p': ring(a, o, t, [1250, 1930, 2710, 3600], 0.5, 0.04 * v); return; // a thali struck
  }
  switch (kit) {
    case 'tabla':
      if (c === 'D' || c === 'g') thud(a, o, t, 150, 78, 0.35, 0.38 * v);
      if (c === 'D' || c === 'n') ring(a, o, t, [560, 1150], 0.35, 0.12 * v);
      if (c === 't') ring(a, o, t, [690], 0.15, 0.1 * v);
      if (c === 'k') hiss(a, o, t, 'lowpass', 700, 1, 0.05, 0.18 * v);
      return;
    case 'dholak':
      if (c === 'D' || c === 'g') dholakHit(a, o, t, true, 0.75 * v);
      if (c === 'D' || c === 'n') dholakHit(a, o, t, false, 0.8 * v);
      if (c === 't') dholakHit(a, o, t, false, 0.4 * v);
      if (c === 'k') hiss(a, o, t, 'lowpass', 800, 1, 0.04, 0.2 * v);
      return;
    case 'dhol':
      if (c === 'B' || c === 'x') { thud(a, o, t, 88, 48, 0.4, 0.5 * v); hiss(a, o, t, 'lowpass', 320, 1, 0.08, 0.2 * v); }
      if (c === 'c' || c === 'x') { hiss(a, o, t, 'bandpass', 2600, 0.9, 0.05, 0.32 * v); ring(a, o, t, [1100], 0.03, 0.07 * v); }
      return;
    case 'chenda': {
      const strike = (s: number, k: number) => { hiss(a, o, s, 'bandpass', 1900, 1.4, 0.1, 0.4 * k); thud(a, o, s, 330, 260, 0.1, 0.12 * k); };
      if (c === 'C') strike(t, v);
      if (c === 'c') strike(t, 0.45 * v);
      if (c === 'r') for (let k = 0; k < 3; k++) strike(t + (k * step) / 3, 0.4 * v);
      return;
    }
    case 'mridangam':
      if (c === 'T') thud(a, o, t, 150, 95, 0.2, 0.4 * v);
      if (c === 'd') { ring(a, o, t, [400, 805], 0.5, 0.12 * v); thud(a, o, t, 180, 140, 0.15, 0.14 * v); }
      if (c === 'n') ring(a, o, t, [760, 1530], 0.3, 0.12 * v);
      return;
  }
}

// ---------- the player ----------
// owner: who asked for it (the story page or the picture book), so each only ever stops its own
export type Owner = 'page' | 'book';
type Playing = { toy: ToyId; owner: Owner; master: GainNode; drone: GainNode; vol: number; timer: ReturnType<typeof setTimeout>; ducked: boolean };
let now: Playing | null = null;

function scheduleBar(p: Playing, tn: Tune, a: A, bar: number, t0: number) {
  const beat = 60 / tn.bpm, barDur = beat * tn.beats, slot = beat / tn.res, perBar = tn.beats * tn.res;
  // the drone: tanpura strings plucked in turn, or a harmonium holding Sa and Pa
  if (tn.drone === 'tanpura') {
    const strings = [tn.sa * 0.75, tn.sa, tn.sa, tn.sa / 2].map((f) => (f > 400 ? f / 2 : f));
    const every = tn.bpm > 100 ? 2 : 1;
    for (let k = 0; k < tn.beats; k += every) tanpuraString(a, p.drone, strings[(bar * tn.beats + k) / every % 4 | 0], t0 + k * beat);
  } else if (tn.drone === 'harmonium') {
    const g = voiceGain(a, p.drone, t0, 0.05, 0.3, barDur - 0.25, 0.3), lp = a.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(g);
    const lo = tn.sa > 300 ? tn.sa / 4 : tn.sa / 2;
    osc(a, 'sawtooth', lo, t0, t0 + barDur + 0.3, lp); osc(a, 'sawtooth', lo * 1.5, t0, t0 + barDur + 0.3, lp);
  }
  // drums: every eighth bar a fill, and now and then a bar without them
  const quiet = bar % 16 === 12;
  if (tn.kit !== 'none' || tn.beat.length) {
    tn.beat.forEach((layer, li) => {
      if (quiet && li === 0) return;
      const pat = li === 0 && bar % 8 === 7 ? tn.fill : layer[bar % layer.length];
      const step = barDur / pat.length;
      for (let i = 0; i < pat.length; i++) {
        const c = pat[i];
        if (c === '.') continue;
        hit(tn.kit, c, a, p.master, t0 + i * step + (Math.random() - 0.5) * 0.008, step, (i === 0 ? 1 : 0.82) * (0.92 + Math.random() * 0.12));
      }
    });
  }
  // the lead comes in after two bars of rhythm
  if (bar < 2) return;
  const b = bar - 2, phrase = tn.melody[tn.form[Math.floor(b / 2) % tn.form.length]], half = b % 2;
  let prev: number | null = null;
  for (const n of notes(phrase)) {
    const f = freqOf(tn, n.deg);
    if (n.at >= half * perBar && n.at < (half + 1) * perBar) {
      const t = t0 + (n.at - half * perBar) * slot, dur = n.len * slot;
      // a grace note (kan) from the note above, now and then
      if (n.len >= 2 && Math.random() < 0.18 && tn.lead !== 'tumbi') playLead(tn.lead, a, p.master, t - 0.06, freqOf(tn, n.deg + 1), 0.07, 0.5, null);
      playLead(tn.lead, a, p.master, t, f, dur, 1, prev);
    }
    prev = f;
  }
}

// Play a story's tune (vol 0…1). Returns false when sound isn't allowed yet (no tap so far, or muted).
// Asking for the tune that's already playing just takes it over (the page's music carries straight on
// into the picture book, a little softer).
export function playTune(toy: ToyId, vol = 1, owner: Owner = 'page'): boolean {
  if (now?.toy === toy) { now.owner = owner; setVol(now, vol); return true; }
  stopTune();
  const io = audioOut();
  if (!io) return false;
  const { a, out } = io, tn = TUNES[toy];
  const master = a.createGain(), drone = a.createGain();
  master.gain.setValueAtTime(0.0001, a.currentTime);
  drone.gain.value = tn.drone === 'tanpura' ? 0.16 : 0.45; // tanpura strings ring long and would drown the tune
  drone.connect(master); master.connect(out);
  const p: Playing = { toy, owner, master, drone, vol: vol * (tn.vol ?? 1), timer: setTimeout(() => {}, 0), ducked: false };
  master.gain.linearRampToValueAtTime(p.vol, a.currentTime + 1.4);
  now = p;
  let bar = 0, next = a.currentTime + 0.12;
  const barDur = (60 / tn.bpm) * tn.beats;
  const tick = () => {
    if (now !== p) return;
    while (next < a.currentTime + 0.6) { scheduleBar(p, tn, a, bar++, next); next += barDur; }
    p.timer = setTimeout(tick, 120);
  };
  tick();
  return true;
}
function setVol(p: Playing, vol: number) {
  const io = audioOut();
  p.vol = vol * (TUNES[p.toy].vol ?? 1);
  if (io) p.master.gain.setTargetAtTime(p.ducked ? p.vol * 0.3 : p.vol, io.a.currentTime, 0.2);
}
// Stop the music (only if it's this owner's, when one is given).
export function stopTune(owner?: Owner) {
  const p = now;
  if (!p || (owner && p.owner !== owner)) return;
  now = null;
  clearTimeout(p.timer);
  const t = p.master.context.currentTime;
  p.master.gain.cancelScheduledValues(t);
  p.master.gain.setValueAtTime(p.master.gain.value, t);
  p.master.gain.setTargetAtTime(0, t, 0.25);
  setTimeout(() => { try { p.master.disconnect(); } catch {} }, 1800);
}
// Softer while someone is talking over it (the picture book's read-aloud).
export function duckTune(on: boolean) {
  if (!now || now.ducked === on) return;
  now.ducked = on;
  setVol(now, now.vol / (TUNES[now.toy].vol ?? 1));
}
export const playingTune = () => now?.toy ?? null;
