// The ghost hand: the first time a drawing toy opens, a fingertip draws one sample stroke so the
// trick (mirroring) is obvious before you touch anything. Shown once per toy per browser.
export function firstVisit(toy: string): boolean {
  const k = 'rangotsav:ghost:' + toy;
  try { if (localStorage.getItem(k)) return false; localStorage.setItem(k, '1'); return true; } catch { return false; }
}

type P = { x: number; y: number };
// Moves `finger` (absolutely positioned over a canvas of side px) along pts (relative to the
// canvas centre) over dur ms, calling onPoint for each point reached. Returns a cancel function.
export function ghostStroke(pts: P[], finger: HTMLElement, side: number, dur: number, onPoint: (p: P, i: number) => void, done: () => void) {
  let raf = 0, i = 0, dead = false;
  const t0 = performance.now() + 350;
  const place = (p: P) => { finger.style.transform = `translate(${(p.x + side / 2).toFixed(1)}px, ${(p.y + side / 2).toFixed(1)}px)`; };
  finger.style.opacity = '1';
  place(pts[0]);
  const step = (now: number) => {
    if (dead) return;
    const k = Math.max(0, Math.min(1, (now - t0) / dur)), upto = Math.floor(k * (pts.length - 1));
    while (i <= upto) { onPoint(pts[i], i); place(pts[i]); i++; }
    if (k < 1) raf = requestAnimationFrame(step);
    else { setTimeout(() => { finger.style.opacity = '0'; }, 250); done(); }
  };
  raf = requestAnimationFrame(step);
  return () => { dead = true; cancelAnimationFrame(raf); finger.style.opacity = '0'; };
}
