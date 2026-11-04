'use client';
// Phuljhadi: paint with a Diwali sparkler. Hold to light it at your fingertip; sparks spray from
// the burning tip and the stroke glows. Long exposure keeps every stroke, like a camera with its
// shutter left open (how light paintings are photographed); turn it off and the light dies away
// like a real sparkler's, and turning it back on shows everything the camera saw. Free writes
// anything; Chakri turns each stroke six ways, Mandala mirrors it eight. Strokes are recorded in
// recipe units as you draw, so undo, resize, share links and reels all redraw from the same
// record (lib/art/phuljhadi.ts).
import { useCallback, useEffect, useRef, useState } from 'react';
import ToyShell, { ToolBtn } from './ToyShell';
import Morph from './Morph';
import CultureStrip from './CultureStrip';
import ShareSheet, { type ShareRequest } from '../ShareSheet';
import { BloomIcon, UndoIcon } from './icons';
import { useElementSize, fitSquare } from '../../hooks/useElementSize';
import { clearLight, composite, copies, fadeLight, lightLayers, lightPainter, lightReplayer, MODES, nightSky, SIZES, SPARK_COLOURS, sparklerTip, type Light } from '../../lib/art/phuljhadi';
import { pxToUnit } from '../../lib/art/rangoli';
import { decodePts, encodePts, MAX_POINTS, type Recipe, type Stroke } from '../../lib/recipe';
import { queryParam, readRemix } from '../../lib/remix';
import { stamp } from '../../lib/progress';
import { track } from '../../lib/track';
import { cheer, flash } from '../../lib/toast';
import { buzz, chime, crackle, pluck, whoosh } from '../../lib/sfx';
import { firstVisit, ghostStroke } from '../../lib/ghost';
import { newSeed, surpriseRangoli } from '../../lib/art/generate';
import { trail, type Trail } from '../../lib/trail';
import { done } from '../../lib/challenges';
import { useUnlocks, unlockHint } from '../../hooks/useUnlocks';
import s from './ToyShell.module.css';

type Rec = { c: string; s: number; n: number; m: boolean; pts: number[] };
type P = { x: number; y: number };
const toStroke = (r: Rec): Stroke => ({ c: r.c, s: r.s, n: r.n, ...(r.m ? { m: 1 as const } : {}), p: encodePts(r.pts) });

// the Rainbow sparks colour (unlocked with Chunauti stars): it sits after the six real colours
const RAINBOW = SPARK_COLOURS.length;
const RAINBOW_BG = `conic-gradient(${SPARK_COLOURS.map(([, c]) => c).join(', ')}, ${SPARK_COLOURS[0][1]})`;

// a little moon for the Andhera (clear the sky) button
function MoonIcon() {
  return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M15 3a9 9 0 1 0 6 15A8 8 0 0 1 15 3Z" fill="#1B1410" /><circle cx="6" cy="6" r="1.2" fill="#1B1410" /><circle cx="19" cy="9" r="1" fill="#1B1410" /></svg>;
}

export default function PhuljhadiToy() {
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const side = useRef(0);
  const light = useRef<Light | null>(null);
  const sky = useRef<HTMLCanvasElement | null>(null);
  const rec = useRef<Rec[]>([]);
  const hist = useRef<Rec[][]>([]);
  const pen = useRef<ReturnType<typeof lightPainter> | null>(null);
  const cur = useRef<Rec | null>(null);
  const last = useRef<P | null>(null);
  const tip = useRef<P | null>(null); // the burning tip, px about the floor's centre
  const points = useRef(0);
  const fizz = useRef<ReturnType<typeof crackle> | null>(null);
  const sparks = useRef<Trail | null>(null);
  const raf = useRef(0);
  const lit = useRef(0); // when light was last added: with long exposure off, the floor keeps fading for a while after
  const ghostEl = useRef<HTMLDivElement>(null);
  const ghost = useRef<(() => void) | null>(null);
  const remixing = useRef(false); // a remix is loading: no ghost hand drawing over it
  const anim = useRef(0);
  const rainbowK = useRef(0); // Rainbow sparks: each stroke takes the next colour
  const faded = useRef(false); // a stroke was drawn with long exposure off
  const { w, h } = useElementSize(stage);
  const unlocks = useUnlocks();

  const [ci, setCi] = useState(0);
  const [mode, setMode] = useState(0);
  const [size, setSize] = useState(1);
  const [exposure, setExposure] = useState(true);
  const [touched, setTouched] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [px, setPx] = useState(300);
  const [share, setShare] = useState<ShareRequest | null>(null);
  const exp = useRef(exposure);
  exp.current = exposure;

  // One frame: the sky, the light (fading if it should), and the burning tips.
  const frame = useCallback((now: number) => {
    const x = ctx.current, L = light.current, S = side.current;
    if (!x || !L || !S || !sky.current) { raf.current = 0; return; }
    const c = cur.current, fading = !exp.current && !c && !anim.current;
    // fading light never quite reaches zero in 8-bit alpha, so once it has died down, wipe it
    if (fading && now - lit.current > 2400) clearLight(L);
    else if (!exp.current) fadeLight(L, 0.05);
    composite(x, S, sky.current, L);
    if (tip.current && c) for (const q of copies(tip.current, c.n, c.m)) sparklerTip(x, { x: S / 2 + q.x, y: S / 2 + q.y }, c.c, S / 150);
    raf.current = c || anim.current || (!exp.current && now - lit.current <= 2400) ? requestAnimationFrame(frame) : 0;
  }, []);
  const wake = useCallback(() => { if (!raf.current) raf.current = requestAnimationFrame(frame); }, [frame]);

  // Paint every recorded stroke again (undo, resize, long exposure turned back on).
  const redraw = useCallback(() => {
    const L = light.current;
    if (!L) return;
    clearLight(L);
    const rp = lightReplayer(L, rec.current.filter((r) => r.pts.length).map(toStroke));
    rp.advance(rp.total);
    lit.current = performance.now();
    wake();
  }, [wake]);

  // Fit the square floor to the stage.
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
    light.current = lightLayers(S, d);
    sky.current = nightSky(S, d);
    setPx(S);
    redraw();
    if (first && !rec.current.length && ghostEl.current && !remixing.current && firstVisit('phuljhadi')) {
      // a golden spiral, written by a ghost fingertip, sparks and all
      const pts = Array.from({ length: 70 }, (_, i) => { const t = i / 69, r = (0.06 + 0.5 * t) * S / 2, a = t * Math.PI * 4.2; return { x: r * Math.cos(a), y: r * Math.sin(a) }; });
      const c = SPARK_COLOURS[0][1], sz = (SIZES[1][1] * S) / 600, r: Rec = { c, s: Math.round((sz / S) * 1000), n: 1, m: false, pts: [] };
      const painter = lightPainter(light.current, { c, sizePx: sz, n: 1, m: false });
      rec.current.push(r);
      cur.current = r;
      let prev = pts[0];
      ghost.current = ghostStroke(pts, ghostEl.current, S, 1700, (p, i) => {
        painter.seg(i ? prev : p, p); prev = p;
        r.pts.push(pxToUnit(p.x, S), pxToUnit(p.y, S)); points.current++;
        tip.current = p; lit.current = performance.now();
        const b = el.getBoundingClientRect(), k = (b.width - 8) / S;
        sparks.current?.emit(b.left + b.width / 2 + p.x * k, b.top + b.height / 2 + p.y * k, 6, c);
        wake();
      }, () => {
        ghost.current = null; cur.current = null; tip.current = null; pluck(9, 0.7);
      });
    }
  }, [w, h, redraw, wake]);

  useEffect(() => {
    stamp('phuljhadi');
    track('tool_open', { tool: 'phuljhadi' });
    if (stage.current) sparks.current = trail(stage.current, 'spark');
    remixing.current = !!queryParam('remix');
    readRemix('phuljhadi').then((r) => {
      remixing.current = false;
      if (r?.type !== 'phuljhadi') return;
      ghost.current?.();
      rec.current = r.data.strokes.map((t) => ({ c: t.c, s: t.s, n: t.n, m: t.m === 1, pts: decodePts(t.p) ?? [] }));
      points.current = rec.current.reduce((a, t) => a + t.pts.length / 2, 0);
      setTouched(true);
      redraw();
      flash('Remixing! Add your own light.');
    });
    return () => { fizz.current?.stop(); ghost.current?.(); sparks.current?.stop(); cancelAnimationFrame(raf.current); cancelAnimationFrame(anim.current); };
  }, [redraw]);

  const recipe = useCallback((): Extract<Recipe, { type: 'phuljhadi' }> | null => {
    const strokes = rec.current.filter((t) => t.pts.length).map(toStroke);
    return strokes.length && points.current <= MAX_POINTS ? { v: 1, type: 'phuljhadi', data: { strokes } } : null;
  }, []);

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
    buzz(8);
    setCanUndo(hist.current.length > 0);
  };
  const dark = () => {
    snap();
    rec.current = [];
    points.current = 0;
    redraw();
    flash('Andhera! A fresh dark sky. Undo brings the light back.');
  };

  // Where a pointer is on the floor, in px about its centre (the canvas's 4px border is outside the drawing).
  const scale = () => { const b = cv.current!.getBoundingClientRect(); return { b, k: side.current / Math.max(1, b.width - 8) }; };
  const onFloor = (e: React.PointerEvent): P => { const { b, k } = scale(); return { x: (e.clientX - b.left - b.width / 2) * k, y: (e.clientY - b.top - b.height / 2) * k }; };
  // sparks fly from every burning copy of the tip (in every colour at once, with Rainbow sparks)
  const spray = (p: P, speed: number, c: Rec) => {
    const { b, k } = scale(), cx = b.left + b.width / 2, cy = b.top + b.height / 2, rainbow = ci === RAINBOW;
    for (const q of copies(p, c.n, c.m)) sparks.current?.emit(cx + q.x / k, cy + q.y / k, speed, rainbow ? SPARK_COLOURS[Math.floor(Math.random() * SPARK_COLOURS.length)][1] : c.c);
  };
  const add = (p: P) => {
    const c = cur.current;
    if (!c || points.current >= MAX_POINTS) return;
    const q = (v: number) => Math.max(-1000, Math.min(1000, pxToUnit(v, side.current)));
    const ux = q(p.x), uy = q(p.y), n = c.pts.length;
    if (n && c.pts[n - 2] === ux && c.pts[n - 1] === uy) return;
    c.pts.push(ux, uy);
    points.current++;
  };

  const down = (e: React.PointerEvent) => {
    const L = light.current, S = side.current;
    if (!L || !S) return;
    e.preventDefault();
    ghost.current?.();
    cancelAnimationFrame(anim.current); anim.current = 0;
    snap();
    const p = onFloor(e), md = MODES[mode], c = ci === RAINBOW ? SPARK_COLOURS[rainbowK.current++ % SPARK_COLOURS.length][1] : SPARK_COLOURS[ci][1], sz = (SIZES[size][1] * S) / 600;
    pen.current = lightPainter(L, { c, sizePx: sz, n: md.n, m: md.m });
    cur.current = { c, s: Math.max(1, Math.min(200, Math.round((sz / S) * 1000))), n: md.n, m: md.m, pts: [] };
    rec.current.push(cur.current);
    add(p);
    pen.current.seg(p, p);
    last.current = p; tip.current = p;
    fizz.current?.stop();
    fizz.current = crackle();
    whoosh(0.25, 1200, 3600, 0.05);
    buzz(6);
    setTouched(true);
    try { cv.current!.setPointerCapture(e.pointerId); } catch {}
    lit.current = performance.now();
    spray(p, 24, cur.current);
    wake();
  };
  const move = (e: React.PointerEvent) => {
    if (!last.current || !pen.current || !cur.current) return;
    e.preventDefault();
    const p = onFloor(e), d = Math.hypot(p.x - last.current.x, p.y - last.current.y);
    if (d < 0.5) return;
    pen.current.seg(last.current, p);
    add(p);
    last.current = p; tip.current = p;
    fizz.current?.speed(d);
    lit.current = performance.now();
    spray(p, d, cur.current);
  };
  const up = () => {
    const stroke = cur.current;
    last.current = null; pen.current = null; cur.current = null; tip.current = null;
    fizz.current?.stop(); fizz.current = null;
    wake();
    if (stroke && stroke.pts.length > 40) {
      if (stroke.n === 4 && stroke.m) done('phuljhadi-mandala');
      if (new Set(rec.current.filter((r) => r.pts.length).map((r) => r.c)).size >= 4) done('phuljhadi-colours');
      if (!exp.current) faded.current = true;
    }
    // the first proper light painting gets a cheer, once per browser
    if (stroke && stroke.pts.length > 120) {
      try { if (!localStorage.getItem('rangotsav:cheer:phuljhadi')) { localStorage.setItem('rangotsav:cheer:phuljhadi', '1'); setTimeout(() => cheer('रोशनी!', 'Roshni!'), 250); } } catch {}
    }
  };

  // Surprise me: a mandala of light drawn in front of you, sparks flying from every tip.
  const surprise = () => {
    const L = light.current, S = side.current;
    if (!L || !S) return;
    ghost.current?.();
    snap();
    setTouched(true);
    if (!exp.current) { setExposure(true); exp.current = true; redraw(); }
    const strokes = surpriseRangoli(newSeed(), 4, SPARK_COLOURS.map(([, c]) => c)).map((st) => ({ ...st, s: Math.max(8, Math.min(22, Math.round(st.s * 0.7))), m: 1 as const }));
    rec.current.push(...strokes.map((st) => ({ c: st.c, s: st.s, n: st.n, m: true, pts: decodePts(st.p) ?? [] })));
    points.current = rec.current.reduce((a, t) => a + t.pts.length / 2, 0);
    const rp = lightReplayer(L, strokes), t0 = performance.now();
    cancelAnimationFrame(anim.current);
    const step = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - t0) / 1700)), at = rp.advance(Math.round(rp.total * k));
      if (at) spray(at.p, 10, { c: at.c, s: 0, n: at.n, m: at.m, pts: [] });
      lit.current = now;
      anim.current = k < 1 ? requestAnimationFrame(step) : 0;
      wake();
    };
    anim.current = requestAnimationFrame(step);
    chime(5, 5);
    track('surprise', { tool: 'phuljhadi' });
  };

  const toggleExposure = () => {
    const on = !exposure;
    setExposure(on); exp.current = on;
    if (on) { redraw(); flash('Long exposure! The camera kept every stroke.'); if (faded.current) done('phuljhadi-camera'); }
    else { lit.current = performance.now(); wake(); flash('Like a real phuljhadi, the light fades away.'); }
    buzz(8);
  };

  const onShare = () => {
    const S = side.current;
    if (!S || !cv.current) return;
    const r = recipe();
    if (!r) { flash(points.current > MAX_POINTS ? 'So much light! Undo a little to share it.' : 'Draw something with the sparkler first!'); return; }
    // the share card is the long-exposure photo: every stroke, whatever the toggle says
    const d = cv.current.width / S, copy = document.createElement('canvas'), L = lightLayers(S, d);
    copy.width = copy.height = cv.current.width;
    const x = copy.getContext('2d')!;
    x.setTransform(d, 0, 0, d, 0, 0);
    const rp = lightReplayer(L, r.data.strokes);
    rp.advance(rp.total);
    composite(x, S, nightSky(S, d), L);
    setShare({
      recipe: r, art: copy, filename: 'my-phuljhadi', heading: 'Share your light painting', kicker: `My Phuljhadi · ${r.data.strokes.length} stroke${r.data.strokes.length > 1 ? 's' : ''} of light`,
      title: (m) => (m ? `${m}'s light painting` : 'Painted with light'), body: 'Drawn with a sparkler on a Diwali night, caught in one long exposure.',
      cta: 'Now you light one', prompt: 'Paint with light this Diwali 🎇 #Rangotsav',
    });
  };

  const [cname, , what] = ci === RAINBOW ? ['Rainbow', '', 'every stroke a new colour'] : SPARK_COLOURS[ci];
  return (
    <>
      <ToyShell
        toy="phuljhadi" label="Phuljhadi light painting" title="Phuljhadi" sub={<span lang="hi">फुलझड़ी</span>} stageRef={stage} onUndo={undo}
        caption={`${MODES[mode].note} · ${exposure ? 'long exposure' : 'the light fades like a real one'}`}
        stage={
          <Morph id="phuljhadi">
            <div style={{ position: 'relative', lineHeight: 0 }}>
              <canvas ref={cv} className={s.canvas} style={{ width: px, height: px, cursor: 'crosshair' }} aria-label="Night sky: hold and drag to paint with a sparkler"
                onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
              <div ref={ghostEl} aria-hidden="true" className={s.ghost} />
              {!touched && <div aria-hidden="true" className={s.hint}><div><i /><b>Hold to light the sparkler</b></div></div>}
            </div>
          </Morph>
        }
        actions={<>
          <ToolBtn icon={<UndoIcon />} label="Undo" onClick={undo} disabled={!canUndo} />
          <ToolBtn icon={<MoonIcon />} label="Andhera" onClick={dark} title="A fresh dark sky" />
          <ToolBtn icon="✨" label="Surprise" onClick={surprise} title="Surprise me" />
          <ToolBtn icon={<BloomIcon />} label="Share" onClick={onShare} go className="rg-bloom" />
        </>}
      >
        <div className={s.field}>
          <span className={s.label}>Colour · {cname} <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 600 }}>({what})</span></span>
          <div role="group" aria-label="Sparkler colour" className={s.swatches}>
            {SPARK_COLOURS.map(([n, c, wh], i) => (
              <button key={c} className={s.swatch} aria-pressed={ci === i} aria-label={`${n}, ${wh}`} onClick={() => { setCi(i); buzz(5); }}
                style={{ background: `radial-gradient(circle at 50% 50%, #FFFFFF 0 16%, ${c} 42%, #1A0A2E 78%)` }} />
            ))}
            {unlocks.rainbow
              ? <button className={s.swatch} aria-pressed={ci === RAINBOW} aria-label="Rainbow sparks: every stroke a new colour" onClick={() => { setCi(RAINBOW); buzz(5); }} style={{ background: RAINBOW_BG }} />
              : <button className={`${s.swatch} ${s.locked}`} aria-label={`Rainbow sparks, locked. ${unlockHint('rainbow')}`} onClick={() => flash(unlockHint('rainbow'))} style={{ background: RAINBOW_BG }} />}
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Symmetry</span>
          <div role="group" aria-label="Symmetry" className={s.seg}>
            {MODES.map((m, i) => <button key={m.id} type="button" aria-pressed={mode === i} onClick={() => { setMode(i); buzz(6); }}>{m.label}</button>)}
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Thickness</span>
          <div role="group" aria-label="Thickness" className={s.row}>
            {SIZES.map(([l], i) => <button key={l} className={s.opt} style={{ fontSize: 13, minWidth: 74 }} aria-pressed={size === i} onClick={() => setSize(i)}>{l}</button>)}
          </div>
        </div>
        <button className={s.toggle} aria-pressed={exposure} onClick={toggleExposure}>
          <span aria-hidden="true">📷</span> {exposure ? 'Long exposure is on' : 'Long exposure is off'}
        </button>
        <CultureStrip art="phuljhadi" />
      </ToyShell>
      <ShareSheet req={share} onClose={() => setShare(null)} />
    </>
  );
}
