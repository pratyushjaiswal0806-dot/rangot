'use client';
// Mehendi: a courtyard card that opens a full-screen tool. Draw on one palm, it mirrors onto the
// other; paste only sticks to skin. Undo/clear redraw from the recorded strokes, so the canvas
// and the share recipe never drift apart.
import { useCallback, useEffect, useRef, useState } from 'react';
import { HENNA, handOutline, mehendiBase } from '../../lib/art/mehendi';
import { decodeStrokes, paintStrokes, pxToUnit, strokePainter } from '../../lib/art/rangoli';
import { encodePts, decodePts, MAX_POINTS, type Brush, type Recipe } from '../../lib/recipe';
import { stamp } from '../../lib/progress';
import { track } from '../../lib/track';
import type { ShareRequest } from '../ShareSheet';
import culture from '../../data/culture.json';

type Rec = { c: string; s: number; b?: Brush; m?: 1; pts: number[] };
const TIPS: [string, number][] = [['Fine', 6], ['Medium', 11], ['Bold', 18]];
const BRUSHES: [string, Brush][] = [['Line', 'powder'], ['Leaves', 'petal'], ['Florets', 'pookalam']];
const ink = '#1B1410';

export default function Mehendi({ share, remix, openSignal }: { share: (r: ShareRequest) => void; remix?: Recipe | null; openSignal?: number }) {
  const [open, setOpen] = useState(false);
  const preview = useRef<HTMLCanvasElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const cv = preview.current;
    if (!cv) return;
    const S = 360;
    cv.width = cv.height = S;
    const x = cv.getContext('2d')!;
    handOutline(x, S);
    x.save();
    mehendiBase(x, S);
    const dot = strokePainter(x, S, { c: HENNA[1][1], sizePx: 4, n: 1, mirror: true });
    for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2, p = { x: 42 + Math.cos(a) * 20, y: 40 + Math.sin(a) * 20 }; dot.seg(p, p); }
    const leaf = strokePainter(x, S, { c: HENNA[1][1], sizePx: 5, n: 1, b: 'petal', mirror: true });
    leaf.seg({ x: 45, y: -80 }, { x: 45, y: 0 });
    leaf.seg({ x: 72, y: -90 }, { x: 72, y: -20 });
    x.restore();
  }, []);

  useEffect(() => { if (remix?.type === 'mehendi') setOpen(true); }, [remix]);
  useEffect(() => { if (openSignal) setOpen(true); }, [openSignal]);

  return (
    <>
      <article data-reveal style={{ background: '#F6E7C8', border: `3px solid ${ink}`, boxShadow: `8px 8px 0 ${ink}`, outline: `2px dashed ${ink}`, outlineOffset: -12, padding: 22, transform: 'rotate(-0.6deg)', display: 'flex', flexDirection: 'column', gap: 14, animation: 'settleIn .7s cubic-bezier(.2,.8,.2,1) .24s both', animationPlayState: 'var(--rv,paused)' as string }}>
        <div style={{ aspectRatio: '1', background: '#F6E7C8', border: `3px solid ${ink}`, overflow: 'hidden' }}>
          <canvas ref={preview} aria-hidden="true" style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Sarpanch,sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase', color: '#B0246A' }}>Toy 03 · New</span>
          <span style={{ padding: '4px 12px', border: `2px solid ${ink}`, borderRadius: 999, fontWeight: 700, fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase', background: '#FBF3E4' }}>Two hands, one design</span>
        </div>
        <h3 style={{ margin: 0, fontFamily: "'Yatra One',serif", fontWeight: 400, fontSize: 'clamp(30px,8vw,40px)', lineHeight: 1 }}>Mehendi Hands</h3>
        <p style={{ margin: '-6px 0 0', fontSize: 15, fontWeight: 600, display: 'flex', gap: 8 }}><span lang="kn" style={{ fontFamily: "'Baloo Tamma 2',sans-serif" }}>ಮದರಂಗಿ</span><span aria-hidden="true">·</span><span lang="hi">मेहंदी</span></p>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55 }}>Draw on one palm and it appears on the other. Lines, leaves and florets, in fresh paste or deep stain.</p>
        <button ref={opener} className="rg-btn rg-btn--primary" style={{ alignSelf: 'flex-start', minHeight: 52 }} onClick={() => setOpen(true)}>Apply mehendi</button>
      </article>
      {open && <MehendiTool share={share} remix={remix?.type === 'mehendi' ? remix : null} onClose={() => { setOpen(false); setTimeout(() => opener.current?.focus(), 30); }} />}
    </>
  );
}

function MehendiTool({ share, remix, onClose }: { share: (r: ShareRequest) => void; remix: Recipe | null; onClose: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const side = useRef(0);
  const rec = useRef<Rec[]>([]);
  const hist = useRef<Rec[][]>([]);
  const pen = useRef<ReturnType<typeof strokePainter> | null>(null);
  const cur = useRef<Rec | null>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(HENNA[1][1]);
  const [tip, setTip] = useState(TIPS[0][1]);
  const [brush, setBrush] = useState<Brush>('powder');
  const [mirror, setMirror] = useState(true);
  const [canUndo, setCanUndo] = useState(false);
  const [touched, setTouched] = useState(false);
  const facts = culture.mehendi.facts;
  const [fact, setFact] = useState(0);

  const toStrokes = (rs: Rec[]) => rs.filter((r) => r.pts.length).map((r) => ({ c: r.c, s: r.s, n: 1, ...(r.b && r.b !== 'powder' ? { b: r.b } : {}), ...(r.m ? { m: 1 as const } : {}), p: encodePts(r.pts) }));
  const redraw = useCallback(() => {
    const x = ctx.current;
    if (!x) return;
    mehendiBase(x, side.current);
    paintStrokes(x, side.current, decodeStrokes(toStrokes(rec.current)));
  }, []);

  const fit = useCallback(() => {
    const el = cv.current, st = stage.current;
    if (!el || !st) return;
    const r = st.getBoundingClientRect();
    const s = Math.max(220, Math.floor(Math.min(r.width - 28, r.height - 28)));
    const d = Math.min(2, window.devicePixelRatio || 1);
    el.style.width = el.style.height = s + 'px';
    el.width = el.height = Math.round(s * d);
    const x = el.getContext('2d')!;
    x.setTransform(d, 0, 0, d, 0, 0);
    ctx.current = x;
    side.current = s;
    redraw();
  }, [redraw]);

  useEffect(() => {
    if (remix?.type === 'mehendi') rec.current = remix.data.strokes.map((t) => ({ c: t.c, s: t.s, b: t.b, m: t.m, pts: decodePts(t.p) ?? [] }));
    const lock = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(fit);
    setTimeout(() => closeBtn.current?.focus(), 60);
    stamp('mehendi');
    track('tool_open', { tool: 'mehendi' });
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(t); t = setTimeout(fit, 200); };
    window.addEventListener('resize', onResize);
    const ft = setInterval(() => setFact((f) => (f + 1) % facts.length), 9000);
    return () => { document.documentElement.style.overflow = lock; window.removeEventListener('resize', onResize); clearInterval(ft); };
  }, [fit, remix, facts.length]);

  const pt = (e: React.PointerEvent) => {
    const b = cv.current!.getBoundingClientRect();
    return { x: e.clientX - b.left - b.width / 2, y: e.clientY - b.top - b.height / 2 };
  };
  const total = () => rec.current.reduce((a, r) => a + r.pts.length / 2, 0);
  const add = (p: { x: number; y: number }) => {
    const c = cur.current;
    if (!c || total() >= MAX_POINTS) return;
    const q = (v: number) => Math.max(-1000, Math.min(1000, pxToUnit(v, side.current)));
    const ux = q(p.x), uy = q(p.y), n = c.pts.length;
    if (n && c.pts[n - 2] === ux && c.pts[n - 1] === uy) return;
    c.pts.push(ux, uy);
  };
  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!ctx.current) return;
    try { cv.current!.setPointerCapture(e.pointerId); } catch {}
    hist.current.push(rec.current.slice());
    if (hist.current.length > 20) hist.current.shift();
    setCanUndo(true); setTouched(true);
    const p = pt(e);
    last.current = p;
    // strokes paint inside the hands' clip, which mehendiBase left on the context
    pen.current = strokePainter(ctx.current, side.current, { c: color, sizePx: tip * side.current / 600, n: 1, b: brush === 'powder' ? undefined : brush, mirror });
    cur.current = { c: color, s: Math.max(1, Math.round((tip / 600) * 1000)), b: brush === 'powder' ? undefined : brush, ...(mirror ? { m: 1 as const } : {}), pts: [] };
    rec.current.push(cur.current);
    add(p);
    pen.current.seg(p, p);
    try { navigator.vibrate?.(5); } catch {}
  };
  const move = (e: React.PointerEvent) => {
    if (!last.current || !pen.current) return;
    e.preventDefault();
    const p = pt(e);
    pen.current.seg(last.current, p);
    add(p);
    last.current = p;
  };
  const up = () => { last.current = null; pen.current = null; cur.current = null; };
  const undo = () => { const h = hist.current.pop(); if (!h) return; rec.current = h; redraw(); setCanUndo(hist.current.length > 0); };
  const clear = () => { hist.current.push(rec.current.slice()); rec.current = []; redraw(); setCanUndo(true); };
  const onShare = () => {
    const strokes = toStrokes(rec.current);
    const copy = document.createElement('canvas');
    copy.width = cv.current!.width; copy.height = cv.current!.height;
    copy.getContext('2d')!.drawImage(cv.current!, 0, 0);
    share({
      recipe: strokes.length ? { v: 1, type: 'mehendi', data: { strokes } } : null,
      art: copy, filename: 'my-mehendi', heading: 'Share your mehendi', kicker: 'My Mehendi',
      title: (m) => (m ? `${m}'s mehendi` : 'My mehendi'), body: 'Drawn on one hand, mirrored onto the other.',
      cta: 'Now you try it', prompt: 'Show your mehendi design 🌿 #Rangotsav',
    });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Mehendi Hands" className="rg-tool" onKeyDown={onKey}>
      <div className="rg-tool__bar">
        <button ref={closeBtn} className="rg-x" onClick={onClose} aria-label="Close mehendi">×</button>
        <span className="rg-tool__title">Mehendi Hands</span>
        <button className="rg-btn rg-btn--primary" onClick={onShare}>Share</button>
      </div>
      <div ref={stage} className="rg-tool__stage">
        <canvas ref={cv} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ touchAction: 'none', border: `3px solid ${ink}`, boxShadow: `6px 6px 0 #000`, cursor: 'crosshair' }} aria-label="Mehendi canvas: two open palms. Drag on one to draw." role="img" />
        {!touched && <p className="rg-tool__hint">Drag on a palm. {mirror ? 'It mirrors onto the other hand.' : ''}</p>}
      </div>
      <div className="rg-tool__tray">
        <fieldset className="rg-fs"><legend className="rg-label">Colour</legend>
          <div className="rg-row">{HENNA.map(([l, c]) => <button key={c} className="rg-chip" aria-pressed={color === c} onClick={() => setColor(c)}><span className="rg-sw" style={{ background: c }} />{l}</button>)}</div>
        </fieldset>
        <fieldset className="rg-fs"><legend className="rg-label">Brush</legend>
          <div className="rg-row">{BRUSHES.map(([l, b]) => <button key={b} className="rg-chip" aria-pressed={brush === b} onClick={() => setBrush(b)}>{l}</button>)}</div>
        </fieldset>
        <fieldset className="rg-fs"><legend className="rg-label">Cone tip</legend>
          <div className="rg-row">{TIPS.map(([l, t]) => <button key={l} className="rg-chip" aria-pressed={tip === t} onClick={() => setTip(t)}>{l}</button>)}</div>
        </fieldset>
        <div className="rg-row">
          <button className="rg-chip" aria-pressed={mirror} onClick={() => setMirror((m) => !m)}>{mirror ? 'Mirror on' : 'Mirror off'}</button>
          <button className="rg-chip" onClick={undo} disabled={!canUndo} style={{ opacity: canUndo ? 1 : 0.45 }}>Undo</button>
          <button className="rg-chip" onClick={clear}>Wash hands</button>
        </div>
        <p className="rg-tool__fact" aria-live="polite"><b>Did you know?</b> {facts[fact]}</p>
      </div>
    </div>
  );
}
