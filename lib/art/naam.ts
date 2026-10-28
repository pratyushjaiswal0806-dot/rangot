// Naam Kolam: a name, hashed into a symmetric dot pattern on a 9×9 grid, woven into one loop.
// The same name always gives the same kolam and the same (playful) reading.
import traits from '../../data/naam-traits.json';
import { hashStr, mkRng } from '../rng';

export const NAAM_GRID = 9;
export type Naam = {
  dots: [number, number][];
  g: number; // grid size, fitted to the pattern with one cell of margin
  sym: 4 | 8;
  weave: { name: string; line: string };
  words: [string, string, string];
  color: { bg: string; line: string; name: string };
};

export const normName = (n: string) => n.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();

export function naamKolam(name: string): Naam {
  const h = hashStr(normName(name) || 'rangotsav');
  const rnd = mkRng(h);
  // Every choice comes from the RNG stream (short-string FNV bits alone are badly correlated).
  const roll = (n: number) => Math.floor(rnd() * n);
  const sym: 4 | 8 = rnd() < 0.5 ? 8 : 4;
  const M = NAAM_GRID - 1, c = M / 2;
  // Grow a connected, symmetric cluster out from the centre, one symmetry orbit at a time. The
  // weaver only reads as a kolam when neighbouring dots touch (like the tool's diamond preset).
  const orbit = (i: number, j: number): [number, number][] => {
    const base: [number, number][] = sym === 8 ? [[i, j], [j, i]] : [[i, j]];
    return base.flatMap(([a, b]) => [[a, b], [M - a, b], [a, M - b], [M - a, M - b]] as [number, number][]);
  };
  const set = new Map<string, [number, number]>();
  const has = (i: number, j: number) => set.has(i + ',' + j);
  const addOrbit = (i: number, j: number) => { for (const [a, b] of orbit(i, j)) set.set(a + ',' + b, [a, b]); };
  addOrbit(c, c);
  const want = 13 + roll(sym === 8 ? 18 : 16);
  const spike = rnd() * 1.6; // 0 = round blob, higher = longer arms
  // Arms: sometimes start with a cross so long names don't all become blobs.
  if (rnd() < 0.45) addOrbit(c, c - 1);
  for (let guard = 0; set.size < want && guard < 200; guard++) {
    const frontier: [number, number][] = [];
    // Orthogonal steps only: every dot then touches a neighbour and the line never has to jump.
    for (const [i, j] of set.values()) for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const a = i + di, b = j + dj;
      if (a >= 0 && b >= 0 && a <= M && b <= M && !has(a, b)) frontier.push([a, b]);
    }
    if (!frontier.length) break;
    const w = frontier.map(([a, b]) => 1 + spike * (Math.max(Math.abs(a - c), Math.abs(b - c)) ** 2));
    let t = rnd() * w.reduce((x, y) => x + y, 0), k = 0;
    while (k < w.length - 1 && (t -= w[k]) > 0) k++;
    addOrbit(frontier[k][0], frontier[k][1]);
  }
  // Fill true holes (all four neighbours set) so the weave doesn't jump across gaps.
  for (let i = 0; i <= M; i++) for (let j = 0; j <= M; j++) {
    if (!has(i, j) && [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([a, b]) => has(i + a, j + b))) addOrbit(i, j);
  }
  // Fit the grid to the pattern (it is centred, so the radius sets the size).
  const r = Math.max(...[...set.values()].map(([i, j]) => Math.max(Math.abs(i - c), Math.abs(j - c))));
  const g = 2 * r + 3, shift = r + 1 - c;
  const pick = <T,>(arr: T[]) => arr[roll(arr.length)];
  const t1 = pick(traits.traits);
  let t2 = pick(traits.traits);
  if (t2 === t1) t2 = traits.traits[(traits.traits.indexOf(t1) + 7) % traits.traits.length];
  return { dots: [...set.values()].map(([i, j]) => [i + shift, j + shift] as [number, number]), g, sym, weave: pick(traits.weaves), words: [t1, t2, pick(traits.twists)], color: pick(traits.colors) };
}

export function naamReading(n: Naam) {
  return {
    title: `the ${n.weave.name}`,
    stats: `${n.dots.length} pulli · ${n.sym}-fold`,
    traits: `${n.words[0]}, ${n.words[1].toLowerCase()}, and ${n.words[2]}.`,
  };
}
