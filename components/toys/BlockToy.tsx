'use client';
// Block Print Stamper: pick a carved block and an ink, tap the cloth to press it, or drag to
// print a row (a border). Each press is a little different (speckled block, random tilt and
// pressure). Repeat fills the whole cloth. "Try it on" shows the cloth sewn into a kurta or a bag.
// A tap shows the wooden block coming down, squashing onto the cloth and lifting away, with a
// fleck of ink and a thud; quick presses build a combo and the thud climbs.
import { useCallback, useEffect, useRef, useState } from 'react';
import ToyShell, { ToolBtn } from './ToyShell';
import Morph from './Morph';
import CultureStrip from './CultureStrip';
import ShareSheet, { type ShareRequest } from '../ShareSheet';
import { BloomIcon, UndoIcon } from './icons';
import { useElementSize } from '../../hooks/useElementSize';
import { C, INK, INKS } from '../../lib/art/palette';
import { BLOCK_TYPES, blockPress, drawBlock, drawGarment, makeStamp, paintFabric } from '../../lib/art/block';
import type { Recipe, Stamp } from '../../lib/recipe';
import { readRemix } from '../../lib/remix';
import { stamp } from '../../lib/progress';
import { track } from '../../lib/track';
import { flash } from '../../lib/toast';
import { buzz, chime, thump } from '../../lib/sfx';
import { GOLD_INK, newSeed, surpriseBlock } from '../../lib/art/generate';
import { useUnlocks, unlockHint } from '../../hooks/useUnlocks';
import { trail, type Trail } from '../../lib/trail';
import { calm, shake } from '../../lib/motion';
import { done } from '../../lib/challenges';
import s from './ToyShell.module.css';

type View = 'cloth' | 'kurta' | 'tote';
const BLOCKS: [string, string][] = [['paisley', 'Paisley'], ['lotus', 'Lotus'], ['elephant', 'Haathi'], ['butta', 'Butta'], ['mor', 'Mor'], ['chakra', 'Chakra'], ['bel', 'Bel border'], ['jaal', 'Jaal']];
const VIEWS: [View, string][] = [['cloth', 'Cloth'], ['kurta', 'Kurta'], ['tote', 'Tote bag']];

const copyOf = (cv: HTMLCanvasElement) => {
  const c = document.createElement('canvas');
  c.width = cv.width; c.height = cv.height;
  c.getContext('2d')!.drawImage(cv, 0, 0);
  return c;
};

// The wooden block seen from above, as it comes down: grain, bevelled edge and the round handle.
const sprites = new Map<number, HTMLCanvasElement>();
function blockSprite(px: number): HTMLCanvasElement {
  const key = Math.round(px / 8) * 8, hit = sprites.get(key);
  if (hit) return hit;
  const d = 2, S = key, cv = document.createElement('canvas');
  cv.width = cv.height = S * d;
  const x = cv.getContext('2d')!;
  x.scale(d, d);
  const m = S * 0.06, r = S * 0.08;
  x.fillStyle = '#B97A3E'; x.strokeStyle = INK; x.lineWidth = Math.max(2, S * 0.03);
  x.beginPath(); x.roundRect(m, m, S - 2 * m, S - 2 * m, r); x.fill(); x.stroke();
  x.strokeStyle = 'rgba(90,45,15,.45)'; x.lineWidth = Math.max(1, S * 0.012);
  for (let k = 1; k < 6; k++) { const y = m + ((S - 2 * m) * k) / 6; x.beginPath(); x.moveTo(m * 1.6, y); x.bezierCurveTo(S * 0.4, y - S * 0.03, S * 0.6, y + S * 0.03, S - m * 1.6, y); x.stroke(); }
  x.fillStyle = 'rgba(255,230,190,.25)'; x.beginPath(); x.roundRect(m * 1.6, m * 1.6, S - 3.2 * m, S * 0.12, r * 0.6); x.fill();
  x.fillStyle = '#8A4E22'; x.strokeStyle = INK; x.lineWidth = Math.max(2, S * 0.03);
  x.beginPath(); x.arc(S / 2, S / 2, S * 0.17, 0, Math.PI * 2); x.fill(); x.stroke();
  x.fillStyle = 'rgba(255,230,190,.35)'; x.beginPath(); x.arc(S / 2 - S * 0.05, S / 2 - S * 0.05, S * 0.06, 0, Math.PI * 2); x.fill();
  sprites.set(key, cv);
  return cv;
}

function BlockTile({ id }: { id: string }) {
  const ref = useCallback((el: HTMLCanvasElement | null) => {
    if (!el) return;
    const d = 2;
    el.width = el.height = 56 * d;
    const x = el.getContext('2d')!;
    x.scale(d, d); x.translate(28, 28); x.scale(0.5, 0.5);
    x.fillStyle = INK; x.strokeStyle = INK;
    drawBlock(x, id);
  }, [id]);
  return <canvas ref={ref} aria-hidden="true" style={{ width: 44, height: 44 }} />;
}

export default function BlockToy() {
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const gv = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const dim = useRef({ w: 0, h: 0 });
  const rec = useRef<Stamp[]>([]);
  const hist = useRef<{ img: HTMLCanvasElement; rec: Stamp[] }[]>([]);
  const variants = useRef<Record<string, HTMLCanvasElement[]>>({});
  const lastPress = useRef<{ x: number; y: number } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const ink$ = useRef<Trail | null>(null);
  const combo = useRef({ n: 0, t: 0 });
  const row = useRef(0); // presses in the current drag (a border)
  const { w, h } = useElementSize(stage);
  const unlocks = useUnlocks();

  const [block, setBlock] = useState('paisley');
  const [ink, setInk] = useState(C.indigo);
  const [size, setSize] = useState(96);
  const [repeat, setRepeat] = useState(false);
  const [view, setView] = useState<View>('cloth');
  const [canUndo, setCanUndo] = useState(false);
  const [box, setBox] = useState({ w: 300, h: 300 });
  const [share, setShare] = useState<ShareRequest | null>(null);

  // Fresh cloth, then every recorded press again (per-mille of the cloth width).
  const replay = useCallback(() => {
    const x = ctx.current, { w: W, h: H } = dim.current;
    if (!x) return;
    paintFabric(x, W, H);
    const cache = {};
    rec.current.forEach((st) => blockPress(x, W, H, st, cache));
  }, []);

  const dress = useCallback((v: View) => {
    const g = gv.current, c = cv.current, { w: W, h: H } = dim.current;
    if (!g || !c || v === 'cloth' || !W) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    g.width = Math.round(W * d); g.height = Math.round(H * d);
    const x = g.getContext('2d')!;
    x.setTransform(d, 0, 0, d, 0, 0);
    drawGarment(x, W, H, c, v);
  }, []);

  useEffect(() => {
    const el = cv.current;
    if (!el || !w || !h) return;
    const W = Math.max(200, Math.floor(w - 24)), H = Math.max(200, Math.floor(h - 60));
    if (Math.abs(W - dim.current.w) < 8 && Math.abs(H - dim.current.h) < 8) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    el.width = Math.round(W * d); el.height = Math.round(H * d);
    const x = el.getContext('2d')!;
    x.setTransform(d, 0, 0, d, 0, 0);
    ctx.current = x;
    dim.current = { w: W, h: H };
    hist.current = [];
    setCanUndo(false);
    setBox({ w: W, h: H });
    replay();
  }, [w, h, replay]);

  useEffect(() => { dress(view); }, [view, box, dress]);

  useEffect(() => {
    stamp('block');
    track('tool_open', { tool: 'block' });
    if (stage.current) ink$.current = trail(stage.current, 'chip');
    readRemix('block').then((r) => {
      if (r?.type !== 'block') return;
      rec.current = r.data.st.slice();
      replay();
      flash('Remixing! Add your own prints.');
    });
    return () => { ink$.current?.stop(); };
  }, [replay]);

  const snap = () => {
    if (!cv.current) return;
    hist.current.push({ img: copyOf(cv.current), rec: rec.current.slice() });
    if (hist.current.length > 10) hist.current.shift();
    setCanUndo(true);
  };
  const undo = () => {
    const x = ctx.current, prev = hist.current.pop();
    if (!x || !prev) return;
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'copy'; x.drawImage(prev.img, 0, 0); x.restore();
    rec.current = prev.rec;
    buzz(8);
    setCanUndo(hist.current.length > 0);
    dress(view);
  };

  const variant = (type: string, color: string, sz: number) => {
    const k = type + color + sz;
    const v = (variants.current[k] ??= [0, 1, 2].map(() => makeStamp(type, color, sz)));
    return v[Math.floor(Math.random() * v.length)];
  };
  const press = (px: number, py: number) => {
    const x = ctx.current;
    if (!x) return;
    const v = variant(block, ink, size);
    x.save();
    x.globalCompositeOperation = 'multiply';
    x.globalAlpha = 0.84 + Math.random() * 0.14;
    x.translate(px, py);
    x.rotate((Math.random() - 0.5) * 0.09);
    x.drawImage(v, -size * 0.6, -size * 0.6, size * 1.2, size * 1.2);
    x.restore();
  };
  // Records one press and prints it (the whole cloth if Repeat is on).
  const printAt = (px: number, py: number, rep: boolean) => {
    const W = dim.current.w, H = dim.current.h, u = (v: number) => Math.round((v / W) * 1000);
    if (rec.current.length < 600) {
      rec.current.push({ x: Math.max(-200, Math.min(1200, u(px))), y: Math.max(-200, Math.min(5200, u(py))), t: Math.max(0, BLOCK_TYPES.indexOf(block)), i: ink, z: Math.max(20, Math.min(800, u(size))), ...(rep ? { r: 1 as const } : {}) });
    } else if (rec.current.length === 600) flash('That cloth is full! Undo or start a fresh one.');
    if (!rep) { press(px, py); return; }
    const st = size * 1.08, ox = ((px % st) + st) % st, oy = ((py % st) + st) % st;
    let col = 0;
    for (let xx = ox - st; xx < W + st; xx += st, col++) {
      const off = col % 2 ? st / 2 : 0;
      for (let yy = oy - st - off; yy < H + st; yy += st) press(xx, yy);
    }
  };

  const local = (e: React.PointerEvent) => {
    const r = cv.current!.getBoundingClientRect(), k = dim.current.w / Math.max(1, r.width - 8);
    return { x: (e.clientX - r.left - 4) * k, y: (e.clientY - r.top - 4) * k };
  };
  // The block on its way down: lands (prints), squashes, then lifts off with a tilt. Returns how
  // long until it lands, so the print can wait for it.
  const pressFx = (cx: number, cy: number): number => {
    const host = wrap.current, c = cv.current;
    if (!host || !c || calm()) return 0;
    const r = c.getBoundingClientRect(), k = (r.width - 8) / dim.current.w, z = size * 1.08 * k;
    const el = blockSprite(z * 1.4).cloneNode() as HTMLCanvasElement;
    el.getContext('2d')!.drawImage(blockSprite(z * 1.4), 0, 0);
    el.setAttribute('aria-hidden', 'true');
    Object.assign(el.style, { position: 'absolute', left: `${cx - r.left}px`, top: `${cy - r.top}px`, width: `${z}px`, height: `${z}px`, pointerEvents: 'none', zIndex: '3', filter: 'drop-shadow(5px 7px 0 rgba(27,20,16,.35))' });
    host.appendChild(el);
    const at = (offset: number, y: number, sc: string, rot: number, o = 1) => ({ offset, transform: `translate(-50%, -50%) translateY(${y}px) scale(${sc}) rotate(${rot}deg)`, opacity: o });
    // lands 115ms in (when the print appears), squashes, then lifts away with a tilt
    el.animate([at(0, -z * 0.5, '1.2', -8, 0), at(0.12, -z * 0.12, '1.06', -3), at(0.205, 0, '1', -1), at(0.32, 0, '1.05, .9', 0), at(0.6, -z * 0.25, '1.08', 7, 0.95), at(1, -z * 0.6, '1.16', 15, 0)], { duration: 560, easing: 'ease-out' })
      .finished.then(() => el.remove(), () => el.remove());
    return 115;
  };
  // A floating "×5" for a run of quick presses.
  const comboTag = (cx: number, cy: number, n: number) => {
    const host = wrap.current, c = cv.current;
    if (!host || !c || calm()) return;
    const r = c.getBoundingClientRect(), el = document.createElement('span');
    el.setAttribute('aria-hidden', 'true');
    el.textContent = `×${n}${n >= 8 ? ' वाह!' : ''}`;
    Object.assign(el.style, { position: 'absolute', left: `${cx - r.left}px`, top: `${cy - r.top}px`, zIndex: '4', pointerEvents: 'none', padding: '2px 8px', background: '#FFC21A', color: '#1B1410', border: '2px solid #1B1410', boxShadow: '2px 2px 0 #1B1410', font: "800 15px/1.2 Sarpanch, sans-serif", whiteSpace: 'nowrap' });
    host.appendChild(el);
    el.animate([{ transform: 'translate(-50%, -60%) scale(.4)', opacity: 0 }, { transform: 'translate(-50%, -150%) scale(1.15)', opacity: 1, offset: 0.25 }, { transform: 'translate(-50%, -230%) scale(1)', opacity: 0 }], { duration: 760, easing: 'ease-out' }).finished.then(() => el.remove(), () => el.remove());
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (view !== 'cloth') { setView('cloth'); return; }
    try { cv.current!.setPointerCapture(e.pointerId); } catch {}
    snap();
    const p = local(e), cx = e.clientX, cy = e.clientY, now = performance.now();
    // quick presses in a row build a combo; the thud climbs with it
    combo.current = now - combo.current.t < 480 ? { n: combo.current.n + 1, t: now } : { n: 1, t: now };
    const n = combo.current.n;
    row.current = 1;
    lastPress.current = repeat ? null : p;
    const land = () => {
      buzz(12);
      thump(repeat, 1 + Math.min(n - 1, 10) * 0.06);
      if (repeat) chime(3, 3);
      printAt(p.x, p.y, repeat);
      ink$.current?.burst(cx, cy, ink, repeat ? 6 : 10);
      shake(stage.current, repeat || size >= 120 ? 3 : 1.6, 200);
      if (n >= 3) comboTag(cx, cy, n);
      if (n === 8) done('block-combo');
    };
    const wait = repeat ? 0 : pressFx(cx, cy);
    if (wait) setTimeout(land, wait); else land();
  };
  // Dragging prints a row, one block-width apart: borders and stripes.
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const l = lastPress.current;
    if (!l) return;
    const p = local(e), gap = size * 1.04, d = Math.hypot(p.x - l.x, p.y - l.y);
    if (d < gap) return;
    const n = Math.floor(d / gap);
    for (let k = 1; k <= n; k++) {
      const q = { x: l.x + ((p.x - l.x) * gap * k) / d, y: l.y + ((p.y - l.y) * gap * k) / d };
      printAt(q.x, q.y, false);
      lastPress.current = q;
    }
    thump(false);
    buzz(8);
    ink$.current?.burst(e.clientX, e.clientY, ink, 5);
    if ((row.current += n) >= 5) done('block-row');
  };
  const up = () => { lastPress.current = null; dress(view); };

  // Surprise me: a seeded dupatta (an all-over repeat plus a few big accent blocks).
  const surprise = () => {
    const x = ctx.current, { w: W, h: H } = dim.current;
    if (!x) return;
    setView('cloth');
    snap();
    const inks = [...INKS.map(([, c]) => c), ...(unlocks.goldink ? [GOLD_INK[1]] : [])];
    const st = surpriseBlock(newSeed(), Math.round((H / W) * 1000), inks, BLOCK_TYPES.length);
    const cache = {};
    st.forEach((one, k) => setTimeout(() => { blockPress(x, W, H, one, cache); thump(k === 0); }, k * 140));
    rec.current.push(...st);
    chime(5, 4);
    track('surprise', { tool: 'block' });
  };

  const wash = () => {
    if (!ctx.current) return;
    snap();
    rec.current = [];
    paintFabric(ctx.current, dim.current.w, dim.current.h);
    setView('cloth');
    flash('Fresh cloth. Undo brings the old one back.');
  };

  const onShare = () => {
    if (!cv.current) return;
    const a = Math.round((dim.current.h / dim.current.w) * 1000);
    const recipe: Recipe | null = rec.current.length && a >= 200 && a <= 5000 ? { v: 1, type: 'block', data: { a, st: rec.current.slice() } } : null;
    const art = view !== 'cloth' && gv.current ? copyOf(gv.current) : copyOf(cv.current);
    setShare({
      recipe, art, filename: view === 'cloth' ? 'my-block-print' : `my-block-print-${view}`, heading: view === 'cloth' ? 'Share your cloth' : `Share your ${view === 'kurta' ? 'kurta' : 'tote bag'}`, kicker: 'My Block Print',
      title: (m) => (m ? `${m}'s block print` : 'Printed by me'), body: 'Hand-pressed, so no two stamps are ever alike.',
      cta: 'Now you print one', prompt: 'Print your own cloth 🌸 #Rangotsav',
    });
  };

  return (
    <>
      <ToyShell
        toy="block" label="Block Print Stamper" title="Block Print" sub={<span lang="hi">ठप्पा</span>} stageRef={stage} onUndo={undo}
        caption={view !== 'cloth' ? 'Tap to go back to the cloth' : repeat ? 'Tap once to fill the whole cloth' : 'Tap to press · drag to print a row'}
        stage={
          <Morph id="block">
            <div ref={wrap} style={{ position: 'relative', lineHeight: 0 }}>
              <canvas ref={cv} className={s.canvas} style={{ width: box.w, height: box.h, cursor: 'copy' }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Cotton cloth: tap to stamp" />
              <canvas ref={gv} aria-hidden={view === 'cloth'} role="img" aria-label={`Your print as a ${view}`} onPointerDown={() => setView('cloth')}
                style={{ position: 'absolute', inset: 4, width: 'calc(100% - 8px)', height: 'calc(100% - 8px)', opacity: view === 'cloth' ? 0 : 1, pointerEvents: view === 'cloth' ? 'none' : 'auto', transition: 'opacity .3s', cursor: 'pointer' }} />
            </div>
          </Morph>
        }
        actions={<>
          <ToolBtn icon={<UndoIcon />} label="Undo" onClick={undo} disabled={!canUndo} />
          <ToolBtn icon="🧺" label="Fresh" onClick={wash} title="A fresh cloth" />
          <ToolBtn icon="✨" label="Surprise" onClick={surprise} title="Surprise me" />
          <ToolBtn icon={<BloomIcon />} label="Share" onClick={onShare} go className="rg-bloom" />
        </>}
      >
        <div className={s.seg} role="group" aria-label="Try it on">
          {VIEWS.map(([v, l]) => <button key={v} aria-pressed={view === v} onClick={() => { setView(v); if (v !== 'cloth') { buzz(6); track('surprise', { tool: 'block-' + v }); } if (v === 'kurta' && rec.current.length) done('block-kurta'); }}>{l}</button>)}
        </div>
        <div className={s.field}>
          <span className={s.label}>Carved block</span>
          <div role="group" aria-label="Carved block" className={s.row}>
            {BLOCKS.map(([id, l]) => (
              <button key={id} className={s.opt} style={{ minHeight: 78, minWidth: 82, fontSize: 12 }} aria-pressed={block === id} onClick={() => { setBlock(id); setView('cloth'); }}>
                <BlockTile id={id} />{l}
              </button>
            ))}
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Ink</span>
          <div role="group" aria-label="Ink" className={s.swatches}>
            {INKS.map(([l, c]) => <button key={c} className={s.swatch} style={{ background: c }} aria-pressed={ink === c} aria-label={l} onClick={() => setInk(c)} />)}
            {unlocks.goldink
              ? <button className={s.swatch} style={{ background: `radial-gradient(circle at 35% 30%, #FFE79A, ${GOLD_INK[1]} 60%, #6E5212)` }} aria-pressed={ink === GOLD_INK[1]} aria-label={GOLD_INK[0]} onClick={() => setInk(GOLD_INK[1])} />
              : <button className={`${s.swatch} ${s.locked}`} style={{ background: GOLD_INK[1] }} aria-label={`${GOLD_INK[0]}, locked. ${unlockHint('goldink')}`} onClick={() => flash(unlockHint('goldink'))} />}
          </div>
        </div>
        <div className={s.spread}>
          <label className={s.range}>
            <span className={s.label}><span>Block size</span><span>{size}px</span></span>
            <input type="range" min={48} max={160} step={8} value={size} onChange={(e) => setSize(+e.target.value)} />
          </label>
          <button className={s.toggle} aria-pressed={repeat} onClick={() => setRepeat((r) => !r)}>{repeat ? 'Repeat on' : 'Repeat off'}</button>
        </div>
        <CultureStrip art="block" />
      </ToyShell>
      <ShareSheet req={share} onClose={() => setShare(null)} />
    </>
  );
}
