// Sikku kolam: a line woven around pulli (dots) the traditional way. Every dot sits in a cell of
// the grid; the line runs diagonally between the midpoints of cell edges, so it makes a little
// diamond around each dot, and it bounces off the outside of the drawing. Between two
// neighbouring dots the line can do one of three things (the "mirror curve" model of Gerdes and
// Jablan):
//   0  cross   the two strands cross between the dots (the default)
//   1  wall    each strand turns back around its own dot
//   2  bridge  the strands swing around both dots together
// Changing a crossing between two different loops always joins them into one, which is how
// "make it one line" works. Shared by the client and the server (OG images): no DOM here.
import { mkRng } from '../rng';

export type Dot = [number, number];
// [i, j, o, s]: the edge between cell (i, j) and its neighbour to the right (o = 0) or below
// (o = 1), and its state (1 wall, 2 bridge). Crossings are the default and aren't stored.
export type Edge = [number, number, 0 | 1, 1 | 2];
export type Pt = { x: number; y: number };

export const SIKKU_GRID = 7;
export const edgeKey = (i: number, j: number, o: number) => `${i},${j},${o}`;
const cellKey = (i: number, j: number) => `${i},${j}`;

export function edgeMap(edges: Edge[]): Map<string, 1 | 2> {
  return new Map(edges.map(([i, j, o, s]) => [edgeKey(i, j, o), s]));
}
export function edgeList(m: Map<string, 1 | 2>, dots: Dot[]): Edge[] {
  const on = new Set(dots.map(([i, j]) => cellKey(i, j)));
  const out: Edge[] = [];
  for (const [k, s] of m) {
    const [i, j, o] = k.split(',').map(Number);
    // only keep edges whose two dots both exist
    if (on.has(cellKey(i, j)) && on.has(o ? cellKey(i, j + 1) : cellKey(i + 1, j))) out.push([i, j, o as 0 | 1, s]);
  }
  return out.sort((a, b) => a[1] - b[1] || a[0] - b[0] || a[2] - b[2]);
}

// Each cell has four quarter-segments, going round the dot clockwise: q0 N→E, q1 E→S, q2 S→W,
// q3 W→N. A segment end is (cell index × 4 + q) × 2 + e, e = 0 for the first point, 1 for the second.
type Weave = { loops: Pt[][]; loopOf: Int32Array; cells: Map<string, number>; list: Dot[] };

export function weave(dots: Dot[], edges: Map<string, 1 | 2>): Weave {
  const list = [...dots].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const cells = new Map(list.map(([i, j], n) => [cellKey(i, j), n]));
  const N = list.length * 8;
  const partner = new Int32Array(N).fill(-1);
  const end = (c: number, q: number, e: number) => (c * 4 + q) * 2 + e;
  const pair = (a: number, b: number) => { partner[a] = b; partner[b] = a; };
  const cellAt = (i: number, j: number) => cells.get(cellKey(i, j));

  list.forEach(([i, j], a) => {
    // the vertical edge on this cell's east side, shared with (i+1, j)
    const b = cellAt(i + 1, j);
    if (b == null) pair(end(a, 0, 1), end(a, 1, 0));
    else {
      const s = edges.get(edgeKey(i, j, 0)) ?? 0;
      if (s === 0) { pair(end(a, 0, 1), end(b, 2, 1)); pair(end(a, 1, 0), end(b, 3, 0)); }
      else if (s === 1) { pair(end(a, 0, 1), end(a, 1, 0)); pair(end(b, 2, 1), end(b, 3, 0)); }
      else { pair(end(a, 0, 1), end(b, 3, 0)); pair(end(a, 1, 0), end(b, 2, 1)); }
    }
    if (cellAt(i - 1, j) == null) pair(end(a, 2, 1), end(a, 3, 0));
    // the horizontal edge on this cell's south side, shared with (i, j+1)
    const d = cellAt(i, j + 1);
    if (d == null) pair(end(a, 1, 1), end(a, 2, 0));
    else {
      const s = edges.get(edgeKey(i, j, 1)) ?? 0;
      if (s === 0) { pair(end(a, 1, 1), end(d, 3, 1)); pair(end(a, 2, 0), end(d, 0, 0)); }
      else if (s === 1) { pair(end(a, 1, 1), end(a, 2, 0)); pair(end(d, 0, 0), end(d, 3, 1)); }
      else { pair(end(a, 1, 1), end(d, 0, 0)); pair(end(a, 2, 0), end(d, 3, 1)); }
    }
    if (cellAt(i, j - 1) == null) pair(end(a, 0, 0), end(a, 3, 1));
  });

  // where each segment end sits, in cell units
  const at = (id: number): Pt => {
    const e = id & 1, q = (id >> 1) & 3, [i, j] = list[id >> 3];
    const side = (q + e) % 4; // 0 N, 1 E, 2 S, 3 W
    return side === 0 ? { x: i + 0.5, y: j } : side === 1 ? { x: i + 1, y: j + 0.5 } : side === 2 ? { x: i + 0.5, y: j + 1 } : { x: i, y: j + 0.5 };
  };

  const loopOf = new Int32Array(N / 2).fill(-1);
  const loops: Pt[][] = [];
  for (let seg = 0; seg < N / 2; seg++) {
    if (loopOf[seg] >= 0) continue;
    const id = loops.length, pts: Pt[] = [];
    let cur = seg * 2; // enter at e = 0
    for (let guard = 0; guard <= N; guard++) {
      const s = cur >> 1;
      if (loopOf[s] >= 0) break;
      loopOf[s] = id;
      const out = cur ^ 1; // leave through the other end
      pts.push(at(out));
      cur = partner[out];
      if (cur < 0) break;
    }
    loops.push(pts);
  }
  return { loops, loopOf, cells, list };
}

// Edges where two different loops meet: re-pairing the four strand ends there (any other state)
// joins those two loops into one. Crossings come first, so a fix adds twists rather than
// undoing the ones you placed.
function joinable(w: Weave, edges: Map<string, 1 | 2>): [number, number, 0 | 1][] {
  const cross: [number, number, 0 | 1][] = [], other: [number, number, 0 | 1][] = [];
  const L = w.loopOf;
  w.list.forEach(([i, j], a) => {
    const right = w.cells.get(cellKey(i + 1, j)), down = w.cells.get(cellKey(i, j + 1));
    if (right != null) {
      const s = edges.get(edgeKey(i, j, 0)) ?? 0;
      if (s === 1 ? L[a * 4] !== L[right * 4 + 2] : L[a * 4] !== L[a * 4 + 1]) (s ? other : cross).push([i, j, 0]);
    }
    if (down != null) {
      const s = edges.get(edgeKey(i, j, 1)) ?? 0;
      if (s === 1 ? L[a * 4 + 1] !== L[down * 4] : L[a * 4 + 1] !== L[a * 4 + 2]) (s ? other : cross).push([i, j, 1]);
    }
  });
  return cross.length ? cross : other;
}

// Keeps re-pairing strands until the dots are woven by as few lines as possible (one line per
// island of touching dots). Returns the new edge map.
export function oneLine(dots: Dot[], edges: Map<string, 1 | 2>, seed = 1): Map<string, 1 | 2> {
  const r = mkRng(seed), m = new Map(edges);
  for (let guard = 0; guard < 300; guard++) {
    const w = weave(dots, m), c = joinable(w, m);
    if (!c.length) break;
    const [i, j, o] = c[Math.floor(r() * c.length)];
    const k = edgeKey(i, j, o), now = m.get(k) ?? 0;
    const next = ([0, 1, 2] as const).filter((v) => v !== now)[r() < 0.5 ? 0 : 1];
    if (next) m.set(k, next); else m.delete(k);
  }
  return m;
}

// Islands of touching dots: the fewest loops any choice of walls and bridges can reach.
export function islands(dots: Dot[]): number {
  const left = new Set(dots.map(([i, j]) => cellKey(i, j)));
  let n = 0;
  for (const [i, j] of dots) {
    if (!left.has(cellKey(i, j))) continue;
    n++;
    const todo: Dot[] = [[i, j]];
    left.delete(cellKey(i, j));
    while (todo.length) {
      const [a, b] = todo.pop()!;
      for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = cellKey(a + da, b + db);
        if (left.has(k)) { left.delete(k); todo.push([a + da, b + db]); }
      }
    }
  }
  return n;
}

// ---------- drawing ----------
// The loop's points are edge midpoints; it is drawn as quadratic curves through the halfway
// points with each midpoint as the control, so crossings stay straight and bounces round off
// into the familiar loops around each dot.
export function tracePath(x: { moveTo(a: number, b: number): void; quadraticCurveTo(a: number, b: number, c: number, d: number): void }, pts: Pt[], s: number, upto = pts.length) {
  const n = pts.length;
  if (!n) return;
  const mid = (k: number) => { const a = pts[k % n], b = pts[(k + 1) % n]; return { x: ((a.x + b.x) / 2) * s, y: ((a.y + b.y) / 2) * s }; };
  const q0 = mid(n - 1);
  x.moveTo(q0.x, q0.y);
  for (let k = 0; k < Math.min(n, upto); k++) { const q = mid(k); x.quadraticCurveTo(pts[k].x * s, pts[k].y * s, q.x, q.y); }
}
// Points along a loop as it is drawn (per points on every curve), for something to travel the line.
export function loopSamples(pts: Pt[], s: number, per = 6): Pt[] {
  const n = pts.length, out: Pt[] = [];
  if (!n) return out;
  const mid = (k: number) => { const a = pts[k % n], b = pts[(k + 1) % n]; return { x: ((a.x + b.x) / 2) * s, y: ((a.y + b.y) / 2) * s }; };
  let a = mid(n - 1);
  for (let k = 0; k < n; k++) {
    const c = { x: pts[k].x * s, y: pts[k].y * s }, b = mid(k);
    for (let i = 0; i < per; i++) { const t = i / per, u = 1 - t; out.push({ x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y }); }
    a = b;
  }
  return out;
}

export function sikkuPathD(pts: Pt[], s: number): string {
  let d = '';
  const f = (v: number) => v.toFixed(1);
  tracePath({ moveTo: (a, b) => { d += `M${f(a)} ${f(b)}`; }, quadraticCurveTo: (a, b, c, e) => { d += `Q${f(a)} ${f(b)} ${f(c)} ${f(e)}`; } }, pts, s);
  return d + 'Z';
}

// Loop colours for "rainbow" kolams (the chosen colour first).
export const LOOP_COLS = ['#FFC21A', '#E0532E', '#D2448A', '#7FC8A9', '#BFD9FF', '#E8761E', '#C9A0DC', '#9ED36A'];
export const loopColor = (base: string, k: number, rainbow: boolean) => (rainbow && k > 0 ? LOOP_COLS[(LOOP_COLS.indexOf(base) + k + 8) % 8] : base);

type Ctx = CanvasRenderingContext2D;
// prog in [0, 1] draws that fraction of every loop at once, so all the strands weave together.
export function drawSikku(x: Ctx, S: number, g: number, w: Weave, color: string, showDots: boolean, prog = 1, floor = '#3B2117', rainbow = false) {
  const s = S / g;
  x.fillStyle = floor;
  x.fillRect(0, 0, S, S);
  x.fillStyle = 'rgba(251,243,228,.2)';
  for (let i = 0; i < g; i++) for (let j = 0; j < g; j++) { x.beginPath(); x.arc((i + 0.5) * s, (j + 0.5) * s, 1.8 * Math.max(1, S / 600), 0, Math.PI * 2); x.fill(); }
  x.lineCap = 'round';
  x.lineJoin = 'round';
  w.loops.forEach((pts, k) => {
    const upto = Math.floor(pts.length * prog);
    if (!upto) return;
    x.beginPath();
    tracePath(x, pts, s, upto);
    if (upto >= pts.length) x.closePath();
    // a soft dark edge first, so crossings read like powder laid over powder
    x.strokeStyle = 'rgba(27,20,16,.45)';
    x.lineWidth = Math.max(4, s * 0.1);
    x.stroke();
    x.strokeStyle = loopColor(color, k, rainbow);
    x.lineWidth = Math.max(3, s * 0.07);
    x.stroke();
  });
  if (showDots) {
    x.fillStyle = '#FBF3E4';
    for (const [i, j] of w.list) { x.beginPath(); x.arc((i + 0.5) * s, (j + 0.5) * s, Math.max(3.2, s * 0.065), 0, Math.PI * 2); x.fill(); }
  }
}

// ---------- ready-made designs ----------
const M = SIKKU_GRID - 1;
// The 8 symmetries of the square grid.
const SYM: ((i: number, j: number) => Dot)[] = [
  (i, j) => [i, j], (i, j) => [M - i, j], (i, j) => [i, M - j], (i, j) => [M - i, M - j],
  (i, j) => [j, i], (i, j) => [M - j, i], (i, j) => [j, M - i], (i, j) => [M - j, M - i],
];
// The edge between cells a and b, as [i, j, o] from the upper/left cell.
function edgeOf(a: Dot, b: Dot): [number, number, 0 | 1] {
  const [p, q] = a[1] < b[1] || (a[1] === b[1] && a[0] < b[0]) ? [a, b] : [b, a];
  return [p[0], p[1], q[0] !== p[0] ? 0 : 1];
}
function edgeOrbit(i: number, j: number, o: 0 | 1): [number, number, 0 | 1][] {
  const a: Dot = [i, j], b: Dot = o ? [i, j + 1] : [i + 1, j];
  const seen = new Map<string, [number, number, 0 | 1]>();
  for (const f of SYM) { const e = edgeOf(f(...a), f(...b)); seen.set(edgeKey(...e), e); }
  return [...seen.values()];
}

export type Shape = 'diamond' | 'square' | 'temple' | 'cross' | 'ring';
export const SHAPES: [Shape, string][] = [['diamond', 'Diamond'], ['square', 'Square'], ['temple', 'Temple'], ['cross', 'Cross'], ['ring', 'Ring']];
export function shapeDots(shape: Shape): Dot[] {
  const out: Dot[] = [];
  for (let j = 0; j <= M; j++) for (let i = 0; i <= M; i++) {
    const di = Math.abs(i - 3), dj = Math.abs(j - 3);
    const on = shape === 'diamond' ? di + dj <= 3
      : shape === 'square' ? di <= 2 && dj <= 2
      : shape === 'temple' ? di + dj <= 4
      : shape === 'cross' ? di <= 1 || dj <= 1
      : Math.max(di, dj) >= 2;
    if (on) out.push([i, j]);
  }
  return out;
}

// A symmetric design: a shape, a sprinkle of walls and bridges in symmetric sets, then (where it
// keeps the symmetry) more flips until it's one line. Same seed, same kolam.
export function surpriseSikku(seed: number): { dots: Dot[]; edges: Map<string, 1 | 2> } {
  const r = mkRng(seed);
  const shapes = SHAPES.map(([id]) => id);
  const dots = shapeDots(shapes[Math.floor(r() * shapes.length)]);
  const on = new Set(dots.map(([i, j]) => cellKey(i, j)));
  const inner: [number, number, 0 | 1][] = [];
  for (const [i, j] of dots) {
    if (on.has(cellKey(i + 1, j))) inner.push([i, j, 0]);
    if (on.has(cellKey(i, j + 1))) inner.push([i, j, 1]);
  }
  // Walk the edges in a random order and flip each one's whole symmetric set when that joins
  // loops; now and then flip it anyway if it doesn't add any (for variety).
  const m = new Map<string, 1 | 2>();
  let best = weave(dots, m).loops.length;
  const keepEven = 0.03 + r() * 0.12;
  const order = inner.map((e) => [e, r()] as const).sort((a, b) => a[1] - b[1]).map(([e]) => e);
  for (const [i, j, o] of order) {
    if (m.has(edgeKey(i, j, o))) continue;
    for (const s of (r() < 0.5 ? [1, 2] : [2, 1]) as (1 | 2)[]) {
      const t = new Map(m);
      for (const e of edgeOrbit(i, j, o)) t.set(edgeKey(...e), s);
      const n = weave(dots, t).loops.length;
      if (n < best || (n === best && r() < keepEven)) { best = n; m.clear(); t.forEach((v, k) => m.set(k, v)); break; }
    }
  }
  // whatever symmetry couldn't join, a few single flips finish
  return { dots, edges: best > islands(dots) ? oneLine(dots, m, seed) : m };
}
