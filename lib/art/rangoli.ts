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

// A peacock feather (an unlockable brush): green vane, gold-teal-indigo eye near the tip.
function feather(x: Ctx, len: number, w: number) {
  x.beginPath();
  x.moveTo(-len / 2, 0);
  x.quadraticCurveTo(-len * 0.05, -w, len / 2, 0);
  x.quadraticCurveTo(-len * 0.05, w, -len / 2, 0);
  x.fillStyle = '#3E8E4E';
  x.fill();
  x.lineWidth = Math.max(1, w * 0.12);
  x.strokeStyle = '#1F4D2B';
  x.beginPath(); x.moveTo(-len / 2, 0); x.lineTo(len * 0.12, 0); x.stroke();
  for (const [r, c] of [[0.62, '#FFC21A'], [0.44, '#1E8C8C'], [0.24, '#2D4C7C']] as [number, string][]) {
    x.beginPath(); x.ellipse(len * 0.24, 0, w * r * 1.25, w * r, 0, 0, TAU); x.fillStyle = c; x.fill();
  }
}

// Mehendi motifs, drawn as line art (paste piped from a cone) about r across.
function paisley(x: Ctx, k: number, dx = 0, dy = 0) {
  x.moveTo(dx, dy + 40 * k);
  x.bezierCurveTo(dx - 40 * k, dy + 40 * k, dx - 42 * k, dy - 8 * k, dx - 12 * k, dy - 22 * k);
  x.bezierCurveTo(dx + 4 * k, dy - 30 * k, dx + 12 * k, dy - 38 * k, dx + 22 * k, dy - 46 * k);
  x.bezierCurveTo(dx + 22 * k, dy - 26 * k, dx + 36 * k, dy - 12 * k, dx + 32 * k, dy + 10 * k);
  x.bezierCurveTo(dx + 29 * k, dy + 30 * k, dx + 16 * k, dy + 40 * k, dx, dy + 40 * k);
  x.closePath();
}
function motif(x: Ctx, kind: 'keri' | 'kamal' | 'chakra', r: number, col: string) {
  x.strokeStyle = col;
  x.fillStyle = col;
  x.lineWidth = Math.max(1, r * 0.075);
  x.lineCap = 'round';
  x.lineJoin = 'round';
  const dot = (a: number, b: number, rr: number) => { x.beginPath(); x.arc(a, b, rr, 0, TAU); x.fill(); };
  if (kind === 'keri') {
    const k = r / 46;
    x.beginPath(); paisley(x, k); x.stroke();
    x.beginPath(); paisley(x, k * 0.62, -1 * k, 6 * k); x.stroke();
    x.beginPath(); paisley(x, k * 0.3, -2 * k, 11 * k); x.fill();
    for (const [a, b] of [[-44, 26], [-47, 4], [-37, -17], [-21, -33], [40, -8], [41, 16], [30, 40], [8, 50], [-20, 49]]) dot(a * k, b * k, r * 0.045);
  } else if (kind === 'kamal') {
    for (const a of [-62, -31, 0, 31, 62]) {
      x.save(); x.translate(0, r * 0.45); x.rotate((a * Math.PI) / 180);
      x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(-r * 0.32, -r * 0.24, -r * 0.26, -r * 0.76, 0, -r); x.bezierCurveTo(r * 0.26, -r * 0.76, r * 0.32, -r * 0.24, 0, 0); x.stroke();
      x.beginPath(); x.moveTo(0, -r * 0.2); x.lineTo(0, -r * 0.7); x.stroke();
      x.restore();
    }
    x.beginPath(); x.moveTo(-r * 0.75, r * 0.6); x.quadraticCurveTo(0, r * 0.85, r * 0.75, r * 0.6); x.stroke();
    for (const a of [-0.5, -0.25, 0, 0.25, 0.5]) dot(a * r, r * 0.9, r * 0.05);
  } else {
    x.beginPath(); x.arc(0, 0, r * 0.32, 0, TAU); x.stroke();
    dot(0, 0, r * 0.12);
    for (let k = 0; k < 8; k++) {
      x.save(); x.rotate((k / 8) * TAU);
      x.beginPath(); x.moveTo(0, -r * 0.36); x.quadraticCurveTo(r * 0.2, -r * 0.62, 0, -r * 0.86); x.quadraticCurveTo(-r * 0.2, -r * 0.62, 0, -r * 0.36); x.stroke();
      x.rotate(TAU / 16); dot(0, -r * 0.62, r * 0.05);
      x.restore();
    }
    x.beginPath(); x.arc(0, 0, r, 0, TAU); x.setLineDash([r * 0.02, r * 0.16]); x.stroke(); x.setLineDash([]);
  }
}

const SPACING: Record<Brush, number> = { powder: 0, petal: 1.5, diya: 3.4, pookalam: 2.2, peacock: 2.6, bindu: 2.3, vine: 1.9, keri: 6.5, kamal: 6.5, chakra: 6.5 };
const MOTIF = new Set<Brush>(['keri', 'kamal', 'chakra']);
// Fresh mehendi paste: strokes in this colour get a raised, glossy look.
export const PASTE = '#4A3B1C';

// A painter for one stroke. seg(a, b) takes points in canvas px relative to the centre.
// grain: rice-powder speckle around powder lines (rangoli). relief: piped-paste highlight (mehendi).
export function strokePainter(x: Ctx, side: number, o: { c: string; sizePx: number; n: number; b?: Brush; mirror?: boolean; grain?: boolean; relief?: boolean }) {
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
      } else if (brush === 'peacock') {
        x.rotate(ang);
        feather(x, sz * 3.4, sz * 1.15);
      } else if (brush === 'diya') {
        x.rotate(Math.atan2(p.y, p.x) + Math.PI / 2);
        diyaIcon(x, sz * 1.2);
      } else if (brush === 'bindu') {
        x.beginPath(); x.arc(0, 0, sz * (i % 3 === 1 ? 0.38 : 0.6), 0, TAU); x.fillStyle = o.c; x.fill();
      } else if (brush === 'vine') {
        x.rotate(ang + (i % 2 ? 0.95 : -0.95));
        x.translate(sz * 0.95, 0);
        petal(x, sz * 1.9, sz * 0.62, o.c);
      } else if (MOTIF.has(brush)) {
        // upright when tapped, following the line when dragged
        x.rotate(i ? ang + Math.PI / 2 : 0);
        motif(x, brush as 'keri' | 'kamal' | 'chakra', sz * 3.2, o.c);
      } else flowerIcon(x, sz * 1.1, o.c);
    });
  };
  const line = (a: P, b: P, w: number, col: string, dx = 0, dy = 0) => {
    x.save();
    x.strokeStyle = col;
    x.lineWidth = w;
    x.lineCap = 'round';
    x.lineJoin = 'round';
    eachCopy(x, side, o.n, !!o.mirror, () => {
      x.beginPath();
      x.moveTo(a.x + dx, a.y + dy);
      x.lineTo(b.x + dx, b.y + dy);
      x.stroke();
    });
    x.restore();
  };
  // Loose grains of powder along the line, the same in every mirrored copy.
  const grains = (a: P, b: P) => {
    const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.min(9, 1 + Math.round((d * sz) / 45));
    const nx = d ? -(b.y - a.y) / d : 0, ny = d ? (b.x - a.x) / d : 1, g = Math.max(0.9, Math.min(2.2, sz / 6));
    const pts = Array.from({ length: n }, () => { const t = Math.random(), off = (Math.random() * 2 - 1) * sz * 0.95; return [a.x + (b.x - a.x) * t + nx * off, a.y + (b.y - a.y) * t + ny * off, Math.random() < 0.35 ? 1 : 0]; });
    x.save();
    eachCopy(x, side, o.n, !!o.mirror, () => {
      for (const [px, py, light] of pts) {
        x.globalAlpha = light ? 0.35 : 0.55;
        x.fillStyle = light ? '#FBF3E4' : o.c;
        x.fillRect(px - g / 2, py - g / 2, g, g);
      }
    });
    x.restore();
  };
  return {
    seg(a: P, b: P) {
      if (brush === 'powder') {
        line(a, b, sz, o.c);
        if (o.grain) grains(a, b);
        if (o.relief) line(a, b, Math.max(0.6, sz * 0.32), 'rgba(255,236,190,.32)', -sz * 0.16, -sz * 0.16);
        return;
      }
      if (brush === 'vine') line(a, b, Math.max(1, sz * 0.32), o.c);
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

// How a recipe type's strokes look: rangoli powder is grainy, fresh mehendi paste is raised.
export type Look = { grain?: boolean; relief?: boolean };
export const RANGOLI_LOOK: Look = { grain: true };
export const MEHENDI_LOOK: Look = { relief: true };

// Replays strokes onto a square canvas (CSS px, already scaled) a few points at a time.
// advance(n) paints up to n points in total; the brush state carries over between calls.
export function strokeReplayer(x: Ctx, side: number, ds: DecodedStroke[], look: Look = {}) {
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
          pen = strokePainter(x, side, { c: st.c, sizePx: (st.s * side) / 1000, n: st.n, b: st.b, mirror: st.m === 1, grain: look.grain, relief: look.relief && st.c === PASTE });
          pen.seg(P(pts, 0), P(pts, 0));
          pi = 1; done++;
        }
        while (pi < np && done < to) { pen.seg(P(pts, pi - 1), P(pts, pi)); pi++; done++; }
        if (pi >= np) { si++; pi = 0; pen = null; }
      }
    },
  };
}
export function paintStrokes(x: Ctx, side: number, ds: DecodedStroke[], look: Look = {}) {
  const r = strokeReplayer(x, side, ds, look);
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
