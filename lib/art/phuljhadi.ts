// Phuljhadi: painting with a Diwali sparkler. Strokes of light on a moonless night sky (Diwali
// falls on amavasya, the new-moon night). Each stroke is drawn in three bands (a wide halo, a glow
// and a white-hot core), each band on its own layer, so joints and crossings never bead or notch;
// the layers are then laid over the sky additively, halo faint and core bright, like light adds up.
// Strokes use the rangoli recipe format (Stroke in lib/recipe.ts) with their own copy rule: n turns
// round the centre, each one mirrored too when m is 1. Free is 1 copy, Chakri 6 turns (it spins
// like the ground chakri), Mandala 4 mirrored turns. The toy, the replay player and the OG image
// (as SVG) all draw from here.
import { decodePts, type Stroke } from '../recipe';
import { skyline } from './skyline';
import { mkRng } from '../rng';

type Ctx = CanvasRenderingContext2D;
type P = { x: number; y: number };
const TAU = Math.PI * 2;

// [name, colour, what gives a firework this colour]
export const SPARK_COLOURS: [string, string, string][] = [
  ['Sona', '#FFC94A', 'gold, from burning iron'],
  ['Chandi', '#FFF2D6', 'white, from aluminium'],
  ['Laal', '#FF4B3E', 'red, from strontium'],
  ['Hara', '#6BFF7A', 'green, from barium'],
  ['Neela', '#45D4FF', 'blue-green, from copper'],
  ['Jamuni', '#C77DFF', 'purple, from strontium and copper'],
];
export const MODES = [
  { id: 'free', label: 'Free', n: 1, m: false, note: 'Write anything' },
  { id: 'chakri', label: 'Chakri ×6', n: 6, m: false, note: 'Spins six ways, like a chakri' },
  { id: 'mandala', label: 'Mandala ×8', n: 4, m: true, note: 'Mirrored eight ways' },
] as const;
// [label, line width in px on a 600px floor]
export const SIZES: [string, number][] = [['Patli', 4], ['Medium', 7], ['Moti', 11]];

export const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
export const coreOf = (c: string) => mix(c, '#FFFFFF', 0.62);

// Every copy of point p (px about the centre): n turns, each mirrored across the axis too if m.
export function copies(p: P, n: number, m: boolean): P[] {
  const out: P[] = [];
  for (let k = 0; k < n; k++) {
    const a = (k * TAU) / n, c = Math.cos(a), s = Math.sin(a);
    out.push({ x: p.x * c - p.y * s, y: p.x * s + p.y * c });
    if (m) out.push({ x: p.x * c + p.y * s, y: p.x * s - p.y * c });
  }
  return out;
}

// ---------- the night ----------
const skies = new Map<string, HTMLCanvasElement>();
// The sky, cached per size: indigo to plum, a seeded scatter of stars, and the city skyline (drawn
// 600px wide and scaled, so every size has the same skyline).
export function nightSky(S: number, d = 1): HTMLCanvasElement {
  const key = `${Math.round(S)}@${d}`;
  const hit = skies.get(key);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = cv.height = Math.round(S * d);
  const x = cv.getContext('2d')!;
  x.scale(d, d);
  const g = x.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, '#07041A'); g.addColorStop(0.62, '#1A0A2E'); g.addColorStop(1, '#3A1238');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  const r = mkRng(808), k = S / 600;
  for (let i = 0; i < 95; i++) {
    const sx = r() * S, sy = r() ** 1.6 * S * 0.78, s = (0.6 + r() * 1.3) * k;
    x.globalAlpha = 0.3 + r() * 0.6; x.fillStyle = r() < 0.22 ? '#FFE29A' : '#FFFFFF'; x.fillRect(sx, sy, s, s);
  }
  x.globalAlpha = 1;
  const base = 110;
  x.drawImage(skyline(600, base, 2026, k * d), 0, S - base * k, S, base * k);
  if (skies.size > 6) skies.clear();
  skies.set(key, cv);
  return cv;
}

// ---------- light ----------
export type Light = { halo: HTMLCanvasElement; glow: HTMLCanvasElement; core: HTMLCanvasElement; S: number };
export function lightLayers(S: number, d = 1): Light {
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = Math.round(S * d); c.getContext('2d')!.setTransform(d, 0, 0, d, 0, 0); return c; };
  return { halo: mk(), glow: mk(), core: mk(), S };
}
const ctxs = (L: Light) => [L.halo.getContext('2d')!, L.glow.getContext('2d')!, L.core.getContext('2d')!];
export function clearLight(L: Light) { for (const x of ctxs(L)) { x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, x.canvas.width, x.canvas.height); x.restore(); } }
// Real sparkler light: it dies away. a = how much fades this frame.
export function fadeLight(L: Light, a: number) {
  for (const x of ctxs(L)) { x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'destination-out'; x.fillStyle = `rgba(0,0,0,${a})`; x.fillRect(0, 0, x.canvas.width, x.canvas.height); x.restore(); }
}

// A soft round dot of colour c, for airbrushing the halo (cached per colour).
const dots = new Map<string, HTMLCanvasElement>();
function softDot(c: string): HTMLCanvasElement {
  const hit = dots.get(c);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const x = cv.getContext('2d')!, g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, c); g.addColorStop(0.3, c + 'AA'); g.addColorStop(1, c + '00');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  dots.set(c, cv);
  return cv;
}

// A painter for one stroke of light: seg(a, b), points in px about the floor's centre. The glow
// and the core are solid strokes on their own layers; the halo is airbrushed with soft dots
// spaced along the line, so it fades out smoothly at the edges.
export function lightPainter(L: Light, o: { c: string; sizePx: number; n: number; m: boolean }) {
  const [hx, gx, cx] = ctxs(L), h = L.S / 2, dot = softDot(o.c), R = o.sizePx * 4.6, step = Math.max(1.5, o.sizePx * 0.55);
  let carry = 0, started = false;
  const line = (x: CanvasRenderingContext2D, A: P[], B: P[], w: number, col: string) => {
    x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath();
    for (let k = 0; k < A.length; k++) { x.moveTo(h + A[k].x, h + A[k].y); x.lineTo(h + B[k].x + 0.01, h + B[k].y); }
    x.stroke();
  };
  const puff = (p: P) => { for (const q of copies(p, o.n, o.m)) hx.drawImage(dot, h + q.x - R, h + q.y - R, R * 2, R * 2); };
  return {
    seg(a: P, b: P) {
      const A = copies(a, o.n, o.m), B = copies(b, o.n, o.m), d = Math.hypot(b.x - a.x, b.y - a.y);
      hx.save(); hx.globalAlpha = 0.14;
      if (!started) { puff(a); started = true; }
      let t = step - carry;
      for (; t <= d; t += step) puff({ x: a.x + ((b.x - a.x) * t) / d, y: a.y + ((b.y - a.y) * t) / d });
      carry = d - (t - step);
      hx.restore();
      line(gx, A, B, o.sizePx * 1.8, o.c);
      line(cx, A, B, o.sizePx * 0.72, coreOf(o.c));
    },
  };
}

// Lays the light over the sky: the halo faint, the glow brighter, the core at full strength.
export function composite(x: Ctx, S: number, sky: HTMLCanvasElement, L: Light) {
  x.drawImage(sky, 0, 0, S, S);
  x.save();
  x.globalCompositeOperation = 'lighter';
  x.globalAlpha = 0.9; x.drawImage(L.halo, 0, 0, S, S);
  x.globalAlpha = 0.7; x.drawImage(L.glow, 0, 0, S, S);
  x.globalAlpha = 1; x.drawImage(L.core, 0, 0, S, S);
  x.restore();
}

// The burning tip of a sparkler at p (px on the floor): a white-hot bead in a glow of its colour.
export function sparklerTip(x: Ctx, p: P, c: string, size: number) {
  x.save();
  x.globalCompositeOperation = 'lighter';
  const g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 4);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.25, coreOf(c)); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.beginPath(); x.arc(p.x, p.y, size * 4, 0, TAU); x.fill();
  x.restore();
}

export type DecodedLight = { st: Stroke; pts: number[] };
// Replays strokes a few points at a time: advance(n) paints up to point n overall and returns the
// pen tips it reached (px about the centre, with their copy rule), so sparks can fly from them.
export function lightReplayer(L: Light, strokes: Stroke[]) {
  const ds: DecodedLight[] = strokes.map((st) => ({ st, pts: decodePts(st.p) ?? [] }));
  const S = L.S, at = (pts: number[], i: number): P => ({ x: (pts[i * 2] * S) / 2000, y: (pts[i * 2 + 1] * S) / 2000 });
  let si = 0, pi = 0, done = 0, pen: ReturnType<typeof lightPainter> | null = null;
  return {
    total: ds.reduce((a, d) => a + d.pts.length / 2, 0),
    advance(to: number): { p: P; c: string; n: number; m: boolean } | null {
      let tip: { p: P; c: string; n: number; m: boolean } | null = null;
      while (done < to && si < ds.length) {
        const { st, pts } = ds[si], np = pts.length / 2;
        if (!pen) { pen = lightPainter(L, { c: st.c, sizePx: (st.s * S) / 1000, n: st.n, m: st.m === 1 }); pen.seg(at(pts, 0), at(pts, 0)); pi = 1; done++; }
        while (pi < np && done < to) { pen.seg(at(pts, pi - 1), at(pts, pi)); pi++; done++; }
        tip = { p: at(pts, Math.min(pi, np) - 1), c: st.c, n: st.n, m: st.m === 1 };
        if (pi >= np) { si++; pi = 0; pen = null; }
      }
      return tip;
    },
  };
}

// The OG image: strokes as SVG paths in three bands over a night gradient (no canvas on the server).
export function phuljhadiSvg(strokes: Stroke[], S: number): string {
  const h = S / 2, defs: string[] = [], uses: [string, string, string][] = [];
  strokes.forEach((st, i) => {
    const pts = decodePts(st.p) ?? [];
    if (!pts.length) return;
    let d = `M${((pts[0] * S) / 2000).toFixed(1)} ${((pts[1] * S) / 2000).toFixed(1)}`;
    for (let k = 2; k < pts.length; k += 2) d += `L${((pts[k] * S) / 2000).toFixed(1)} ${((pts[k + 1] * S) / 2000).toFixed(1)}`;
    if (pts.length === 2) d += 'l0.01 0';
    defs.push(`<path id="p${i}" d="${d}"/>`);
    const w = (st.s * S) / 1000;
    for (let k = 0; k < st.n; k++) {
      const rot = `rotate(${((k * 360) / st.n).toFixed(2)})`;
      for (const t of st.m === 1 ? [rot, `${rot} scale(1 -1)`] : [rot]) uses.push([`p${i}`, t, `${st.c}|${w.toFixed(1)}`]);
    }
  });
  const band = (k: number, op: number, core: boolean) => uses.map(([id, t, cw]) => {
    const [c, w] = cw.split('|');
    return `<use xlink:href="#${id}" transform="${t}" stroke="${core ? coreOf(c) : c}" stroke-width="${(+w * k).toFixed(1)}" opacity="${op}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><defs><linearGradient id="n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07041A"/><stop offset=".62" stop-color="#1A0A2E"/><stop offset="1" stop-color="#3A1238"/></linearGradient>${defs.join('')}</defs><rect width="${S}" height="${S}" fill="url(#n)"/><g transform="translate(${h} ${h})" fill="none" stroke-linecap="round" stroke-linejoin="round">${band(5, 0.2, false)}${band(2.2, 0.6, false)}${band(0.75, 1, true)}</g></svg>`;
}
