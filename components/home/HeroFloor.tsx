'use client';
// The hero floor you can play with: move the mouse (or tap, on a phone) and petals bloom in
// 8-fold symmetry around the kolam, then fade like powder in the wind. Taps play a note.
// Pointer listeners sit on the hero itself and never call preventDefault, so scrolling on a
// phone is untouched.
import { useEffect, useRef, type RefObject } from 'react';
import { pluck } from '../../lib/sfx';
import { track } from '../../lib/track';

const TAU = Math.PI * 2;
const COLS = ['#FFC21A', '#E8761E', '#FBF3E4', '#C93A82', '#FFC21A', '#4F8A3C'];
const N = 8;

export default function HeroFloor({ hero, center, onBloom }: { hero: RefObject<HTMLElement | null>; center: RefObject<HTMLElement | null>; onBloom?: (n: number) => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef(onBloom);
  bloomRef.current = onBloom;

  useEffect(() => {
    const h = hero.current, el = cv.current;
    if (!h || !el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x = el.getContext('2d')!;
    let W = 0, H = 0, d = 1, raf = 0, lastDraw = 0, last = { x: -999, y: -999, t: 0 }, count = 0, ci = 0, gesture = false, lastNote = 0, told = false;
    const size = () => {
      const r = h.getBoundingClientRect();
      d = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      el.width = Math.round(W * d); el.height = Math.round(H * d);
      el.style.width = W + 'px'; el.style.height = H + 'px';
      x.setTransform(d, 0, 0, d, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(h);

    const mid = () => {
      const hr = h.getBoundingClientRect(), c = center.current?.getBoundingClientRect();
      return c ? { x: c.left + c.width / 2 - hr.left, y: c.top + c.height / 2 - hr.top } : { x: W / 2, y: H / 2 };
    };
    const petal = (len: number, w: number) => {
      x.beginPath(); x.moveTo(-len / 2, 0);
      x.quadraticCurveTo(0, -w, len / 2, 0); x.quadraticCurveTo(0, w, -len / 2, 0);
      x.fill(); x.stroke();
    };
    // one stamp at (px,py), repeated in 2N mirrored copies around the kolam's centre
    const bloom = (px: number, py: number, big: boolean) => {
      const c = mid(), dx = px - c.x, dy = py - c.y, a0 = Math.atan2(dy, dx), r = Math.hypot(dx, dy);
      const col = COLS[ci++ % COLS.length], sz = big ? 13 : 6 + Math.random() * 4;
      x.save();
      x.globalCompositeOperation = 'source-over';
      x.fillStyle = col; x.strokeStyle = 'rgba(27,20,16,.85)'; x.lineWidth = 1.4;
      for (let k = 0; k < N; k++) for (const f of [1, -1]) {
        const a = k * (TAU / N) + f * a0;
        x.save();
        x.translate(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r);
        x.rotate(a + Math.PI / 2);
        if (big) { for (let p = 0; p < 5; p++) { x.save(); x.rotate((p * TAU) / 5); x.translate(0, -sz * 0.55); petal(sz * 0.9, sz * 0.4); x.restore(); } }
        else petal(sz * 2, sz * 0.7);
        x.restore();
      }
      x.restore();
      count++;
      bloomRef.current?.(count);
      if (!told) { told = true; track('hero_bloom'); }
      lastDraw = performance.now();
      if (!raf) raf = requestAnimationFrame(fade);
    };
    // powder settles: wash a little alpha out every frame, stop when idle
    const fade = (now: number) => {
      x.save();
      x.globalCompositeOperation = 'destination-out';
      x.fillStyle = 'rgba(0,0,0,.045)';
      x.fillRect(0, 0, W, H);
      x.restore();
      raf = now - lastDraw < 4000 ? requestAnimationFrame(fade) : (x.clearRect(0, 0, W, H), 0);
    };
    const pos = (e: PointerEvent) => { const r = h.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const blocked = (e: PointerEvent) => !!(e.target as HTMLElement).closest('a,button,input,form,label');
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || blocked(e)) return;
      const p = pos(e), now = performance.now();
      if (now - last.t < 60 && Math.hypot(p.x - last.x, p.y - last.y) < 34) return;
      last = { ...p, t: now };
      bloom(p.x, p.y, false);
      if (gesture && now - lastNote > 240) { lastNote = now; pluck(5 + Math.floor((Math.atan2(p.y - H / 2, p.x - W / 2) / TAU + 0.5) * 10), 0.35); }
    };
    const down = (e: PointerEvent) => {
      if (blocked(e)) return;
      gesture = true;
      // on Diwali nights a tap launches a firework instead (HeroSky)
      if (document.documentElement.dataset.theme === 'night') return;
      const p = pos(e);
      bloom(p.x, p.y, true);
      pluck(5 + Math.floor(Math.random() * 8), 0.8);
    };
    h.addEventListener('pointermove', move);
    h.addEventListener('pointerdown', down);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); h.removeEventListener('pointermove', move); h.removeEventListener('pointerdown', down); };
  }, [hero, center]);

  return <canvas ref={cv} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, zIndex: 2, pointerEvents: 'none' }} />;
}
