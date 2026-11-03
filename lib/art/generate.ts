// "Surprise me": seeded designs for a blank floor, in the same recipe format a visitor's own
// strokes use, so they replay, undo and share like anything drawn by hand.
import { encodePts, type Brush, type Stamp, type Stroke } from '../recipe';
import { mkRng } from '../rng';

// Unlockable colours (see UNLOCKS in lib/progress.ts).
export const GOLD_POWDER: [string, string] = ['Gold', '#D9B44A'];
export const GOLD_INK: [string, string] = ['Gold ink', '#B8902A'];
export const MOONLIGHT: [string, string] = ['Moonlight', '#BFD9FF'];

const clamp = (v: number) => Math.max(-1000, Math.min(1000, Math.round(v)));
const curve = (n: number, f: (t: number) => [number, number]) => Array.from({ length: n + 1 }, (_, i) => f(i / n)).flat().map(clamp);
const stroke = (c: string, s: number, n: number, pts: number[], b?: Brush, m?: 1): Stroke =>
  ({ c, s: Math.max(1, Math.min(200, Math.round(s))), n, p: encodePts(pts), ...(b && b !== 'powder' ? { b } : {}), ...(m ? { m } : {}) });

export const newSeed = () => (Math.random() * 2 ** 31) | 0;

// A layered mandala for n-fold symmetry: centre ring, a few rings of petals, loops and spokes,
// a flower border and diyas at the rim. Drawn in one wedge on +x; the painter mirrors it.
export function surpriseRangoli(seed: number, n: number, palette: string[]): Stroke[] {
  const r = mkRng(seed), wedge = Math.PI / n;
  const cols = [...palette].sort(() => r() - 0.5).slice(0, 4);
  const col = (i: number) => cols[i % cols.length];
  const arc = (R: number, a0: number, a1: number, k = 10) => curve(k, (t) => [R * Math.cos(a0 + (a1 - a0) * t), R * Math.sin(a0 + (a1 - a0) * t)]);
  const out: Stroke[] = [stroke(col(0), 6 + r() * 4, n, arc(70 + r() * 50, 0, wedge, 6))];
  let R = 130 + r() * 50, i = 1;
  while (R < 760 && i < 6) {
    const len = 150 + r() * 170, mid = R + len / 2;
    const amp = Math.min(40 + r() * 140, mid * Math.tan(wedge) * 0.85);
    const kind = ['petal', 'petal', 'loop', 'ring', 'spoke'][Math.floor(r() * 5)];
    if (kind === 'petal') out.push(stroke(col(i), 9 + r() * 7, n, curve(16, (t) => [R + len * t, amp * Math.sin(Math.PI * t)])));
    else if (kind === 'loop') out.push(stroke(col(i), 7 + r() * 5, n, curve(22, (t) => [R + len * Math.sin(Math.PI * t), amp * Math.sin(2 * Math.PI * t) * 0.6 + amp * 0.4 * Math.sin(Math.PI * t)])));
    else if (kind === 'ring') out.push(stroke(col(i), 8 + r() * 4, n, arc(mid, 0.04, wedge - 0.02), r() < 0.5 ? 'pookalam' : 'powder'));
    else out.push(stroke(col(i), 8 + r() * 4, n, curve(8, (t) => [R + len * t, 0]), 'petal'));
    R += len * (0.6 + r() * 0.3);
    i++;
  }
  out.push(stroke(col(i), 8 + r() * 3, n, arc(Math.min(880, R + 70), 0.06, wedge - 0.02), 'pookalam'));
  out.push(stroke('#FFC21A', 8, n, [Math.min(960, R + 150), 0], 'diya'));
  return out;
}

// A dupatta: a small repeat all over, then a few big accent blocks. Units are per-mille of the
// cloth width; `a` is height/width × 1000.
export function surpriseBlock(seed: number, a: number, inks: string[], blocks = 3): Stamp[] {
  const r = mkRng(seed), ink = () => inks[Math.floor(r() * inks.length)];
  // motifs for the big accents; the border and lattice tiles (6, 7) only make sense repeated
  const motifs = Array.from({ length: Math.min(blocks, 6) }, (_, i) => i);
  // the all-over repeat reads best in a lighter ink; kohl black and indigo are for accents
  const light = inks.filter((c) => !['#1B1410', '#2D4C7C'].includes(c.toUpperCase()));
  const base = light.length ? light[Math.floor(r() * light.length)] : ink();
  const st: Stamp[] = [{ x: Math.round(r() * 100), y: Math.round(r() * 100), t: Math.floor(r() * blocks), i: base, z: 120 + Math.round(r() * 50), r: 1 }];
  const accents = 3 + Math.floor(r() * 4), accent = inks.filter((c) => c !== base);
  for (let k = 0; k < accents; k++) {
    st.push({ x: Math.round(120 + r() * 760), y: Math.round(120 + r() * Math.max(100, a - 240)), t: motifs[Math.floor(r() * motifs.length)], i: accent[Math.floor(r() * accent.length)] ?? base, z: 240 + Math.round(r() * 120) });
  }
  return st;
}

// Bridal-ish mehendi on the right palm, mirrored to the left: a palm medallion ringed with
// dots, something different up each finger, a paisley on the thumb and a lotus band at the
// wrist. The right palm sits at x 57–90 % of the square (recipe x ≈ 140…800).
export function surpriseMehendi(seed: number, color: string): Stroke[] {
  const r = mkRng(seed), m = 1 as const;
  const cx = 455 + r() * 40, cy = 300 + r() * 50;
  const ring = (R: number, k = 28, a0 = 0) => curve(k, (t) => [cx + R * Math.cos(a0 + t * Math.PI * 2), cy + R * Math.sin(a0 + t * Math.PI * 2)]);
  const out: Stroke[] = [];
  let rad: number;
  if (r() < 0.6) {
    rad = 120 + r() * 20;
    out.push(stroke(color, 26 + r() * 6, 1, [Math.round(cx), Math.round(cy)], 'chakra', m));
  } else {
    rad = 95 + r() * 40;
    out.push(stroke(color, 10, 1, ring(rad), undefined, m), stroke(color, 18, 1, [Math.round(cx), Math.round(cy)], 'pookalam', m));
    out.push(stroke(color, 8, 1, ring(rad * 0.55, 18), 'petal', m));
  }
  out.push(stroke(color, 8, 1, ring(rad + 32, 40), r() < 0.5 ? 'bindu' : 'petal', m));
  const fingers = [225, 390, 560, 710];
  const kinds = ['vine', 'petal', 'bindu', 'keri', 'wave'];
  const pick = kinds[Math.floor(r() * kinds.length)], alt = kinds[Math.floor(r() * kinds.length)];
  fingers.forEach((fx, i) => {
    const kind = i % 2 ? alt : pick, top = -420 - r() * 160;
    if (kind === 'vine') out.push(stroke(color, 9, 1, curve(12, (t) => [fx, -70 + (top + 70) * t]), 'vine', m));
    else if (kind === 'petal') out.push(stroke(color, 10, 1, curve(10, (t) => [fx, -60 + (top + 60) * t]), 'petal', m));
    else if (kind === 'bindu') out.push(stroke(color, 10, 1, curve(10, (t) => [fx, -60 + (top + 60) * t]), 'bindu', m));
    else if (kind === 'keri') { out.push(stroke(color, 13, 1, [fx, -150], 'keri', m)); out.push(stroke(color, 8, 1, curve(6, (t) => [fx, -260 + (top + 260) * t]), 'bindu', m)); }
    else out.push(stroke(color, 9, 1, curve(16, (t) => [fx + 16 * Math.sin(t * 16), -40 + (top + 40) * t]), undefined, m));
    // fingertips dipped in paste, the traditional way
    if (r() < 0.7) out.push(stroke(color, 26, 1, [fx, Math.round(top - 70)], 'bindu', m));
  });
  out.push(stroke(color, 14, 1, [150, 300], r() < 0.5 ? 'keri' : 'kamal', m));
  out.push(stroke(color, 10, 1, curve(16, (t) => [230 + 520 * t, 600 + 26 * Math.sin(t * 22)]), undefined, m));
  out.push(stroke(color, 20, 1, [470, 690], 'kamal', m));
  if (r() < 0.6) out.push(stroke(color, 8, 1, curve(10, (t) => [240 + 500 * t, 780]), 'bindu', m));
  return out;
}
