'use client';
// The shared night sky over the diya section: one warm light for every diya anyone has lit
// (placed by a fixed seed, so everyone sees the same sky), a skyline along the bottom, and
// fireworks wherever you tap. Your own diyas float up from the big diya and are ringed.
import { useEffect, useRef, type RefObject } from 'react';
import { mkRng } from '../../lib/rng';
import { skyline } from '../../lib/art/skyline';
import { drawSparks, explode, flyRocket, glowSprite, rocket, stepSparks, type Rocket, type Spark } from '../../lib/art/sparks';
import { burst, whoosh } from '../../lib/sfx';
import { track } from '../../lib/track';

const TAU = Math.PI * 2;
const MAX = 1500; // lights drawn individually; beyond that each one stands for several
const SKYLINE = 130;
const MINE = 'rangotsav:my-lights';

export const myLights = (): number[] => { try { return JSON.parse(localStorage.getItem(MINE) || '[]'); } catch { return []; } };
export const addMyLight = (i: number) => { try { localStorage.setItem(MINE, JSON.stringify([...myLights(), i].slice(-60))); } catch {} };

// Positions for the first MAX lights: denser towards the top, like a starry sky.
const rnd = mkRng(2026);
const SPOTS = Array.from({ length: MAX }, () => ({ x: rnd(), y: rnd() ** 1.35, ph: rnd() * TAU, sp: 0.6 + rnd() * 1.6, warm: rnd() }));

export default function DiyaSky({ count, lit, from, host }: { count: number; lit: number; from: RefObject<HTMLElement | null>; host: RefObject<HTMLElement | null> }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({ count, prev: count, born: new Map<number, number>(), rising: [] as { t0: number; to: number }[], mine: new Set<number>() });

  // new diyas from other visitors twinkle in
  useEffect(() => {
    const s = st.current;
    if (count > s.count && s.count > 0) for (let i = s.count; i < Math.min(count, MAX); i++) s.born.set(i, performance.now());
    s.count = count;
  }, [count]);

  // your diya lifts off the big diya and floats to its spot
  useEffect(() => {
    if (!lit) return;
    const s = st.current, to = Math.max(0, s.count - 1);
    s.rising.push({ t0: performance.now(), to });
    s.mine.add(to % MAX);
  }, [lit]);

  useEffect(() => {
    const el = cv.current, h = host.current;
    if (!el || !h) return;
    const x = el.getContext('2d')!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const s = st.current;
    myLights().forEach((i) => s.mine.add(i % MAX));
    let W = 0, H = 0, skyH = 0, line: HTMLCanvasElement | null = null, raf = 0, on = false, told = false, last = 0;
    const sparks: Spark[] = [], rockets: Rocket[] = [];
    const glow = glowSprite();

    const size = () => {
      const r = h.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height; skyH = H - SKYLINE - 20;
      el.width = Math.round(W * d); el.height = Math.round(H * d);
      el.style.width = W + 'px'; el.style.height = H + 'px';
      x.setTransform(d, 0, 0, d, 0, 0);
      line = skyline(W, SKYLINE);
      if (!on) draw(performance.now());
    };
    const spot = (i: number) => { const p = SPOTS[i % MAX]; return { x: 12 + p.x * (W - 24), y: 10 + p.y * (skyH - 10) }; };

    const draw = (now: number) => {
      const dt = last ? now - last : 16.67;
      last = now;
      x.clearRect(0, 0, W, H);
      const n = Math.min(s.count, MAX), per = Math.max(1, s.count / MAX), t = now / 1000;
      for (let i = 0; i < n; i++) {
        if (s.rising.some((r) => r.to % MAX === i)) continue;
        const p = SPOTS[i], q = spot(i);
        const born = s.born.get(i), k = born ? Math.min(1, (now - born) / 900) : 1;
        if (born && k >= 1) s.born.delete(i);
        const tw = reduced ? 0.85 : 0.6 + 0.4 * Math.sin(t * p.sp + p.ph);
        const sz = (6 + p.warm * 6) * Math.min(2.2, Math.sqrt(per)) * (born ? 0.4 + 1.6 * k * (2 - k) : 1);
        x.globalAlpha = tw * (born ? k : 1);
        x.drawImage(glow, q.x - sz / 2, q.y - sz / 2, sz, sz);
        if (s.mine.has(i)) { x.globalAlpha = 0.9; x.strokeStyle = '#FBF3E4'; x.lineWidth = 1.5; x.beginPath(); x.arc(q.x, q.y, sz * 0.75, 0, TAU); x.stroke(); }
      }
      x.globalAlpha = 1;
      // rising diyas
      const f = from.current?.getBoundingClientRect(), hr = h.getBoundingClientRect();
      for (let k = s.rising.length - 1; k >= 0; k--) {
        const r = s.rising[k], q = spot(r.to), p = Math.min(1, (now - r.t0) / 1700);
        const sx = f ? f.left + f.width / 2 - hr.left : W / 2, sy = f ? f.top + f.height * 0.35 - hr.top : H * 0.6;
        const e = 1 - (1 - p) ** 3, cx = sx + (q.x - sx) * e + Math.sin(p * Math.PI) * 40, cy = sy + (q.y - sy) * e;
        for (let j = 0; j < 6; j++) { const tp = Math.max(0, e - j * 0.03); x.globalAlpha = 0.25 * (1 - j / 6); x.drawImage(glow, sx + (q.x - sx) * tp - 6, sy + (q.y - sy) * tp - 6, 12, 12); }
        x.globalAlpha = 1; x.drawImage(glow, cx - 14, cy - 14, 28, 28);
        if (p >= 1) { s.rising.splice(k, 1); s.born.set(r.to % MAX, now); }
      }
      // fireworks
      for (let k = rockets.length - 1; k >= 0; k--) if (flyRocket(rockets[k], now, sparks)) { pop(rockets[k]); rockets.splice(k, 1); }
      stepSparks(sparks, dt);
      drawSparks(x, sparks, glow);
      if (line) x.drawImage(line, 0, H - SKYLINE, W, SKYLINE);
    };
    const pop = (r: Rocket) => { burst(0.8); explode(sparks, r.tx, r.ty, r.kind); };
    const launch = (tx: number, ty: number) => {
      if (rockets.length >= 5) return;
      const y0 = H - SKYLINE + 30, x0 = tx + (Math.random() - 0.5) * 80;
      rockets.push(rocket(x0, y0, tx, Math.min(ty, skyH - 20)));
      whoosh(0.7, 300, 1800, 0.08);
      if (!told) { told = true; track('firework'); }
      if (reduced) pop(rockets.pop()!);
      start();
    };
    const loop = (now: number) => { draw(now); raf = on ? requestAnimationFrame(loop) : 0; if (!raf) last = 0; };
    const start = () => { if (!raf && (on || reduced)) raf = requestAnimationFrame(loop); else if (reduced) draw(performance.now()); };
    const tap = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('a,button,input,label,form,textarea')) return;
      const r = h.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      if (py > H - SKYLINE + 10) return;
      launch(px, py);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(h);
    h.addEventListener('pointerdown', tap);
    const io = new IntersectionObserver(([en]) => { on = en.isIntersecting && !reduced; if (on) start(); }, { threshold: 0 });
    io.observe(h);
    const vis = () => { if (document.hidden) on = false; else if (h.getBoundingClientRect().bottom > 0) { on = !reduced; start(); } };
    document.addEventListener('visibilitychange', vis);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); h.removeEventListener('pointerdown', tap); document.removeEventListener('visibilitychange', vis); };
  }, [from, host]);

  return <canvas ref={cv} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, zIndex: 0, pointerEvents: 'none' }} />;
}
