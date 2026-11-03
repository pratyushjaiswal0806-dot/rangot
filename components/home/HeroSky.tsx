'use client';
// Diwali night over the hero: while the night theme is on (all day during Diwali, and evenings),
// rockets rise from behind the diya ledge every few seconds and burst in the sky framed by the
// temple arches, and a tap on the sky launches one there. The canvas is painted right after the
// sky bands, so the arches stand in front of the fireworks. Silent until the first tap (browsers
// keep audio locked), and off with reduced motion, off screen and in a hidden tab.
import { useEffect, useRef, type RefObject } from 'react';
import { drawSparks, explode, flyRocket, glowSprite, rocket, stepSparks, type Rocket, type Spark } from '../../lib/art/sparks';
import { burst, whoosh } from '../../lib/sfx';
import { calm } from '../../lib/motion';
import { track } from '../../lib/track';

export const isNight = () => document.documentElement.dataset.theme === 'night';

export default function HeroSky({ hero }: { hero: RefObject<HTMLElement | null> }) {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const h = hero.current, el = cv.current;
    if (!h || !el || calm()) return;
    const x = el.getContext('2d')!, sp: Spark[] = [], rk: Rocket[] = [], glow = glowSprite();
    let W = 0, H = 0, raf = 0, on = false, last = 0, next = 0, told = false;
    const size = () => {
      const r = h.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      el.width = Math.round(W * d); el.height = Math.round(H * d);
      el.style.width = W + 'px'; el.style.height = H + 'px';
      x.setTransform(d, 0, 0, d, 0, 0);
    };
    const launch = (tx: number, ty: number) => {
      if (rk.length >= 4) return;
      rk.push(rocket(tx + (Math.random() - 0.5) * 70, H - 40, tx, ty));
      whoosh(0.7, 300, 1800, 0.06);
      wake();
    };
    const loop = (now: number) => {
      const dt = last ? Math.min(50, now - last) : 16.67;
      last = now;
      if (isNight() && now > next) { next = now + 2200 + Math.random() * 2800; launch(W * (0.18 + Math.random() * 0.64), H * (0.1 + Math.random() * 0.28)); }
      x.clearRect(0, 0, W, H);
      for (let k = rk.length - 1; k >= 0; k--) if (flyRocket(rk[k], now, sp)) { burst(0.5); explode(sp, rk[k].tx, rk[k].ty, rk[k].kind, 80); rk.splice(k, 1); }
      stepSparks(sp, dt);
      drawSparks(x, sp, glow);
      raf = on && (isNight() || rk.length || sp.length) ? requestAnimationFrame(loop) : 0;
      if (!raf) { last = 0; x.clearRect(0, 0, W, H); }
    };
    const wake = () => { if (!raf && on) raf = requestAnimationFrame(loop); };
    const tap = (e: PointerEvent) => {
      if (!isNight() || (e.target as HTMLElement).closest('a,button,input,form,label')) return;
      const r = h.getBoundingClientRect();
      launch(e.clientX - r.left, Math.min(e.clientY - r.top, H * 0.62));
      if (!told) { told = true; track('firework', { from: 'hero' }); }
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(h);
    const io = new IntersectionObserver(([en]) => { on = en.isIntersecting && !document.hidden; wake(); }, { threshold: 0 });
    io.observe(h);
    const vis = () => { on = !document.hidden && h.getBoundingClientRect().bottom > 0; wake(); };
    document.addEventListener('visibilitychange', vis);
    // the footer toggle can turn the night on while you're here
    const mo = new MutationObserver(wake);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    h.addEventListener('pointerdown', tap);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); mo.disconnect(); document.removeEventListener('visibilitychange', vis); h.removeEventListener('pointerdown', tap); };
  }, [hero]);
  return <canvas ref={cv} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} />;
}
