'use client';
// Plays a recipe onto a canvas: the rangoli redraws stroke by stroke, the kolam weaves itself.
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createPlayer, type Player } from '../lib/art/player';
import type { Recipe } from '../lib/recipe';

export type ReplayHandle = { replay: () => void; canvas: () => HTMLCanvasElement | null };

const FONTS = ["400 100px 'Yatra One'", '900 100px Sarpanch', '800 100px Sarpanch', '700 40px Mukta', '800 30px Mukta'];

const Replay = forwardRef<ReplayHandle, { recipe: Recipe; px?: number; label: string; className?: string; onDone?: () => void }>(
  function Replay({ recipe, px = 1080, label, className, onDone }, ref) {
    const cv = useRef<HTMLCanvasElement>(null);
    const player = useRef<Player | null>(null);
    const raf = useRef(0);
    const doneRef = useRef(onDone);
    doneRef.current = onDone;

    const play = () => {
      const p = player.current;
      if (!p) return;
      cancelAnimationFrame(raf.current);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { p.seek(1); doneRef.current?.(); return; }
      const t0 = performance.now();
      const step = (now: number) => {
        const t = (now - t0) / p.duration;
        p.seek(t);
        if (t < 1) raf.current = requestAnimationFrame(step); else doneRef.current?.();
      };
      raf.current = requestAnimationFrame(step);
    };

    useImperativeHandle(ref, () => ({ replay: play, canvas: () => cv.current }));

    useEffect(() => {
      let live = true;
      const ready = document.fonts ? Promise.all(FONTS.map((f) => document.fonts.load(f).catch(() => null))) : Promise.resolve();
      ready.then(() => {
        if (!live || !cv.current) return;
        player.current = createPlayer(recipe, px, cv.current);
        player.current.seek(0);
        play();
      });
      return () => { live = false; cancelAnimationFrame(raf.current); };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipe, px]);

    return <canvas ref={cv} className={className} role="img" aria-label={label} />;
  },
);
export default Replay;
