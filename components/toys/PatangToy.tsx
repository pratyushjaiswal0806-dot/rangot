'use client';
// Patang: design a fighter kite and fly it over old Ahmedabad on Uttarayan. Hold to pull the
// string (kheench) and the kite darts towards your finger; let go (dheel) and the line pays out,
// the wind carries the kite and it turns slowly on its own. The neighbours fly too. Cross a
// neighbour's string and it's a pech: keep pulling hard and theirs is cut (Kai po che!), go slack
// and yours is. A cut kite drifts away and a fresh one goes up from the roof. The recipe keeps the
// design and the kites cut; share pages fly it again in a scripted loop (lib/art/patang.ts).
import { useCallback, useEffect, useRef, useState } from 'react';
import ToyShell, { ToolBtn } from './ToyShell';
import Morph from './Morph';
import CultureStrip from './CultureStrip';
import ShareSheet, { type ShareRequest } from '../ShareSheet';
import { BloomIcon } from './icons';
import { useElementSize } from '../../hooks/useElementSize';
import { drawKite, drawSky, drawString, KITE_COLOURS, ME, PATTERN_EN, PATTERNS, ROOF, stringPoints, TAILS, THEM, type Design } from '../../lib/art/patang';
import type { Recipe } from '../../lib/recipe';
import { queryParam, readRemix } from '../../lib/remix';
import { stamp } from '../../lib/progress';
import { track } from '../../lib/track';
import { cheer, flash } from '../../lib/toast';
import { fireworks } from '../../lib/fx';
import { burst, buzz, chord, crackle, pluck, whoosh } from '../../lib/sfx';
import { firstVisit, ghostStroke } from '../../lib/ghost';
import { done } from '../../lib/challenges';
import { calm } from '../../lib/motion';
import { say } from '../../lib/cheenti';
import s from './ToyShell.module.css';

const STEP = 1 / 60;
const SIZE = 0.042;
type Kite = { x: number; y: number; vx: number; vy: number; ang: number; L: number; alive: boolean; cutAt: number; spin: number };
type Rival = Kite & { home: { x: number; y: number }; tx: number; ty: number; next: number; force: number; d: Design };
type Pech = { r: number; meter: number; x: number; y: number; seen: number; force: number };

const fresh = (home: { x: number; y: number }, t = 0): Kite => ({ x: home.x + 0.03, y: home.y - 0.08, vx: 0, vy: -0.25, ang: 0, L: 0.25, alive: true, cutAt: t, spin: 1 });
const turnTo = (a: number, b: number, max: number) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + Math.max(-max, Math.min(max, d)); };
// do segments p1-p2 and p3-p4 cross? returns where
function cross(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number) {
  const r = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
  if (Math.abs(r) < 1e-9) return null;
  const u = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / r, v = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / r;
  return u >= 0 && u <= 1 && v >= 0 && v <= 1 ? { x: ax + (bx - ax) * u, y: ay + (by - ay) * u } : null;
}

export default function PatangToy() {
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const side = useRef(0);
  const me = useRef<Kite>(fresh(ME));
  const rivals = useRef<Rival[]>([]);
  const pech = useRef<Pech | null>(null);
  const pulling = useRef(false);
  const aim = useRef<{ x: number; y: number } | null>(null);
  const keyTurn = useRef(0);
  const clock = useRef(0);
  const acc = useRef(0);
  const last = useRef(0);
  const raf = useRef(0);
  const visible = useRef(true);
  const rasp = useRef<ReturnType<typeof crackle> | null>(null);
  const score = useRef(0);
  const streak = useRef(0);
  const shout = useRef({ text: '', until: 0 });
  const ghostEl = useRef<HTMLDivElement>(null);
  const ghost = useRef<(() => void) | null>(null);
  const remixing = useRef(false);
  const { w, h } = useElementSize(stage);

  const [design, setDesign] = useState<Design>({ a: 1, b: 0, p: 0, t: 1 });
  const [night, setNight] = useState(false);
  const [cuts, setCuts] = useState(0);
  const [touched, setTouched] = useState(false);
  const [px, setPx] = useState(300);
  const [share, setShare] = useState<ShareRequest | null>(null);
  const dRef = useRef(design);
  dRef.current = design;
  const nightRef = useRef(night);
  nightRef.current = night;

  const newRival = (i: number, t: number): Rival => ({
    ...fresh(THEM[i], t), home: THEM[i], tx: 0.5, ty: 0.3, next: t + 1, force: 0.8 + Math.random() * 0.45,
    d: { a: (i * 3 + 2 + Math.floor(Math.random() * 3)) % 8, b: (i * 5 + 1) % 8, p: Math.floor(Math.random() * 4), t: Math.floor(Math.random() * 3) },
  });

  // ---------- the flight ----------
  const fly = useCallback((k: Kite, home: { x: number; y: number }, pull: boolean, target: { x: number; y: number } | null, thrust: number, turn: number, wind: number, dt: number) => {
    if (pull) {
      if (target) k.ang = turnTo(k.ang, Math.atan2(target.x - k.x, -(target.y - k.y)), turn * dt);
      k.vx += Math.sin(k.ang) * thrust * dt; k.vy -= Math.cos(k.ang) * thrust * dt;
      // a friend on the firki lets the line out (or takes it in) towards where you're pulling
      const want = target ? Math.max(0.2, Math.min(1.25, Math.hypot(target.x - home.x, target.y - home.y))) : 1.25;
      k.L += Math.max(-0.12 * dt, Math.min(0.4 * dt, want - k.L));
    } else {
      k.L = Math.min(1.25, k.L + 0.16 * dt);
      k.ang += (0.8 + 0.4 * Math.sin(clock.current * 1.3)) * k.spin * dt; // a slack fighter kite turns by itself
      k.vy += 0.035 * dt;
    }
    k.vx += (wind - k.vx) * 0.6 * dt;
    k.vx *= 1 - 1.2 * dt; k.vy *= 1 - 1.2 * dt;
    k.x += k.vx * dt; k.y += k.vy * dt;
    // the string holds it: no further than the line from the hand
    const dx = k.x - home.x, dy = k.y - home.y, d = Math.hypot(dx, dy);
    if (d > k.L) {
      k.x = home.x + (dx / d) * k.L; k.y = home.y + (dy / d) * k.L;
      const vr = (k.vx * dx + k.vy * dy) / d;
      if (vr > 0) { k.vx -= (vr * dx) / d; k.vy -= (vr * dy) / d; }
    }
    if (k.y > ROOF - 0.03) { k.y = ROOF - 0.03; k.vy = Math.min(0, k.vy); k.vx *= 0.9; k.ang = turnTo(k.ang, 0, 2 * dt); }
    if (k.y < 0.04) { k.y = 0.04; k.vy = Math.max(0, k.vy); }
    k.x = Math.max(0.03, Math.min(0.97, k.x));
  }, []);

  const cutRival = useCallback((i: number) => {
    const r = rivals.current[i], t = clock.current;
    r.alive = false; r.cutAt = t;
    score.current++; streak.current++;
    setCuts(score.current);
    shout.current = { text: 'KAI PO CHE!', until: t + 1.6 };
    chord(); burst(0.8);
    done('patang-pech');
    if (streak.current >= 3) done('patang-three');
    const el = cv.current;
    if (el && !calm()) { const b = el.getBoundingClientRect(); fireworks(2, { x: b.left + r.x * b.width, y: b.top + r.y * b.height }); }
    if (score.current === 1 || score.current % 5 === 0) setTimeout(() => cheer('काई पो छे!', 'Kai po che!'), 200);
    buzz([20, 40, 20]);
  }, []);
  const cutMe = useCallback(() => {
    const k = me.current, t = clock.current;
    k.alive = false; k.cutAt = t;
    streak.current = 0;
    shout.current = { text: 'KAT GAYI!', until: t + 1.6 };
    whoosh(0.8, 1600, 300, 0.07);
    say('Arre! Your kite was cut. Keep pulling in a pech next time!', { pose: 'talk', once: 'patang:cut', ms: 3600 });
    buzz(30);
  }, []);

  const step = useCallback(() => {
    const t = clock.current, wind = 0.05 + 0.03 * Math.sin(t * 0.5) + 0.02 * Math.sin(t * 1.7 + 1);
    const k = me.current;
    if (k.alive) {
      if (keyTurn.current) k.ang += keyTurn.current * 2.2 * STEP;
      fly(k, ME, pulling.current, keyTurn.current ? null : aim.current, 0.7, 2.4, wind, STEP);
      if (k.y < 0.1 && pulling.current) done('patang-high');
    } else {
      k.x += wind * 0.9 * STEP; k.y += 0.05 * STEP; k.ang += 2.2 * STEP;
      if (t - k.cutAt > 2.6) { me.current = fresh(ME, t); whoosh(0.6, 300, 1400, 0.05); }
    }
    rivals.current.forEach((r, i) => {
      if (!r.alive) {
        r.x += wind * 1.1 * STEP; r.y += 0.055 * STEP; r.ang += 2.4 * STEP;
        if (t - r.cutAt > 4) rivals.current[i] = newRival(i, t);
        return;
      }
      if (t > r.next) {
        // wander the sky, and now and then go for your string
        const mine = stringPoints(ME.x, ME.y, k.x, k.y, 0.2, 4);
        if (k.alive && Math.random() < 0.45) { r.tx = mine[4] + (Math.random() - 0.5) * 0.1; r.ty = mine[5] - 0.08; }
        else { r.tx = 0.25 + Math.random() * 0.6; r.ty = 0.12 + Math.random() * 0.4; }
        r.next = t + 1.6 + Math.random() * 2.4;
      }
      const near = Math.hypot(r.tx - r.x, r.ty - r.y) > 0.05;
      fly(r, r.home, near, { x: r.tx, y: r.ty }, 0.42, 1.6, wind, STEP);
      if (r.L > 0.8) r.L = 0.8;
    });
    // pech: does your string cross a neighbour's?
    if (k.alive) {
      const mine = stringPoints(ME.x, ME.y, k.x, k.y, 0.2, 10);
      let hit: { r: number; x: number; y: number } | null = null;
      rivals.current.forEach((r, i) => {
        if (!r.alive || hit) return;
        const theirs = stringPoints(r.home.x, r.home.y, r.x, r.y, 0.2, 10);
        for (let a = 4; a < mine.length - 2 && !hit; a += 2) for (let b = 4; b < theirs.length - 2 && !hit; b += 2) {
          const c = cross(mine[a], mine[a + 1], mine[a + 2], mine[a + 3], theirs[b], theirs[b + 1], theirs[b + 2], theirs[b + 3]);
          if (c) hit = { r: i, ...c };
        }
      });
      const p = pech.current;
      if (hit) {
        const h2 = hit as { r: number; x: number; y: number };
        if (!p || p.r !== h2.r) { pech.current = { r: h2.r, meter: 0, x: h2.x, y: h2.y, seen: t, force: rivals.current[h2.r].force }; rasp.current?.stop(); rasp.current = crackle(); }
        else { p.x = h2.x; p.y = h2.y; p.seen = t; }
      }
      const q = pech.current;
      if (q) {
        if (t - q.seen > 0.35) { pech.current = null; rasp.current?.stop(); rasp.current = null; }
        else {
          // whoever pulls harder wins: pulling while your kite moves fast beats a slack line
          const speed = Math.hypot(k.vx, k.vy), mineF = pulling.current ? 0.8 + Math.min(1, speed * 2.5) : 0.5;
          q.meter += (mineF - q.force * (0.85 + 0.3 * Math.sin(t * 5))) * STEP * 0.9;
          rasp.current?.speed(10 + speed * 40);
          if (q.meter >= 1) { cutRival(q.r); pech.current = null; rasp.current?.stop(); rasp.current = null; }
          else if (q.meter <= -1) { cutMe(); pech.current = null; rasp.current?.stop(); rasp.current = null; }
        }
      }
    } else if (pech.current) { pech.current = null; rasp.current?.stop(); rasp.current = null; }
    clock.current += STEP;
  }, [fly, cutRival, cutMe]);

  const draw = useCallback((x: CanvasRenderingContext2D, S: number, t: number) => {
    const n = nightRef.current, line = n ? 'rgba(251,243,228,.85)' : 'rgba(27,20,16,.8)';
    drawSky(x, S, n, calm() ? 0 : t);
    for (const r of rivals.current) {
      if (r.alive) drawString(x, S, stringPoints(r.home.x, r.home.y, r.x, r.y, Math.max(0.05, 1 - Math.hypot(r.x - r.home.x, r.y - r.home.y) / r.L) * 2), line, n ? 1 : 0, t);
      drawKite(x, S, r.x, r.y, r.ang, SIZE * 0.85, r.d, t, !r.alive);
    }
    const k = me.current;
    if (k.alive) drawString(x, S, stringPoints(ME.x, ME.y, k.x, k.y, pulling.current ? 0.05 : Math.max(0.1, 1 - Math.hypot(k.x - ME.x, k.y - ME.y) / k.L) * 2.2), n ? '#FFE6A8' : '#7A0E3A', n ? 3 : 0, t);
    drawKite(x, S, k.x, k.y, k.ang, SIZE, dRef.current, t, !k.alive);
    const p = pech.current;
    if (p) {
      // sparks where the strings rub, and the tug-of-war meter
      x.strokeStyle = '#FFE08A'; x.lineWidth = Math.max(1, S * 0.003);
      for (let i = 0; i < 6; i++) { const a = Math.random() * Math.PI * 2, r0 = S * 0.008, r1 = S * (0.02 + Math.random() * 0.02); x.beginPath(); x.moveTo(p.x * S + Math.cos(a) * r0, p.y * S + Math.sin(a) * r0); x.lineTo(p.x * S + Math.cos(a) * r1, p.y * S + Math.sin(a) * r1); x.stroke(); }
      const bw = S * 0.5, bx = S * 0.25, by = S * 0.05, bh = S * 0.035, mid = bx + bw / 2 + (p.meter * bw) / 2;
      x.fillStyle = KITE_COLOURS[dRef.current.a][1]; x.fillRect(bx, by, mid - bx, bh);
      x.fillStyle = KITE_COLOURS[rivals.current[p.r]?.d.a ?? 3][1]; x.fillRect(mid, by, bx + bw - mid, bh);
      x.lineWidth = S * 0.005; x.strokeStyle = '#1B1410'; x.strokeRect(bx, by, bw, bh);
      x.font = `900 ${Math.round(S * 0.04)}px Sarpanch, sans-serif`; x.textAlign = 'center';
      x.fillStyle = '#1B1410'; x.fillText(pulling.current ? 'PECH! KHEENCHO!' : 'PECH! PULL!', S / 2 + 2, by + bh + S * 0.05 + 2);
      x.fillStyle = '#FFC21A'; x.fillText(pulling.current ? 'PECH! KHEENCHO!' : 'PECH! PULL!', S / 2, by + bh + S * 0.05);
    }
    if (t < shout.current.until) {
      const a = Math.min(1, (shout.current.until - t) * 2);
      x.globalAlpha = a; x.font = `900 ${Math.round(S * 0.08)}px Sarpanch, sans-serif`; x.textAlign = 'center';
      x.lineWidth = S * 0.014; x.strokeStyle = '#1B1410'; x.strokeText(shout.current.text, S / 2, S * 0.34);
      x.fillStyle = shout.current.text.startsWith('KAI') ? '#FFC21A' : '#FBF3E4'; x.fillText(shout.current.text, S / 2, S * 0.34);
      x.globalAlpha = 1;
    }
  }, []);

  const frame = useCallback((now: number) => {
    const x = ctx.current, S = side.current;
    if (!x || !S) { raf.current = 0; return; }
    const dt = Math.min(0.1, (now - (last.current || now)) / 1000);
    last.current = now;
    acc.current += dt;
    while (acc.current >= STEP) { step(); acc.current -= STEP; }
    draw(x, S, clock.current);
    raf.current = visible.current ? requestAnimationFrame(frame) : 0;
  }, [step, draw]);
  const wake = useCallback(() => { if (!raf.current && visible.current) { last.current = 0; raf.current = requestAnimationFrame(frame); } }, [frame]);

  // Fit the square sky to the stage.
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
    const first = !side.current;
    side.current = S;
    setPx(S);
    wake();
    if (first && ghostEl.current && !remixing.current && firstVisit('patang')) {
      // a ghost fingertip holds and drags up: the kite climbs after it
      const pts = Array.from({ length: 50 }, (_, i) => { const k = i / 49; return { x: (-0.2 + 0.35 * k) * S, y: (0.1 - 0.42 * k + Math.sin(k * 6) * 0.04) * S }; });
      pulling.current = true;
      ghost.current = ghostStroke(pts, ghostEl.current, S, 2400, (p) => { aim.current = { x: 0.5 + p.x / S, y: 0.5 + p.y / S }; }, () => { ghost.current = null; pulling.current = false; aim.current = null; });
    }
  }, [w, h, wake]);

  useEffect(() => {
    stamp('patang');
    track('tool_open', { tool: 'patang' });
    rivals.current = [newRival(0, 0), newRival(1, 0)];
    rivals.current[1].next = 2.5;
    remixing.current = !!queryParam('remix');
    readRemix('patang').then((r) => {
      remixing.current = false;
      if (r?.type !== 'patang') return;
      ghost.current?.();
      setDesign({ a: r.data.a, b: r.data.b, p: r.data.p, t: r.data.t });
      setNight(r.data.n === 1);
      flash('Remixing! Fly this kite, or change its colours.');
    });
    const onVis = () => { visible.current = !document.hidden; if (visible.current) wake(); };
    document.addEventListener('visibilitychange', onVis);
    const io = stage.current && 'IntersectionObserver' in window ? new IntersectionObserver(([en]) => { visible.current = en.isIntersecting && !document.hidden; if (visible.current) wake(); }) : null;
    if (stage.current) io?.observe(stage.current);
    return () => {
      cancelAnimationFrame(raf.current); raf.current = 0;
      rasp.current?.stop(); ghost.current?.();
      document.removeEventListener('visibilitychange', onVis);
      io?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wake]);

  // ---------- your hands on the string ----------
  const toUnits = (e: React.PointerEvent) => {
    const b = cv.current!.getBoundingClientRect();
    return { x: (e.clientX - b.left - 4) / Math.max(1, b.width - 8), y: (e.clientY - b.top - 4) / Math.max(1, b.height - 8) };
  };
  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    ghost.current?.();
    pulling.current = true;
    aim.current = toUnits(e);
    try { cv.current!.setPointerCapture(e.pointerId); } catch {}
    if (!touched) setTouched(true);
    pluck(4, 0.3);
    wake();
  };
  const move = (e: React.PointerEvent) => { if (pulling.current) aim.current = toUnits(e); };
  const up = () => { pulling.current = false; aim.current = null; };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'ArrowUp') pulling.current = true;
    else if (e.key === 'ArrowLeft') keyTurn.current = -1;
    else if (e.key === 'ArrowRight') keyTurn.current = 1;
    else return;
    e.preventDefault();
    if (!touched) setTouched(true);
    wake();
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'ArrowUp') pulling.current = false;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') keyTurn.current = 0;
  };

  const set = (patch: Partial<Design>) => { setDesign((d) => ({ ...d, ...patch })); buzz(5); };

  const onShare = () => {
    const S = side.current;
    if (!S || !cv.current) return;
    const r: Extract<Recipe, { type: 'patang' }> = { v: 1, type: 'patang', data: { ...design, k: Math.min(99, score.current), ...(night ? { n: 1 as const } : {}) } };
    const d = cv.current.width / S, copy = document.createElement('canvas');
    copy.width = copy.height = cv.current.width;
    const x = copy.getContext('2d')!;
    x.setTransform(d, 0, 0, d, 0, 0);
    draw(x, S, clock.current);
    const k = score.current;
    setShare({
      recipe: r, art: copy, filename: 'my-patang', heading: 'Share your kite',
      kicker: k ? `My patang · ${k} kite${k === 1 ? '' : 's'} cut` : 'My patang · Uttarayan',
      title: (m) => (k ? 'Kai po che!' : m ? `${m}'s kite` : 'Up goes my patang'), body: k ? `My kite cut ${k} kite${k === 1 ? '' : 's'} over the rooftops of Ahmedabad.` : 'Designed and flown over the rooftops of Ahmedabad on Uttarayan.',
      cta: 'Now you fly one', prompt: 'Kai po che! 🪁 #Rangotsav',
    });
  };

  const [c1, c2] = [KITE_COLOURS[design.a], KITE_COLOURS[design.b]];
  return (
    <>
      <ToyShell
        toy="patang" label="Patang kite flying" title="Patang" sub={<span lang="gu">પતંગ</span>} stageRef={stage}
        caption={`${cuts ? `${cuts} kati · ` : ''}hold to pull (kheench), let go to let the string out (dheel)`}
        stage={
          <Morph id="patang">
            <div style={{ position: 'relative', lineHeight: 0 }}>
              <canvas ref={cv} className={s.canvas} style={{ width: px, height: px, cursor: 'crosshair' }} tabIndex={0}
                aria-label="The sky over Ahmedabad's rooftops on Uttarayan. Hold to pull your kite towards your finger, let go to let the string out. Keys: hold Space to pull, left and right arrows to turn."
                onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={onKey} onKeyUp={onKeyUp} />
              <div ref={ghostEl} aria-hidden="true" className={s.ghost} />
              {!touched && <div aria-hidden="true" className={s.hint}><div><i /><b>Hold to pull the string</b></div></div>}
            </div>
          </Morph>
        }
        actions={<>
          <ToolBtn icon="🌙" label={night ? 'Din' : 'Raat'} onClick={() => { setNight((n) => !n); buzz(6); }} title={night ? 'Fly by day' : 'Fly at night, with tukkal lanterns'} />
          <ToolBtn icon={<BloomIcon />} label="Share" onClick={onShare} go className="rg-bloom" />
        </>}
      >
        <div className={s.field}>
          <span className={s.label}>Colour one · {c1[0]}</span>
          <div role="group" aria-label="Kite colour one" className={s.swatches}>
            {KITE_COLOURS.map(([n, c], i) => <button key={c} className={s.swatch} aria-pressed={design.a === i} aria-label={n} onClick={() => set({ a: i })} style={{ background: c }} />)}
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Colour two · {c2[0]}</span>
          <div role="group" aria-label="Kite colour two" className={s.swatches}>
            {KITE_COLOURS.map(([n, c], i) => <button key={c} className={s.swatch} aria-pressed={design.b === i} aria-label={n} onClick={() => set({ b: i })} style={{ background: c }} />)}
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Pattern · {PATTERN_EN[design.p]}</span>
          <div role="group" aria-label="Pattern" className={s.seg}>
            {PATTERNS.map((p, i) => <button key={p} type="button" aria-pressed={design.p === i} onClick={() => set({ p: i })}>{p}</button>)}
          </div>
        </div>
        <div className={s.field}>
          <span className={s.label}>Poonch · tail</span>
          <div role="group" aria-label="Tail" className={s.seg}>
            {TAILS.map((p, i) => <button key={p} type="button" aria-pressed={design.t === i} onClick={() => set({ t: i })}>{p.replace(' tail', '')}</button>)}
          </div>
        </div>
        <CultureStrip art="patang" />
      </ToyShell>
      <ShareSheet req={share} onClose={() => setShare(null)} />
    </>
  );
}
