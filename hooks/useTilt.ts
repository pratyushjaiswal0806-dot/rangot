'use client';
// Parallax for the hero's layered arches: the mouse on desktop, the gyroscope on phones (iOS
// asks for permission first), and a slow drift on touch screens without one.
import { useEffect, useRef, useState, type RefObject } from 'react';
import { flash } from '../lib/toast';

type DOE = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

export function useTilt(hero: RefObject<HTMLElement | null>, enabled = true) {
  const [ask, setAsk] = useState(false);
  const api = useRef<{ orient: (e: DeviceOrientationEvent) => void; drift: () => void } | null>(null);

  useEffect(() => {
    const h = hero.current;
    if (!h) return;
    const layers = [...h.querySelectorAll<HTMLElement>('[data-depth]')];
    let tx = 0, ty = 0, raf = 0, dRaf = 0, gotOrient = false, visible = true, dead = false;
    const tiltTo = (x: number, y: number) => {
      tx = x; ty = y;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        for (const l of layers) { const d = +(l.dataset.depth ?? 0); l.style.transform = `translate3d(${(tx * d * 12).toFixed(1)}px,${(ty * d * 7).toFixed(1)}px,0)`; }
      });
    };
    const orient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      gotOrient = true;
      tiltTo(Math.max(-1, Math.min(1, e.gamma / 22)), Math.max(-1, Math.min(1, ((e.beta ?? 45) - 45) / 22)));
    };
    const drift = () => {
      const loop = (now: number) => {
        if (gotOrient || dead) return;
        if (visible) tiltTo(Math.sin(now / 2600) * 0.6, Math.cos(now / 3300) * 0.4);
        dRaf = requestAnimationFrame(loop);
      };
      dRaf = requestAnimationFrame(loop);
    };
    api.current = { orient, drift };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = h.getBoundingClientRect();
      tiltTo(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
    };
    h.addEventListener('pointermove', onMove);
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([en]) => { visible = en.isIntersecting; }) : null;
    io?.observe(h);

    let driftT: ReturnType<typeof setTimeout> | undefined;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (enabled && !reduced) {
      const D = window.DeviceOrientationEvent as DOE | undefined, coarse = matchMedia('(pointer: coarse)').matches;
      if (D && typeof D.requestPermission === 'function') { if (coarse) setAsk(true); }
      else if (D) window.addEventListener('deviceorientation', orient);
      if (coarse) driftT = setTimeout(() => { if (!gotOrient) drift(); }, 1800);
    }
    return () => {
      dead = true;
      h.removeEventListener('pointermove', onMove);
      window.removeEventListener('deviceorientation', orient);
      io?.disconnect();
      clearTimeout(driftT);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(dRaf);
    };
  }, [hero, enabled]);

  const askTilt = () => {
    const D = window.DeviceOrientationEvent as DOE;
    D.requestPermission?.().then((p) => {
      if (p === 'granted' && api.current) { window.addEventListener('deviceorientation', api.current.orient); flash('Tilt away!'); }
      else { flash('No worries, the arches will sway on their own.'); api.current?.drift(); }
      setAsk(false);
    }).catch(() => setAsk(false));
  };

  return { ask, askTilt };
}
