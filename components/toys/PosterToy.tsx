'use client';
// Type Distorter: bend a word like a bazaar banner. Every letter gets its own lift and twist;
// two nudged shadows fake a misregistered screen print. Layouts (banner, arch, steps, shake),
// backdrops and eight ink sets; Hindi and Kannada words work too. The preview is the 1080×1350
// poster itself, so what you see is what you share. "Nachao" (dance!) sets every letter hopping
// to its own beat and the marquee bulbs chasing, in the preview, the replay link and the reel.
import { useEffect, useRef, useState } from 'react';
import ToyShell, { ToolBtn } from './ToyShell';
import Morph from './Morph';
import CultureStrip from './CultureStrip';
import ShareSheet, { type ShareRequest } from '../ShareSheet';
import { BloomIcon } from './icons';
import { useElementSize } from '../../hooks/useElementSize';
import { PALS } from '../../lib/art/palette';
import { BACKDROPS, drawPoster, LAYOUTS } from '../../lib/art/poster';
import { readRemix } from '../../lib/remix';
import { stamp } from '../../lib/progress';
import { track } from '../../lib/track';
import { buzz, chime, pluck } from '../../lib/sfx';
import { calm } from '../../lib/motion';
import { done } from '../../lib/challenges';
import s from './ToyShell.module.css';

const WORDS = ['MELA', 'DHAMAKA', 'ROSHNI', 'MASALA', 'CHAI', 'DIWALI', 'JALEBI', 'उत्सव', 'मेला', 'ರಂಗು', 'ಹಬ್ಬ', 'BINDAAS', 'JHAKAAS', 'SHUBH'];

export default function PosterToy() {
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const { w: sw, h: sh } = useElementSize(stage);
  const [word, setWord] = useState('MELA');
  const [tilt, setTilt] = useState(8);
  const [off, setOff] = useState(6);
  const [pal, setPal] = useState(0);
  const [layout, setLayout] = useState(0);
  const [bg, setBg] = useState(0);
  const [dance, setDance] = useState(false);
  const [share, setShare] = useState<ShareRequest | null>(null);
  const layouts = useRef(new Set<number>());

  useEffect(() => {
    track('tool_open', { tool: 'poster' });
    readRemix('poster').then((r) => {
      if (r?.type !== 'poster') return;
      setWord(r.data.w); setTilt(r.data.t); setOff(r.data.o); setPal(r.data.p); setLayout(r.data.l ?? 0); setBg(r.data.b ?? 0); setDance(r.data.n === 1);
    });
  }, []);

  const p = PALS[pal] ?? PALS[0];
  const w = (word || '').toUpperCase().slice(0, 10) || 'MELA';

  // Redraw on every change; the letters jiggle for a moment, like a banner caught by the wind.
  // While it dances, it keeps drawing (and pauses when the poster is off screen).
  useEffect(() => {
    const el = cv.current;
    if (!el) return;
    let raf = 0, live = true, seen = true;
    const t0 = performance.now(), still = calm(), moving = dance && !still;
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([en]) => { seen = en.isIntersecting; if (seen && moving && !raf) raf = requestAnimationFrame(frame); }) : null;
    io?.observe(el);
    const frame = (now: number) => {
      const k = still ? 1 : Math.min(1, (now - t0) / 500);
      drawPoster(el, w, tilt, off, p, layout, bg, (1 - k) * (1 - k), moving ? 0.01 + (now - t0) / 1000 : 0);
      raf = k < 1 || (moving && seen) ? requestAnimationFrame(frame) : 0;
    };
    const fonts = document.fonts ? Promise.all(["900 100px Sarpanch", "800 100px 'Baloo Tamma 2'"].map((f) => document.fonts.load(f).catch(() => null))) : Promise.resolve();
    fonts.then(() => { if (live) raf = requestAnimationFrame(frame); });
    return () => { live = false; cancelAnimationFrame(raf); io?.disconnect(); };
  }, [w, tilt, off, p, layout, bg, dance]);

  useEffect(() => { layouts.current.add(layout); if (layouts.current.size >= LAYOUTS.length) done('poster-layouts'); }, [layout]);
  useEffect(() => { if (/[\u0900-\u097F\u0C80-\u0CFF]/.test(word)) done('poster-indic'); }, [word]);

  const shuffle = () => {
    setLayout(Math.floor(Math.random() * LAYOUTS.length));
    setBg(Math.floor(Math.random() * BACKDROPS.length));
    setPal((v) => (v + 1 + Math.floor(Math.random() * (PALS.length - 1))) % PALS.length);
    setTilt(4 + Math.floor(Math.random() * 12));
    buzz(8); pluck(6, 0.6);
    stamp('poster');
  };
  const newWord = () => { setWord((cur) => { const opts = WORDS.filter((x) => x !== cur.toUpperCase()); return opts[Math.floor(Math.random() * opts.length)]; }); buzz(6); stamp('poster'); };

  const nachao = () => {
    const on = !dance;
    setDance(on);
    if (on) { chime(4, 5); buzz([8, 40, 8]); done('poster-nachao'); track('surprise', { tool: 'poster-nachao' }); } else buzz(6);
    stamp('poster');
  };

  const onShare = () => {
    stamp('poster');
    const out = document.createElement('canvas');
    drawPoster(out, w, tilt, off, p, layout, bg);
    setShare({
      recipe: { v: 1, type: 'poster', data: { w, t: tilt, o: off, p: pal, ...(layout ? { l: layout } : {}), ...(bg ? { b: bg } : {}), ...(dance ? { n: 1 as const } : {}) } }, art: out, asIs: true, filename: 'rangotsav-poster', heading: dance ? 'Share your dancing poster' : 'Share your poster', kicker: 'Karkhana',
      title: (m) => (m ? `${m}'s ${w} poster` : `My ${w} poster`), cta: 'Print yours', prompt: 'Make your mela poster 🎪 #Rangotsav',
    });
  };

  // the 4:5 poster fitted into the stage
  const aw = Math.max(160, sw - 28), ah = Math.max(200, sh - 28 - 26);
  const pw = Math.floor(Math.min(aw, (ah * 4) / 5)), ph = Math.floor((pw * 5) / 4);

  return (
    <>
      <ToyShell
        toy="poster" label="Type Distorter" title="Type Distorter" sub={<span lang="hi">अक्षर कला</span>} stageRef={stage}
        caption="Bend it like a bazaar banner"
        stage={
          <Morph id="poster">
            <canvas ref={cv} role="img" aria-label={`${w} poster`} width={1080} height={1350} className={s.canvas} style={{ width: pw, height: ph, background: p.bg }} />
          </Morph>
        }
        actions={<>
          <ToolBtn icon="🔤" label="New word" onClick={newWord} title="Try another word" />
          <ToolBtn icon="🎲" label="Shuffle" onClick={shuffle} title="Shuffle the style" />
          <ToolBtn icon={dance ? '✋' : '💃'} label={dance ? 'Ruko' : 'Nachao'} onClick={nachao} title={dance ? 'Stop the dance' : 'Make it dance'} className={dance ? s.toolOn : undefined} />
          <ToolBtn icon={<BloomIcon />} label="Share" onClick={onShare} go className="rg-bloom" />
        </>}
      >
        <label className={s.field}>
          <span className={s.label}>Your word · English, हिन्दी or ಕನ್ನಡ</span>
          <input className="rg-input" value={word} maxLength={10} autoComplete="off" spellCheck={false} placeholder="MELA" enterKeyHint="done"
            onChange={(e) => { stamp('poster'); setWord(e.target.value.slice(0, 10)); }} style={{ fontFamily: 'Sarpanch, sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '.08em', textTransform: 'uppercase' }} />
        </label>
        <div className={s.field}>
          <span className={s.label}>Layout</span>
          <div role="group" aria-label="Layout" className={s.row}>
            {LAYOUTS.map((l, i) => <button key={l} className={s.opt} style={{ fontSize: 13, minWidth: 74 }} aria-pressed={layout === i} onClick={() => setLayout(i)}>{l}</button>)}
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Inks · {p.name}</span>
          <div role="group" aria-label="Inks" className={s.swatches}>
            {PALS.map((q, i) => (
              <button key={q.name} className={s.swatch} aria-pressed={pal === i} aria-label={q.name} onClick={() => setPal(i)}
                style={{ background: `linear-gradient(135deg, ${q.bg} 0 50%, ${q.fg} 50% 72%, ${q.mis} 72%)` }} />
            ))}
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Backdrop</span>
          <div role="group" aria-label="Backdrop" className={s.row}>
            {BACKDROPS.map((l, i) => <button key={l} className={s.opt} style={{ fontSize: 13, minWidth: 84 }} aria-pressed={bg === i} onClick={() => setBg(i)}>{l}</button>)}
          </div>
        </div>
        <div className={s.spread}>
          <label className={s.range}>
            <span className={s.label}><span>{layout === 1 ? 'Curve' : 'Tilt'}</span><span>{tilt}°</span></span>
            <input type="range" min={0} max={20} value={tilt} onChange={(e) => setTilt(+e.target.value)} />
          </label>
          <label className={s.range}>
            <span className={s.label}><span>Print offset</span><span>{off}px</span></span>
            <input type="range" min={0} max={14} value={off} onChange={(e) => setOff(+e.target.value)} />
          </label>
        </div>
        <CultureStrip art="poster" />
      </ToyShell>
      <ShareSheet req={share} onClose={() => setShare(null)} />
    </>
  );
}
