// Cheenti's lines: say() makes her peek in with a speech bubble (components/site/CheentiHost.tsx
// shows it). once: a key she only says it for once per browser (first-visit tips). The footer
// toggle turns her tips off; cheers still show her.
import type { CheentiPose } from '../components/site/Cheenti';
import type { ToyId } from './toys';

const EVT = 'rangotsav:cheenti', PREF = 'rangotsav:cheenti', SEEN = 'rangotsav:cheenti:';
export type Say = { text: string; pose?: CheentiPose; ms?: number };

export function cheentiOn(): boolean {
  try { return localStorage.getItem(PREF) !== 'off'; } catch { return true; }
}
export function setCheentiOn(on: boolean) {
  try { localStorage.setItem(PREF, on ? 'on' : 'off'); } catch {}
}
export function say(text: string, o: { pose?: CheentiPose; once?: string; ms?: number } = {}): boolean {
  if (!cheentiOn()) return false;
  if (o.once) {
    try { if (localStorage.getItem(SEEN + o.once)) return false; localStorage.setItem(SEEN + o.once, '1'); } catch { return false; }
  }
  try { window.dispatchEvent(new CustomEvent<Say>(EVT, { detail: { text, pose: o.pose, ms: o.ms } })); } catch {}
  return true;
}
export function onSay(fn: (s: Say) => void) {
  const h = (e: Event) => fn((e as CustomEvent<Say>).detail);
  window.addEventListener(EVT, h);
  return () => window.removeEventListener(EVT, h);
}

// Her one-line tip the first time each toy opens.
const TIPS: Record<ToyId, string> = {
  rangoli: 'Draw anywhere and it’s mirrored all the way round. Try Spin floor and hold still for a ring!',
  phuljhadi: 'Psst! Hold your finger down to light the phuljhadi. Move fast and it throws more sparks.',
  kolam: 'Tap to add dots. Then switch to Twist and tap between two dots to join the loops into one line.',
  pookalam: 'Pick a flower, then tap a ring. One tap lays the whole ring of petals!',
  bandhani: 'Tap to tie knots, dip the cloth in dye, then untie it to find the dots.',
  block: 'Tap to press the block. Press fast for a combo, or drag to print a border.',
  poster: 'Type your own word and bend it with the sliders. Then press Nachao and watch it dance!',
  truck: 'Your name, painted lorry-style. Honk the horn, then send it off: Chalo!',
  selfie: 'Your photo never leaves your phone. Pick a frame, add some nazar-battu eyes, and smile!',
  patang: 'Hold to pull and the kite flies towards your finger. Let go and it drifts. Cross a string and pull hard!',
  warli: 'Tap anywhere and a dancer walks in to join the tarpa circle. Then press Palto!',
  kathputli: 'Drag anywhere to work the strings. Tilt fast and the hands fly up! Double-tap to jump.',
  naam: 'Type any name and watch it weave itself into a kolam.',
  pulli: 'Find where today’s dots go. After each try, green means right and yellow means close.',
};
export const tipFor = (toy: ToyId) => TIPS[toy];
