// A "recipe" is everything needed to redraw a creation: strokes, dots, stamps or a few settings.
// Recipes, not PNGs, are what share links store, so a friend's page can replay the drawing.
// Shared by the client (recording) and the server (validation, OG images). No DOM here.

export type Stroke = { c: string; s: number; n: number; b?: Brush; m?: 1; p: string };
export type Brush = 'powder' | 'petal' | 'diya' | 'pookalam' | 'peacock' | 'bindu' | 'vine' | 'keri' | 'kamal' | 'chakra';
export type Stamp = { x: number; y: number; t: number; i: string; z: number; r?: 1 };
export type Lang = 'en' | 'hi' | 'kn' | 'ta';

export type RangoliData = { strokes: Stroke[] };
// m (sikku kolams from the Kolam Weaver): walls and bridges between dots, see lib/art/sikku.ts.
// Without m it's the older dot-loop weave (Pulli, early share links). r: each loop its own colour.
export type KolamData = { dots: [number, number][]; c: string; d: boolean; m?: [number, number, 0 | 1, 1 | 2][]; r?: 1 };
export type BlockData = { a: number; st: Stamp[] };
// l: layout (banner, arch, stack, shake), b: backdrop (plain, sunburst, dots, stripes, bulbs),
// n: 1 when it dances (Nachao)
export type PosterData = { w: string; t: number; o: number; p: number; l?: number; b?: number; n?: 1 };
// s: the line painted under the name, k: colour scheme
export type PlateData = { n: string; f: 'wallpaper' | 'sticker'; s?: number; k?: number };
export type NaamData = { n: string; for?: string };
export type MehendiData = { strokes: Stroke[] };
export type GreetingData = { f: string; to: string; m: number; x?: string; l: Lang; art?: Art };
// Pookalam: l = layout, k = one character per cell ('.' empty, 'a'… a flower), see lib/art/pookalam.ts
export type PookalamData = { l: number; k: string };
// Bandhani: rounds of knots (points) tied before each dip in dye c; z = knot size 1–3
export type BandhaniData = { z: number; r: { c: string; p: string }[] };
// Phuljhadi light painting: rangoli-style strokes, but n is turns round the centre and m mirrors
// each turn (n 1 without m is a single free stroke), see lib/art/phuljhadi.ts
export type PhuljhadiData = { strokes: Stroke[] };
// Kathputli show: p = puppet, b = backdrop, t = the control bar's path as (x, y, tilt) triples at
// 30 a second, packed with encodePts; the replay runs the string physics again, see lib/art/kathputli.ts
export type KathputliData = { p: number; b: number; t: string };
// Warli: d dancers in the tarpa spiral, i = the village round them as (kind, x, y) triples packed
// with encodePts, s = dance speed in tenths, n: 1 at night, r: 1 when it turns the other way (Palto)
export type WarliData = { d: number; i: string; s: number; n?: 1; r?: 1 };
// Patang: the kite's two colours (a, b), pattern p, tail t, how many kites it cut (k), n: 1 at night
export type PatangData = { a: number; b: number; p: number; t: number; k: number; n?: 1 };

type R<T extends string, D> = { v: 1; type: T; by?: string; data: D };
export type Art = R<'rangoli', RangoliData> | R<'kolam', KolamData> | R<'naam', NaamData> | R<'mehendi', MehendiData> | R<'pookalam', PookalamData> | R<'bandhani', BandhaniData>;
export type Recipe =
  | Art
  | R<'block', BlockData>
  | R<'poster', PosterData>
  | R<'plate', PlateData>
  | R<'greeting', GreetingData>
  | R<'phuljhadi', PhuljhadiData>
  | R<'kathputli', KathputliData>
  | R<'warli', WarliData>
  | R<'patang', PatangData>;
export type RecipeType = Recipe['type'];

export const LABEL: Record<RecipeType, string> = {
  rangoli: 'rangoli', kolam: 'kolam', block: 'block print', poster: 'poster', plate: 'truck-art plate',
  naam: 'Naam Kolam', mehendi: 'mehendi', greeting: 'greeting', pookalam: 'pookalam', bandhani: 'bandhani',
  phuljhadi: 'light painting', kathputli: 'puppet show', warli: 'Warli painting', patang: 'kite',
};

export const MAX_BYTES = 48_000;
export const MAX_POINTS = 15_000; // x,y pairs across all strokes
export const BLOCK_COUNT = 8; // carved blocks in lib/art/block.ts
export const POOKALAM_LAYOUTS = 3; // layouts in lib/art/pookalam.ts
export const PUPPET_COUNT = 3, PUPPET_BACKDROPS = 3; // in lib/art/kathputli.ts
export const SHOW_MAX = 330;
export const WARLI_DANCERS = 48, WARLI_ITEMS = 60, WARLI_KINDS = 6; // in lib/art/warli.ts // control samples in a show: 11 seconds at 30 a second

// ---------- points: flat [x0,y0,x1,y1,...] ints in [-1000, 1000], per-axis delta + zigzag varint + base64url ----------
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
export function encodePts(flat: number[]): string {
  const bytes: number[] = [];
  const prev = [0, 0];
  for (let i = 0; i < flat.length; i++) {
    const v = Math.round(flat[i]);
    const d = v - prev[i & 1];
    prev[i & 1] = v;
    let z = d >= 0 ? d * 2 : -d * 2 - 1;
    while (z >= 0x80) { bytes.push((z & 0x7f) | 0x80); z >>>= 7; }
    bytes.push(z);
  }
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    const left = bytes.length - i;
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + (left > 1 ? B64[(n >> 6) & 63] : '') + (left > 2 ? B64[n & 63] : '');
  }
  return out;
}
export function decodePts(s: string): number[] | null {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) return null;
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i += 4) {
    const chunk = s.slice(i, i + 4);
    let n = 0;
    for (let k = 0; k < 4; k++) n = (n << 6) | (k < chunk.length ? B64.indexOf(chunk[k]) : 0);
    bytes.push((n >> 16) & 255);
    if (chunk.length > 2) bytes.push((n >> 8) & 255);
    if (chunk.length > 3) bytes.push(n & 255);
  }
  const out: number[] = [];
  const prev = [0, 0];
  let z = 0, shift = 0;
  for (const b of bytes) {
    z |= (b & 0x7f) << shift;
    if (b & 0x80) { shift += 7; if (shift > 21) return null; continue; }
    const k = out.length & 1;
    prev[k] += z & 1 ? -((z + 1) / 2) : z / 2;
    if (prev[k] < -1100 || prev[k] > 1100) return null;
    out.push(prev[k]);
    z = 0; shift = 0;
  }
  return shift ? null : out;
}

// ---------- text ----------
// Names and messages are short, plain and link-free so share pages can't host spam.
export function cleanText(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .replace(/\b(?:https?:\/\/|www\.)\S*/gi, '')
    .replace(/\b[\w-]+\.(?:com|in|net|org|io|xyz|ly|me|co|app|link|site|info)\b\S*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

// ---------- validation (server and client) ----------
const HEX = /^#[0-9A-Fa-f]{6}$/;
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const int = (x: unknown, lo: number, hi: number) => typeof x === 'number' && Number.isInteger(x) && x >= lo && x <= hi;
const LANGS: Lang[] = ['en', 'hi', 'kn', 'ta'];
const BRUSHES: Brush[] = ['powder', 'petal', 'diya', 'pookalam', 'peacock', 'bindu', 'vine', 'keri', 'kamal', 'chakra'];

function strokes(x: unknown, maxN: number): Stroke[] | null {
  if (!Array.isArray(x) || x.length > 2000) return null;
  let pts = 0;
  const out: Stroke[] = [];
  for (const s of x) {
    if (!isObj(s) || typeof s.c !== 'string' || !HEX.test(s.c) || !int(s.s, 1, 200) || !int(s.n, 1, maxN) || typeof s.p !== 'string') return null;
    if (s.b != null && !BRUSHES.includes(s.b as Brush)) return null;
    const d = decodePts(s.p);
    if (!d || d.length % 2 || !d.length) return null;
    pts += d.length / 2;
    if (pts > MAX_POINTS) return null;
    out.push({ c: s.c, s: s.s as number, n: s.n as number, p: s.p, ...(s.b ? { b: s.b as Brush } : {}), ...(s.m === 1 ? { m: 1 as const } : {}) });
  }
  return out;
}

function art(x: unknown): Art | null {
  const r = validateRecipe(x);
  return r && (r.type === 'rangoli' || r.type === 'kolam' || r.type === 'naam' || r.type === 'mehendi' || r.type === 'pookalam' || r.type === 'bandhani') ? r : null;
}

export function validateRecipe(x: unknown): Recipe | null {
  if (!isObj(x) || x.v !== 1 || !isObj(x.data)) return null;
  const d = x.data;
  const by = cleanText(x.by, 24) || undefined;
  const base = { v: 1 as const, ...(by ? { by } : {}) };
  switch (x.type) {
    case 'rangoli': {
      const st = strokes(d.strokes, 12);
      return st && st.length ? { ...base, type: 'rangoli', data: { strokes: st } } : null;
    }
    case 'mehendi': {
      const st = strokes(d.strokes, 2);
      return st && st.length ? { ...base, type: 'mehendi', data: { strokes: st } } : null;
    }
    case 'phuljhadi': {
      const st = strokes(d.strokes, 8);
      return st && st.length ? { ...base, type: 'phuljhadi', data: { strokes: st } } : null;
    }
    case 'kathputli': {
      if (!int(d.p, 0, PUPPET_COUNT - 1) || !int(d.b, 0, PUPPET_BACKDROPS - 1) || typeof d.t !== 'string' || d.t.length > 6000) return null;
      const t = decodePts(d.t);
      if (!t || t.length % 3 || t.length < 3 * 15 || t.length > 3 * SHOW_MAX || t.some((v) => v < -1000 || v > 1000)) return null;
      return { ...base, type: 'kathputli', data: { p: d.p as number, b: d.b as number, t: d.t } };
    }
    case 'patang': {
      if (!int(d.a, 0, 7) || !int(d.b, 0, 7) || !int(d.p, 0, 3) || !int(d.t, 0, 2) || !int(d.k, 0, 99)) return null;
      return { ...base, type: 'patang', data: { a: d.a as number, b: d.b as number, p: d.p as number, t: d.t as number, k: d.k as number, ...(d.n === 1 ? { n: 1 as const } : {}) } };
    }
    case 'warli': {
      if (!int(d.d, 0, WARLI_DANCERS) || !int(d.s, 3, 20) || typeof d.i !== 'string' || d.i.length > 2000) return null;
      const it = decodePts(d.i);
      if (!it || it.length % 3 || it.length > 3 * WARLI_ITEMS || (!d.d && !it.length)) return null;
      for (let k = 0; k < it.length; k += 3) if (!int(it[k], 0, WARLI_KINDS - 1) || Math.abs(it[k + 1]) > 1000 || Math.abs(it[k + 2]) > 1000) return null;
      return { ...base, type: 'warli', data: { d: d.d as number, i: d.i, s: d.s as number, ...(d.n === 1 ? { n: 1 as const } : {}), ...(d.r === 1 ? { r: 1 as const } : {}) } };
    }
    case 'kolam': {
      if (!Array.isArray(d.dots) || !d.dots.length || d.dots.length > 49 || typeof d.c !== 'string' || !HEX.test(d.c)) return null;
      const seen = new Set<string>();
      const dots: [number, number][] = [];
      for (const p of d.dots) {
        if (!Array.isArray(p) || !int(p[0], 0, 6) || !int(p[1], 0, 6) || seen.has(p.join())) return null;
        seen.add(p.join());
        dots.push([p[0], p[1]]);
      }
      let m: [number, number, 0 | 1, 1 | 2][] | undefined;
      if (d.m != null) {
        if (!Array.isArray(d.m) || d.m.length > 84) return null;
        const edges = new Set<string>();
        m = [];
        for (const e of d.m) {
          if (!Array.isArray(e) || !int(e[2], 0, 1) || !int(e[3], 1, 2) || !int(e[0], 0, e[2] ? 6 : 5) || !int(e[1], 0, e[2] ? 5 : 6) || edges.has(`${e[0]},${e[1]},${e[2]}`)) return null;
          edges.add(`${e[0]},${e[1]},${e[2]}`);
          m.push([e[0], e[1], e[2], e[3]]);
        }
      }
      return { ...base, type: 'kolam', data: { dots, c: d.c, d: d.d !== false, ...(m ? { m } : {}), ...(d.r === 1 ? { r: 1 as const } : {}) } };
    }
    case 'block': {
      if (!int(d.a, 200, 5000) || !Array.isArray(d.st) || !d.st.length || d.st.length > 600) return null;
      const st: Stamp[] = [];
      for (const s of d.st) {
        if (!isObj(s) || !int(s.x, -200, 1200) || !int(s.y, -200, 5200) || !int(s.t, 0, BLOCK_COUNT - 1) || typeof s.i !== 'string' || !HEX.test(s.i) || !int(s.z, 20, 800)) return null;
        st.push({ x: s.x as number, y: s.y as number, t: s.t as number, i: s.i, z: s.z as number, ...(s.r === 1 ? { r: 1 as const } : {}) });
      }
      return { ...base, type: 'block', data: { a: d.a as number, st } };
    }
    case 'poster': {
      const w = cleanText(d.w, 10).toUpperCase();
      if (!w || !int(d.t, 0, 30) || !int(d.o, 0, 30) || !int(d.p, 0, 7)) return null;
      if ((d.l != null && !int(d.l, 0, 3)) || (d.b != null && !int(d.b, 0, 4))) return null;
      return { ...base, type: 'poster', data: { w, t: d.t as number, o: d.o as number, p: d.p as number, ...(d.l ? { l: d.l as number } : {}), ...(d.b ? { b: d.b as number } : {}), ...(d.n === 1 ? { n: 1 as const } : {}) } };
    }
    case 'plate': {
      const n = cleanText(d.n, 22);
      if (!n || (d.f !== 'wallpaper' && d.f !== 'sticker')) return null;
      if ((d.s != null && !int(d.s, 0, 7)) || (d.k != null && !int(d.k, 0, 3))) return null;
      return { ...base, type: 'plate', data: { n, f: d.f, ...(d.s ? { s: d.s as number } : {}), ...(d.k ? { k: d.k as number } : {}) } };
    }
    case 'naam': {
      const n = cleanText(d.n, 24);
      if (!n) return null;
      const f = cleanText(d.for, 24);
      return { ...base, type: 'naam', data: { n, ...(f ? { for: f } : {}) } };
    }
    case 'pookalam': {
      if (!int(d.l, 0, POOKALAM_LAYOUTS - 1) || typeof d.k !== 'string' || d.k.length > 400 || !/^[.a-l]+$/.test(d.k) || !/[a-l]/.test(d.k)) return null;
      return { ...base, type: 'pookalam', data: { l: d.l as number, k: d.k } };
    }
    case 'bandhani': {
      if (!int(d.z, 1, 3) || !Array.isArray(d.r) || !d.r.length || d.r.length > 3) return null;
      const rounds: { c: string; p: string }[] = [];
      let knots = 0;
      for (const r of d.r) {
        if (!isObj(r) || typeof r.c !== 'string' || !HEX.test(r.c) || typeof r.p !== 'string') return null;
        const pts = decodePts(r.p);
        if (!pts || pts.length % 2 || pts.some((v) => v < -1000 || v > 1000)) return null;
        knots += pts.length / 2;
        if (knots > 2000) return null;
        rounds.push({ c: r.c, p: r.p });
      }
      return { ...base, type: 'bandhani', data: { z: d.z as number, r: rounds } };
    }
    case 'greeting': {
      const f = cleanText(d.f, 32);
      const to = cleanText(d.to, 32);
      if (!/^[a-z0-9-]+$/.test(f) || !int(d.m, 0, 20) || !LANGS.includes(d.l as Lang)) return null;
      const extra = cleanText(d.x, 60);
      const a = d.art == null ? null : art(d.art);
      if (d.art != null && !a) return null;
      return { ...base, type: 'greeting', data: { f, to, m: d.m as number, l: d.l as Lang, ...(extra ? { x: extra } : {}), ...(a ? { art: a } : {}) } };
    }
  }
  return null;
}

// Short, stable ids: the same recipe always gets the same link (no duplicate rows on re-share).
export async function recipeId(r: Recipe): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(r)));
  let n = 0n;
  for (const b of new Uint8Array(buf).slice(0, 8)) n = (n << 8n) | BigInt(b);
  const A = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let id = '';
  for (let i = 0; i < 8; i++) { id += A[Number(n % 62n)]; n /= 62n; }
  return id;
}
export const ID_RE = /^[0-9A-Za-z]{8}$/;
