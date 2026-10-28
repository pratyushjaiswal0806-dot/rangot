// Pulli: the daily kolam puzzle. Everyone gets the same target (seeded by the IST date); you see
// only the woven line and must place the dots that make it. Six tries, Wordle-style sharing.
import { hashStr, mkRng } from './rng';
import { daysBetween, istDay } from './festivals';

export const GRID = 7;
export const TRIES = 6;
const EPOCH = '2026-10-28'; // puzzle #1 (launch day)
export type Dot = [number, number];
export type Mark = 'hit' | 'near' | 'miss';
export const key = ([i, j]: Dot) => `${i},${j}`;

export const puzzleNumber = (day = istDay()) => daysBetween(EPOCH, day) + 1;

// A connected, mirror-symmetric cluster of 5–13 dots, grown from the centre. Orthogonal growth
// keeps the woven line readable, so the dots can be worked out from it.
export function target(day = istDay()): Dot[] {
  const rnd = mkRng(hashStr('pulli:' + day));
  const M = GRID - 1, c = M / 2;
  const set = new Map<string, Dot>();
  const cells = (i: number, j: number) => [[i, j], [M - i, j], [i, M - j], [M - i, M - j]] as Dot[];
  const orbit = (i: number, j: number) => { for (const d of cells(i, j)) set.set(key(d), d); };
  if (rnd() < 0.7) orbit(c, c); else orbit(c - 1, c - 1);
  const want = 5 + Math.floor(rnd() * 9);
  for (let g = 0; set.size < want && g < 60; g++) {
    const fr: Dot[] = [];
    for (const [i, j] of set.values()) for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const a = i + di, b = j + dj;
      if (a >= 0 && b >= 0 && a <= M && b <= M && !set.has(a + ',' + b)) fr.push([a, b]);
    }
    if (!fr.length) break;
    const [a, b] = fr[Math.floor(rnd() * fr.length)];
    // the set is symmetric, so a new cell's whole orbit is new too
    if (set.size + new Set(cells(a, b).map(key)).size > 13) break;
    orbit(a, b);
  }
  return [...set.values()];
}

// hit = right spot; near = a dot you haven't found yet is right next to it; miss = neither.
export function evaluate(guess: Dot[], tgt: Dot[]): { marks: Mark[]; missing: number; won: boolean } {
  const T = new Set(tgt.map(key)), G = new Set(guess.map(key));
  const unfound = tgt.filter((d) => !G.has(key(d)));
  const marks = guess.map((d): Mark => {
    if (T.has(key(d))) return 'hit';
    return unfound.some(([a, b]) => Math.abs(a - d[0]) <= 1 && Math.abs(b - d[1]) <= 1) ? 'near' : 'miss';
  });
  return { marks, missing: unfound.length, won: unfound.length === 0 && guess.length === tgt.length };
}

const EMO: Record<Mark, string> = { hit: '🟩', near: '🟨', miss: '⬜' };
export function shareText(day: string, guesses: Dot[][], won: boolean, tgt: Dot[], url: string) {
  const rows = guesses.map((g) => evaluate([...g].sort((a, b) => a[1] - b[1] || a[0] - b[0]), tgt).marks.map((m) => EMO[m]).join(''));
  return `Rangotsav Pulli #${puzzleNumber(day)} · ${won ? guesses.length : 'X'}/${TRIES}\n${rows.join('\n')}\n${url}`;
}

// ---------- storage ----------
type Today = { day: string; guesses: Dot[][]; done: boolean; won: boolean };
type Stats = { played: number; won: number; streak: number; best: number; lastWon: string; dist: number[] };
const TK = 'rangotsav:pulli:today', SK = 'rangotsav:pulli:stats';
const read = <T,>(k: string, d: T): T => { try { return { ...d, ...JSON.parse(localStorage.getItem(k) || 'null') }; } catch { return d; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export function loadToday(day = istDay()): Today {
  const t = read<Today>(TK, { day, guesses: [], done: false, won: false });
  return t.day === day ? t : { day, guesses: [], done: false, won: false };
}
export const saveToday = (t: Today) => write(TK, t);

export function pulliStats(): Stats {
  const s = read<Stats>(SK, { played: 0, won: 0, streak: 0, best: 0, lastWon: '', dist: [0, 0, 0, 0, 0, 0] });
  // a streak only survives if yesterday (or today) was won
  if (s.lastWon && daysBetween(s.lastWon, istDay()) > 1) s.streak = 0;
  return s;
}
export function recordResult(day: string, won: boolean, tries: number) {
  const s = pulliStats();
  s.played++;
  if (won) {
    s.won++;
    s.streak = s.lastWon && daysBetween(s.lastWon, day) === 1 ? s.streak + 1 : 1;
    s.best = Math.max(s.best, s.streak);
    s.lastWon = day;
    s.dist[tries - 1] = (s.dist[tries - 1] ?? 0) + 1;
  } else s.streak = 0;
  write(SK, s);
  return s;
}

// time until the next puzzle (midnight IST)
export function msToNext(now = new Date()) {
  const ist = new Date(now.getTime() + 5.5 * 3600_000);
  const next = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() + 1) - 5.5 * 3600_000;
  return next - now.getTime();
}
