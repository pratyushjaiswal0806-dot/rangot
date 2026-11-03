'use client';
// Kolam Weaver: a sikku kolam. Tap cells to place pulli (dots) and one line weaves around them.
// Switch to Twist and tap between two dots to change how the line passes there (cross, turn
// back, swing round both). The line usually falls into several loops; the game is to twist it
// into one unbroken line. See lib/art/sikku.ts. Each dot lands with a puff of rice flour; when the
// line becomes one, a bead of light runs the whole of it and the ants come for breakfast.
import { useCallback, useEffect, useRef, useState } from 'react';
import ToyShell, { ToolBtn } from './ToyShell';
import Morph from './Morph';
import CultureStrip from './CultureStrip';
import ShareSheet, { type ShareRequest } from '../ShareSheet';
import { BloomIcon, SweepIcon, UndoIcon } from './icons';
import { useElementSize, fitSquare } from '../../hooks/useElementSize';
import { C, KCOLS } from '../../lib/art/palette';
import { drawSikku, edgeKey, edgeList, edgeMap, islands, loopSamples, oneLine, SHAPES, shapeDots, SIKKU_GRID as G, surpriseSikku, weave, type Dot, type Pt, type Shape } from '../../lib/art/sikku';
import type { Recipe } from '../../lib/recipe';
import { readRemix } from '../../lib/remix';
import { stamp } from '../../lib/progress';
import { track } from '../../lib/track';
import { buzz, chime, chord, pluck } from '../../lib/sfx';
import { petalBurst } from '../../lib/fx';
import { cheer, flash } from '../../lib/toast';
import { glowSprite } from '../../lib/art/sparks';
import { calm } from '../../lib/motion';
import { trail, type Trail } from '../../lib/trail';
import { done } from '../../lib/challenges';
import { say } from '../../lib/cheenti';
import { MOONLIGHT, newSeed } from '../../lib/art/generate';
import { useUnlocks, unlockHint } from '../../hooks/useUnlocks';
import s from './ToyShell.module.css';

type Tool = 'dots' | 'twist';
// how a change came about: by hand (taps, twists) or by a button (the solver, a preset, Surprise)
type How = 'tap' | 'twist' | 'auto';

// a little ant, facing along `a`, for the breakfast walk
function ant(x: CanvasRenderingContext2D, p: Pt, a: number, s: number, step: number) {
  x.save(); x.translate(p.x, p.y); x.rotate(a); x.scale(s, s);
  x.strokeStyle = '#1B1410'; x.lineWidth = 1.2; x.lineCap = 'round';
  const k = Math.sin(step) * 2;
  x.beginPath();
  for (const lx of [-3, 0, 3]) { x.moveTo(lx, 0); x.lineTo(lx - 1 + k * (lx === 0 ? -1 : 1), -5); x.moveTo(lx, 0); x.lineTo(lx - 1 - k * (lx === 0 ? -1 : 1), 5); }
  x.stroke();
  x.fillStyle = '#1B1410';
  for (const [cx, r] of [[-5, 3.2], [0, 2.3], [4.5, 2.6]] as const) { x.beginPath(); x.arc(cx, 0, r, 0, Math.PI * 2); x.fill(); }
  x.fillStyle = '#FBF3E4'; x.beginPath(); x.arc(8, -1.5, 1.8, 0, Math.PI * 2); x.fill(); // the grain of rice it carries
  x.restore();
}
type Snap = { dots: Dot[]; edges: [string, 1 | 2][] };
const ck = (i: number, j: number) => i + ',' + j;

export default function KolamToy() {
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const side = useRef(0);
  const dots = useRef(new Map<string, Dot>());
  const edges = useRef(new Map<string, 1 | 2>());
  const woven = useRef<ReturnType<typeof weave> | null>(null);
  const hist = useRef<Snap[]>([]);
  const raf = useRef(0);
  const loopsBefore = useRef(0);
  const flour = useRef<Trail | null>(null);
  const glow = useRef<HTMLCanvasElement | null>(null);
  const { w, h } = useElementSize(stage);
  const unlocks = useUnlocks();

  const [tool, setTool] = useState<Tool>('dots');
  const [color, setColor] = useState(C.ivory);
  const [showDots, setShowDots] = useState(true);
  const [rainbow, setRainbow] = useState(false);
  const [count, setCount] = useState({ dots: 0, loops: 0, best: 0 });
  const [canUndo, setCanUndo] = useState(false);
  const [px, setPx] = useState(300);
  const [share, setShare] = useState<ShareRequest | null>(null);
  const look = useRef({ color, showDots, rainbow, tool });
  look.current = { color, showDots, rainbow, tool };

  // The kolam, plus (in Twist mode) a marker on every spot between two dots you can tap.
  const paint = useCallback((prog = 1, marks = true) => {
    const x = ctx.current, S = side.current, wv = woven.current;
    if (!x || !wv) return;
    const L = look.current;
    drawSikku(x, S, G, wv, L.color, L.showDots, prog, C.floor, L.rainbow);
    if (!marks || L.tool !== 'twist') return;
    const c = S / G;
    x.save();
    x.lineCap = 'round';
    for (const [i, j] of dots.current.values()) {
      for (const o of [0, 1] as const) {
        const ni = i + (o ? 0 : 1), nj = j + (o ? 1 : 0);
        if (!dots.current.has(ck(ni, nj))) continue;
        const mx = (i + 0.5 + (o ? 0 : 0.5)) * c, my = (j + 0.5 + (o ? 0.5 : 0)) * c, st = edges.current.get(edgeKey(i, j, o)) ?? 0;
        x.beginPath(); x.arc(mx, my, c * 0.16, 0, Math.PI * 2);
        x.fillStyle = st ? '#FFC21A' : 'rgba(255,194,26,.22)'; x.fill();
        x.lineWidth = 2; x.strokeStyle = '#1B1410'; x.stroke();
        if (st) {
          // a wall runs along the cell edge, a bridge across it (along the line joining the dots)
          const vertical = (st === 1) === (o === 0);
          x.beginPath();
          if (vertical) { x.moveTo(mx, my - c * 0.1); x.lineTo(mx, my + c * 0.1); } else { x.moveTo(mx - c * 0.1, my); x.lineTo(mx + c * 0.1, my); }
          x.lineWidth = 3; x.stroke();
        }
      }
    }
    x.restore();
  }, []);

  // One unbroken line: a bead of light runs the whole of it to rising notes, then three ants walk
  // it for breakfast (rice-flour kolams feed the ants). Skipped with reduced motion.
  const runLine = useCallback(() => {
    const wv = woven.current, x = ctx.current, S = side.current;
    if (!wv || !x || wv.loops.length !== 1 || calm()) return;
    const pts = loopSamples(wv.loops[0], S / G, 8), n = pts.length;
    if (n < 8) return;
    glow.current ??= glowSprite();
    const sprite = glow.current, t0 = performance.now(), D = Math.min(3200, 1100 + n * 5), W = 3600;
    let note = -1;
    cancelAnimationFrame(raf.current);
    const f = (now: number) => {
      const t = Math.max(0, now - t0);
      paint(1);
      if (t < D) {
        const idx = Math.floor((t / D) * (n - 1)), z = S / 13;
        x.save(); x.globalCompositeOperation = 'lighter';
        for (let j = 12; j >= 0; j--) { const q = pts[Math.max(0, idx - j * 3)], k = 1 - j / 13; x.globalAlpha = k * 0.75; x.drawImage(sprite, q.x - (z * k) / 2, q.y - (z * k) / 2, z * k, z * k); }
        x.restore();
        const nt = Math.floor((t / D) * 12);
        if (nt > note) { note = nt; pluck(2 + nt, 0.5); }
      } else if (t < D + W) {
        // breakfast: three ants follow each other round the line
        const u = (t - D) / W;
        for (let a = 0; a < 3; a++) {
          const i = Math.floor((u * 0.55 + a * 0.06) * n) % n, q = pts[i], r = pts[(i + 2) % n];
          ant(x, q, Math.atan2(r.y - q.y, r.x - q.x), S / 360, t / 60 + a);
        }
      } else { paint(1); raf.current = 0; say('Breakfast! Kolams in rice flour feed us ants, you know.', { pose: 'eat', once: 'kolam:breakfast', ms: 4500 }); return; }
      raf.current = requestAnimationFrame(f);
    };
    raf.current = requestAnimationFrame(f);
  }, [paint]);

  // Re-weave through the current dots and walls, animating it in unless motion is reduced.
  const rebuild = useCallback((anim = true, celebrate = false, how: How = 'auto') => {
    if (!side.current) return;
    const list = [...dots.current.values()];
    const wv = weave(list, edges.current);
    woven.current = wv;
    const loops = list.length ? wv.loops.length : 0, best = islands(list);
    setCount({ dots: list.length, loops, best });
    if (celebrate && loops === best && loops > 0 && loopsBefore.current > best && list.length > 3) {
      const one = best === 1, byHand = how !== 'auto';
      if (one && byHand) {
        if (list.length >= 9) done('kolam-one9');
        if (list.length >= 16) done('kolam-one16');
        if (how === 'twist' && loopsBefore.current >= 3) done('kolam-twist');
      }
      setTimeout(() => {
        if (one) { cheer('एक Kambi!', 'Ek kambi! One unbroken line'); setTimeout(runLine, 250); return; }
        chord();
        const r = cv.current?.getBoundingClientRect();
        if (r) petalBurst(r.left + r.width / 2, r.top + r.height / 2, 40);
        flash(`As few lines as these dots allow: ${best}.`);
      }, anim ? 500 : 0);
    }
    loopsBefore.current = loops;
    cancelAnimationFrame(raf.current);
    if (!anim || matchMedia('(prefers-reduced-motion: reduce)').matches) { paint(1); return; }
    const t0 = performance.now(), dur = Math.min(1400, 420 + list.length * 18);
    const f = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      paint(1 - (1 - p) * (1 - p));
      if (p < 1) raf.current = requestAnimationFrame(f);
    };
    raf.current = requestAnimationFrame(f);
  }, [paint, runLine]);

  const snap = () => {
    hist.current.push({ dots: [...dots.current.values()], edges: [...edges.current] });
    if (hist.current.length > 40) hist.current.shift();
    setCanUndo(true);
  };
  const load = useCallback((list: Dot[], m: Map<string, 1 | 2>, anim = true) => {
    dots.current = new Map(list.map(([i, j]) => [ck(i, j), [i, j] as Dot]));
    edges.current = new Map(m);
    rebuild(anim);
  }, [rebuild]);
  const undo = () => {
    const prev = hist.current.pop();
    if (!prev) return;
    load(prev.dots, new Map(prev.edges), false);
    buzz(8);
    setCanUndo(hist.current.length > 0);
  };

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
    const first = !side.current;
    side.current = S;
    setPx(S);
    if (first && !dots.current.size) load(shapeDots('diamond'), new Map());
    else rebuild(false);
  }, [w, h, rebuild, load]);

  useEffect(() => { paint(1); }, [color, showDots, rainbow, tool, paint]);

  useEffect(() => {
    stamp('kolam');
    track('tool_open', { tool: 'kolam' });
    if (stage.current) flour.current = trail(stage.current, 'powder');
    readRemix('kolam').then((r) => {
      if (r?.type !== 'kolam') return;
      setColor(r.data.c); setShowDots(r.data.d); setRainbow(r.data.r === 1);
      look.current = { ...look.current, color: r.data.c, showDots: r.data.d, rainbow: r.data.r === 1 };
      load(r.data.dots, edgeMap(r.data.m ?? []));
      flash('Remixing! Twist it your way.');
    });
    return () => { cancelAnimationFrame(raf.current); flour.current?.stop(); };
  }, [load]);

  const recipe = useCallback((): Recipe | null => {
    const list = [...dots.current.values()];
    if (!list.length) return null;
    const L = look.current;
    return { v: 1, type: 'kolam', data: { dots: list, c: L.color, d: L.showDots, m: edgeList(edges.current, list), ...(L.rainbow ? { r: 1 as const } : {}) } };
  }, []);
  const tap = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    // the canvas's 4px border sits outside the drawing
    const b = e.currentTarget.getBoundingClientRect(), c = (b.width - 8) / G;
    const u = (e.clientX - b.left - 4) / c, v = (e.clientY - b.top - 4) / c;
    const i = Math.max(0, Math.min(G - 1, Math.floor(u))), j = Math.max(0, Math.min(G - 1, Math.floor(v)));
    const fu = u - i, fv = v - j;
    if (look.current.tool === 'twist') {
      // the nearest spot between this cell's dot and a neighbour's
      const cand: [number, number, 0 | 1, number][] = [
        [i, j, 0, Math.hypot(fu - 1, fv - 0.5)], [i - 1, j, 0, Math.hypot(fu, fv - 0.5)],
        [i, j, 1, Math.hypot(fu - 0.5, fv - 1)], [i, j - 1, 1, Math.hypot(fu - 0.5, fv)],
      ];
      const ok = cand.filter(([a, bb, o]) => dots.current.has(ck(a, bb)) && dots.current.has(o ? ck(a, bb + 1) : ck(a + 1, bb))).sort((p, q) => p[3] - q[3]);
      if (!ok.length || ok[0][3] > 0.55) { flash('Tap between two neighbouring dots to twist the line there.'); return; }
      const [a, bb, o] = ok[0], k = edgeKey(a, bb, o), now = edges.current.get(k) ?? 0, next = ((now + 1) % 3) as 0 | 1 | 2;
      snap();
      if (next) edges.current.set(k, next); else edges.current.delete(k);
      buzz(10);
      pluck([2, 5, 8][next], 0.8);
      rebuild(false, true, 'twist');
      return;
    }
    snap();
    buzz(8);
    const k = ck(i, j);
    // each new dot plays the next note up the scale (and lands with a puff of flour); removing one steps down
    if (dots.current.has(k)) { dots.current.delete(k); pluck(Math.max(0, dots.current.size % 10), 0.6); }
    else {
      dots.current.set(k, [i, j]); pluck(3 + (dots.current.size % 10));
      flour.current?.burst(b.left + 4 + (i + 0.5) * c, b.top + 4 + (j + 0.5) * c, look.current.color, 10);
    }
    rebuild(true, true, 'tap');
  };

  const preset = (shape: Shape) => { snap(); load(shapeDots(shape), new Map()); chime(4, 4); };
  const surprise = () => {
    snap();
    const r = surpriseSikku(newSeed());
    load(r.dots, r.edges);
    chime(5, 5);
    track('surprise', { tool: 'kolam' });
  };
  const solve = () => {
    const list = [...dots.current.values()];
    if (!list.length) return;
    snap();
    loopsBefore.current = count.loops;
    edges.current = oneLine(list, edges.current, newSeed());
    rebuild(true, true);
    track('surprise', { tool: 'kolam-oneline' });
  };
  const sweep = () => { snap(); load([], new Map(), false); flash('Floor swept. Undo brings it back.'); };

  const onShare = () => {
    cancelAnimationFrame(raf.current);
    paint(1, false);
    if (!cv.current) return;
    const r = recipe();
    const copy = document.createElement('canvas');
    copy.width = cv.current.width; copy.height = cv.current.height;
    copy.getContext('2d')!.drawImage(cv.current, 0, 0);
    paint(1);
    const one = count.loops === 1;
    setShare({
      recipe: r, art: copy, filename: 'my-kolam', heading: 'Share your kolam', kicker: `My Kolam · ${count.dots} pulli${one ? ' · one line' : ''}`,
      title: (m) => (m ? `${m}'s kolam` : 'Woven by me'), body: one ? 'One unbroken line, looping around every dot.' : `${count.loops} lines, looping around ${count.dots} dots.`,
      cta: 'Now you weave one', prompt: 'Weave a kolam ✨ #Rangotsav',
    });
  };

  const { dots: nd, loops, best } = count;
  const solved = nd > 0 && loops === best;
  const status = !nd ? 'Tap the floor to place dots'
    : solved ? (best === 1 ? <><b>One line</b> · {nd} pulli ✓</> : <><b>{loops} lines</b> · the fewest these dots allow</>)
    : <><b>{loops} loops</b> · twist them into one</>;

  return (
    <>
      <ToyShell
        toy="kolam" label="Kolam Weaver" title="Kolam Weaver" sub={<span lang="kn">ಚುಕ್ಕಿ ರಂಗೋಲಿ</span>} stageRef={stage} onUndo={undo}
        caption={<span className={`${s.status} ${solved && nd > 3 ? s.win : ''}`} aria-live="polite">{status}</span>}
        stage={
          <Morph id="kolam">
            <canvas ref={cv} className={s.canvas} style={{ width: px, height: px, cursor: 'pointer' }} onPointerDown={tap}
              aria-label={tool === 'twist' ? 'Kolam floor: tap between two dots to twist the line' : 'Kolam floor: tap to add or remove dots'} />
          </Morph>
        }
        actions={<>
          <ToolBtn icon={<UndoIcon />} label="Undo" onClick={undo} disabled={!canUndo} />
          <ToolBtn icon={<SweepIcon />} label="Sweep" onClick={sweep} title="Sweep the floor" />
          <ToolBtn icon="✨" label="Surprise" onClick={surprise} title="Surprise me" />
          <ToolBtn icon={<BloomIcon />} label="Share" onClick={onShare} go className="rg-bloom" />
        </>}
      >
        <div className={s.seg} role="group" aria-label="Tool">
          <button aria-pressed={tool === 'dots'} onClick={() => setTool('dots')}>● Place dots</button>
          <button aria-pressed={tool === 'twist'} onClick={() => { setTool('twist'); if (nd > 1) flash('Tap a marker between two dots to twist the line.'); }}>⤨ Twist line</button>
        </div>
        {nd > 1 && !solved && (
          <button className={s.surprise} onClick={solve}>🪢 Make it one line</button>
        )}
        <div className={s.field}>
          <span className={s.label}>Rice powder</span>
          <div role="group" aria-label="Line colour" className={s.swatches}>
            {KCOLS.map(([l, c]) => <button key={c} className={s.swatch} style={{ background: c }} aria-pressed={color === c} aria-label={l} onClick={() => setColor(c)} />)}
            {unlocks.moon
              ? <button className={s.swatch} style={{ background: `radial-gradient(circle at 35% 30%, #fff, ${MOONLIGHT[1]} 60%, #6f8fc4)` }} aria-pressed={color === MOONLIGHT[1]} aria-label={MOONLIGHT[0]} onClick={() => setColor(MOONLIGHT[1])} />
              : <button className={`${s.swatch} ${s.locked}`} style={{ background: MOONLIGHT[1] }} aria-label={`${MOONLIGHT[0]}, locked. ${unlockHint('moon')}`} onClick={() => flash(unlockHint('moon'))} />}
            <button className={s.toggle} aria-pressed={rainbow} onClick={() => setRainbow((v) => !v)}>🌈 Loops</button>
            <button className={s.toggle} aria-pressed={showDots} onClick={() => setShowDots((v) => !v)}>{showDots ? 'Dots on' : 'Dots off'}</button>
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Start from</span>
          <div className={s.row}>
            {SHAPES.map(([id, l]) => <button key={id} className={s.opt} style={{ fontSize: 14, minWidth: 84 }} onClick={() => preset(id)}>{l}</button>)}
          </div>
        </div>
        <CultureStrip art="kolam" />
      </ToyShell>
      <ShareSheet req={share} onClose={() => setShare(null)} />
    </>
  );
}
