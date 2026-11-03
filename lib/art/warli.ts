// Warli: white rice-paste figures on a red-earth wall. Everything is built from the three shapes
// Warli painters use (a circle, a triangle, a square) and drawn as a list of primitives, so the
// same geometry goes to a canvas (the toy, the replay, the reel) or to an SVG (the OG image).
// In the middle stands the tarpa player; dancers join hands in a spiral round him and the whole
// spiral turns, the way the tarpa dance is painted. Houses, trees, animals, paddy and birds fill
// the village around it. Positions are in stage units (0…1 of the square).
type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
export const PASTE = '#F6EEDB';
const GERU = ['#8E3B20', '#A24A28'], NIGHT = ['#4A1C12', '#5E2617'];

export const CX = 0.5, CY = 0.53; // the tarpa player
const R_IN = 0.125, RING = 0.072, GAP = 0.052, H = 0.058; // spiral start, ring spacing, dancer spacing, dancer height
export const MAX_DANCERS = 48;
export const WALK = 1.6; // seconds for a dancer to walk in and join
export const SPIN = 0.22; // radians a second the spiral turns at speed 1

// Things to paint round the dance (k in the recipe).
export const ITEMS = [
  { id: 'hut', name: 'Ghar', en: 'hut' },
  { id: 'tree', name: 'Ped', en: 'tree' },
  { id: 'deer', name: 'Hiran', en: 'deer' },
  { id: 'rooster', name: 'Murga', en: 'rooster' },
  { id: 'paddy', name: 'Dhaan', en: 'paddy' },
  { id: 'bird', name: 'Chidiya', en: 'birds' },
] as const;
export const ANIMALS = [2, 3];

export type Dancer = { sx: number; sy: number; t0: number }; // where it walks in from, when it set off (s)
export type Item = { k: number; x: number; y: number; t0: number };
export type Scene = { dancers: Dancer[]; items: Item[]; night: boolean };

// ---------- primitives ----------
type Prim = { c: [number, number, number]; f?: boolean } | { p: number[]; f?: boolean; z?: boolean };
// a small steady wobble per figure and point, like a hand-painted line (the same every frame)
const jit = (a: number, b: number) => { const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return s - Math.floor(s) - 0.5; };

// ---------- a Warli person: a circle on two triangles that meet at the waist ----------
// lh/rh: where the hands go (holding a neighbour), otherwise the arms swing; p: the step's phase
function person(cx: number, cy: number, h: number, seed: number, p: number, lh?: [number, number] | null, rh?: [number, number] | null, walk = 0): Prim[] {
  const w = (n: number) => jit(seed, n) * h * 0.06;
  const out: Prim[] = [];
  const hop = Math.abs(Math.sin(p)) * h * 0.06;
  cy -= hop;
  const sh = cy - 0.44 * h, sw = 0.21 * h, hip = cy + 0.34 * h, hw = 0.18 * h;
  out.push({ c: [cx + w(1), cy - 0.62 * h, 0.13 * h], f: true });
  if (seed % 2) out.push({ c: [cx + 0.11 * h, cy - 0.66 * h, 0.06 * h], f: true }); // a hair knot
  out.push({ p: [cx - sw + w(2), sh, cx + sw + w(3), sh + w(4), cx + w(5) * 0.3, cy], f: true });
  out.push({ p: [cx + w(5) * 0.3, cy, cx + hw + w(6), hip, cx - hw + w(7), hip + w(8)], f: true });
  // legs: each bends at the knee and steps in turn
  const sw2 = Math.sin(p) * h * (0.1 + walk * 0.08);
  for (const s of [-1, 1]) {
    const k = s * sw2, lift = Math.max(0, s * Math.sin(p)) * h * 0.08;
    out.push({ p: [cx + s * 0.11 * h, hip, cx + s * 0.2 * h + k * 0.5, hip + 0.16 * h - lift, cx + s * 0.13 * h + k, hip + 0.32 * h - lift * 0.5] });
  }
  // arms: to the neighbours' hands, or swinging
  const arm = (s: number, hand: [number, number] | null | undefined) => {
    const x0 = cx + s * sw, y0 = sh + 0.02 * h;
    if (hand) {
      const mx = (x0 + hand[0]) / 2, my = Math.max(y0, hand[1]) + 0.08 * h;
      out.push({ p: [x0, y0, mx, my, hand[0], hand[1]] });
    } else {
      const a = s * (0.6 + Math.sin(p + (s > 0 ? Math.PI : 0)) * (0.25 + walk * 0.2));
      const ex = x0 + Math.sin(a) * 0.2 * h, ey = y0 + Math.cos(a) * 0.2 * h;
      out.push({ p: [x0, y0, ex, ey, ex + s * 0.1 * h, ey - 0.16 * h] });
    }
  };
  arm(-1, lh); arm(1, rh);
  return out;
}

// The tarpa player: he blows the long gourd horn and sways to his own tune.
function tarpaPlayer(beat: number): Prim[] {
  const h = 0.1, sway = Math.sin(beat * Math.PI) * 0.006, cx = CX + sway, cy = CY;
  const out = person(cx, cy, h, 4, 0, [cx + 0.03, cy - 0.06], [cx + 0.07, cy - 0.04]);
  // the tarpa: a tube from his mouth curving out and down to a gourd bell
  const m = [cx + 0.012, cy - 0.062], e = [cx + 0.1, cy + 0.0];
  out.push({ p: [m[0], m[1], cx + 0.05, cy - 0.06, cx + 0.085, cy - 0.035, e[0], e[1]] });
  out.push({ c: [e[0] + 0.01, e[1] + 0.012, 0.019], f: true }, { c: [e[0] + 0.022, e[1] + 0.03, 0.011], f: true });
  return out;
}

// Where dancer k stands on the spiral, with the spiral turned phi radians.
export function slot(k: number, phi: number): [number, number] {
  const a = k * GAP + 0.07, c = RING / TAU, th = (-R_IN + Math.sqrt(R_IN * R_IN + 2 * c * a)) / c, r = R_IN + c * th, ang = th + phi;
  return [CX + r * Math.cos(ang), CY + 0.02 + r * Math.sin(ang) * 0.92];
}
const ease = (v: number) => (v <= 0 ? 0 : v >= 1 ? 1 : 1 - (1 - v) ** 3);

// Dancer k's place right now: walking in from where it was added, or in the spiral.
function dancerAt(d: Dancer, k: number, t: number, phi: number): { x: number; y: number; joined: boolean; walk: number } {
  const [tx, ty] = slot(k, phi), e = ease((t - d.t0) / WALK);
  return { x: d.sx + (tx - d.sx) * e, y: d.sy + (ty - d.sy) * e, joined: e >= 1, walk: e < 1 && t >= d.t0 ? 1 : 0 };
}

// ---------- the village ----------
function item(it: Item, t: number): Prim[] {
  const { x, y } = it, s = 0.07, a = t - it.t0;
  const grow = ease(a / 0.5), k = s * (0.4 + 0.6 * grow);
  if (grow <= 0) return [];
  switch (it.k) {
    case 0: { // a hut: square walls, a pitched thatch roof with its strokes, a door
      const w = k * 0.55, hh = k * 0.45;
      const out: Prim[] = [{ p: [x - w, y, x + w, y, x + w, y - hh, x - w, y - hh], z: true }, { p: [x - w * 1.25, y - hh, x, y - hh - k * 0.5, x + w * 1.25, y - hh], z: true }];
      for (let i = 1; i < 5; i++) out.push({ p: [x - w * 1.25 + (i * w * 2.5) / 5, y - hh, x - w * 0.6 + (i * w * 1.2) / 5, y - hh - k * 0.3] });
      out.push({ p: [x - w * 0.25, y, x - w * 0.25, y - hh * 0.6, x + w * 0.25, y - hh * 0.6, x + w * 0.25, y], f: true });
      return out;
    }
    case 1: { // a tree: a trunk with branches reaching up, a leaf at every tip; it sways
      const sw = Math.sin(t * 1.3 + x * 9) * k * 0.05, out: Prim[] = [{ p: [x, y, x + sw, y - k * 1.1] }];
      for (let i = 0; i < 5; i++) {
        const by = y - k * (0.35 + i * 0.16), len = k * (0.42 - i * 0.06);
        for (const s of [-1, 1]) {
          const tx = x + s * len + sw * (1 + i * 0.2), ty = by - len * 0.7;
          out.push({ p: [x + sw * (0.3 + i * 0.15), by, tx, ty] }, { c: [tx, ty, k * 0.045], f: true });
        }
      }
      return out;
    }
    case 2: { // a deer: a body of two triangles, thin legs, antlers; it lowers its head to graze
      const g = Math.max(0, Math.sin(t * 0.8 + x * 7)) * k * 0.18, w = k * 0.45;
      return [
        { p: [x - w, y - k * 0.45, x + w, y - k * 0.45, x, y - k * 0.3], f: true },
        { p: [x - w, y - k * 0.15, x + w, y - k * 0.15, x, y - k * 0.3], f: true },
        { p: [x - w * 0.8, y - k * 0.15, x - w * 0.9, y] }, { p: [x - w * 0.5, y - k * 0.15, x - w * 0.4, y] },
        { p: [x + w * 0.5, y - k * 0.15, x + w * 0.4, y] }, { p: [x + w * 0.8, y - k * 0.15, x + w * 0.9, y] },
        { p: [x + w, y - k * 0.42, x + w * 1.3, y - k * 0.75 + g] },
        { c: [x + w * 1.38, y - k * 0.78 + g, k * 0.08], f: true },
        { p: [x + w * 1.3, y - k * 0.86 + g, x + w * 1.15, y - k * 1.1 + g, x + w * 1.05, y - k * 1.05 + g] },
        { p: [x + w * 1.45, y - k * 0.86 + g, x + w * 1.6, y - k * 1.1 + g, x + w * 1.75, y - k * 1.05 + g] },
        { p: [x - w, y - k * 0.42, x - w * 1.2, y - k * 0.52] },
      ];
    }
    case 3: { // a rooster: a round body, a fan of tail feathers, a comb; it pecks now and then
      const peck = Math.max(0, Math.sin(t * 2.2 + x * 5)) ** 6 * k * 0.15, r = k * 0.22;
      const out: Prim[] = [{ c: [x, y - k * 0.4, r], f: true }, { c: [x + r * 1.1, y - k * 0.62 + peck, r * 0.45], f: true }];
      out.push({ p: [x + r * 1.5, y - k * 0.62 + peck, x + r * 1.95, y - k * 0.58 + peck, x + r * 1.5, y - k * 0.54 + peck], f: true });
      out.push({ p: [x + r * 0.9, y - k * 0.78 + peck, x + r * 1.1, y - k * 0.86 + peck, x + r * 1.3, y - k * 0.78 + peck] });
      for (let i = 0; i < 4; i++) { const a = -2.2 - i * 0.28; out.push({ p: [x - r * 0.6, y - k * 0.45, x - r * 0.6 + Math.cos(a) * k * 0.45, y - k * 0.45 + Math.sin(a) * k * 0.45] }); }
      out.push({ p: [x - r * 0.2, y - k * 0.2, x - r * 0.3, y] }, { p: [x + r * 0.2, y - k * 0.2, x + r * 0.3, y] });
      return out;
    }
    case 4: { // paddy: a row of rice plants bending in the breeze
      const out: Prim[] = [];
      for (let i = -2; i <= 2; i++) {
        const px = x + i * k * 0.28, sw = Math.sin(t * 1.6 + i + x * 4) * k * 0.06;
        for (const s of [-1, 0, 1]) out.push({ p: [px, y, px + s * k * 0.14 + sw, y - k * (0.38 - Math.abs(s) * 0.08)] });
        out.push({ c: [px + sw, y - k * 0.42, k * 0.035], f: true });
      }
      return out;
    }
    default: { // birds: three little V's flapping across the sky
      const out: Prim[] = [];
      for (let i = 0; i < 3; i++) {
        const bx = x + (i - 1) * k * 0.5, by = y + (i === 1 ? -k * 0.2 : 0), f = Math.sin(t * 6 + i * 1.7) * k * 0.12;
        out.push({ p: [bx - k * 0.2, by - k * 0.05 - f, bx, by + k * 0.06, bx + k * 0.2, by - k * 0.05 - f] });
      }
      return out;
    }
  }
}

// the sun (with rays) or the moon (with stars) in the corner of the wall
function sky(night: boolean, t: number): Prim[] {
  const x = 0.85, y = 0.15;
  if (!night) {
    const out: Prim[] = [{ c: [x, y, 0.035], f: true }];
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU + t * 0.1; out.push({ p: [x + Math.cos(a) * 0.045, y + Math.sin(a) * 0.045, x + Math.cos(a) * 0.065, y + Math.sin(a) * 0.065] }); }
    return out;
  }
  const out: Prim[] = [];
  const moon: number[] = [];
  for (let i = 0; i <= 16; i++) { const a = -1.9 + (i / 16) * 3.8; moon.push(x + Math.cos(a) * 0.04, y + Math.sin(a) * 0.04); }
  for (let i = 16; i >= 0; i--) { const a = -1.5 + (i / 16) * 3; moon.push(x + 0.012 + Math.cos(a) * 0.03, y + Math.sin(a) * 0.034); }
  out.push({ p: moon, f: true });
  for (const [sx, sy] of [[0.12, 0.14], [0.22, 0.09], [0.7, 0.1], [0.32, 0.17], [0.62, 0.2], [0.93, 0.28]]) {
    const r = 0.008 + Math.sin(t * 2 + sx * 30) * 0.002;
    out.push({ p: [sx - r, sy, sx + r, sy] }, { p: [sx, sy - r, sx, sy + r] });
  }
  return out;
}

// Everything on the wall at time t (s): phi is how far the spiral has turned, beat the dance's
// step count (both kept by the caller, so changing speed never makes them jump); hop lifts every
// dancer for a moment (0…1).
function scenePrims(sc: Scene, t: number, phi: number, beat: number, hop = 0): Prim[][] {
  const groups: Prim[][] = [sky(sc.night, t)];
  for (const it of sc.items) groups.push(item(it, t));
  groups.push(tarpaPlayer(beat));
  const at = sc.dancers.map((d, k) => dancerAt(d, k, t, phi));
  sc.dancers.forEach((d, k) => {
    if (t < d.t0) return;
    const me = at[k], up = hop ? Math.sin(Math.PI * hop) * 0.02 : 0;
    // joined neighbours hold hands, meeting halfway between them
    const hand = (o: (typeof at)[number] | undefined) => (o && o.joined && me.joined ? [(me.x + o.x) / 2, (me.y + o.y) / 2 - H * 0.3 - up] as [number, number] : null);
    // the left hand goes to whichever neighbour stands further left
    const hs = [[hand(at[k - 1]), at[k - 1]?.x], [hand(at[k + 1]), at[k + 1]?.x]].filter((v): v is [[number, number], number] => !!v[0]);
    let left: [number, number] | null = null, right: [number, number] | null = null;
    if (hs.length === 2) [left, right] = hs[0][1] < hs[1][1] ? [hs[0][0], hs[1][0]] : [hs[1][0], hs[0][0]];
    else if (hs.length === 1) { if (hs[0][1] < me.x) left = hs[0][0]; else right = hs[0][0]; }
    groups.push(person(me.x, me.y - up, H, k + 7, beat * Math.PI + k * 0.45, left, right, me.walk));
  });
  return groups;
}

// ---------- the wall ----------
// Red earth, smeared on by hand, with a border of little triangles (cached: it never changes).
export function wallCanvas(S: number, night: boolean, d = 1): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = cv.height = Math.round(S * d);
  const x = cv.getContext('2d')!;
  x.setTransform(d, 0, 0, d, 0, 0);
  const [a, b] = night ? NIGHT : GERU;
  const g = x.createRadialGradient(S * 0.5, S * 0.5, S * 0.1, S * 0.5, S * 0.5, S * 0.75);
  g.addColorStop(0, b); g.addColorStop(1, a);
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 90; i++) {
    const px = (jit(i, 1) + 0.5) * S, py = (jit(i, 2) + 0.5) * S, r = (0.03 + (jit(i, 3) + 0.5) * 0.08) * S;
    x.globalAlpha = 0.06; x.fillStyle = jit(i, 4) > 0 ? '#C2643A' : '#3A140A';
    x.beginPath(); x.ellipse(px, py, r, r * 0.6, jit(i, 5) * 3, 0, TAU); x.fill();
  }
  x.globalAlpha = 1;
  x.fillStyle = PASTE;
  const n = 26, m = S * 0.028, tri = (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number) => { x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.lineTo(x2, y2); x.fill(); };
  for (let i = 0; i < n; i++) {
    const u = (i / n) * S, v = ((i + 1) / n) * S, mid = (u + v) / 2;
    tri(u, m * 0.4, v, m * 0.4, mid, m * 1.3); tri(u, S - m * 0.4, v, S - m * 0.4, mid, S - m * 1.3);
    tri(m * 0.4, u, m * 0.4, v, m * 1.3, mid); tri(S - m * 0.4, u, S - m * 0.4, v, S - m * 1.3, mid);
  }
  x.strokeStyle = PASTE; x.lineWidth = S * 0.004;
  x.strokeRect(m * 1.6, m * 1.6, S - m * 3.2, S - m * 3.2);
  return cv;
}

export function drawWarli(x: Ctx, S: number, sc: Scene, o: { t: number; phi: number; beat: number; hop?: number; wall: HTMLCanvasElement }) {
  x.drawImage(o.wall, 0, 0, S, S);
  x.fillStyle = PASTE; x.strokeStyle = PASTE;
  x.lineCap = 'round'; x.lineJoin = 'round';
  x.lineWidth = Math.max(1.2, S * 0.0042);
  for (const g of scenePrims(sc, o.t, o.phi, o.beat, o.hop)) {
    for (const pr of g) {
      x.beginPath();
      if ('c' in pr) { x.arc(pr.c[0] * S, pr.c[1] * S, pr.c[2] * S, 0, TAU); if (pr.f) x.fill(); else x.stroke(); continue; }
      const p = pr.p;
      x.moveTo(p[0] * S, p[1] * S);
      for (let i = 2; i < p.length; i += 2) x.lineTo(p[i] * S, p[i + 1] * S);
      if (pr.f || pr.z) x.closePath();
      if (pr.f) x.fill(); else x.stroke();
    }
  }
}

// ---------- recipes and the OG image ----------
// A scene from a recipe: dancers walk in one after another from the edges (they were added by
// tapping, but a replay doesn't need to know where), items appear first.
export function sceneFrom(d: number, items: [number, number, number][], night: boolean, spread = 3.2): Scene {
  return {
    night,
    items: items.map(([k, ix, iy], i) => ({ k, x: ix / 2000 + 0.5, y: iy / 2000 + 0.5, t0: 0.15 + i * 0.12 })),
    dancers: Array.from({ length: d }, (_, k) => {
      const a = k * 2.4 + 0.8;
      return { sx: CX + Math.cos(a) * 0.62, sy: CY + Math.sin(a) * 0.62, t0: 0.4 + (k * spread) / Math.max(1, d) };
    }),
  };
}

// SVG of the finished scene (no canvas on the server): the wall, and everything in paste white.
export function warliSvg(d: number, items: [number, number, number][], night: boolean, S = 600): string {
  const sc = sceneFrom(d, items, night);
  const t = 99, f = (v: number) => (v * S).toFixed(1);
  const [a, b] = night ? NIGHT : GERU;
  let body = '';
  for (const g of scenePrims(sc, t, 0, 0)) {
    for (const pr of g) {
      if ('c' in pr) { body += `<circle cx="${f(pr.c[0])}" cy="${f(pr.c[1])}" r="${f(pr.c[2])}"${pr.f ? '' : ' fill="none" stroke-width="2.5"'}/>`; continue; }
      const pts = [];
      for (let i = 0; i < pr.p.length; i += 2) pts.push(`${f(pr.p[i])},${f(pr.p[i + 1])}`);
      body += pr.f ? `<polygon points="${pts.join(' ')}"/>` : `<poly${pr.z ? 'gon' : 'line'} points="${pts.join(' ')}" fill="none" stroke-width="2.5"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><defs><radialGradient id="w"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></radialGradient></defs>`
    + `<rect width="${S}" height="${S}" fill="url(#w)"/><rect x="${S * 0.045}" y="${S * 0.045}" width="${S * 0.91}" height="${S * 0.91}" fill="none" stroke="${PASTE}" stroke-width="2.5"/>`
    + `<g fill="${PASTE}" stroke="${PASTE}" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
}

// A whole village for the shelf tile: two dozen dancers, huts, trees, animals and a paddy field.
export const SAMPLE_ITEMS: [number, number, number][] = [
  [0, -760, -520], [0, -560, -580], [1, 720, -240], [1, -780, 120], [2, 560, 640], [3, -560, 700], [4, -160, 760], [4, 180, 760], [5, -400, -760], [1, 780, 500],
];
