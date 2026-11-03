// "My Courtyard": what you've tried, made and shared, kept in this browser only.
// Every read/write is guarded; a private window just starts fresh.
// Stamps and unlocks also announce themselves (see StampToast) the first time they happen.
import type { RecipeType } from './recipe';
import { pulliStats } from './pulli';

export const STAMPS = [
  { id: 'naam', label: 'Naam Kolam', glyph: 'ನ' },
  { id: 'rangoli', label: 'Rangoli', glyph: '✺' },
  { id: 'phuljhadi', label: 'Phuljhadi', glyph: '✦' },
  { id: 'kolam', label: 'Kolam', glyph: '∞' },
  { id: 'pookalam', label: 'Pookalam', glyph: '✿' },
  { id: 'bandhani', label: 'Bandhani', glyph: '⁙' },
  { id: 'block', label: 'Block print', glyph: '❁' },
  { id: 'poster', label: 'Poster', glyph: 'अ' },
  { id: 'plate', label: 'Truck art', glyph: '◉' },
  { id: 'diya', label: 'Diya', glyph: '🪔' },
  { id: 'pulli', label: 'Pulli puzzle', glyph: '⁘' },
  { id: 'selfie', label: 'Selfie', glyph: '◈' },
  { id: 'kathputli', label: 'Kathputli', glyph: '♔' },
  { id: 'warli', label: 'Warli', glyph: '△' },
  { id: 'patang', label: 'Patang', glyph: '◇' },
] as const;
export type StampId = (typeof STAMPS)[number]['id'];
// Only stamps that still exist: older versions saved some that have since been retired (Mehendi went with
// its toy, so it no longer counts towards Kalakaar).
export const stampCount = (s: { stamps: Partial<Record<string, number>> }) => STAMPS.filter((x) => s.stamps[x.id]).length;

export type Made = { url: string; type: RecipeType; title: string; at: number };
// unlocked: every unlock ever announced; unseen: announced but not shown yet (a page can close
// before its toast appears, so the next page shows it)
// challenges: Chunauti stars earned (ids from lib/challenges.ts)
type State = { stamps: Partial<Record<StampId, number>>; made: Made[]; shares: number; names: number; unlocked: string[]; unseen: string[]; challenges: string[] };

const KEY = 'rangotsav:progress';
const EVT = 'rangotsav:progress';
export const STAMP_EVT = 'rangotsav:stamp';
export const UNLOCK_EVT = 'rangotsav:unlock';
export const STAR_EVT = 'rangotsav:star';
const empty = (): State => ({ stamps: {}, made: [], shares: 0, names: 0, unlocked: [], unseen: [], challenges: [] });

export function load(): State {
  try { return { ...empty(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return empty(); }
}
function save(s: State) {
  announceUnlocks(s);
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  try { window.dispatchEvent(new Event(EVT)); } catch {}
}
export function onProgress(fn: () => void) {
  window.addEventListener(EVT, fn);
  return () => window.removeEventListener(EVT, fn);
}
// Deferred, so a stamp earned while a page is still mounting reaches listeners mounted after it.
const emit = (name: string, detail: unknown) => { setTimeout(() => { try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch {} }, 60); };

// Returns true the first time this art form is tried.
export function stamp(id: StampId): boolean {
  const s = load();
  if (s.stamps[id]) { checkUnlocks(); return false; }
  s.stamps[id] = Date.now();
  const def = STAMPS.find((x) => x.id === id)!;
  emit(STAMP_EVT, { id, label: def.label, glyph: def.glyph, n: stampCount(s), total: STAMPS.length });
  save(s);
  return true;
}
export function wovenName() {
  const s = load();
  s.names++;
  const fresh = !s.stamps.naam;
  s.stamps.naam ??= Date.now();
  if (fresh) emit(STAMP_EVT, { id: 'naam', label: 'Naam Kolam', glyph: 'ನ', n: stampCount(s), total: STAMPS.length });
  save(s);
}
export function shared(m: Omit<Made, 'at'> | null) {
  const s = load();
  s.shares++;
  if (m && !s.made.some((x) => x.url === m.url)) s.made = [{ ...m, at: Date.now() }, ...s.made].slice(0, 30);
  save(s);
}

// A Chunauti star: kept once, announced (StampToast) with how many you have out of all of them.
export function earn(id: string, label: string, total: number): boolean {
  const s = load();
  if (s.challenges.includes(id)) return false;
  s.challenges = [...s.challenges, id];
  emit(STAR_EVT, { id, label, n: s.challenges.length, total });
  save(s);
  return true;
}
export const stars = (s = load()) => s.challenges.length;

export function diyasLit(): number {
  try { return parseInt(localStorage.getItem('rangotsav:diyas-mine') || '0', 10) || 0; } catch { return 0; }
}

// ---------- unlocks: new pigments, brushes and inks earned by playing ----------
type Counts = { stamps: number; shares: number; names: number; pulli: number; stars: number };
export const UNLOCKS = [
  { id: 'gold', label: 'Gold powder', toy: 'Rangoli', how: 'Try 3 toys', got: (c: Counts) => c.stamps >= 3 },
  { id: 'peacock', label: 'Peacock-feather brush', toy: 'Rangoli', how: 'Try 5 toys', got: (c: Counts) => c.stamps >= 5 },
  { id: 'goldink', label: 'Gold ink', toy: 'Block Print', how: 'Share 3 creations', got: (c: Counts) => c.shares >= 3 },
  { id: 'moon', label: 'Moonlight line', toy: 'Kolam', how: 'Play Pulli on 3 days', got: (c: Counts) => c.pulli >= 3 },
  { id: 'rainbow', label: 'Rainbow sparks', toy: 'Phuljhadi', how: 'Earn 6 Chunauti stars', got: (c: Counts) => c.stars >= 6 },
  { id: 'kalakaar', label: 'Kalakaar certificate', toy: 'My Courtyard', how: `Collect all ${STAMPS.length} stamps`, got: (c: Counts) => c.stamps >= STAMPS.length },
] as const;
export type UnlockId = (typeof UNLOCKS)[number]['id'];

const counts = (s: State): Counts => ({ stamps: stampCount(s), shares: s.shares, names: s.names, pulli: pulliStats().played, stars: s.challenges.length });
export function isUnlocked(id: UnlockId, s = load()): boolean {
  return UNLOCKS.find((u) => u.id === id)!.got(counts(s));
}
// The next thing to earn, for "2 more toys to unlock Gold powder".
export function nextUnlock(s = load()) {
  const c = counts(s);
  return UNLOCKS.find((u) => !u.got(c)) ?? null;
}
function announceUnlocks(s: State) {
  const c = counts(s);
  for (const u of UNLOCKS) {
    if (!u.got(c) || s.unlocked.includes(u.id)) continue;
    s.unlocked = [...s.unlocked, u.id];
    s.unseen = [...s.unseen, u.id];
    emit(UNLOCK_EVT, { id: u.id, label: u.label, toy: u.toy });
  }
}
export function unseenUnlocks() {
  return load().unseen.map((id) => UNLOCKS.find((u) => u.id === id)).filter((u) => !!u).map((u) => ({ id: u.id, label: u.label, toy: u.toy }));
}
export function sawUnlock(id: string) {
  const s = load();
  if (!s.unseen.includes(id)) return;
  s.unseen = s.unseen.filter((x) => x !== id);
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}
// For progress that lives elsewhere (Pulli days): announce anything it just unlocked.
export function checkUnlocks() {
  const s = load(), before = s.unlocked.length;
  announceUnlocks(s);
  if (s.unlocked.length !== before) save(s);
}

export function badges(s = load(), pulliStreak = 0) {
  const n = stampCount(s);
  return [
    { id: 'kalakaar', label: 'Kalakaar', desc: 'Tried every art form', got: n >= STAMPS.length },
    { id: 'dost', label: 'Sab ka Dost', desc: 'Shared 5 creations', got: s.shares >= 5 },
    { id: 'diya', label: 'Diya Lighter', desc: 'Lit 10 diyas', got: diyasLit() >= 10 },
    { id: 'naam', label: 'Naam Weaver', desc: 'Wove 3 names', got: s.names >= 3 },
    { id: 'streak', label: 'Pulli Pro', desc: '7-day Pulli streak', got: pulliStreak >= 7 },
  ];
}
