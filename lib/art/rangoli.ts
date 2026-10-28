// Rangoli: one stroke, mirrored and rotated into 2n copies. Recipe coords are ints in ±1000 of
// the half-side, sizes are per-mille of the side, so a drawing replays at any canvas size.
import { C, TAU } from './palette';
import { decodePts, type Brush, type Stroke } from '../recipe';

type Ctx = CanvasRenderingContext2D;
type P = { x: number; y: number };

export function rangoliFloor(x: Ctx, s: number) {
  x.fillStyle = C.floor;
  x.fillRect(0, 0, s, s);
  x.fillStyle = 'rgba(251,243,228,.035)';
  for (let i = 0; i < (s * s) / 220; i++) x.fillRect(Math.random() * s, Math.random() * s, 1.5, 1.5);
}

// Runs fn once per symmetric copy, with the context turned so fn can draw in "stroke space".
function eachCopy(x: Ctx, side: number, n: number, mirrorOnly: boolean, fn: () => void) {
  const h = side / 2;
  const base = x.getTransform();
  const copies = mirrorOnly ? [[0, 1], [0, -1]] : Array.from({ length: n }, (_, k) => [k, 1]).flatMap(([k]) => [[k, 1], [k, -1]]);
  for (const [k, f] of copies) {
    x.setTransform(base);
    x.translate(h, h);
    if (mirrorOnly) x.scale(f, 1);
    else { x.rotate((k * TAU) / n); x.scale(1, f); }
    fn();
  }
  x.setTransform(base);
}

function petal(x: Ctx, len: number, w: number, fill: string) {
  x.beginPath();
  x.moveTo(-len / 2, 0);
  x.quadraticCurveTo(0, -w, len / 2, 0);
  x.quadraticCurveTo(0, w, -len / 2, 0);
  x.fillStyle = fill;
  x.fill();
}

function diyaIcon(x: Ctx, r: number) {
  x.beginPath();
  x.moveTo(-r, -r * 0.1);
  x.quadraticCurveTo(0, r * 1.1, r, -r * 0.1);
  x.closePath();
  x.fillStyle = C.terracotta;
  x.fill();
  x.beginPath();
  x.moveTo(0, -r * 1.25);
  x.quadraticCurveTo(r * 0.42, -r * 0.55, 0, -r * 0.2);
  x.quadraticCurveTo(-r * 0.42, -r * 0.55, 0, -r * 1.25);
  x.fillStyle = C.marigold;
  x.fill();
}

function flowerIcon(x: Ctx, r: number, col: string) {
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * TAU;
    x.beginPath();
    x.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.5, 0, TAU);
    x.fillStyle = col;
    x.fill();
  }
  x.beginPath();
  x.arc(0, 0, r * 0.3, 0, TAU);
  x.fillStyle = C.marigold;
  x.fill();
}

const SPACING: Record<Brush, number> = { powder: 0, petal: 1.5, diya: 3.4, pookalam: 2.2 };

// A painter for one stroke. seg(a, b) takes points in canvas px relative to the centre.
export function strokePainter(x: Ctx, side: number, o: { c: string; sizePx: number; n: number; b?: Brush; mirror?: boolean }) {
  const brush = o.b ?? 'powder';
  const sz = o.sizePx;
  let carry = 0, count = 0;
  const stamp = (p: P, ang: number) => {
    const i = count++;
    eachCopy(x, side, o.n, !!o.mirror, () => {
      x.translate(p.x, p.y);
      if (brush === 'petal') {
        x.rotate(ang + (i % 2 ? 0.5 : -0.5));
        petal(x, sz * 2.4, sz * 0.75, o.c);
      } else if (brush === 'diya') {
        x.rotate(Math.atan2(p.y, p.x) + Math.PI / 2);
        diyaIcon(x, sz * 1.2);
      } else flowerIcon(x, sz * 1.1, o.c);
    });
  };
  return {
    seg(a: P, b: P) {
      if (brush === 'powder') {
        x.save();
        x.strokeStyle = o.c;
        x.lineWidth = sz;
        x.lineCap = 'round';
        x.lineJoin = 'round';
        eachCopy(x, side, o.n, !!o.mirror, () => {
          x.beginPath();
          x.moveTo(a.x, a.y);
          x.lineTo(b.x, b.y);
          x.stroke();
        });
        x.restore();
        return;
      }
      const gap = Math.max(4, sz * SPACING[brush]);
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      if (d === 0 && count === 0) { stamp(a, 0); return; }
      let t = gap - carry;
      while (t <= d) {
        stamp({ x: a.x + ((b.x - a.x) * t) / d, y: a.y + ((b.y - a.y) * t) / d }, ang);
        t += gap;
      }
      carry = d - (t - gap);
    },
  };
}

export const pxToUnit = (v: number, side: number) => Math.round((v / (side / 2)) * 1000);
export const unitToPx = (v: number, side: number) => (v * side) / 2000;

export type DecodedStroke = { st: Stroke; pts: number[] };
export const decodeStrokes = (strokes: Stroke[]): DecodedStroke[] => strokes.map((st) => ({ st, pts: decodePts(st.p) ?? [] }));
export const pointCount = (ds: DecodedStroke[]) => ds.reduce((a, d) => a + d.pts.length / 2, 0);

// Replays strokes onto a square canvas (CSS px, already scaled) a few points at a time.
// advance(n) paints up to n points in total; the brush state carries over between calls.
export function strokeReplayer(x: Ctx, side: number, ds: DecodedStroke[]) {
  let si = 0, pi = 0, done = 0;
  let pen: ReturnType<typeof strokePainter> | null = null;
  const P = (pts: number[], i: number) => ({ x: unitToPx(pts[i * 2], side), y: unitToPx(pts[i * 2 + 1], side) });
  return {
    total: pointCount(ds),
    advance(to: number) {
      while (done < to && si < ds.length) {
        const { st, pts } = ds[si];
        const np = pts.length / 2;
        if (!pen) {
          pen = strokePainter(x, side, { c: st.c, sizePx: (st.s * side) / 1000, n: st.n, b: st.b, mirror: st.m === 1 });
          pen.seg(P(pts, 0), P(pts, 0));
          pi = 1; done++;
        }
        while (pi < np && done < to) { pen.seg(P(pts, pi - 1), P(pts, pi)); pi++; done++; }
        if (pi >= np) { si++; pi = 0; pen = null; }
      }
    },
  };
}
export function paintStrokes(x: Ctx, side: number, ds: DecodedStroke[]) {
  const r = strokeReplayer(x, side, ds);
  r.advance(r.total);
}

// SVG of a rangoli recipe for server-side OG images (powder strokes drawn as paths, stamp
// brushes as dotted paths, which reads fine at thumbnail size).
export function rangoliSvg(strokes: Stroke[], size: number, bg: string = C.floor): string {
  const defs: string[] = [];
  const uses: string[] = [];
  strokes.forEach((st, i) => {
    const pts = decodePts(st.p) ?? [];
    if (!pts.length) return;
    let d = `M${unitToPx(pts[0], size).toFixed(1)} ${unitToPx(pts[1], size).toFixed(1)}`;
    for (let k = 2; k < pts.length; k += 2) d += `L${unitToPx(pts[k], size).toFixed(1)} ${unitToPx(pts[k + 1], size).toFixed(1)}`;
    if (pts.length === 2) d += 'l0.01 0';
    const w = ((st.s * size) / 1000) * (st.b && st.b !== 'powder' ? 1.8 : 1);
    const dash = st.b && st.b !== 'powder' ? ` stroke-dasharray="${(w * 0.2).toFixed(1)} ${(w * 1.1).toFixed(1)}"` : '';
    defs.push(`<path id="s${i}" d="${d}" fill="none" stroke="${st.c}" stroke-width="${w.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"${dash}/>`);
    const copies = st.m === 1 ? ['scale(1 1)', 'scale(-1 1)'] : Array.from({ length: st.n }, (_, k) => [`rotate(${((k * 360) / st.n).toFixed(2)})`, `rotate(${((k * 360) / st.n).toFixed(2)}) scale(1 -1)`]).flat();
    for (const t of copies) uses.push(`<use xlink:href="#s${i}" transform="${t}"/>`);
  });
  const h = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${bg}"/><defs>${defs.join('')}</defs><g transform="translate(${h} ${h})">${uses.join('')}</g></svg>`;
}
