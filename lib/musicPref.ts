// The story music's on/off switch (on unless turned off, kept in this browser), and a signal for
// when the picture book opens or closes, so the story page's music steps aside for the book's.
// Kept apart from lib/music.ts, which is only loaded once music is about to play.
const KEY = 'rangotsav:music', EVT = 'rangotsav:music', BOOK = 'rangotsav:book';

export function musicOn(): boolean {
  try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; }
}
export function setMusicOn(on: boolean) {
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch {}
  try { window.dispatchEvent(new Event(EVT)); } catch {}
}
export function onMusicPref(fn: () => void) {
  window.addEventListener(EVT, fn);
  return () => window.removeEventListener(EVT, fn);
}

let book = false;
export const bookOpen = () => book;
export function setBookOpen(open: boolean) {
  book = open;
  try { window.dispatchEvent(new Event(BOOK)); } catch {}
}
export function onBook(fn: () => void) {
  window.addEventListener(BOOK, fn);
  return () => window.removeEventListener(BOOK, fn);
}
