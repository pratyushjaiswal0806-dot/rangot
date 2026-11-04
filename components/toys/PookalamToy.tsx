'use client';
// Pookalam: Kerala's Onam flower carpet. Pick a flower and tap the rings: every tap lays the
// whole symmetric set of cells at once, so a carpet comes together in a dozen taps. Drag to
// lay a run of cells; tap a cell in the same flower to sweep it up again. Petals drop into
// place with a little spin and bounce, a finished ring glows, and when the whole carpet is laid
// Maveli himself strolls by under his umbrella.
import { useCallback, useEffect, useRef, useState } from 'react';
import ToyShell, { ToolBtn } from './ToyShell';
import Morph from './Morph';
import CultureStrip from './CultureStrip';
import ShareSheet, { type ShareRequest } from '../ShareSheet';
import { BloomIcon, SweepIcon, UndoIcon } from './icons';
import { useElementSize, fitSquare } from '../../hooks/useElementSize';
import { cells, drawPookalam, EMPTY, emptyKey, FLOWERS, flowerChar, hitCell, LAYOUTS, orbit, surprisePookalam } from '../../lib/art/pookalam';
import type { Recipe } from '../../lib/recipe';
import { readRemix } from '../../lib/remix';
import { stamp } from '../../lib/progress';
import { track } from '../../lib/track';
import { flash } from '../../lib/toast';
import { buzz, chime, pluck } from '../../lib/sfx';
import { newSeed } from '../../lib/art/generate';
import Maveli from './Maveli';
import { trail, type Trail } from '../../lib/trail';
import { done } from '../../lib/challenges';
import { cheer } from '../../lib/toast';
import Count from '../site/Count';
import s from './ToyShell.module.css';

const FOLDS: [number, string][] = [[1, 'Free'], [4, '4'], [8, '8'], [16, '16']];
type Snap = { l: number; k: string };

export default function PookalamToy() {
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const side = useRef(0);
  const key = useRef(emptyKey(0));
  const hist = useRef<Snap[]>([]);
  const born = useRef(new Map<number, number>());
  const raf = useRef(0);
  const drag = useRef<{ mode: 'fill' | 'clear'; last: number } | null>(null);
  const wasFull = useRef(false);
  const petals = useRef<Trail | null>(null);
  const shine = useRef<{ ring: number; t0: number } | null>(null); // a ring just finished, glowing
  const freeLaid = useRef(0);
  const { w, h } = useElementSize(stage);

  const [layout, setLayout] = useState(0);
  const [flower, setFlower] = useState(0);
  const [fold, setFold] = useState(8);
  const [mirror, setMirror] = useState(true);
  const [filled, setFilled] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [px, setPx] = useState(300);
  const [share, setShare] = useState<ShareRequest | null>(null);
  const [maveli, setMaveli] = useState(0);
  const L = useRef(layout);
  L.current = layout;

  // Paint, letting freshly laid flowers drop in (with a bounce: past 1 and back) and a finished
  // ring glow; keeps animating while anything is still moving.
  const paint = useCallback(() => {
    const x = ctx.current, S = side.current;
    if (!x || !S) return;
    cancelAnimationFrame(raf.current);
    const all = cells(L.current);
    const frame = () => {
      const now = performance.now(), sh = shine.current, ga = sh ? Math.max(0, 0.6 * (1 - (now - sh.t0) / 750)) : 0;
      let busy = ga > 0;
      drawPookalam(x, S, L.current, key.current, {
        fall: true,
        show: (i) => {
          const t0 = born.current.get(i);
          if (t0 == null) return 1;
          const t = Math.max(0, Math.min(1, (now - t0) / 380));
          if (t >= 1) { born.current.delete(i); return 1; }
          busy = true;
          return 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2; // ease out, overshooting a little
        },
        glow: ga ? (i) => (all[i].ring === sh!.ring ? ga : 0) : undefined,
      });
      if (!ga) shine.current = null;
      if (busy) raf.current = requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const count = useCallback((byHand = false) => {
    const k = key.current, n = [...k].filter((c) => c !== EMPTY).length;
    setFilled(n);
    const full = n === k.length;
    if (byHand && new Set([...k].filter((c) => c !== EMPTY)).size >= 6) done('pookalam-flowers');
    if (full && !wasFull.current) {
      if (byHand) done('pookalam-full');
      setTimeout(() => {
        const r = cv.current?.getBoundingClientRect();
        cheer('Onashamsakal!', 'Onashamsakal! Happy Onam', r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined);
        setMaveli((m) => m + 1);
      }, 300);
    }
    wasFull.current = full;
  }, []);

  useEffect(() => {
    const el = cv.current;
    if (!el || !w || !h) return;
    const S = fitSquare(w, h, 220);
    if (Math.abs(S - side.current) < 8) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    el.width = el.height = Math.round(S * d);
    const x = el.getContext('2d')!;
    x.setTransform(d, 0, 0, d, 0, 0);
    ctx.current = x;
    side.current = S;
    setPx(S);
    paint();
  }, [w, h, paint]);

  useEffect(() => {
    stamp('pookalam');
    track('tool_open', { tool: 'pookalam' });
    if (stage.current) petals.current = trail(stage.current, 'petal');
    readRemix('pookalam').then((r) => {
      if (r?.type !== 'pookalam') return;
      setLayout(r.data.l); L.current = r.data.l;
      key.current = r.data.k.padEnd(cells(r.data.l).length, EMPTY).slice(0, cells(r.data.l).length);
      count(); paint();
      flash('Remixing! Lay your own flowers.');
    });
    return () => { cancelAnimationFrame(raf.current); petals.current?.stop(); };
  }, [paint, count]);

  const recipe = useCallback((): Recipe | null => (/[a-l]/.test(key.current) ? { v: 1, type: 'pookalam', data: { l: L.current, k: key.current } } : null), []);
  const snap = () => {
    hist.current.push({ l: L.current, k: key.current });
    if (hist.current.length > 40) hist.current.shift();
    setCanUndo(true);
  };
  const undo = () => {
    const prev = hist.current.pop();
    if (!prev) return;
    setLayout(prev.l); L.current = prev.l;
    key.current = prev.k;
    born.current.clear();
    paint(); count();
    buzz(8);
    setCanUndo(hist.current.length > 0);
  };

  const cellAt = (e: React.PointerEvent) => {
    const b = cv.current!.getBoundingClientRect(), S = side.current, k = S / (b.width - 8);
    const x = (e.clientX - b.left - 4) * k - S / 2, y = (e.clientY - b.top - 4) * k - S / 2, R = (S / 2) * 0.95;
    return hitCell(L.current, x / R, y / R);
  };
  const lay = (idx: number, mode: 'fill' | 'clear', at?: { x: number; y: number }) => {
    const ch = mode === 'fill' ? flowerChar(flower) : EMPTY, k = key.current.split(''), now = performance.now();
    let changed = 0;
    for (const i of orbit(L.current, idx, fold, mirror)) {
      if (k[i] === ch) continue;
      k[i] = ch; changed++;
      if (mode === 'fill') born.current.set(i, now + Math.random() * 90);
    }
    if (!changed) return;
    key.current = k.join('');
    const all = cells(L.current), ring = all[idx].ring;
    pluck(mode === 'fill' ? 2 + ring : Math.max(0, ring - 1), mode === 'fill' ? 0.8 : 0.5);
    buzz(mode === 'fill' ? 8 : 5);
    if (mode === 'fill') {
      if (at) petals.current?.burst(at.x, at.y, FLOWERS[flower][2], 5);
      // the whole ring laid now: it glows, with a note an octave up
      if (all.every((c, i) => c.ring !== ring || key.current[i] !== EMPTY)) { shine.current = { ring, t0: performance.now() }; pluck(7 + ring, 0.6, 0.05); }
      if (fold === 1 && !mirror && (freeLaid.current += changed) >= 30) done('pookalam-free');
    }
    paint(); count(true);
  };
  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    const idx = cellAt(e);
    if (idx < 0) return;
    try { cv.current!.setPointerCapture(e.pointerId); } catch {}
    snap();
    const mode = key.current[idx] === flowerChar(flower) ? 'clear' : 'fill';
    drag.current = { mode, last: idx };
    lay(idx, mode, { x: e.clientX, y: e.clientY });
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const idx = cellAt(e);
    if (idx < 0 || idx === d.last) return;
    d.last = idx;
    lay(idx, d.mode, { x: e.clientX, y: e.clientY });
  };
  const up = () => { drag.current = null; };

  const pickLayout = (l: number) => {
    if (l === L.current) return;
    snap();
    setLayout(l); L.current = l;
    key.current = emptyKey(l);
    born.current.clear();
    paint(); count();
    chime(3, 3);
  };
  const sweep = () => { snap(); key.current = emptyKey(L.current); born.current.clear(); paint(); count(); flash('Floor swept. Undo brings it back.'); };
  const surprise = () => {
    snap();
    const k = surprisePookalam(newSeed(), L.current), all = cells(L.current), now = performance.now();
    key.current = k;
    born.current.clear();
    // bloom outwards from the centre
    all.forEach((c, i) => born.current.set(i, now + c.ring * 110 + Math.random() * 80));
    wasFull.current = true;
    paint(); count();
    chime(5, 5);
    track('surprise', { tool: 'pookalam' });
  };

  const onShare = () => {
    born.current.clear();
    paint();
    if (!cv.current) return;
    const r = recipe();
    if (r?.type !== 'pookalam') { flash('Lay a few flowers first!'); return; }
    const copy = document.createElement('canvas');
    copy.width = cv.current.width; copy.height = cv.current.height;
    copy.getContext('2d')!.drawImage(cv.current, 0, 0);
    setShare({
      recipe: r, art: copy, filename: 'my-pookalam', heading: 'Share your pookalam', kicker: `My Pookalam · ${LAYOUTS[L.current].name}`,
      title: (m) => (m ? `${m}'s pookalam` : 'Laid by me'), body: 'A flower carpet for Onam, petal by petal.',
      cta: 'Now you lay one', prompt: 'Lay your pookalam 🌼 #Rangotsav',
    });
  };

  const total = cells(layout).length;
  const [fname, fdesc] = FLOWERS[flower];

  return (
    <>
      <ToyShell
        toy="pookalam" label="Pookalam" title="Pookalam" sub={<span lang="ml">പൂക്കളം</span>} stageRef={stage} onUndo={undo}
        caption={filled === 0 ? 'Tap a ring to lay flowers' : filled === total ? 'Complete! Share it with the family' : <><Count value={Math.round((filled / total) * 100)} ms={350} />% laid · tap a flower again to sweep it</>}
        stage={
          <Morph id="pookalam">
            <div style={{ position: 'relative', lineHeight: 0 }}>
              <canvas ref={cv} className={s.canvas} style={{ width: px, height: px, cursor: 'pointer' }} aria-label="Pookalam floor: tap the rings to lay flowers"
                onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
              {filled === 0 && <div aria-hidden="true" className={s.hint}><div><i /><b>Tap a ring</b></div></div>}
              {maveli > 0 && <div key={maveli} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ['--stage-w' as string]: `${px}px` }}><Maveli /></div>}
            </div>
          </Morph>
        }
        actions={<>
          <ToolBtn icon={<UndoIcon />} label="Undo" onClick={undo} disabled={!canUndo} />
          <ToolBtn icon={<SweepIcon />} label="Sweep" onClick={sweep} title="Sweep the floor" />
          <ToolBtn icon="✨" label="Surprise" onClick={surprise} title="Surprise me" />
          <ToolBtn icon={<BloomIcon />} label="Share" onClick={onShare} go className="rg-bloom" />
        </>}
      >
        <div className={s.field}>
          <span className={s.label}>Flower · {fname} <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 600 }}>({fdesc})</span></span>
          <div role="group" aria-label="Flower" className={s.swatches}>
            {FLOWERS.map(([n, d, c], i) => (
              <button key={c} className={s.swatch} aria-pressed={flower === i} aria-label={`${n}, ${d}`} onClick={() => { setFlower(i); buzz(5); }}
                style={{ background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,.45) 0 8%, transparent 9%), radial-gradient(circle at 65% 60%, rgba(0,0,0,.18) 0 12%, transparent 13%), ${c}` }} />
            ))}
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Symmetry</span>
          <div role="group" aria-label="Symmetry" className={s.row}>
            {FOLDS.map(([f, l]) => <button key={f} className={s.opt} style={{ fontSize: 16, minWidth: 58 }} aria-pressed={fold === f} onClick={() => setFold(f)}>{l}</button>)}
            <button className={s.toggle} style={{ flex: 'none' }} aria-pressed={mirror} onClick={() => setMirror((m) => !m)}>⇋ Mirror</button>
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Design</span>
          <div role="group" aria-label="Design" className={s.row}>
            {LAYOUTS.map((l, i) => <button key={l.name} className={s.opt} style={{ fontSize: 14, minWidth: 92 }} aria-pressed={layout === i} onClick={() => pickLayout(i)}>{l.name}</button>)}
          </div>
        </div>
        <CultureStrip art="pookalam" />
      </ToyShell>
      <ShareSheet req={share} onClose={() => setShare(null)} />
    </>
  );
}
