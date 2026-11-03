// A one-line status toast ("Floor swept. Undo brings it back."). Anyone can flash(); the
// <Toaster/> in the root layout shows the latest message for a few seconds.
const EVT = 'rangotsav:toast';

export function flash(msg: string) {
  try { window.dispatchEvent(new CustomEvent<string>(EVT, { detail: msg })); } catch {}
}
export function onToast(fn: (msg: string) => void) {
  const h = (e: Event) => fn((e as CustomEvent<string>).detail);
  window.addEventListener(EVT, h);
  return () => window.removeEventListener(EVT, h);
}

// A big moment: poster lettering slams onto the screen (components/site/Cheer.tsx) with petals and
// a bell. Milestones only (a carpet finished, one unbroken line), never every tap. Without text it
// picks one of the cheers below. at: where the petals bloom from (defaults to mid-screen).
export type CheerMsg = { text: string; label: string; at?: { x: number; y: number } };
const CHEER = 'rangotsav:cheer';
const CHEERS: [string, string][] = [['वाह!', 'Waah!'], ['Shabash!', 'Shabash!'], ['Kya बात!', 'Kya baat!'], ['Ek नंबर!', 'Ek number!'], ['Jhakaas!', 'Jhakaas!'], ['कमाल!', 'Kamaal!']];
export function cheer(text?: string, label?: string, at?: { x: number; y: number }) {
  const [t, l] = text ? [text, label ?? text] : CHEERS[Math.floor(Math.random() * CHEERS.length)];
  try { window.dispatchEvent(new CustomEvent<CheerMsg>(CHEER, { detail: { text: t, label: l, at } })); } catch {}
}
export function onCheer(fn: (m: CheerMsg) => void) {
  const h = (e: Event) => fn((e as CustomEvent<CheerMsg>).detail);
  window.addEventListener(CHEER, h);
  return () => window.removeEventListener(CHEER, h);
}
