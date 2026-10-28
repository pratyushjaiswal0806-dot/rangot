// "My Courtyard": what you've tried, made and shared, kept in this browser only.
// Every read/write is guarded; a private window just starts fresh.
import type { RecipeType } from './recipe';

export const STAMPS = [
  { id: 'naam', label: 'Naam Kolam', glyph: 'ನ' },
  { id: 'rangoli', label: 'Rangoli', glyph: '✺' },
  { id: 'kolam', label: 'Kolam', glyph: '∞' },
  { id: 'mehendi', label: 'Mehendi', glyph: '❦' },
  { id: 'block', label: 'Block print', glyph: '❁' },
  { id: 'poster', label: 'Poster', glyph: 'अ' },
  { id: 'plate', label: 'Truck art', glyph: '◉' },
  { id: 'greeting', label: 'Greeting', glyph: '✉' },
  { id: 'diya', label: 'Diya', glyph: '🪔' },
  { id: 'pulli', label: 'Pulli puzzle', glyph: '⁘' },
] as const;
export type StampId = (typeof STAMPS)[number]['id'];

export type Made = { url: string; type: RecipeType; title: string; at: number };
type State = { stamps: Partial<Record<StampId, number>>; made: Made[]; shares: number; names: number };

const KEY = 'rangotsav:progress';
const EVT = 'rangotsav:progress';
const empty = (): State => ({ stamps: {}, made: [], shares: 0, names: 0 });

export function load(): State {
  try { return { ...empty(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return empty(); }
}
function save(s: State) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  try { window.dispatchEvent(new Event(EVT)); } catch {}
}
export function onProgress(fn: () => void) {
  window.addEventListener(EVT, fn);
  return () => window.removeEventListener(EVT, fn);
}

export function stamp(id: StampId) {
  const s = load();
  if (s.stamps[id]) return;
  s.stamps[id] = Date.now();
  save(s);
}
export function wovenName() {
  const s = load();
  s.names++;
  s.stamps.naam ??= Date.now();
  save(s);
}
export function shared(m: Omit<Made, 'at'> | null) {
  const s = load();
  s.shares++;
  if (m && !s.made.some((x) => x.url === m.url)) s.made = [{ ...m, at: Date.now() }, ...s.made].slice(0, 30);
  save(s);
}

export function diyasLit(): number {
  try { return parseInt(localStorage.getItem('rangotsav:diyas-mine') || '0', 10) || 0; } catch { return 0; }
}

export function badges(s = load(), pulliStreak = 0) {
  const n = Object.keys(s.stamps).length;
  return [
    { id: 'kalakaar', label: 'Kalakaar', desc: 'Tried every art form', got: n >= STAMPS.length },
    { id: 'dost', label: 'Sab ka Dost', desc: 'Shared 5 creations', got: s.shares >= 5 },
    { id: 'diya', label: 'Diya Lighter', desc: 'Lit 10 diyas', got: diyasLit() >= 10 },
    { id: 'naam', label: 'Naam Weaver', desc: 'Wove 3 names', got: s.names >= 3 },
    { id: 'streak', label: 'Pulli Pro', desc: '7-day Pulli streak', got: pulliStreak >= 7 },
  ];
}
