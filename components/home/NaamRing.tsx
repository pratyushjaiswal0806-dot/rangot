'use client';
// The hero's centre kolam, re-woven from a visitor's name: the same Naam Kolam as /naam, drawn
// with a transparent floor so the arches show through, weaving in over two seconds.
import { useEffect, useRef } from 'react';
import { drawKolam, kolamSegs } from '../../lib/art/kolam';
import { naamKolam } from '../../lib/art/naam';

export default function NaamRing({ name, className, onWoven }: { name: string; className?: string; onWoven?: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const done = useRef(onWoven);
  done.current = onWoven;

  useEffect(() => {
    const el = cv.current;
    if (!el || !name) return;
    const n = naamKolam(name);
    let raf = 0, S = 0, segs: ReturnType<typeof kolamSegs> = [], x: CanvasRenderingContext2D | null = null;
    const paint = (prog: number) => {
      if (!x) return;
      x.clearRect(0, 0, S, S);
      drawKolam(x, S, n.g, n.dots, segs, '#FBF3E4', true, prog, 'rgba(0,0,0,0)');
    };
    const setup = () => {
      const r = el.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
      S = Math.round(r.width);
      el.width = el.height = Math.round(S * d);
      x = el.getContext('2d')!;
      x.setTransform(d, 0, 0, d, 0, 0);
      segs = kolamSegs(n.dots, S, n.g);
    };
    setup();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { paint(1); done.current?.(); }
    else {
      const t0 = performance.now(), dur = Math.min(2600, 1200 + segs.length * 12);
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        paint(1 - (1 - p) ** 2);
        if (p < 1) raf = requestAnimationFrame(step); else done.current?.();
      };
      raf = requestAnimationFrame(step);
    }
    // (the observer also fires once on attach; skip that one so the weave can play)
    let first = true;
    const ro = new ResizeObserver(() => { if (first) { first = false; return; } setup(); paint(1); });
    ro.observe(el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [name]);

  return <canvas ref={cv} aria-hidden="true" className={className} />;
}
