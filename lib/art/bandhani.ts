// Bandhani: tie-and-dye from Gujarat and Rajasthan. Knots are tied into the cloth, the cloth is
// dipped, and wherever a knot was the cloth keeps the colour it had when it was tied. Several
// rounds (tie, dip, tie more, dip darker) give dots in two or three colours. Knot points are
// recipe units (±1000 of the half-side, centre 0), like rangoli strokes.
import { mkRng } from '../rng';
import type { BandhaniData } from '../recipe';
import { decodePts } from '../recipe';

export const CLOTH = '#FBF6EA';
export const DYES: [string, string][] = [
  ['Haldi', '#F2BE22'], ['Kesari', '#EE8A1E'], ['Gulabi', '#E0558F'], ['Lal', '#C42330'],
  ['Rani', '#9E1F5C'], ['Hara', '#2E7A4A'], ['Neel', '#2B4C9B'], ['Kala', '#2A1D1A'],
];
// knot radius per size, in recipe units (per-mille of the half-side)
export const KNOT = [0, 9, 13, 18];
export const MOTIFS: { id: string; label: string; pts: [number, number][] }[] = [
  { id: 'ekdali', label: 'Ekdali', pts: [[0, 0]] },
  { id: 'trikunti', label: 'Trikunti', pts: [[0, -1], [-0.87, 0.5], [0.87, 0.5]] },
  { id: 'chaubundi', label: 'Chaubundi', pts: [[-0.71, -0.71], [0.71, -0.71], [-0.71, 0.71], [0.71, 0.71]] },
  { id: 'phool', label: 'Phool', pts: [[0, 0], ...Array.from({ length: 6 }, (_, k) => [Math.cos((k * Math.PI) / 3) * 1.15, Math.sin((k * Math.PI) / 3) * 1.15] as [number, number])] },
];

// Mirror copies of a point: 1 none, 2 left-right, 4 both axes, 8 both axes and the diagonals.
export function mirrored(x: number, y: number, sym: number): [number, number][] {
  const out: [number, number][] = [[x, y]];
  if (sym >= 2) out.push([-x, y]);
  if (sym >= 4) out.push([x, -y], [-x, -y]);
  if (sym >= 8) out.push([y, x], [-y, x], [y, -x], [-y, -x]);
  const seen = new Set<string>();
  return out.filter(([a, b]) => { const k = Math.round(a / 6) + ',' + Math.round(b / 6); if (seen.has(k)) return false; seen.add(k); return true; });
}

export type Round = { c: string; pts: number[] };
export const decodeRounds = (d: BandhaniData): Round[] => d.r.map((r) => ({ c: r.c, pts: decodePts(r.p) ?? [] }));

// ---------- drawing ----------
type Ctx = CanvasRenderingContext2D;
function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16), f = (v: number) => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k))));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
// Thread-weave texture, the same over any colour.
const weaves = new Map<number, HTMLCanvasElement>();
function weave(S: number): HTMLCanvasElement {
  const key = Math.round(S);
  const hit = weaves.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = c.height = key;
  const x = c.getContext('2d')!;
  x.strokeStyle = 'rgba(60,30,10,.05)'; x.lineWidth = 1;
  x.beginPath(); for (let y = 0; y < key; y += 3) { x.moveTo(0, y + 0.5); x.lineTo(key, y + 0.5); } x.stroke();
  x.strokeStyle = 'rgba(255,255,255,.05)';
  x.beginPath(); for (let i = 0; i < key; i += 3) { x.moveTo(i + 0.5, 0); x.lineTo(i + 0.5, key); } x.stroke();
  weaves.set(key, c);
  return c;
}

export type Moment = {
  dips: number; // dips finished
  wave?: number; // 0..1: the next dip rising from the bottom
  tied: number; // rounds whose knots are tied (knots of round r are tied before dip r)
  show?: (round: number, i: number) => number; // knot pop-in, 0..1
  open?: number; // 0..1: knots untied from the centre outwards (1 = all open)
};

// The cloth at one moment of the process.
export function drawBandhani(x: Ctx, S: number, rounds: Round[], z: number, m: Moment) {
  const h = S / 2, u = S / 2000, kr = KNOT[z] * u * 2;
  const colorAfter = (d: number) => (d <= 0 ? CLOTH : rounds[Math.min(d, rounds.length) - 1].c);
  const base = colorAfter(m.dips);
  x.fillStyle = base;
  x.fillRect(0, 0, S, S);
  if (m.wave && m.wave > 0 && rounds[m.dips]) {
    // the dye creeping up the cloth as it's lowered into the vat
    const top = S * (1.06 - m.wave * 1.12);
    x.save();
    x.beginPath(); x.moveTo(0, S);
    for (let i = 0; i <= 24; i++) x.lineTo((i / 24) * S, top + Math.sin(i * 0.9 + m.wave * 7) * S * 0.018);
    x.lineTo(S, S); x.closePath(); x.clip();
    x.fillStyle = rounds[m.dips].c; x.fillRect(0, 0, S, S);
    x.restore();
  }
  x.drawImage(weave(S), 0, 0, S, S);
  const dipColorAt = (y: number) => (m.wave && rounds[m.dips] && y > S * (1.06 - m.wave * 1.12) ? rounds[m.dips].c : base);
  const R = Math.hypot(h, h), open = m.open ?? 0;
  for (let r = 0; r < Math.min(m.tied, rounds.length); r++) {
    const pts = rounds[r].pts, before = colorAfter(r);
    const rng = mkRng(9173 + r * 7919);
    for (let i = 0; i < pts.length / 2; i++) {
      const jx = rng(), jy = rng(), js = rng(), ja = rng();
      const t = m.show ? m.show(r, i) : 1;
      if (t <= 0) continue;
      const cx = h + pts[i * 2] * u, cy = h + pts[i * 2 + 1] * u;
      const revealed = open > 0 && Math.hypot(cx - h, cy - h) <= open * R;
      x.save();
      x.translate(cx, cy);
      if (revealed) {
        // the opened dot: the colour it had when tied, a little irregular, with a dyed eye
        const k = kr * (0.95 + js * 0.3);
        x.rotate((ja - 0.5) * 0.9);
        // a soft halo where the dye crept in under the thread
        x.globalAlpha = 0.35;
        x.fillStyle = before;
        x.beginPath(); x.arc(0, 0, k * 1.35, 0, Math.PI * 2); x.fill();
        x.globalAlpha = 1;
        x.beginPath(); x.roundRect(-k + (jx - 0.5) * k * 0.2, -k + (jy - 0.5) * k * 0.2, k * 2, k * 1.9, k * 0.8); x.fill();
        // the tip of the knot stuck out of the thread and took the dye
        x.fillStyle = shade(base, 0.1);
        x.beginPath(); x.arc(0, 0, Math.max(0.6, k * 0.13), 0, Math.PI * 2); x.fill();
      } else {
        // a tied knot: a pinched bump wrapped in thread, its tip taking the dye
        const k = kr * (1.05 + js * 0.2) * (0.4 + 0.6 * t);
        x.globalAlpha = Math.min(1, t * 1.5);
        x.fillStyle = 'rgba(27,20,16,.25)';
        x.beginPath(); x.arc(k * 0.18, k * 0.22, k, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#F3EBDA';
        x.beginPath(); x.arc(0, 0, k, 0, Math.PI * 2); x.fill();
        x.strokeStyle = 'rgba(120,90,60,.55)'; x.lineWidth = Math.max(0.6, k * 0.16);
        x.beginPath(); x.arc(0, 0, k * 0.62, 0, Math.PI * 2); x.stroke();
        x.fillStyle = dipColorAt(cy);
        x.beginPath(); x.arc(0, 0, k * 0.34, 0, Math.PI * 2); x.fill();
      }
      x.restore();
    }
  }
}

export function bandhaniSvg(d: BandhaniData, S = 600): string {
  const rounds = decodeRounds(d), u = S / 2000, h = S / 2, k = KNOT[d.z] * u * 2;
  const bg = rounds.length ? rounds[rounds.length - 1].c : CLOTH;
  const dots = rounds.map((r, ri) => {
    const col = ri ? rounds[ri - 1].c : CLOTH;
    let out = '';
    for (let i = 0; i < r.pts.length; i += 2) out += `<rect x="${(h + r.pts[i] * u - k).toFixed(1)}" y="${(h + r.pts[i + 1] * u - k).toFixed(1)}" width="${(2 * k).toFixed(1)}" height="${(2 * k).toFixed(1)}" rx="${(k * 0.8).toFixed(1)}" fill="${col}"/>`;
    return out;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><rect width="${S}" height="${S}" fill="${bg}"/>${dots}</svg>`;
}

// ---------- a design for a fresh cloth ----------
// A two-dip odhni: a light dye with a medallion and border tied first, then dots all over and
// a darker dye. Same seed, same cloth.
export function surpriseBandhani(seed: number): { z: number; rounds: Round[] } {
  const r = mkRng(seed);
  const light = [DYES[0][1], DYES[1][1], DYES[2][1]][Math.floor(r() * 3)];
  const dark = [DYES[3][1], DYES[4][1], DYES[5][1], DYES[6][1], DYES[7][1]][Math.floor(r() * 5)];
  const z = 1 + Math.floor(r() * 2);
  const gap = KNOT[z] * 3.2;
  const one: number[] = [], two: number[] = [];
  const put = (arr: number[], x: number, y: number) => { if (Math.abs(x) <= 960 && Math.abs(y) <= 960) arr.push(Math.round(x), Math.round(y)); };
  // round 1, on white: concentric rings of dots round the centre, and a border
  const rings = 2 + Math.floor(r() * 3), R0 = 120 + r() * 80;
  for (let k = 0; k < rings; k++) {
    const rad = R0 + k * (gap * 2.6), n = Math.max(6, Math.round((2 * Math.PI * rad) / gap));
    for (let i = 0; i < n; i++) put(one, Math.cos((i / n) * Math.PI * 2) * rad, Math.sin((i / n) * Math.PI * 2) * rad);
  }
  put(one, 0, 0);
  const edge = 860 + r() * 60;
  for (let v = -edge; v <= edge; v += gap * 1.6) { put(one, v, -edge); put(one, v, edge); put(one, -edge, v); put(one, edge, v); }
  // corner flowers
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const cx = sx * edge * 0.72, cy = sy * edge * 0.72;
    put(one, cx, cy);
    for (let k = 0; k < 6; k++) put(one, cx + Math.cos((k * Math.PI) / 3) * gap * 1.2, cy + Math.sin((k * Math.PI) / 3) * gap * 1.2);
  }
  // round 2, on the light dye: an all-over grid of single dots outside the medallion
  const outer = R0 + rings * gap * 2.6 + gap * 2, step = gap * (3 + Math.floor(r() * 3));
  for (let y = -edge + step; y < edge - gap; y += step) for (let x = -edge + step; x < edge - gap; x += step) {
    const xx = x + ((Math.round(y / step) % 2) * step) / 2;
    if (Math.hypot(xx, y) > outer && Math.abs(xx) < edge - gap * 2) put(two, xx, y);
  }
  return { z, rounds: [{ c: light, pts: one }, { c: dark, pts: two }] };
}
