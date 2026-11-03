'use client';
// Plays a recipe onto a canvas: the rangoli redraws stroke by stroke, the kolam weaves itself.
// `lazy` waits until the canvas is on screen (and pauses when it leaves); `loop` replays after
// that many milliseconds. The toy shelf uses both; share pages play once.
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createPlayer, type Player } from '../lib/art/player';
import type { Recipe } from '../lib/recipe';

export type ReplayHandle = { replay: () => void; canvas: () => HTMLCanvasElement | null };

// sample text pulls in the Devanagari subsets too (the truck plates paint names in Hindi)
const FONTS = ["400 100px 'Yatra One'", '900 100px Sarpanch', '800 100px Sarpanch', '700 40px Mukta', '800 30px Mukta', "700 100px 'Palanquin Dark'"];
const fontsReady = () => (document.fonts ? Promise.all(FONTS.map((f) => document.fonts.load(f, 'Aअ').catch(() => null))) : Promise.resolve());

type Props = { recipe: Recipe; px?: number; label: string; className?: string; onDone?: () => void; lazy?: boolean; loop?: number };

const Replay = forwardRef<ReplayHandle, Props>(function Replay({ recipe, px = 1080, label, className, onDone, lazy, loop }, ref) {
  const cv = useRef<HTMLCanvasElement>(null);
  const player = useRef<Player | null>(null);
  const raf = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const seen = useRef(!lazy);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const loopRef = useRef(loop);
  loopRef.current = loop;

  const stop = () => { cancelAnimationFrame(raf.current); clearTimeout(timer.current); };
  const play = () => {
    const p = player.current;
    if (!p) return;
    stop();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { p.seek(1); doneRef.current?.(); return; }
    const t0 = performance.now();
    const step = (now: number) => {
      const t = (now - t0) / p.duration;
      p.seek(t);
      if (t < 1) { raf.current = requestAnimationFrame(step); return; }
      doneRef.current?.();
      if (loopRef.current && seen.current) timer.current = setTimeout(play, loopRef.current);
    };
    raf.current = requestAnimationFrame(step);
  };

  useImperativeHandle(ref, () => ({ replay: play, canvas: () => cv.current }));

  useEffect(() => {
    let live = true;
    player.current = null;
    fontsReady().then(() => {
      if (!live || !cv.current) return;
      player.current = createPlayer(recipe, px, cv.current);
      player.current.seek(lazy ? 1 : 0);
      if (seen.current) play();
    });
    return () => { live = false; stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe, px]);

  useEffect(() => {
    const el = cv.current;
    if (!lazy || !el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([en]) => {
      seen.current = en.isIntersecting;
      if (en.isIntersecting) play(); else stop();
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazy]);

  return <canvas ref={cv} className={className} role="img" aria-label={label} />;
});
export default Replay;
