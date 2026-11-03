'use client';
// Bandhani: tie knots into the cloth, dip it, and untie to find the dots. Tie more knots after a
// dip and dip again in a darker dye for two- and three-colour dots, the way a real odhni is made
// (lightest dye first). See lib/art/bandhani.ts. Dye drips off the cloth after a dip, knots pop
// open with bits of thread, and the opened cloth flutters as if hung out to dry.
import { useCallback, useEffect, useRef, useState } from 'react';
import ToyShell, { ToolBtn } from './ToyShell';
import Morph from './Morph';
import CultureStrip from './CultureStrip';
import ShareSheet, { type ShareRequest } from '../ShareSheet';
import { BloomIcon, UndoIcon } from './icons';
import { useElementSize } from '../../hooks/useElementSize';
import { DYES, drawBandhani, decodeRounds, KNOT, MOTIFS, mirrored, surpriseBandhani, type Round } from '../../lib/art/bandhani';
import { encodePts, type Recipe } from '../../lib/recipe';
import { readRemix } from '../../lib/remix';
import { stamp } from '../../lib/progress';
import { track } from '../../lib/track';
import { flash } from '../../lib/toast';
import { buzz, chime, chord, pluck, whoosh } from '../../lib/sfx';
import { petalBurst } from '../../lib/fx';
import { newSeed } from '../../lib/art/generate';
import { trail, type Trail } from '../../lib/trail';
import { calm } from '../../lib/motion';
import { done } from '../../lib/challenges';
import s from './ToyShell.module.css';

type Phase = 'tie' | 'busy' | 'open';
type Snap = { rounds: Round[]; tying: number[]; phase: Phase; z: number };
const SYMS: [number, string][] = [[1, 'None'], [2, '2'], [4, '4'], [8, '8']];
const SIZES: [number, string][] = [[1, 'Fine'], [2, 'Medium'], [3, 'Bold']];
const MAX_KNOTS = 2000;
// a darker shade of a dye, for the drips running down a cloth of that same colour
const deeper = (hex: string) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * 0.62).toString(16).padStart(2, '0')).join('');

function MotifChip({ pts }: { pts: [number, number][] }) {
  return (
    <svg aria-hidden="true" viewBox="-2 -2 4 4" style={{ width: 28, height: 28 }}>
      {pts.map(([x, y], i) => <rect key={i} x={(x * 0.9 - 0.42).toFixed(3)} y={(y * 0.9 - 0.42).toFixed(3)} width=".84" height=".84" rx=".34" fill="#C42330" />)}
    </svg>
  );
}

export default function BandhaniToy() {
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const side = useRef(0);
  const rounds = useRef<Round[]>([]);
  const tying = useRef<number[]>([]);
  const born = useRef<number[]>([]);
  const hist = useRef<Snap[]>([]);
  const raf = useRef(0);
  const last = useRef<{ x: number; y: number } | null>(null);
  const drips = useRef<Trail | null>(null);
  const bits = useRef<Trail | null>(null);
  const motifs = useRef(new Set<number>()); // knot patterns used on this cloth
  const wrap = useRef<HTMLDivElement>(null);
  const { w, h } = useElementSize(stage);

  const [phase, setPhase] = useState<Phase>('tie');
  const [dye, setDye] = useState(0);
  const [z, setZ] = useState(2);
  const [sym, setSym] = useState(4);
  const [motif, setMotif] = useState(0);
  const [info, setInfo] = useState({ dips: 0, knots: 0 });
  const [canUndo, setCanUndo] = useState(false);
  const [px, setPx] = useState(300);
  const [share, setShare] = useState<ShareRequest | null>(null);
  const zr = useRef(z);
  zr.current = z;
  const ph = useRef(phase);
  ph.current = phase;

  const sync = () => setInfo({ dips: rounds.current.length, knots: tying.current.length / 2 });

  // At rest: the dipped rounds plus the knots tied since, or the opened cloth.
  const paint = useCallback(() => {
    const x = ctx.current, S = side.current;
    // a dip or an untie is animating and owns the canvas until it finishes
    if (!x || !S || ph.current === 'busy') return;
    cancelAnimationFrame(raf.current);
    const R = rounds.current;
    if (ph.current === 'open') { drawBandhani(x, S, R, zr.current, { dips: R.length, tied: R.length, open: 1 }); return; }
    const frame = () => {
      const now = performance.now();
      let busy = false;
      drawBandhani(x, S, [...R, { c: '#000000', pts: tying.current }], zr.current, {
        dips: R.length, tied: R.length + 1,
        show: (r, i) => {
          if (r < R.length) return 1;
          const t = Math.min(1, (now - (born.current[i] ?? 0)) / 220);
          if (t < 1) busy = true;
          return t;
        },
      });
      if (busy) raf.current = requestAnimationFrame(frame);
    };
    frame();
  }, []);

  useEffect(() => {
    const el = cv.current;
    if (!el || !w || !h) return;
    const S = Math.max(220, Math.floor(Math.min(w - 28, h - 28 - 26)));
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

  useEffect(() => { paint(); }, [z, phase, paint]);

  useEffect(() => {
    stamp('bandhani');
    track('tool_open', { tool: 'bandhani' });
    if (stage.current) { drips.current = trail(stage.current, 'drop'); bits.current = trail(stage.current, 'chip'); }
    readRemix('bandhani').then((r) => {
      if (r?.type !== 'bandhani') return;
      rounds.current = decodeRounds(r.data);
      tying.current = []; born.current = [];
      setZ(r.data.z); zr.current = r.data.z;
      setPhase('tie'); ph.current = 'tie';
      sync(); paint();
      flash('Remixing! Untie it, or tie more and dip again.');
    });
    return () => { cancelAnimationFrame(raf.current); drips.current?.stop(); bits.current?.stop(); };
  }, [paint]);

  const recipe = useCallback((): Recipe | null => (rounds.current.length
    ? { v: 1, type: 'bandhani', data: { z: zr.current, r: rounds.current.map((r) => ({ c: r.c, p: encodePts(r.pts) })) } }
    : null), []);
  const snap = () => {
    hist.current.push({ rounds: rounds.current.map((r) => ({ c: r.c, pts: r.pts.slice() })), tying: tying.current.slice(), phase: ph.current, z: zr.current });
    if (hist.current.length > 30) hist.current.shift();
    setCanUndo(true);
  };
  const undo = () => {
    if (ph.current === 'busy') return;
    const prev = hist.current.pop();
    if (!prev) return;
    rounds.current = prev.rounds; tying.current = prev.tying; born.current = prev.tying.map(() => 0);
    setZ(prev.z); zr.current = prev.z;
    setPhase(prev.phase); ph.current = prev.phase;
    sync(); paint();
    buzz(8);
    setCanUndo(hist.current.length > 0);
  };

  const total = () => rounds.current.reduce((a, r) => a + r.pts.length / 2, 0) + tying.current.length / 2;
  const unit = (e: React.PointerEvent) => {
    const b = cv.current!.getBoundingClientRect(), k = 2000 / (b.width - 8);
    return { x: (e.clientX - b.left - 4) * k - 1000, y: (e.clientY - b.top - 4) * k - 1000 };
  };
  // Ties one knot cluster (and its mirror copies), skipping spots that already have a knot.
  const tie = (p: { x: number; y: number }) => {
    const kr = KNOT[zr.current], gap = kr * 2.6, now = performance.now(), t = tying.current;
    let added = 0;
    for (const [mx, my] of MOTIFS[motif].pts) {
      for (const [x, y] of mirrored(p.x + mx * gap, p.y + my * gap, sym)) {
        if (Math.abs(x) > 985 || Math.abs(y) > 985 || total() >= MAX_KNOTS) continue;
        let near = false;
        for (let i = 0; i < t.length && !near; i += 2) near = Math.hypot(t[i] - x, t[i + 1] - y) < kr * 1.7;
        if (near) continue;
        t.push(Math.round(x), Math.round(y));
        born.current.push(now + added * 12);
        added++;
      }
    }
    if (added) {
      pluck(4 + Math.floor(Math.random() * 6), 0.55); buzz(6); sync(); paint();
      motifs.current.add(motif);
      if (motifs.current.size >= 3) done('bandhani-motifs');
      if (total() >= 300) done('bandhani-knots');
    }
    if (total() >= MAX_KNOTS) flash('That cloth is full of knots!');
  };
  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    if (ph.current === 'busy') return;
    if (ph.current === 'open') { flash('Tap "Tie it again" to keep going.'); return; }
    if (rounds.current.length >= 3) { flash('Three dips is plenty! Untie it to see the colours.'); return; }
    try { cv.current!.setPointerCapture(e.pointerId); } catch {}
    snap();
    const p = unit(e);
    last.current = p;
    tie(p);
  };
  const move = (e: React.PointerEvent) => {
    if (!last.current) return;
    const p = unit(e), sp = KNOT[zr.current] * (MOTIFS[motif].pts.length > 1 ? 7 : 3.2);
    if (Math.hypot(p.x - last.current.x, p.y - last.current.y) < sp) return;
    last.current = p;
    tie(p);
  };
  const up = () => { last.current = null; };

  // Lower the cloth into the dye vat: the colour climbs up the cloth, then the knots are kept.
  const dip = (col = DYES[dye][1], then?: () => void) => {
    const x = ctx.current, S = side.current;
    if (!x || !S || ph.current === 'busy') return;
    if (!tying.current.length && !rounds.current.length) { flash('Tie a few knots first: tap the cloth.'); return; }
    if (rounds.current.length >= 3) return;
    snap();
    setPhase('busy'); ph.current = 'busy';
    whoosh(0.9, 300, 900, 0.14);
    buzz([10, 40, 20]);
    const pending: Round = { c: col, pts: tying.current.slice() }, R = rounds.current, t0 = performance.now();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frame = (now: number) => {
      const k = reduce ? 1 : Math.min(1, (now - t0) / 1100);
      drawBandhani(x, S, [...R, pending], zr.current, { dips: R.length, tied: R.length + 1, wave: 1 - (1 - k) ** 2 });
      if (k < 1) { raf.current = requestAnimationFrame(frame); return; }
      rounds.current = [...R, pending];
      tying.current = []; born.current = [];
      setPhase('tie'); ph.current = 'tie';
      sync(); paint();
      pluck(2, 0.7);
      if (rounds.current.length >= 3) done('bandhani-three');
      // the cloth comes out of the vat dripping
      const r = cv.current?.getBoundingClientRect();
      if (r && !calm()) for (let k = 0; k < 22; k++) setTimeout(() => drips.current?.emit(r.left + 12 + Math.random() * (r.width - 24), r.top + r.height * (0.55 + Math.random() * 0.35), 0, deeper(col)), k * 70);
      if (then) then();
      else flash(rounds.current.length < 3 ? 'Dyed! Untie it now, or tie more knots for a second colour.' : 'Dyed! Now untie the knots.');
    };
    raf.current = requestAnimationFrame(frame);
  };

  // Untie: knots open from the centre outwards, each with a soft pop.
  const untie = (quick = false) => {
    const x = ctx.current, S = side.current, R = rounds.current;
    if (!x || !S || !R.length || ph.current === 'busy') return;
    if (tying.current.length) { flash('Dip your new knots first (or undo them).'); return; }
    snap();
    setPhase('busy'); ph.current = 'busy';
    const t0 = performance.now(), reduce = quick || matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastPop = 0;
    const finish = () => {
      setPhase('open'); ph.current = 'open';
      paint();
      chord();
      const r = cv.current?.getBoundingClientRect();
      if (r && !quick) petalBurst(r.left + r.width / 2, r.top + r.height / 2, 36);
      // hung out to dry: the cloth flutters a little
      if (!quick && !calm()) wrap.current?.animate([{ transform: 'none' }, { transform: 'skewX(-3deg) translateX(3px)' }, { transform: 'skewX(2.5deg) translateX(-2px)' }, { transform: 'skewX(-1.5deg)' }, { transform: 'none' }], { duration: 1400, easing: 'ease-in-out' });
      track('surprise', { tool: 'bandhani-untie' });
    };
    if (reduce) { finish(); return; }
    const box = cv.current?.getBoundingClientRect();
    const frame = (now: number) => {
      const k = Math.min(1, (now - t0) / 1500);
      drawBandhani(x, S, R, zr.current, { dips: R.length, tied: R.length, open: k });
      if (now - lastPop > 70 && k < 1) {
        lastPop = now; pluck(3 + Math.floor(k * 9), 0.45);
        // a knot pops open somewhere on the widening ring, flicking off bits of thread
        if (box) { const a = Math.random() * Math.PI * 2, d = k * box.width * 0.5; bits.current?.burst(box.left + box.width / 2 + Math.cos(a) * d, box.top + box.height / 2 + Math.sin(a) * d, '#FBF3E4', 4); }
      }
      if (k < 1) raf.current = requestAnimationFrame(frame); else finish();
    };
    raf.current = requestAnimationFrame(frame);
  };
  const retie = () => { snap(); setPhase('tie'); ph.current = 'tie'; paint(); };
  const fresh = () => {
    if (ph.current === 'busy') return;
    snap();
    motifs.current.clear();
    rounds.current = []; tying.current = []; born.current = [];
    setPhase('tie'); ph.current = 'tie';
    sync(); paint();
    flash('A fresh white cloth. Undo brings the old one back.');
  };

  // Surprise me: a two-dip odhni, tied and dyed in front of you; untying is left to you.
  const surprise = () => {
    if (ph.current === 'busy') return;
    snap();
    const sp = surpriseBandhani(newSeed());
    setZ(sp.z); zr.current = sp.z;
    rounds.current = [];
    tying.current = sp.rounds[0].pts.slice(); born.current = tying.current.map((_, i) => performance.now() + i * 3);
    setPhase('tie'); ph.current = 'tie';
    sync(); paint();
    chime(4, 4);
    track('surprise', { tool: 'bandhani' });
    setTimeout(() => dip(sp.rounds[0].c, () => {
      tying.current = sp.rounds[1].pts.slice(); born.current = tying.current.map((_, i) => performance.now() + i * 2);
      sync(); paint();
      setTimeout(() => dip(sp.rounds[1].c, () => flash('Tied and dyed twice. Now untie it! ✨')), 900);
    }), 900);
  };

  const onShare = () => {
    if (ph.current === 'busy') return;
    if (!rounds.current.length) { flash('Dip it in dye first, then untie it to see your pattern.'); return; }
    if (tying.current.length) { flash('Dip your new knots first (or undo them).'); return; }
    if (ph.current !== 'open') untie(true);
    const r = recipe();
    if (r?.type !== 'bandhani' || !cv.current) return;
    const copy = document.createElement('canvas');
    copy.width = cv.current.width; copy.height = cv.current.height;
    copy.getContext('2d')!.drawImage(cv.current, 0, 0);
    const dots = rounds.current.reduce((a, x) => a + x.pts.length / 2, 0);
    setShare({
      recipe: r, art: copy, filename: 'my-bandhani', heading: 'Share your bandhani', kicker: `My Bandhani · ${dots} knots · ${rounds.current.length} dip${rounds.current.length > 1 ? 's' : ''}`,
      title: (m) => (m ? `${m}'s bandhani` : 'Tied and dyed by me'), body: 'Every dot is a knot, tied by hand before the dye.',
      cta: 'Now you tie one', prompt: 'Tie and dye your own bandhani 🧣 #Rangotsav',
    });
  };

  const { dips, knots } = info;
  const step = phase === 'open' ? 3 : knots > 0 ? 2 : dips > 0 ? 3 : 1;
  const [dyeName] = DYES[dye];
  const main = phase === 'open'
    ? <button className={s.surprise} onClick={retie}>↺ Tie it again</button>
    : knots > 0
      ? <button className={`${s.btn} ${s.primary}`} style={{ width: '100%', flex: 'none' }} onClick={() => dip()} disabled={phase === 'busy'}><span aria-hidden="true" className="rg-sw" style={{ background: DYES[dye][1], width: 22, height: 22 }} />Dip in {dyeName}</button>
      : dips > 0
        ? <button className={`${s.btn} ${s.primary}`} style={{ width: '100%', flex: 'none' }} onClick={() => untie()} disabled={phase === 'busy'}>✨ Untie the knots</button>
        : <button className={s.surprise} disabled style={{ opacity: 0.7, cursor: 'default' }}>Tap the cloth to tie knots</button>;

  return (
    <>
      <ToyShell
        toy="bandhani" label="Bandhani tie and dye" title="Bandhani" sub={<span lang="hi">बांधणी</span>} stageRef={stage} onUndo={undo}
        caption={phase === 'open' ? `${rounds.current.reduce((a, r) => a + r.pts.length / 2, 0)} dots in ${dips + 1} colours` : knots ? `${knots} knots tied · ready to dip` : dips ? `Dipped ${dips}× · untie, or tie more knots` : 'Tap or drag on the cloth to tie knots'}
        stage={
          <Morph id="bandhani">
            <div ref={wrap} style={{ position: 'relative', lineHeight: 0, transformOrigin: '50% 0' }}>
              <canvas ref={cv} className={s.canvas} style={{ width: px, height: px, cursor: phase === 'tie' ? 'cell' : 'default' }} aria-label="Cloth: tap to tie knots"
                onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
              {!knots && !dips && <div aria-hidden="true" className={s.hint}><div><i /><b>Tap to tie a knot</b></div></div>}
            </div>
          </Morph>
        }
        actions={<>
          <ToolBtn icon={<UndoIcon />} label="Undo" onClick={undo} disabled={!canUndo || phase === 'busy'} />
          <ToolBtn icon="🧺" label="Fresh" onClick={fresh} title="A fresh white cloth" />
          <ToolBtn icon="✨" label="Surprise" onClick={surprise} title="Surprise me" />
          <ToolBtn icon={<BloomIcon />} label="Share" onClick={onShare} go className="rg-bloom" />
        </>}
      >
        <ol className={s.steps} aria-label="Steps">
          {['Tie', 'Dip', 'Untie'].map((t, i) => <li key={t} aria-current={step === i + 1 ? 'step' : undefined}>{t}</li>)}
        </ol>
        {main}
        <div className={s.field}>
          <span className={s.label}>Dye · {dyeName}{dips > 0 && phase !== 'open' ? ' (darker dyes cover lighter ones)' : ''}</span>
          <div role="group" aria-label="Dye" className={s.swatches}>
            {DYES.map(([n, c], i) => <button key={c} className={s.swatch} style={{ background: c }} aria-pressed={dye === i} aria-label={n} onClick={() => setDye(i)} />)}
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Knots</span>
          <div role="group" aria-label="Knot pattern" className={s.row}>
            {MOTIFS.map((m, i) => <button key={m.id} className={s.opt} style={{ fontSize: 12, minWidth: 84 }} aria-pressed={motif === i} onClick={() => setMotif(i)}><MotifChip pts={m.pts} />{m.label}</button>)}
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Mirror · knot size</span>
          <div className={s.row}>
            {SYMS.map(([n, l]) => <button key={n} className={s.opt} style={{ fontSize: 15, minWidth: 54 }} aria-pressed={sym === n} onClick={() => setSym(n)}>{l}</button>)}
            {SIZES.map(([n, l]) => <button key={n} className={s.opt} style={{ fontSize: 13, minWidth: 72 }} aria-pressed={z === n} disabled={dips > 0 || knots > 0} onClick={() => setZ(n)}>{l}</button>)}
          </div>
        </div>
        <CultureStrip art="bandhani" />
      </ToyShell>
      <ShareSheet req={share} onClose={() => setShare(null)} />
    </>
  );
}
