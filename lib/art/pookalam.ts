// Pookalam: Kerala's Onam flower carpet. A layout is a set of rings (a centre disc, then bands
// of sectors, petals, zig-zags and swirls); every cell of every ring is filled with one kind of
// flower. A recipe stores one character per cell, so the same layout and string always give
// the same carpet. Shared by the client and the server (OG images): canvas code takes a ctx.
import { mkRng } from '../rng';

export type Pt = [number, number];
export type Kind = 'disc' | 'sector' | 'petal' | 'gap' | 'up' | 'down' | 'swirl';
export type Cell = { ring: number; kind: Kind; k: number; n: number; poly: Pt[]; c: Pt };
type Ring = { r0: number; r1: number; n: number; style: 'disc' | 'sector' | 'petal' | 'zigzag' | 'swirl'; tw?: number };

export const FLOWERS: [string, string, string][] = [
  ['Chendumalli', 'marigold', '#F07F13'],
  ['Mukkutti', 'little yellow', '#FFC21A'],
  ['Thumba', 'white', '#F6F1E3'],
  ['Chethi', 'ixora', '#D7262E'],
  ['Chembarathi', 'hibiscus', '#8E1630'],
  ['Arali', 'oleander', '#E8649A'],
  ['Vadamalli', 'globe amaranth', '#7B3F98'],
  ['Shankhupushpam', 'butterfly pea', '#3559A8'],
  ['Kanakambaram', 'firecracker', '#F2A65A'],
  ['Leaves', 'green', '#3F7D2E'],
  ['Tender leaves', 'light green', '#8CBF3F'],
];
export const EMPTY = '.';
export const flowerChar = (i: number) => String.fromCharCode(97 + i);
export const flowerIndex = (ch: string) => (ch === EMPTY ? -1 : ch.charCodeAt(0) - 97);

export const LAYOUTS: { name: string; rings: Ring[] }[] = [
  { name: 'Classic', rings: [
    { r0: 0, r1: 0.1, n: 1, style: 'disc' },
    { r0: 0.1, r1: 0.21, n: 8, style: 'sector' },
    { r0: 0.21, r1: 0.37, n: 8, style: 'petal' },
    { r0: 0.37, r1: 0.46, n: 16, style: 'sector' },
    { r0: 0.46, r1: 0.6, n: 16, style: 'zigzag' },
    { r0: 0.6, r1: 0.77, n: 16, style: 'petal' },
    { r0: 0.77, r1: 0.86, n: 32, style: 'sector' },
    { r0: 0.86, r1: 1, n: 32, style: 'zigzag' },
  ] },
  { name: 'Lotus', rings: [
    { r0: 0, r1: 0.12, n: 1, style: 'disc' },
    { r0: 0.12, r1: 0.32, n: 8, style: 'petal' },
    { r0: 0.32, r1: 0.52, n: 16, style: 'petal' },
    { r0: 0.52, r1: 0.6, n: 16, style: 'sector' },
    { r0: 0.6, r1: 0.82, n: 16, style: 'petal' },
    { r0: 0.82, r1: 1, n: 32, style: 'zigzag' },
  ] },
  { name: 'Chakra', rings: [
    { r0: 0, r1: 0.1, n: 1, style: 'disc' },
    { r0: 0.1, r1: 0.3, n: 8, style: 'swirl', tw: 0.9 },
    { r0: 0.3, r1: 0.38, n: 16, style: 'sector' },
    { r0: 0.38, r1: 0.62, n: 16, style: 'swirl', tw: -0.9 },
    { r0: 0.62, r1: 0.75, n: 16, style: 'zigzag' },
    { r0: 0.75, r1: 0.84, n: 32, style: 'sector' },
    { r0: 0.84, r1: 1, n: 32, style: 'petal' },
  ] },
];

const TOP = -Math.PI / 2; // cell 0 starts at twelve o'clock
const polar = (r: number, a: number): Pt => [r * Math.cos(TOP + a), r * Math.sin(TOP + a)];
function arc(r: number, a0: number, a1: number): Pt[] {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 0.05));
  return Array.from({ length: n + 1 }, (_, i) => polar(r, a0 + ((a1 - a0) * i) / n));
}
function quad(p0: Pt, c: Pt, p1: Pt, n = 10): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, u = 1 - t;
    return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]] as Pt;
  });
}
const centroid = (poly: Pt[]): Pt => { let x = 0, y = 0; for (const [a, b] of poly) { x += a; y += b; } return [x / poly.length, y / poly.length]; };

// Cells of a layout in unit coordinates (the carpet is a circle of radius 1 at the origin).
const cache = new Map<number, Cell[]>();
export function cells(layout: number): Cell[] {
  const hit = cache.get(layout);
  if (hit) return hit;
  const out: Cell[] = [];
  LAYOUTS[layout].rings.forEach((g, ring) => {
    const D = (Math.PI * 2) / g.n, push = (kind: Kind, k: number, poly: Pt[]) => out.push({ ring, kind, k, n: g.n, poly, c: centroid(poly) });
    if (g.style === 'disc') { push('disc', 0, arc(g.r1, 0, Math.PI * 2).slice(0, -1)); return; }
    for (let k = 0; k < g.n; k++) {
      const a0 = k * D, a1 = a0 + D;
      if (g.style === 'sector') push('sector', k, [...arc(g.r1, a0, a1), ...arc(g.r0, a1, a0)]);
      else if (g.style === 'swirl') {
        const tw = (g.tw ?? 0.8) * D;
        const edge = (a: number) => Array.from({ length: 9 }, (_, i) => { const t = i / 8; return polar(g.r0 + (g.r1 - g.r0) * t, a + tw * t * t); });
        push('swirl', k, [...edge(a0), ...arc(g.r1, a0 + tw, a1 + tw), ...edge(a1).reverse(), ...arc(g.r0, a1, a0)]);
      } else if (g.style === 'zigzag') {
        const h = D / 2;
        push('up', k, [polar(g.r0, a0), polar(g.r1, a0 + h), polar(g.r0, a1), ...arc(g.r0, a1, a0).slice(1, -1)]);
        push('down', k, [polar(g.r1, a0 + h), polar(g.r0, a1), polar(g.r1, a1 + h), ...arc(g.r1, a1 + h, a0 + h).slice(1, -1)]);
      } else {
        // petals centred on (k + ½)·D, with the gaps between them as cells of their own
        const rm = g.r0 + (g.r1 - g.r0) * 0.5, w = D * 0.62;
        const side = (c: number, s: number) => quad(polar(g.r0, c), polar(rm / Math.cos(w * 0.5), c + s * w), polar(g.r1, c), 12);
        const c = a0 + D / 2, cp = c - D;
        push('petal', k, [...side(c, -1), ...side(c, 1).reverse().slice(1)]);
        push('gap', k, [...side(cp, 1), ...arc(g.r1, cp, c).slice(1), ...side(c, -1).reverse().slice(1), ...arc(g.r0, c, cp).slice(1, -1)]);
      }
    }
  });
  cache.set(layout, out);
  return out;
}

// The cells a tap fills: turned by every 1/fold of a circle, and mirrored about the vertical.
export function orbit(layout: number, idx: number, fold: number, mirror: boolean): number[] {
  const all = cells(layout), c = all[idx];
  if (c.kind === 'disc') return [idx];
  const find = (k: number) => all.findIndex((x) => x.ring === c.ring && x.kind === c.kind && x.k === ((k % c.n) + c.n) % c.n);
  const step = fold > 1 && c.n % fold === 0 ? c.n / fold : fold > 1 ? c.n / gcd(c.n, fold) : c.n;
  const ks = new Set<number>();
  for (let k = c.k; ks.size < c.n; k += step) { if (ks.has(((k % c.n) + c.n) % c.n)) break; ks.add(((k % c.n) + c.n) % c.n); }
  if (mirror) for (const k of [...ks]) ks.add(((mirrorK(c.kind, k, c.n) % c.n) + c.n) % c.n);
  return [...ks].map(find).filter((i) => i >= 0);
}
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
function mirrorK(kind: Kind, k: number, n: number) {
  if (kind === 'gap') return n - k;
  if (kind === 'down') return n - k - 2;
  return n - 1 - k;
}

export function hitCell(layout: number, x: number, y: number): number {
  const all = cells(layout);
  for (let i = all.length - 1; i >= 0; i--) {
    const p = all[i].poly;
    let inside = false;
    for (let a = 0, b = p.length - 1; a < p.length; b = a++) {
      if ((p[a][1] > y) !== (p[b][1] > y) && x < ((p[b][0] - p[a][0]) * (y - p[a][1])) / (p[b][1] - p[a][1]) + p[a][0]) inside = !inside;
    }
    if (inside) return i;
  }
  return -1;
}

export const emptyKey = (layout: number) => EMPTY.repeat(cells(layout).length);

// ---------- drawing ----------
type Ctx = CanvasRenderingContext2D;
export const POOKALAM_FLOOR = '#4A2C1A';
const R = (S: number) => (S / 2) * 0.95;

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16), f = (v: number) => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k))));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
// A tile of loose petals in one flower's colours, used as a fill pattern.
const tiles = new Map<string, HTMLCanvasElement>();
function petalTile(hex: string, scale: number): HTMLCanvasElement {
  const key = hex + Math.round(scale * 10);
  const hit = tiles.get(key);
  if (hit) return hit;
  const T = Math.round(72 * scale), c = document.createElement('canvas');
  c.width = c.height = T;
  const x = c.getContext('2d')!, r = mkRng(parseInt(hex.slice(1), 16));
  x.fillStyle = shade(hex, -0.12); x.fillRect(0, 0, T, T);
  for (let i = 0; i < 70; i++) {
    const px = r() * T, py = r() * T, l = (3 + r() * 5) * scale, a = r() * Math.PI;
    x.fillStyle = shade(hex, (r() - 0.45) * 0.36);
    // draw at the tile edges too so the pattern repeats without seams
    for (const [ox, oy] of [[0, 0], [T, 0], [-T, 0], [0, T], [0, -T]]) {
      x.beginPath(); x.ellipse(px + ox, py + oy, l, l * 0.55, a, 0, Math.PI * 2); x.fill();
    }
  }
  for (let i = 0; i < 18; i++) { x.fillStyle = shade(hex, 0.35); x.fillRect(r() * T, r() * T, 1.4 * scale, 1.4 * scale); }
  tiles.set(key, c);
  return c;
}

function cellPath(poly: Pt[], S: number) {
  const p = new Path2D(), h = S / 2, rr = R(S);
  poly.forEach(([a, b], i) => (i ? p.lineTo(h + a * rr, h + b * rr) : p.moveTo(h + a * rr, h + b * rr)));
  p.closePath();
  return p;
}
const paths = new Map<string, Path2D[]>();
export function cellPaths(layout: number, S: number): Path2D[] {
  const key = layout + ':' + Math.round(S);
  let hit = paths.get(key);
  if (!hit) { hit = cells(layout).map((c) => cellPath(c.poly, S)); paths.set(key, hit); }
  return hit;
}

// The whole carpet. `show(i)` in [0, 1] lets a cell bloom in (fade + grow); outlines = chalk guide.
// show(i) in [0, 1] grows a cell in (above 1 it swells a touch, for a bounce); with fall the
// flowers drop into place from above with a little spin. glow(i) lays a warm light over a cell.
export function drawPookalam(x: Ctx, S: number, layout: number, key: string, o: { show?: (i: number) => number; outlines?: boolean; floor?: string; fall?: boolean; glow?: (i: number) => number } = {}) {
  const all = cells(layout), ps = cellPaths(layout, S), h = S / 2, rr = R(S), pat = Math.max(0.6, S / 700);
  x.fillStyle = o.floor ?? POOKALAM_FLOOR;
  x.fillRect(0, 0, S, S);
  // a faint rice-powder circle drawn before the flowers go down
  x.beginPath(); x.arc(h, h, rr + 3, 0, Math.PI * 2); x.fillStyle = 'rgba(251,243,228,.06)'; x.fill();
  all.forEach((c, i) => {
    const f = flowerIndex(key[i] ?? EMPTY);
    if (f < 0 || !FLOWERS[f]) return;
    const t = o.show ? o.show(i) : 1;
    if (t <= 0) return;
    x.save();
    if (t !== 1) {
      const cx = h + c.c[0] * rr, cy = h + c.c[1] * rr, k = 0.55 + 0.45 * t, u = Math.max(0, 1 - t);
      x.globalAlpha = Math.min(1, t);
      x.translate(cx, cy - (o.fall ? u * S * 0.08 : 0));
      if (o.fall) x.rotate(u * 0.7);
      x.scale(k, k); x.translate(-cx, -cy);
    }
    x.fillStyle = x.createPattern(petalTile(FLOWERS[f][2], pat), 'repeat')!;
    x.fill(ps[i]);
    x.lineWidth = Math.max(0.8, S / 900);
    x.strokeStyle = 'rgba(27,20,16,.28)';
    x.stroke(ps[i]);
    const gv = o.glow ? o.glow(i) : 0;
    if (gv > 0) { x.fillStyle = `rgba(255,236,170,${gv.toFixed(3)})`; x.fill(ps[i]); }
    x.restore();
  });
  if (o.outlines !== false) {
    x.lineWidth = Math.max(0.8, S / 800);
    x.strokeStyle = 'rgba(251,243,228,.22)';
    all.forEach((_, i) => { if ((key[i] ?? EMPTY) === EMPTY) x.stroke(ps[i]); });
  }
}

// SVG for OG images: flat colours (the petal texture doesn't matter at thumbnail size).
export function pookalamSvg(layout: number, key: string, S = 600): string {
  const h = S / 2, rr = R(S), f = (v: number) => v.toFixed(1);
  const body = cells(layout).map((c, i) => {
    const fi = flowerIndex(key[i] ?? EMPTY);
    const d = c.poly.map(([a, b], j) => `${j ? 'L' : 'M'}${f(h + a * rr)} ${f(h + b * rr)}`).join('') + 'Z';
    return fi < 0 || !FLOWERS[fi] ? `<path d="${d}" fill="none" stroke="rgba(251,243,228,.22)" stroke-width="1"/>` : `<path d="${d}" fill="${FLOWERS[fi][2]}" stroke="rgba(27,20,16,.3)" stroke-width="1"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><rect width="${S}" height="${S}" fill="${POOKALAM_FLOOR}"/>${body}</svg>`;
}

// ---------- a design for an empty floor ----------
// Every ring (and each half of a petal or zig-zag ring) gets a flower, fully symmetric, with
// neighbouring bands kept different. Same seed, same pookalam.
export function surprisePookalam(seed: number, layout: number): string {
  const r = mkRng(seed), all = cells(layout);
  const pal = [...FLOWERS.keys()].sort(() => r() - 0.5).slice(0, 4 + Math.floor(r() * 3));
  const pick = (not: number[]) => { const ok = pal.filter((p) => !not.includes(p)); return ok[Math.floor(r() * ok.length)] ?? pal[0]; };
  const chars = all.map(() => EMPTY);
  const used: number[] = [];
  const rings = LAYOUTS[layout].rings.length;
  for (let g = 0; g < rings; g++) {
    const inRing = all.map((c, i) => [c, i] as const).filter(([c]) => c.ring === g);
    const kinds = [...new Set(inRing.map(([c]) => c.kind))];
    const a = pick(used.slice(-2));
    // alternate cells of a sector/swirl ring sometimes get a second flower
    const b = pick([a, ...used.slice(-1)]);
    const alt = r() < 0.45;
    for (const [c, i] of inRing) {
      const second = kinds.length > 1 ? c.kind === kinds[1] : alt && c.n >= 8 && (c.k % 2 === 1);
      chars[i] = flowerChar(second ? b : a);
    }
    used.push(a, b);
  }
  return chars.join('');
}
