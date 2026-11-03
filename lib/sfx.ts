// Sound and haptics. One AudioContext for the whole site, created on the first gesture (browsers
// keep audio locked until then). Everything is synthesised, so there are no audio files to load.
// Notes come from raga Bhupali (Sa Re Ga Pa Dha), a pentatonic scale where any two notes sound
// good together, so random taps still make music.
let ac: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

const KEY = 'rangotsav:sound';
const EVT = 'rangotsav:sound';
let muted: boolean | null = null;

export function isMuted(): boolean {
  if (muted == null) { try { muted = localStorage.getItem(KEY) === 'off'; } catch { muted = false; } }
  return muted;
}
export function setMuted(m: boolean) {
  muted = m;
  try { localStorage.setItem(KEY, m ? 'off' : 'on'); } catch {}
  if (master && ac) master.gain.setTargetAtTime(m ? 0 : 1, ac.currentTime, 0.02);
  try { window.dispatchEvent(new Event(EVT)); } catch {}
}
export function onMute(fn: () => void) {
  window.addEventListener(EVT, fn);
  return () => window.removeEventListener(EVT, fn);
}

// Browsers only allow audio and vibration after the visitor has tapped or typed on the page.
const activated = () => (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive !== false;

function ctx(): AudioContext | null {
  if (typeof window === 'undefined' || isMuted() || (!ac && !activated())) return null;
  try {
    if (!ac) {
      const A = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!A) return null;
      ac = new A();
      master = ac.createGain();
      master.gain.value = 0.9;
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    return ac;
  } catch {
    return null;
  }
}
const out = () => master!;
// For the story music (lib/music.ts): the shared context and the master output, or null before the
// first tap and while muted.
export function audioOut(): { a: AudioContext; out: AudioNode } | null {
  const a = ctx();
  return a ? { a, out: out() } : null;
}

export function noise(a: AudioContext): AudioBuffer {
  if (noiseBuf) return noiseBuf;
  const b = a.createBuffer(1, a.sampleRate, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return (noiseBuf = b);
}

// Bhupali over three octaves, from Sa = C4.
const SA = 261.63;
const STEPS = [0, 2, 4, 7, 9];
export const note = (i: number) => SA * 2 ** ((STEPS[((i % 5) + 5) % 5] + 12 * Math.floor(i / 5)) / 12);

// A small brass bell: three detuned partials with a long tail.
export function ting(freq = 880, vol = 1) {
  const a = ctx();
  if (!a) return;
  const t = a.currentTime;
  for (const [k, v] of [[1, 0.1], [1.5, 0.06], [3, 0.02]]) {
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine';
    o.frequency.value = freq * k * (1 + Math.random() * 0.012);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v * vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    o.connect(g); g.connect(out());
    o.start(t); o.stop(t + 1.9);
  }
}

// A plucked, santoor-ish note: bright attack, quick decay.
export function pluck(i: number, vol = 1, delay = 0) {
  const a = ctx();
  if (!a) return;
  const t = a.currentTime + delay, f = note(i);
  const o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(), lp = a.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = f;
  o2.type = 'sine'; o2.frequency.value = f * 2.01;
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 8, t); lp.frequency.exponentialRampToValueAtTime(f * 2, t + 0.4);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.13 * vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
  o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(out());
  o.start(t); o2.start(t); o.stop(t + 1); o2.stop(t + 1);
}

// A rising run of notes, for "it's woven" and "you made something".
export function chime(from = 5, n = 4) {
  for (let k = 0; k < n; k++) pluck(from + k, 0.9, k * 0.07);
}

// Bell chord: shares, stamps and unlocks.
export function chord() {
  ting(note(10), 0.8);
  setTimeout(() => ting(note(12), 0.6), 90);
  setTimeout(() => ting(note(14), 0.5), 180);
}

// The thud of a wooden block on cotton. pitch > 1 makes it higher (a combo of quick presses climbs).
export function thump(big = false, pitch = 1) {
  const a = ctx();
  if (!a) return;
  const t = a.currentTime;
  const o = a.createOscillator(), g = a.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime((big ? 140 : 180) * pitch, t);
  o.frequency.exponentialRampToValueAtTime(55 * pitch, t + 0.12);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(big ? 0.5 : 0.35, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g); g.connect(out());
  o.start(t); o.stop(t + 0.25);
  const n = a.createBufferSource(), nf = a.createBiquadFilter(), ng = a.createGain();
  n.buffer = noise(a);
  nf.type = 'lowpass'; nf.frequency.value = 900;
  ng.gain.setValueAtTime(0.12, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  n.connect(nf); nf.connect(ng); ng.connect(out());
  n.start(t, Math.random() * 0.5, 0.1);
}

// Rice powder hissing from the fingers: a filtered noise loop whose loudness follows the stroke
// speed. Returns handles to drive it while drawing.
export function powder(tone = 2600) {
  const a = ctx();
  if (!a) return { speed: (_: number) => {}, stop: () => {} };
  const src = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain();
  src.buffer = noise(a); src.loop = true;
  bp.type = 'bandpass'; bp.frequency.value = tone; bp.Q.value = 0.9;
  g.gain.value = 0;
  src.connect(bp); bp.connect(g); g.connect(out());
  src.start();
  let done = false;
  return {
    speed(px: number) { if (!done) g.gain.setTargetAtTime(Math.min(0.07, px * 0.0016), a.currentTime, 0.03); },
    stop() {
      if (done) return;
      done = true;
      g.gain.setTargetAtTime(0, a.currentTime, 0.05);
      src.stop(a.currentTime + 0.3);
    },
  };
}

// A soft whoosh (gulal, fireworks launching).
export function whoosh(dur = 0.6, from = 400, to = 2400, vol = 0.12) {
  const a = ctx();
  if (!a) return;
  const t = a.currentTime;
  const n = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  n.buffer = noise(a); n.loop = true;
  f.type = 'bandpass'; f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  n.connect(f); f.connect(g); g.connect(out());
  n.start(t); n.stop(t + dur + 0.05);
}

// A soft pop with a crackle tail (a firework bursting, quietly).
export function burst(vol = 1) {
  const a = ctx();
  if (!a) return;
  const t = a.currentTime;
  const n = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  n.buffer = noise(a);
  f.type = 'lowpass'; f.frequency.setValueAtTime(3000, t); f.frequency.exponentialRampToValueAtTime(300, t + 0.4);
  g.gain.setValueAtTime(0.22 * vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  n.connect(f); f.connect(g); g.connect(out());
  n.start(t, Math.random() * 0.4, 0.5);
  for (let k = 0; k < 7; k++) {
    const c = a.createBufferSource(), cg = a.createGain(), at = t + 0.15 + Math.random() * 0.6;
    c.buffer = noise(a);
    cg.gain.setValueAtTime(0.06 * vol, at); cg.gain.exponentialRampToValueAtTime(0.0001, at + 0.03);
    c.connect(cg); cg.connect(out());
    c.start(at, Math.random() * 0.8, 0.04);
  }
}

export function buzz(p: number | number[]) {
  try { if (activated()) navigator.vibrate?.(p); } catch {}
}

// A lorry's two-tone air horn: "Horn OK Please".
export function horn(long = false) {
  const a = ctx();
  if (!a) return;
  const t = a.currentTime, dur = long ? 0.9 : 0.42;
  const g = a.createGain(), lp = a.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 1800;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.11, t + 0.03);
  g.gain.setValueAtTime(0.11, t + dur - 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  lp.connect(g); g.connect(out());
  for (const f of [349, 440]) {
    const o = a.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f * 0.96, t);
    o.frequency.linearRampToValueAtTime(f, t + 0.06);
    o.connect(lp);
    o.start(t); o.stop(t + dur + 0.02);
  }
}

// A sparkler fizzing: a bright hiss with little crackles popping at random, louder as the hand
// moves faster. Returns handles to drive it while drawing (like powder()).
export function crackle() {
  const a = ctx();
  if (!a) return { speed: (_: number) => {}, stop: () => {} };
  const src = a.createBufferSource(), hp = a.createBiquadFilter(), g = a.createGain();
  src.buffer = noise(a); src.loop = true;
  hp.type = 'highpass'; hp.frequency.value = 3400;
  g.gain.value = 0;
  src.connect(hp); hp.connect(g); g.connect(out());
  src.start();
  g.gain.setTargetAtTime(0.03, a.currentTime, 0.05);
  let done = false, timer: ReturnType<typeof setTimeout>;
  const pop = () => {
    if (done) return;
    const t = a.currentTime, c = a.createBufferSource(), bp = a.createBiquadFilter(), cg = a.createGain();
    c.buffer = noise(a);
    bp.type = 'bandpass'; bp.frequency.value = 1800 + Math.random() * 4200; bp.Q.value = 2.2;
    cg.gain.setValueAtTime(0.05 + Math.random() * 0.06, t); cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    c.connect(bp); bp.connect(cg); cg.connect(out());
    c.start(t, Math.random() * 0.8, 0.04);
    timer = setTimeout(pop, 25 + Math.random() * 95);
  };
  timer = setTimeout(pop, 30);
  return {
    speed(px: number) { if (!done) g.gain.setTargetAtTime(Math.min(0.09, 0.03 + px * 0.002), a.currentTime, 0.04); },
    stop() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      g.gain.setTargetAtTime(0, a.currentTime, 0.06);
      src.stop(a.currentTime + 0.4);
    },
  };
}

// ---------- tanpura: the four strings (Pa, Sa, Sa, low Sa) plucked in a slow cycle ----------
const TANPURA = [220, 293.66, 293.66, 146.83];
export function tanpuraString(a: AudioContext, out: AudioNode, f: number, t: number) {
  for (const [m, v] of [[1, 0.5], [2, 0.18], [3, 0.1], [4, 0.06]] as const) {
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine';
    o.frequency.value = f * m * (1 + (m - 1) * 0.0015);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, t + 3.2);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + 3.3);
  }
}
// dur seconds of drone into any context's node, fading in and out (the reel recorder's soundtrack)
export function drone(a: AudioContext, out: AudioNode, dur: number) {
  const t0 = a.currentTime, master = a.createGain();
  master.gain.setValueAtTime(0, t0);
  master.gain.linearRampToValueAtTime(0.16, t0 + 1.2);
  master.gain.setValueAtTime(0.16, t0 + dur - 1.2);
  master.gain.linearRampToValueAtTime(0, t0 + dur);
  master.connect(out);
  for (let k = 0; k * 0.9 < dur; k++) tanpuraString(a, master, TANPURA[k % 4], t0 + k * 0.9);
}
// A quiet live drone (under the picture book) that keeps going until stop().
export function tanpura(vol = 0.08) {
  const a = ctx();
  if (!a) return { stop: () => {} };
  const g = a.createGain();
  g.gain.setValueAtTime(0, a.currentTime);
  g.gain.linearRampToValueAtTime(vol, a.currentTime + 1.5);
  g.connect(out());
  let k = 0, done = false, timer: ReturnType<typeof setTimeout>;
  const tick = () => { if (done) return; tanpuraString(a, g, TANPURA[k++ % 4], a.currentTime + 0.05); timer = setTimeout(tick, 900); };
  timer = setTimeout(tick, 0);
  return {
    stop() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      g.gain.setTargetAtTime(0, a.currentTime, 0.35);
      setTimeout(() => g.disconnect(), 2500);
    },
  };
}

// A lorry's diesel engine: a low, lumpy rumble that revs up as it pulls away (dur seconds).
export function engine(dur = 1.6) {
  const a = ctx();
  if (!a) return;
  const t = a.currentTime, o = a.createOscillator(), lp = a.createBiquadFilter(), g = a.createGain(), lfo = a.createOscillator(), lg = a.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(38, t);
  o.frequency.linearRampToValueAtTime(42, t + dur * 0.45);
  o.frequency.exponentialRampToValueAtTime(95, t + dur);
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(260, t); lp.frequency.linearRampToValueAtTime(900, t + dur);
  lfo.frequency.value = 11; lg.gain.value = 0.05;
  lfo.connect(lg); lg.connect(g.gain);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.13, t + 0.12);
  g.gain.setValueAtTime(0.13, t + dur - 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(lp); lp.connect(g); g.connect(out());
  o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
}

// A string of ghungroo (little brass bells) shaken: a quick shower of high, bright tings.
export function jingle(n = 7) {
  const a = ctx();
  if (!a) return;
  for (let k = 0; k < n; k++) {
    const t = a.currentTime + k * 0.025 + Math.random() * 0.03, f = 2600 + Math.random() * 2600;
    for (const [m, v] of [[1, 0.05], [2.7, 0.02]]) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'sine'; o.frequency.value = f * m;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(g); g.connect(out());
      o.start(t); o.stop(t + 0.4);
    }
  }
}

// ---------- Kathputli: the dholak, the boli reed and the crowd ----------
// One stroke of a dholak. bass: the big left head, its pitch sliding down as the palm presses
// ("ge"); otherwise the small right head's ringing slap ("na", "ta"). Into any context and node,
// so the reel recorder can play the same drum.
export function dholakHit(a: AudioContext, o: AudioNode, t: number, bass: boolean, vol = 1) {
  const s = a.createOscillator(), g = a.createGain();
  s.type = 'sine';
  if (bass) { s.frequency.setValueAtTime(150, t); s.frequency.exponentialRampToValueAtTime(70, t + 0.28); }
  else { s.frequency.setValueAtTime(420, t); s.frequency.exponentialRampToValueAtTime(380, t + 0.15); }
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime((bass ? 0.42 : 0.2) * vol, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (bass ? 0.4 : 0.18));
  s.connect(g); g.connect(o);
  s.start(t); s.stop(t + 0.45);
  const n = a.createBufferSource(), f = a.createBiquadFilter(), ng = a.createGain();
  n.buffer = noise(a);
  f.type = 'bandpass'; f.frequency.value = bass ? 600 : 2600; f.Q.value = 1.4;
  ng.gain.setValueAtTime((bass ? 0.08 : 0.14) * vol, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  n.connect(f); f.connect(ng); ng.connect(o);
  n.start(t, Math.random() * 0.8, 0.06);
}
// Keherwa, eight beats: Dha Ge Na Ti | Na Ka Dhi Na (true = the bass head joins in).
const KEHERWA: [boolean, boolean][] = [[true, true], [true, false], [false, true], [false, true], [false, true], [false, true], [true, true], [false, true]];
// dur seconds of dholak into any context's node (the reel's soundtrack).
export function dholakInto(a: AudioContext, o: AudioNode, dur: number, bpm = 104) {
  const step = 60 / bpm, t0 = a.currentTime + 0.05;
  for (let k = 0; k * step < dur; k++) {
    const [b, r] = KEHERWA[k % 8], t = t0 + k * step;
    if (b) dholakHit(a, o, t, true, 0.8);
    if (r) dholakHit(a, o, t, false, k % 4 ? 0.7 : 1);
    if (k % 2) dholakHit(a, o, t + step / 2, false, 0.35); // the little in-between tap
  }
}
// A live dholak that keeps playing until stop(), scheduled a little ahead so it never stumbles.
// onBeat(k) fires on each beat, roughly in time, for the dance.
export function dholak(bpm = 104, onBeat?: (k: number) => void) {
  const a = ctx();
  if (!a) return { stop: () => {} };
  const step = 60 / bpm, t0 = a.currentTime + 0.08, g = a.createGain();
  g.gain.value = 0.9;
  g.connect(out());
  let k = 0, done = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const tick = () => {
    if (done) return;
    while (t0 + k * step < a.currentTime + 0.3) {
      const [b, r] = KEHERWA[k % 8], t = t0 + k * step, n = k;
      if (b) dholakHit(a, g, t, true, 0.8);
      if (r) dholakHit(a, g, t, false, k % 4 ? 0.7 : 1);
      if (k % 2) dholakHit(a, g, t + step / 2, false, 0.35);
      if (onBeat) timers.push(setTimeout(() => !done && onBeat(n), Math.max(0, (t - a.currentTime) * 1000)));
      k++;
    }
    timers.push(setTimeout(tick, 90));
  };
  tick();
  return {
    stop() {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      g.gain.setTargetAtTime(0, a.currentTime, 0.08);
      setTimeout(() => g.disconnect(), 800);
    },
  };
}

// The boli: the bamboo-and-skin reed the puppeteer holds in his mouth to give the puppet its
// squeaky, warbling voice. n syllables, each a quick wobbling chirp.
export function boli(n = 3) {
  const a = ctx();
  if (!a) return;
  for (let k = 0; k < n; k++) {
    const t = a.currentTime + k * 0.16, f = 950 + Math.random() * 500, len = 0.1 + Math.random() * 0.06;
    const o = a.createOscillator(), bp = a.createBiquadFilter(), g = a.createGain(), lfo = a.createOscillator(), lg = a.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f * 0.8, t);
    o.frequency.linearRampToValueAtTime(f * 1.25, t + len * 0.4);
    o.frequency.linearRampToValueAtTime(f * (0.9 + Math.random() * 0.3), t + len);
    lfo.frequency.value = 32; lg.gain.value = f * 0.06;
    lfo.connect(lg); lg.connect(o.frequency);
    bp.type = 'bandpass'; bp.frequency.value = f * 1.6; bp.Q.value = 3;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(bp); bp.connect(g); g.connect(out());
    o.start(t); lfo.start(t); o.stop(t + len + 0.02); lfo.stop(t + len + 0.02);
  }
}

// Taaliyan: an audience clapping, many hands, swelling and dying away over dur seconds.
export function taaliyan(dur = 2.4) {
  const a = ctx();
  if (!a) return;
  const t0 = a.currentTime;
  for (let k = 0; k < dur * 38; k++) {
    const p = k / (dur * 38), t = t0 + p * dur + Math.random() * 0.04, vol = Math.sin(Math.PI * Math.min(1, p * 1.6)) * 0.16 + 0.02;
    const n = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    n.buffer = noise(a);
    f.type = 'bandpass'; f.frequency.value = 900 + Math.random() * 1600; f.Q.value = 1.1;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    n.connect(f); f.connect(g); g.connect(out());
    n.start(t, Math.random() * 0.9, 0.05);
  }
}

// ---------- Warli: the tarpa and a drum ----------
// The tarpa is a long horn of dried bottle gourd and bamboo with a nasal, buzzing voice. It plays
// a short circling tune for the dancers; Palto switches to a higher one (people say two different
// notes tell the dancers which way to turn).
const TARPA_TUNES = [[5, 6, 7, 6, 5, 6, 8, 7], [8, 9, 8, 7, 8, 9, 10, 9]];
function tarpaNote(a: AudioContext, o: AudioNode, t: number, i: number, len: number, vol = 1) {
  const f = note(i) / 2, s = a.createOscillator(), q = a.createOscillator(), bp = a.createBiquadFilter(), g = a.createGain(), lfo = a.createOscillator(), lg = a.createGain();
  s.type = 'sawtooth'; q.type = 'square'; s.frequency.value = f; q.frequency.value = f * 1.003;
  lfo.frequency.value = 5.5; lg.gain.value = f * 0.012; lfo.connect(lg); lg.connect(s.frequency); lg.connect(q.frequency);
  bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 1.2;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05 * vol, t + 0.04);
  g.gain.setValueAtTime(0.05 * vol, t + len * 0.8);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  s.connect(bp); q.connect(bp); bp.connect(g); g.connect(o);
  for (const n of [s, q, lfo]) { n.start(t); n.stop(t + len + 0.02); }
}
function tarpaBeat(a: AudioContext, o: AudioNode, t: number, k: number, tune: number, step: number) {
  tarpaNote(a, o, t, TARPA_TUNES[tune][k % 8], step * 0.95);
  dholakHit(a, o, t, true, k % 4 ? 0.35 : 0.6);
}
export function tarpaInto(a: AudioContext, o: AudioNode, dur: number, speed = 1, tune = 0) {
  const step = 60 / (84 * speed), t0 = a.currentTime + 0.05;
  for (let k = 0; k * step < dur; k++) tarpaBeat(a, o, t0 + k * step, k, tune, step);
}
// A live tarpa tune that loops until stop(); speed() follows the dance, palto() switches tunes.
export function tarpa(speed = 1) {
  const a = ctx();
  if (!a) return { stop: () => {}, speed: (_: number) => {}, palto: () => {} };
  const g = a.createGain();
  g.gain.value = 0.9;
  g.connect(out());
  let k = 0, next = a.currentTime + 0.08, sp = speed, tune = 0, done = false, timer: ReturnType<typeof setTimeout>;
  const tick = () => {
    if (done) return;
    while (next < a.currentTime + 0.3) { const step = 60 / (84 * sp); tarpaBeat(a, g, next, k++, tune, step); next += step; }
    timer = setTimeout(tick, 90);
  };
  tick();
  return {
    stop() { if (done) return; done = true; clearTimeout(timer); g.gain.setTargetAtTime(0, a.currentTime, 0.1); setTimeout(() => g.disconnect(), 900); },
    speed(v: number) { sp = Math.max(0.3, Math.min(2.5, v)); },
    // the signal: one long call on the new tune's top note, then the new tune
    palto() { tune = 1 - tune; tarpaNote(a, g, next, TARPA_TUNES[tune][6] + 2, 0.9, 1.4); next += 0.9; k = 0; },
  };
}
