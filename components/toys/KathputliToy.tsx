'use client';
// Kathputli: work a Rajasthani string puppet on its little stage. Drag anywhere to move the
// control bar (relative, so your finger never hides the puppet); swing it fast and the bar tips,
// so one hand flies up. Double-tap to make it jump; tap its head and it talks in the squeaky voice
// of the boli reed. Nacho brings in the dholak and the puppet dances on top of whatever you do.
// The bar's path is kept as you play (the last 8 seconds, or a 10-second Record), and that path
// is the recipe: the share page, wall and reel run the same string physics again
// (lib/art/kathputli.ts), so the puppet swings there just as it did here.
import { useCallback, useEffect, useRef, useState } from 'react';
import ToyShell, { ToolBtn } from './ToyShell';
import Morph from './Morph';
import CultureStrip from './CultureStrip';
import ShareSheet, { type ShareRequest } from '../ShareSheet';
import { BloomIcon } from './icons';
import { useElementSize, fitSquare } from '../../hooks/useElementSize';
import { BACKDROPS, clampX, clampY, dancePose, drawKathputli, fromInts, newRig, PUPPETS, RATE, REST, sampleAt, stepRig, toInts, type Rig, type Sample } from '../../lib/art/kathputli';
import { decodePts, encodePts, SHOW_MAX, type Recipe } from '../../lib/recipe';
import { queryParam, readRemix } from '../../lib/remix';
import { stamp } from '../../lib/progress';
import { track } from '../../lib/track';
import { cheer, flash } from '../../lib/toast';
import { boli, buzz, dholak, jingle, taaliyan, thump, whoosh } from '../../lib/sfx';
import { firstVisit, ghostStroke } from '../../lib/ghost';
import { trail, type Trail } from '../../lib/trail';
import { done } from '../../lib/challenges';
import { calm } from '../../lib/motion';
import { say } from '../../lib/cheenti';
import s from './ToyShell.module.css';
import k from './KathputliToy.module.css';

const STEP = 1 / 60;
const RECORD = 10; // seconds in a recorded show
const KEEP = 8 * RATE; // the rolling show kept for Share when nothing was recorded
const GLYPH = ['👑', '💃', '🐍'];
const ease = (v: number) => v * v * (3 - 2 * v);

export default function KathputliToy() {
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const side = useRef(0);
  const rig = useRef<Rig>(newRig());
  const user = useRef({ x: REST.x, y: REST.y, a: 0 }); // where your hand holds the bar
  const drag = useRef<{ id: number; u: number; v: number; x: number; y: number; t: number; head: boolean } | null>(null);
  const lastTap = useRef({ t: 0, u: 0, v: 0 });
  const jumpAt = useRef(-1);
  const keysTilt = useRef(0);
  const curtain = useRef({ v: 0, to: 1 }); // 0 shut … 1 open
  const pendingWho = useRef<number | null>(null);
  const bubble = useRef({ text: '', until: 0 });
  const raf = useRef(0);
  const last = useRef(0);
  const acc = useRef(0);
  const clock = useRef(0); // simulated seconds
  const steps = useRef(0);
  const buffer = useRef<Sample[]>([]);
  const recording = useRef<Sample[] | null>(null);
  const replay = useRef<{ show: Sample[]; t: number } | null>(null); // a remix playing its show back
  const drum = useRef<{ stop: () => void } | null>(null);
  const nachoT0 = useRef(-1);
  const hip = useRef({ vy: 0, at: 0 });
  const dust = useRef<Trail | null>(null);
  const visible = useRef(true);
  const ghostEl = useRef<HTMLDivElement>(null);
  const ghost = useRef<(() => void) | null>(null);
  const remixing = useRef(false);
  const used = useRef(new Set<number>());
  const { w, h } = useElementSize(stage);

  const [who, setWho] = useState(1);
  const [bg, setBg] = useState(0);
  const [open, setOpen] = useState(true);
  const [nacho, setNacho] = useState(false);
  const [recLeft, setRecLeft] = useState(0); // seconds left in a recording, 0 when not recording
  const [touched, setTouched] = useState(false);
  const [px, setPx] = useState(300);
  const [share, setShare] = useState<ShareRequest | null>(null);
  const whoRef = useRef(who);
  whoRef.current = who;
  const bgRef = useRef(bg);
  bgRef.current = bg;

  const speak = useCallback((line?: string) => {
    bubble.current = { text: line ?? PUPPETS[whoRef.current].line, until: performance.now() + 1800 };
    boli(3 + Math.floor(Math.random() * 3));
  }, []);

  // One fixed physics step towards where the bar should be right now.
  const step = useCallback(() => {
    const t = clock.current, u = user.current;
    let tx = u.x, ty = u.y, ta = u.a + keysTilt.current;
    const rp = replay.current;
    if (rp) {
      const c = sampleAt(rp.show, rp.t);
      tx = c.x; ty = c.y; ta = c.a;
      rp.t += STEP;
      if (rp.t * RATE >= rp.show.length - 1) { replay.current = null; user.current = { x: c.x, y: c.y, a: 0 }; }
    } else if (nachoT0.current >= 0) {
      const d = dancePose(t - nachoT0.current);
      tx += d.x - REST.x; ty += d.y - REST.y; ta += d.a;
    }
    if (jumpAt.current >= 0) {
      const j = (t - jumpAt.current) / 0.36;
      if (j >= 1) jumpAt.current = -1; else ty -= 0.085 * Math.sin(Math.PI * j);
    }
    // a jump or a hop may lift the bar up behind the valance, where a puppeteer's hands really are
    tx = clampX(tx); ty = Math.max(0.02, Math.min(0.34, ty)); ta = Math.max(-1, Math.min(1, ta));
    const r = rig.current, y0 = r.p[5];
    stepRig(r, tx, ty, ta);
    // the puppet lands: its strings catch it with a jolt (a thud and its ankle bells)
    const vy = r.p[5] - y0, now = performance.now();
    if (hip.current.vy > 0.0025 && vy < hip.current.vy * 0.3 && r.p[5] > 0.64 && now - hip.current.at > 220) {
      hip.current.at = now;
      if (nachoT0.current < 0) thump(false, 1.5);
      jingle(nachoT0.current < 0 ? 5 : 3);
      const el = cv.current;
      if (el && dust.current && !calm()) {
        const b = el.getBoundingClientRect();
        dust.current.burst(b.left + 4 + r.p[4] * (b.width - 8), b.top + 4 + 0.84 * (b.height - 8), '#E0B27A', 8);
      }
    }
    hip.current.vy = vy;
    // keep the bar's path: 30 samples a second
    if (steps.current++ % 2 === 0) {
      const smp = { x: tx, y: ty, a: ta };
      const b = buffer.current;
      b.push(smp); if (b.length > KEEP) b.shift();
      const rec = recording.current;
      if (rec) {
        rec.push(smp);
        if (rec.length % RATE === 0) setRecLeft(Math.max(0, RECORD - rec.length / RATE));
      }
    }
    clock.current += STEP;
  }, []);

  const finishRecording = useRef<() => void>(() => {});

  const frame = useCallback((now: number) => {
    const x = ctx.current, S = side.current;
    if (!x || !S) { raf.current = 0; return; }
    const dt = Math.min(0.1, (now - (last.current || now)) / 1000);
    last.current = now;
    acc.current += dt;
    while (acc.current >= STEP) { step(); acc.current -= STEP; }
    if (recording.current && recording.current.length >= RECORD * RATE) finishRecording.current();
    // the curtain
    const c = curtain.current;
    if (c.v !== c.to) c.v = calm() ? c.to : c.to > c.v ? Math.min(c.to, c.v + dt / 0.9) : Math.max(c.to, c.v - dt / 0.7);
    if (c.v <= 0 && pendingWho.current != null) {
      setWho(pendingWho.current);
      whoRef.current = pendingWho.current;
      pendingWho.current = null;
      c.to = 1;
      whoosh(0.7, 300, 1400, 0.06);
    }
    const bub = bubble.current;
    drawKathputli(x, S, rig.current, whoRef.current, bgRef.current, { curtain: ease(c.v), t: clock.current, bubble: now < bub.until && c.v > 0.5 ? bub.text : undefined });
    raf.current = visible.current ? requestAnimationFrame(frame) : 0;
  }, [step]);
  const wake = useCallback(() => {
    if (!raf.current && visible.current) { last.current = 0; raf.current = requestAnimationFrame(frame); }
  }, [frame]);

  // Fit the square stage.
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
    wake();
    if (first && ghostEl.current && !remixing.current && firstVisit('kathputli')) {
      // a ghost hand works the bar: left, right, and a quick swing so a hand flies up
      const pts = Array.from({ length: 60 }, (_, i) => { const t = i / 59; return { x: Math.sin(t * Math.PI * 2) * S * 0.16, y: -S * 0.1 + Math.sin(t * Math.PI * 4) * S * 0.03 }; });
      ghost.current = ghostStroke(pts, ghostEl.current, S, 2400, (p) => {
        user.current = { x: clampX(0.5 + p.x / S), y: REST.y, a: 0 };
      }, () => { ghost.current = null; user.current = { x: REST.x, y: REST.y, a: 0 }; });
    }
  }, [w, h, wake]);

  useEffect(() => {
    stamp('kathputli');
    track('tool_open', { tool: 'kathputli' });
    used.current.add(1);
    if (stage.current) dust.current = trail(stage.current, 'dust');
    // the big moment: curtains part on the stage
    curtain.current = { v: calm() ? 1 : 0, to: 1 };
    const t = setTimeout(() => whoosh(0.9, 250, 1500, 0.06), 150);
    remixing.current = !!queryParam('remix');
    readRemix('kathputli').then((r) => {
      remixing.current = false;
      if (r?.type !== 'kathputli') return;
      ghost.current?.();
      const show = fromInts(decodePts(r.data.t) ?? []);
      if (show.length < 2) return;
      setBg(r.data.b); bgRef.current = r.data.b;
      setWho(r.data.p); whoRef.current = r.data.p; used.current.add(r.data.p);
      curtain.current = { v: calm() ? 1 : 0, to: 1 };
      replay.current = { show, t: 0 };
      setTouched(true);
      flash('Remixing! Watch the show, then take over the strings.');
    });
    const onVis = () => { visible.current = !document.hidden; if (visible.current) wake(); };
    document.addEventListener('visibilitychange', onVis);
    const io = stage.current && 'IntersectionObserver' in window ? new IntersectionObserver(([en]) => { visible.current = en.isIntersecting && !document.hidden; if (visible.current) wake(); }) : null;
    if (stage.current) io?.observe(stage.current);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf.current); raf.current = 0;
      drum.current?.stop();
      ghost.current?.();
      dust.current?.stop();
      document.removeEventListener('visibilitychange', onVis);
      io?.disconnect();
    };
  }, [wake]);

  // ---------- strings ----------
  const toUnits = (e: { clientX: number; clientY: number }) => {
    const b = cv.current!.getBoundingClientRect();
    return { u: (e.clientX - b.left - 4) / Math.max(1, b.width - 8), v: (e.clientY - b.top - 4) / Math.max(1, b.height - 8) };
  };
  const jump = () => {
    if (jumpAt.current >= 0) return;
    jumpAt.current = clock.current;
    whoosh(0.25, 600, 1800, 0.04);
    buzz(10);
  };
  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    ghost.current?.();
    replay.current = null;
    const { u, v } = toUnits(e), r = rig.current, now = performance.now();
    const head = Math.hypot(u - r.p[0], v - r.p[1]) < 0.07;
    drag.current = { id: e.pointerId, u, v, x: user.current.x, y: user.current.y, t: now, head };
    const lt = lastTap.current;
    if (now - lt.t < 320 && Math.hypot(u - lt.u, v - lt.v) < 0.1) { jump(); lastTap.current = { t: 0, u, v }; } else lastTap.current = { t: now, u, v };
    try { cv.current!.setPointerCapture(e.pointerId); } catch {}
    if (!touched) setTouched(true);
    wake();
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    e.preventDefault();
    const { u, v } = toUnits(e);
    user.current = { x: clampX(d.x + (u - d.u) * 1.1), y: clampY(d.y + (v - d.v) * 1.1), a: user.current.a };
  };
  const up = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const { u, v } = toUnits(e);
    // a tap on the head (not a drag): the puppet talks
    if (d.head && performance.now() - d.t < 300 && Math.hypot(u - d.u, v - d.v) < 0.02) speak();
  };
  const onKey = (e: React.KeyboardEvent) => {
    const u = user.current, m = 0.03;
    if (e.key === 'ArrowLeft') user.current = { ...u, x: clampX(u.x - m) };
    else if (e.key === 'ArrowRight') user.current = { ...u, x: clampX(u.x + m) };
    else if (e.key === 'ArrowUp') user.current = { ...u, y: clampY(u.y - m) };
    else if (e.key === 'ArrowDown') user.current = { ...u, y: clampY(u.y + m) };
    else if (e.key === ' ') jump();
    else if (e.key === 'q' || e.key === 'Q') keysTilt.current = -0.7;
    else if (e.key === 'e' || e.key === 'E') keysTilt.current = 0.7;
    else if (e.key === 'Enter') speak();
    else return;
    e.preventDefault();
    replay.current = null;
    if (!touched) setTouched(true);
    wake();
  };
  const onKeyUp = (e: React.KeyboardEvent) => { if ('qQeE'.includes(e.key)) keysTilt.current = 0; };

  // ---------- Nacho: the dholak starts and the puppet dances ----------
  const nachoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toggleNacho = () => {
    const on = !nacho;
    setNacho(on);
    clearTimeout(nachoTimer.current);
    drum.current?.stop(); drum.current = null;
    if (on) {
      replay.current = null;
      nachoT0.current = clock.current + 0.08;
      drum.current = dholak(104);
      nachoTimer.current = setTimeout(() => done('kathputli-nacho'), 4000);
      if (Math.random() < 0.5) speak('Nacho, nacho!');
    } else nachoT0.current = -1;
    buzz(8);
    wake();
  };
  useEffect(() => () => clearTimeout(nachoTimer.current), []);

  // ---------- puppets, backdrops, the curtain ----------
  const pickPuppet = (i: number) => {
    if (i === whoRef.current && pendingWho.current == null) return;
    pendingWho.current = i;
    curtain.current.to = 0;
    used.current.add(i);
    if (used.current.size >= PUPPETS.length) done('kathputli-all');
    buzz(6);
    wake();
    setTimeout(() => speak(PUPPETS[i].line), calm() ? 50 : 1700);
  };
  const toggleCurtain = () => {
    const o = !open;
    setOpen(o);
    curtain.current.to = o ? 1 : 0;
    whoosh(0.7, o ? 300 : 1400, o ? 1400 : 300, 0.06);
    if (o) setTimeout(() => taaliyan(1.2), 500);
    buzz(6);
    wake();
  };

  // ---------- record a show ----------
  const recipeFrom = (show: Sample[]): Extract<Recipe, { type: 'kathputli' }> | null => {
    if (show.length < 15) return null;
    const ints = toInts(show.slice(-SHOW_MAX)).map((v) => Math.max(-1000, Math.min(1000, v)));
    return { v: 1, type: 'kathputli', data: { p: whoRef.current, b: bgRef.current, t: encodePts(ints) } };
  };
  const openShare = (show: Sample[]) => {
    const r = recipeFrom(show);
    const S = side.current;
    if (!r || !S || !cv.current) { flash('Work the strings for a moment first!'); return; }
    // the card is the stage as it is now, curtains open
    const d = cv.current.width / S, copy = document.createElement('canvas');
    copy.width = copy.height = cv.current.width;
    const x = copy.getContext('2d')!;
    x.setTransform(d, 0, 0, d, 0, 0);
    drawKathputli(x, S, rig.current, whoRef.current, bgRef.current, { curtain: 1, t: clock.current, bubble: PUPPETS[whoRef.current].line });
    const secs = Math.round(show.slice(-SHOW_MAX).length / RATE);
    setShare({
      recipe: r, art: copy, filename: 'my-kathputli', heading: 'Share your puppet show', kicker: `My Kathputli · ${PUPPETS[whoRef.current].name} · ${secs} seconds`,
      title: (m) => (m ? `${m}'s puppet show` : 'A kathputli show'), body: 'Worked by hand on a little Rajasthani stage, strings and all. It plays again on your link.',
      cta: 'Now you work the strings', prompt: 'Curtain up! My kathputli show 🎭 #Rangotsav',
    });
  };
  finishRecording.current = () => {
    const show = recording.current;
    if (!show) return;
    recording.current = null;
    setRecLeft(0);
    taaliyan(2.6);
    done('kathputli-show');
    let first = false;
    try { first = !localStorage.getItem('rangotsav:cheer:kathputli'); if (first) localStorage.setItem('rangotsav:cheer:kathputli', '1'); } catch {}
    if (first) setTimeout(() => cheer('वाह उस्ताद!', 'Wah Ustad!'), 300);
    else say('Taaliyan! What a show.', { pose: 'cheer', ms: 2600 });
    setTimeout(() => openShare(show), first ? 1900 : 900);
  };
  const record = () => {
    if (recording.current) { finishRecording.current(); return; }
    replay.current = null;
    recording.current = [];
    setRecLeft(RECORD);
    if (curtain.current.v < 1) { curtain.current.to = 1; setOpen(true); }
    flash('Recording! 10 seconds. Make it dance.');
    buzz([10, 60, 10]);
    setTouched(true);
    wake();
  };
  const onShare = () => {
    if (recording.current) { finishRecording.current(); return; }
    if (!touched) { flash('Work the strings for a moment first!'); return; }
    openShare(buffer.current.slice());
  };

  const P = PUPPETS[who];
  const caption = recLeft > 0 ? `Recording · ${recLeft} second${recLeft === 1 ? '' : 's'} left` : nacho ? `${P.name} dances to the dholak` : `${P.name} · tap the head to hear the boli`;
  return (
    <>
      <ToyShell
        toy="kathputli" label="Kathputli puppet stage" title="Kathputli" sub={<span lang="hi">कठपुतली</span>} stageRef={stage}
        caption={caption}
        stage={
          <Morph id="kathputli">
            <div style={{ position: 'relative', lineHeight: 0 }}>
              <canvas ref={cv} className={s.canvas} style={{ width: px, height: px, cursor: 'grab' }} tabIndex={0}
                aria-label={`Puppet stage with ${P.name}. Drag to work the strings, double-tap to jump, tap the head to talk. Keys: arrows move, Space jumps, Q and E tilt the bar, Enter talks.`}
                onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={onKey} onKeyUp={onKeyUp} />
              <div ref={ghostEl} aria-hidden="true" className={s.ghost} />
              {recLeft > 0 && <div className={k.rec} aria-hidden="true"><i />REC {recLeft}</div>}
              {!touched && <div aria-hidden="true" className={s.hint}><div><i /><b>Drag to work the strings</b></div></div>}
            </div>
          </Morph>
        }
        actions={<>
          <ToolBtn icon="🥁" label={nacho ? 'Ruko' : 'Nacho'} onClick={toggleNacho} title={nacho ? 'Stop the dance' : 'Dance to the dholak'} className={nacho ? s.toolOn : ''} />
          <ToolBtn icon="🗣️" label="Bolo" onClick={() => speak()} title="Make the puppet talk" />
          <ToolBtn icon={recLeft > 0 ? '⏹' : '🎬'} label={recLeft > 0 ? 'Stop' : 'Record'} onClick={record} title="Record a 10-second show" />
          <ToolBtn icon={<BloomIcon />} label="Share" onClick={onShare} go className="rg-bloom" />
        </>}
      >
        <div className={s.field}>
          <span className={s.label}>Puppet · {P.name}</span>
          <div role="group" aria-label="Puppet" className={s.row}>
            {PUPPETS.map((p, i) => (
              <button key={p.id} className={s.opt} style={{ fontSize: 13, minWidth: 92 }} aria-pressed={who === i} onClick={() => pickPuppet(i)}>
                <span aria-hidden="true">{GLYPH[i]} </span>{p.name.replace(' Amar Singh', '')}
              </button>
            ))}
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Backdrop</span>
          <div role="group" aria-label="Backdrop" className={s.seg}>
            {BACKDROPS.map((b, i) => <button key={b} type="button" aria-pressed={bg === i} onClick={() => { setBg(i); bgRef.current = i; buzz(6); wake(); }}>{b}</button>)}
          </div>
        </div>
        <button className={s.toggle} aria-pressed={open} onClick={toggleCurtain}>
          <span aria-hidden="true">🎭</span> {open ? 'Parda: curtains open' : 'Parda: curtains shut'}
        </button>
        <CultureStrip art="kathputli" />
      </ToyShell>
      <ShareSheet req={share} onClose={() => setShare(null)} />
    </>
  );
}
