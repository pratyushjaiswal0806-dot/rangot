'use client';
// Draw Rangoli: every stroke is mirrored and turned into 2n copies. Strokes are recorded in
// recipe units as you draw, and undo/resize redraw from that record, so the canvas and the
// share link always agree. "Spin the floor" turns the floor under your finger like a potter's
// wheel: hold still for a ring, drift in or out for a spiral. Powder sifts down from your
// fingertip as you draw, and "Light diyas" sets a ring of lamps round the rim (a diya-brush
// stroke, so it shares and replays like any other) that flicker while you're here.
import { useCallback, useEffect, useRef, useState } from 'react';
import ToyShell, { ToolBtn } from './ToyShell';
import Morph from './Morph';
import CultureStrip from './CultureStrip';
import ShareSheet, { type ShareRequest } from '../ShareSheet';
import { BloomIcon, SweepIcon, UndoIcon } from './icons';
import { useElementSize, fitSquare } from '../../hooks/useElementSize';
import { C, RCOLS } from '../../lib/art/palette';
import { paintStrokes, pxToUnit, RANGOLI_LOOK, rangoliFloor, strokePainter, strokeReplayer, type DecodedStroke } from '../../lib/art/rangoli';
import { decodePts, encodePts, MAX_POINTS, type Brush, type Recipe } from '../../lib/recipe';
import { queryParam, readRemix } from '../../lib/remix';
import { stamp } from '../../lib/progress';
import { track } from '../../lib/track';
import { flash } from '../../lib/toast';
import { buzz, chime, pluck, powder, ting } from '../../lib/sfx';
import { firstVisit, ghostStroke } from '../../lib/ghost';
import { GOLD_POWDER, newSeed, surpriseRangoli } from '../../lib/art/generate';
import { useUnlocks, unlockHint } from '../../hooks/useUnlocks';
import { trail, type Trail } from '../../lib/trail';
import { done } from '../../lib/challenges';
import s from './ToyShell.module.css';

type Rec = { c: string; s: number; n: number; b?: Brush; pts: number[] };
type P = { x: number; y: number };
const BRUSHES: [Brush, string][] = [['powder', 'Powder'], ['bindu', 'Dots'], ['petal', 'Petals'], ['vine', 'Vine'], ['pookalam', 'Flowers'], ['diya', 'Diyas'], ['peacock', 'Peacock']];
const HISS: Partial<Record<Brush, number>> = { powder: 2600, bindu: 3200, petal: 1900, vine: 2300, diya: 1300, pookalam: 2100, peacock: 1600 };
const AXES = [4, 6, 8, 12];
const SPIN = (Math.PI * 2) / 7; // one turn every 7 seconds
const rot = (p: P, a: number): P => ({ x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a) });

// A little sample of each brush for its button.
function BrushChip({ b, color }: { b: Brush; color: string }) {
  const ref = useCallback((el: HTMLCanvasElement | null) => {
    if (!el) return;
    const d = 2, W = 64, H = 26;
    el.width = W * d; el.height = H * d;
    const x = el.getContext('2d')!;
    x.scale(d, d);
    x.fillStyle = C.floor;
    x.beginPath(); x.roundRect(0, 0, W, H, 6); x.fill();
    x.translate(W / 2 - H / 2, 0);
    const pen = strokePainter(x, H, { c: b === 'diya' || b === 'peacock' ? C.marigold : color, sizePx: b === 'powder' ? 4 : 4.4, n: 1, b: b === 'powder' ? undefined : b, mirror: true, grain: true });
    let last = { x: -26, y: 0 };
    pen.seg(last, last);
    for (let i = 1; i <= 26; i++) { const p = { x: -26 + i * 2, y: Math.sin(i / 4) * 4 }; pen.seg(last, p); last = p; }
  }, [b, color]);
  return <canvas ref={ref} aria-hidden="true" style={{ width: 64, height: 26 }} />;
}

export default function RangoliToy() {
  const stage = useRef<HTMLDivElement>(null);
  const table = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const side = useRef(0);
  const floor = useRef<HTMLCanvasElement | null>(null);
  const rec = useRef<Rec[]>([]);
  const hist = useRef<Rec[][]>([]);
  const pen = useRef<ReturnType<typeof strokePainter> | null>(null);
  const cur = useRef<Rec | null>(null);
  const last = useRef<P | null>(null);
  const finger = useRef<P | null>(null); // the pointer, relative to the floor's centre on screen
  const points = useRef(0);
  const hiss = useRef<ReturnType<typeof powder> | null>(null);
  const ghostEl = useRef<HTMLDivElement>(null);
  const ghost = useRef<(() => void) | null>(null);
  const remixing = useRef(false); // a remix is loading: no ghost hand drawing over it
  const anim = useRef(0);
  const dust = useRef<Trail | null>(null);
  const client = useRef<{ x: number; y: number } | null>(null); // the pointer on screen, for the falling powder
  const angle = useRef(0);
  const spinRaf = useRef(0);
  const { w, h } = useElementSize(stage);
  const unlocks = useUnlocks();

  const [sym, setSym] = useState(8);
  const [color, setColor] = useState(C.ivory);
  const [size, setSize] = useState(6);
  const [brush, setBrush] = useState<Brush>('powder');
  const [grid, setGrid] = useState(true);
  const [spin, setSpin] = useState(false);
  const [touched, setTouched] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [px, setPx] = useState(300);
  const [share, setShare] = useState<ShareRequest | null>(null);
  const [glows, setGlows] = useState<{ x: number; y: number }[]>([]);
  const spinning = useRef(false);
  spinning.current = spin;

  // Repaint everything from the record: the (cached) floor, then each stroke.
  const redraw = useCallback(() => {
    const x = ctx.current, S = side.current;
    if (!x || !S) return;
    if (!floor.current || floor.current.width !== Math.round(S)) {
      const f = document.createElement('canvas');
      f.width = f.height = Math.round(S);
      rangoliFloor(f.getContext('2d')!, S);
      floor.current = f;
    }
    x.drawImage(floor.current, 0, 0, S, S);
    const ds: DecodedStroke[] = rec.current.filter((r) => r.pts.length).map((r) => ({ st: { c: r.c, s: r.s, n: r.n, p: '', ...(r.b ? { b: r.b } : {}) }, pts: r.pts }));
    paintStrokes(x, S, ds, RANGOLI_LOOK);
  }, []);

  // Where the lit diyas sit (px about the floor's centre): every single-tap diya stroke, in all its
  // mirrored copies. Their glow flickers over the floor while the toy is open.
  const relight = useCallback(() => {
    const S = side.current, out: { x: number; y: number }[] = [];
    for (const r of rec.current) {
      if (r.b !== 'diya' || r.pts.length !== 2) continue;
      const px0 = (r.pts[0] * S) / 2000, py0 = (r.pts[1] * S) / 2000;
      for (let k = 0; k < r.n; k++) for (const f of [1, -1]) {
        const a = (k * Math.PI * 2) / r.n, y = py0 * f;
        out.push({ x: px0 * Math.cos(a) - y * Math.sin(a), y: px0 * Math.sin(a) + y * Math.cos(a) });
      }
    }
    setGlows(out.slice(0, 48));
  }, []);

  // Fit the square floor to the stage whenever the stage changes size.
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
    redraw();
    relight();
    if (first && !rec.current.length && ghostEl.current && !remixing.current && firstVisit('rangoli')) {
      // one marigold petal, mirrored 16 ways, drawn by a ghost fingertip
      const pts = Array.from({ length: 30 }, (_, i) => { const t = i / 29; return { x: (0.12 + 0.5 * t) * S / 2, y: -Math.sin(Math.PI * t) * 0.15 * S / 2 }; });
      const pen = strokePainter(x, S, { c: C.marigold, sizePx: 7, n: 8, grain: true });
      const r: Rec = { c: C.marigold, s: Math.round((7 / S) * 1000), n: 8, pts: [] };
      rec.current.push(r);
      let prev = pts[0];
      ghost.current = ghostStroke(pts, ghostEl.current, S, 1400, (p, i) => {
        pen.seg(i ? prev : p, p); prev = p;
        r.pts.push(pxToUnit(p.x, S), pxToUnit(p.y, S)); points.current++;
      }, () => { ghost.current = null; pluck(9, 0.7); });
    }
  }, [w, h, redraw, relight]);

  useEffect(() => {
    stamp('rangoli');
    track('tool_open', { tool: 'rangoli' });
    if (stage.current) dust.current = trail(stage.current, 'powder');
    remixing.current = !!queryParam('remix');
    readRemix('rangoli').then((r) => {
      remixing.current = false;
      if (r?.type !== 'rangoli') return;
      ghost.current?.();
      rec.current = r.data.strokes.map((t) => ({ c: t.c, s: t.s, n: t.n, b: t.b, pts: decodePts(t.p) ?? [] }));
      points.current = rec.current.reduce((a, t) => a + t.pts.length / 2, 0);
      setTouched(true);
      redraw();
      relight();
      flash('Remixing! Add your own strokes.');
    });
    return () => { dust.current?.stop(); };
  }, [redraw, relight]);

  const recipe = useCallback((): Recipe | null => {
    if (points.current > MAX_POINTS) return null;
    const strokes = rec.current.filter((t) => t.pts.length).map((t) => ({ c: t.c, s: t.s, n: t.n, ...(t.b ? { b: t.b } : {}), p: encodePts(t.pts) }));
    return strokes.length ? { v: 1, type: 'rangoli', data: { strokes } } : null;
  }, []);
  useEffect(() => () => { hiss.current?.stop(); ghost.current?.(); cancelAnimationFrame(anim.current); cancelAnimationFrame(spinRaf.current); }, [recipe]);

  const snap = () => {
    hist.current.push(rec.current.slice());
    if (hist.current.length > 30) hist.current.shift();
    setCanUndo(true);
  };
  const undo = () => {
    const prev = hist.current.pop();
    if (!prev) return;
    rec.current = prev;
    points.current = prev.reduce((a, t) => a + t.pts.length / 2, 0);
    redraw();
    relight();
    buzz(8);
    setCanUndo(hist.current.length > 0);
  };
  const sweep = () => {
    if (!ctx.current) return;
    snap();
    rec.current = [];
    points.current = 0;
    redraw();
    relight();
    flash('Floor swept. Undo brings it back.');
  };

  // Where the pointer is on the floor: screen position about the centre, turned back by the spin.
  // (the canvas's 4px border is outside its drawing area, hence the scale)
  const onScreen = (e: React.PointerEvent): P => {
    const b = table.current!.getBoundingClientRect(), k = side.current / Math.max(1, side.current - 8);
    return { x: (e.clientX - b.left - b.width / 2) * k, y: (e.clientY - b.top - b.height / 2) * k };
  };
  const onFloor = (p: P) => rot(p, -angle.current);
  // Records the point in recipe units (±1000 of the half-side).
  const add = (p: P) => {
    const c = cur.current;
    if (!c || points.current >= MAX_POINTS) return;
    const q = (v: number) => Math.max(-1000, Math.min(1000, pxToUnit(v, side.current)));
    const ux = q(p.x), uy = q(p.y), n = c.pts.length;
    if (n && c.pts[n - 2] === ux && c.pts[n - 1] === uy) return;
    c.pts.push(ux, uy);
    points.current++;
  };
  const drawTo = (p: P) => {
    if (!last.current || !pen.current) return;
    const d = Math.hypot(p.x - last.current.x, p.y - last.current.y);
    pen.current.seg(last.current, p);
    hiss.current?.speed(d);
    add(p);
    last.current = p;
    // a little powder sifts down from the fingertip
    if (client.current && cur.current) dust.current?.emit(client.current.x, client.current.y, d, cur.current.b === 'diya' || cur.current.b === 'peacock' ? C.marigold : cur.current.c);
  };
  const down = (e: React.PointerEvent) => {
    if (!ctx.current) return;
    e.preventDefault();
    ghost.current?.();
    snap();
    buzz(6);
    pluck(5 + Math.floor(Math.random() * 6), 0.7);
    hiss.current?.stop();
    hiss.current = powder(HISS[brush] ?? 2400);
    setTouched(true);
    try { cv.current!.setPointerCapture(e.pointerId); } catch {}
    client.current = { x: e.clientX, y: e.clientY };
    finger.current = onScreen(e);
    const p = onFloor(finger.current);
    last.current = p;
    const b = brush === 'powder' ? undefined : brush;
    pen.current = strokePainter(ctx.current, side.current, { c: color, sizePx: size, n: sym, b, grain: true });
    cur.current = { c: color, s: Math.max(1, Math.min(200, Math.round((size / side.current) * 1000))), n: sym, b, pts: [] };
    rec.current.push(cur.current);
    add(p);
    pen.current.seg(p, p);
  };
  const move = (e: React.PointerEvent) => {
    if (!last.current || !pen.current) return;
    e.preventDefault();
    client.current = { x: e.clientX, y: e.clientY };
    finger.current = onScreen(e);
    // while spinning, the turntable loop draws every frame (the floor moves even if you don't)
    if (!spinning.current) drawTo(onFloor(finger.current));
  };
  const up = () => {
    const c = cur.current;
    last.current = null; pen.current = null; cur.current = null; finger.current = null; client.current = null; hiss.current?.stop(); hiss.current = null;
    if (!c || c.pts.length < 40) return;
    if (new Set(rec.current.filter((r) => r.pts.length).map((r) => r.c)).size >= 4) done('rangoli-colours');
    if (spinning.current) done('rangoli-spin');
  };

  // Light diyas: a ring of lamps just inside the rim, one per mirror, lit one after another.
  const lightDiyas = () => {
    const x = ctx.current, S = side.current;
    if (!x || !S) return;
    ghost.current?.();
    snap();
    setTouched(true);
    const r = S * 0.43, a0 = Math.PI / (2 * sym), p = { x: r * Math.cos(a0), y: r * Math.sin(a0) }, sz = Math.max(6, S * 0.024);
    const stroke: Rec = { c: C.marigold, s: Math.max(1, Math.min(200, Math.round((sz / S) * 1000))), n: sym, b: 'diya', pts: [pxToUnit(p.x, S), pxToUnit(p.y, S)] };
    rec.current.push(stroke);
    points.current++;
    strokePainter(x, S, { c: stroke.c, sizePx: sz, n: sym, b: 'diya', grain: true }).seg(p, p);
    relight();
    for (let k = 0; k < Math.min(10, sym * 2); k++) pluck(3 + k, 0.45, k * 0.06);
    setTimeout(() => ting(1320, 0.6), 700);
    done('rangoli-diyas');
    track('surprise', { tool: 'rangoli-diyas' });
  };

  // The turntable: turn the floor every frame, and keep drawing under a resting finger.
  useEffect(() => {
    const el = table.current;
    if (!el) return;
    cancelAnimationFrame(spinRaf.current);
    if (!spin) {
      // ease back to the nearest symmetric position, so the guide lines up again
      const step = (Math.PI * 2) / sym, a = angle.current, to = Math.round(a / step) * step;
      el.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)';
      el.style.transform = `rotate(${to}rad)`;
      angle.current = to;
      return;
    }
    el.style.transition = 'none';
    let t0 = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;
      angle.current += SPIN * dt;
      el.style.transform = `rotate(${angle.current}rad)`;
      if (finger.current && pen.current) drawTo(onFloor(finger.current));
      spinRaf.current = requestAnimationFrame(loop);
    };
    spinRaf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(spinRaf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spin, sym]);

  // Surprise me: a seeded mandala drawn in over a second and a half, on top of what's there.
  const surprise = () => {
    const x = ctx.current, S = side.current;
    if (!x || !S) return;
    ghost.current?.();
    snap();
    setTouched(true);
    const palette = [...RCOLS.map(([, c]) => c), ...(unlocks.gold ? [GOLD_POWDER[1]] : [])];
    const strokes = surpriseRangoli(newSeed(), sym, palette);
    const ds = strokes.map((st) => ({ st, pts: decodePts(st.p) ?? [] }));
    rec.current.push(...ds.map(({ st, pts }) => ({ c: st.c, s: st.s, n: st.n, b: st.b, pts })));
    points.current += ds.reduce((a, d) => a + d.pts.length / 2, 0);
    const rp = strokeReplayer(x, S, ds, RANGOLI_LOOK), t0 = performance.now();
    cancelAnimationFrame(anim.current);
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 1500);
      rp.advance(Math.round(rp.total * k));
      if (k < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
    chime(5, 5);
    track('surprise', { tool: 'rangoli' });
  };

  const toggleSpin = () => {
    if (!spin) { flash('The floor is spinning: hold still for a ring, drift for a spiral.'); track('surprise', { tool: 'rangoli-spin' }); }
    setSpin(!spin);
    buzz(8);
  };

  const onShare = () => {
    if (!cv.current) return;
    const r = recipe();
    if (points.current > MAX_POINTS) flash('So detailed! This one shares as an image, no replay link.');
    const copy = document.createElement('canvas');
    copy.width = cv.current.width; copy.height = cv.current.height;
    copy.getContext('2d')!.drawImage(cv.current, 0, 0);
    setShare({
      recipe: r, art: copy, filename: 'my-rangoli', heading: 'Share your rangoli', kicker: `My Rangoli · ${sym}-fold`,
      title: (m) => (m ? `${m}'s rangoli` : 'Made by me'), body: `Every stroke mirrored ${sym * 2} ways, like rice flour on a doorstep.`,
      cta: 'Now you draw one', prompt: 'Show your rangoli 🪔 #Rangotsav',
    });
  };

  const guide = Array.from({ length: sym }, (_, k) => {
    const a = (k * Math.PI) / sym;
    return { x1: -49 * Math.cos(a), y1: -49 * Math.sin(a), x2: 49 * Math.cos(a), y2: 49 * Math.sin(a) };
  });

  return (
    <>
      <ToyShell
        toy="rangoli" label="Draw Rangoli" title="Draw Rangoli" sub={<span lang="kn">ರಂಗೋಲಿ</span>} stageRef={stage} onUndo={undo}
        caption={spin ? 'The floor is turning · hold still for rings' : `Draw anywhere · mirrored ×${sym * 2}`}
        stage={
          <Morph id="rangoli">
            <div ref={table} style={{ position: 'relative', lineHeight: 0, borderRadius: spin ? '50%' : 0, transition: 'border-radius .4s' }}>
              <canvas ref={cv} className={s.canvas} style={{ width: px, height: px, cursor: 'crosshair', borderRadius: 'inherit' }} aria-label="Rangoli drawing floor"
                onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={(e) => { if (!spin || e.pointerType === 'mouse') up(); }} />
              {grid && (
                <svg aria-hidden="true" viewBox="-50 -50 100 100" style={{ position: 'absolute', inset: 4, width: 'calc(100% - 8px)', height: 'calc(100% - 8px)', pointerEvents: 'none' }}>
                  {[16, 32, 48].map((r) => <circle key={r} r={r} fill="none" stroke="rgba(251,243,228,.16)" strokeWidth=".3" strokeDasharray="1 1.2" />)}
                  {guide.map((g, i) => <line key={i} {...g} stroke="rgba(251,243,228,.2)" strokeWidth=".3" strokeDasharray="1 1.2" />)}
                </svg>
              )}
              {glows.length > 0 && (
                <div aria-hidden="true" style={{ position: 'absolute', inset: 4, pointerEvents: 'none', borderRadius: 'inherit', overflow: 'hidden' }}>
                  {glows.map((g, i) => <i key={i} className={s.diyaGlow} style={{ left: (px - 8) / 2 + (g.x * (px - 8)) / px, top: (px - 8) / 2 + (g.y * (px - 8)) / px, width: px * 0.09, height: px * 0.09, ['--gi' as string]: i % 24 }} />)}
                </div>
              )}
              <div ref={ghostEl} aria-hidden="true" className={s.ghost} />
              {!touched && <div aria-hidden="true" className={s.hint}><div><i /><b>Drag anywhere to draw</b></div></div>}
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
          <span className={s.label}>Pigment</span>
          <div role="group" aria-label="Pigment" className={s.swatches}>
            {RCOLS.map(([l, c]) => <button key={c} className={s.swatch} style={{ background: c }} aria-pressed={color === c} aria-label={l} onClick={() => setColor(c)} />)}
            {unlocks.gold
              ? <button className={s.swatch} style={{ background: `radial-gradient(circle at 35% 30%, #FFF3B0, ${GOLD_POWDER[1]} 55%, #9C7A1E)` }} aria-pressed={color === GOLD_POWDER[1]} aria-label={GOLD_POWDER[0]} onClick={() => setColor(GOLD_POWDER[1])} />
              : <button className={`${s.swatch} ${s.locked}`} style={{ background: GOLD_POWDER[1] }} aria-label={`${GOLD_POWDER[0]}, locked. ${unlockHint('gold')}`} onClick={() => flash(unlockHint('gold'))} />}
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Brush</span>
          <div role="group" aria-label="Brush" className={s.row}>
            {BRUSHES.map(([b, l]) => b === 'peacock' && !unlocks.peacock
              ? <button key={b} className={`${s.opt} ${s.locked}`} style={{ minWidth: 80, fontSize: 12 }} aria-label={`Peacock brush, locked. ${unlockHint('peacock')}`} onClick={() => flash(unlockHint('peacock'))}><BrushChip b={b} color={color} />{l}</button>
              : <button key={b} className={s.opt} style={{ minWidth: 80, fontSize: 12 }} aria-pressed={brush === b} onClick={() => setBrush(b)}><BrushChip b={b} color={color} />{l}</button>)}
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Mirrors</span>
          <div role="group" aria-label="Symmetry axes" className={s.row}>
            {AXES.map((n) => <button key={n} className={s.opt} style={{ fontSize: 18, minWidth: 54 }} aria-pressed={sym === n} aria-label={`${n} axes`} onClick={() => setSym(n)}>{n}</button>)}
            <button className={s.toggle} style={{ flex: 'none' }} aria-pressed={spin} onClick={toggleSpin}>🌀 Spin floor</button>
            <button className={s.toggle} style={{ flex: 'none' }} onClick={lightDiyas}>🪔 Light diyas</button>
          </div>
        </div>
        <div className={s.spread}>
          <label className={s.range}>
            <span className={s.label}><span>Size</span><span>{size}px</span></span>
            <input type="range" min={2} max={24} value={size} onChange={(e) => setSize(+e.target.value)} />
          </label>
          <button className={s.toggle} aria-pressed={grid} onClick={() => setGrid((g) => !g)}>{grid ? 'Guide on' : 'Guide off'}</button>
        </div>
        <CultureStrip art="rangoli" />
      </ToyShell>
      <ShareSheet req={share} onClose={() => setShare(null)} />
    </>
  );
}
