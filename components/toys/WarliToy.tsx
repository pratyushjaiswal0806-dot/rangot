'use client';
// Warli: paint a village on a red-earth wall in white rice paste. Tap and a dancer walks in from
// where you tapped, takes the hands of the last one, and the spiral of dancers keeps turning
// round the tarpa player in the middle. Pick a hut, a tree, an animal, paddy or birds to paint
// them round the dance instead. Palto turns the dance the other way (the tarpa switches tunes);
// tap the tarpa player and everyone hops. The recipe keeps the number of dancers and the village,
// so the share page, wall and reel paint it again and walk the dancers in (lib/art/warli.ts).
import { useCallback, useEffect, useRef, useState } from 'react';
import ToyShell, { ToolBtn } from './ToyShell';
import Morph from './Morph';
import CultureStrip from './CultureStrip';
import ShareSheet, { type ShareRequest } from '../ShareSheet';
import { BloomIcon, UndoIcon } from './icons';
import { useElementSize, fitSquare } from '../../hooks/useElementSize';
import { ANIMALS, CX, CY, drawWarli, ITEMS, MAX_DANCERS, sceneFrom, SPIN, WALK, wallCanvas, type Scene } from '../../lib/art/warli';
import { decodePts, encodePts, WARLI_ITEMS, type Recipe } from '../../lib/recipe';
import { queryParam, readRemix } from '../../lib/remix';
import { stamp } from '../../lib/progress';
import { track } from '../../lib/track';
import { cheer, flash } from '../../lib/toast';
import { buzz, pluck, tarpa, ting, whoosh } from '../../lib/sfx';
import { firstVisit, ghostStroke } from '../../lib/ghost';
import { done } from '../../lib/challenges';
import { calm } from '../../lib/motion';
import { say } from '../../lib/cheenti';
import s from './ToyShell.module.css';

const BPM = 84;
const TOOLS = [{ id: 'dancer', name: 'Nachne wale', en: 'dancers', glyph: '💃' }, ...ITEMS.map((it, k) => ({ id: it.id, name: it.name, en: it.en, glyph: ['🛖', '🌳', '🦌', '🐓', '🌾', '🐦'][k] }))];
type Did = { kind: 'd' } | { kind: 'i' } | { kind: 'many'; n: number };

export default function WarliToy() {
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const side = useRef(0);
  const wall = useRef<HTMLCanvasElement | null>(null);
  const scene = useRef<Scene>({ dancers: [], items: [], night: false });
  const hist = useRef<Did[]>([]);
  const clock = useRef(0);
  const phi = useRef(0);
  const beat = useRef(0);
  const hopAt = useRef(-1);
  const raf = useRef(0);
  const last = useRef(0);
  const visible = useRef(true);
  const dirty = useRef(true);
  const music = useRef<ReturnType<typeof tarpa> | null>(null);
  const ghostEl = useRef<HTMLDivElement>(null);
  const ghost = useRef<(() => void) | null>(null);
  const remixing = useRef(false);
  const { w, h } = useElementSize(stage);

  const [tool, setTool] = useState(0);
  const [speed, setSpeed] = useState(10); // tenths
  const [night, setNight] = useState(false);
  const [dir, setDir] = useState(1);
  const [tune, setTune] = useState(true);
  const [count, setCount] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [touched, setTouched] = useState(false);
  const [px, setPx] = useState(300);
  const [share, setShare] = useState<ShareRequest | null>(null);
  const live = useRef({ speed: 1, dir: 1 });
  live.current = { speed: speed / 10, dir };
  const tuneRef = useRef(tune);
  tuneRef.current = tune;

  const frame = useCallback((now: number) => {
    const x = ctx.current, S = side.current;
    if (!x || !S || !wall.current) { raf.current = 0; return; }
    const still = calm();
    const dt = Math.min(0.1, (now - (last.current || now)) / 1000);
    last.current = now;
    if (!still) {
      clock.current += dt;
      phi.current += SPIN * live.current.speed * live.current.dir * dt;
      beat.current += ((BPM * live.current.speed) / 60) * dt;
    }
    const hop = hopAt.current >= 0 ? (clock.current - hopAt.current) / 0.5 : -1;
    if (hop >= 1) hopAt.current = -1;
    drawWarli(x, S, scene.current, { t: clock.current, phi: phi.current, beat: beat.current, hop: hop >= 0 && hop < 1 ? hop : 0, wall: wall.current });
    dirty.current = false;
    // with reduced motion nothing moves by itself, so only draw again when something changes
    raf.current = visible.current && (!still || dirty.current) ? requestAnimationFrame(frame) : 0;
  }, []);
  const wake = useCallback(() => {
    dirty.current = true;
    if (!raf.current && visible.current) { last.current = 0; raf.current = requestAnimationFrame(frame); }
  }, [frame]);

  const startMusic = useCallback(() => {
    if (music.current || !tuneRef.current) return;
    music.current = tarpa(live.current.speed);
  }, []);
  const stopMusic = () => { music.current?.stop(); music.current = null; };

  // Fit the square wall to the stage.
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
    wall.current = wallCanvas(S, scene.current.night, d);
    setPx(S);
    wake();
    if (first && ghostEl.current && !remixing.current && firstVisit('warli')) {
      // a ghost fingertip taps three times; a dancer walks in each time
      const spots = [[-0.32, 0.3], [0.34, 0.26], [0.3, -0.32]];
      const pts = spots.flatMap(([u, v], j) => Array.from({ length: 15 }, (_, i) => {
        const [pu, pv] = j ? spots[j - 1] : [0, 0.4], k = Math.min(1, i / 9);
        return { x: (pu + (u - pu) * k) * S, y: (pv + (v - pv) * k) * S };
      }));
      ghost.current = ghostStroke(pts, ghostEl.current, S, 2600, (p, i) => {
        if (i % 15 === 12) addDancer(0.5 + p.x / S, 0.5 + p.y / S, true);
      }, () => { ghost.current = null; });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h, wake]);

  useEffect(() => {
    stamp('warli');
    track('tool_open', { tool: 'warli' });
    remixing.current = !!queryParam('remix');
    readRemix('warli').then((r) => {
      remixing.current = false;
      if (r?.type !== 'warli') return;
      ghost.current?.();
      const it = decodePts(r.data.i) ?? [], items: [number, number, number][] = [];
      for (let k = 0; k + 2 < it.length; k += 3) items.push([it[k], it[k + 1], it[k + 2]]);
      const sc = sceneFrom(r.data.d, items, r.data.n === 1), t = clock.current;
      sc.dancers.forEach((d) => { d.t0 += t; });
      sc.items.forEach((d) => { d.t0 += t; });
      scene.current = sc;
      hist.current = [{ kind: 'many', n: 0 }];
      setNight(sc.night);
      if (side.current) wall.current = wallCanvas(side.current, sc.night, Math.min(2, window.devicePixelRatio || 1));
      setSpeed(r.data.s); setDir(r.data.r ? -1 : 1);
      setCount(sc.dancers.length); setTouched(true);
      flash('Remixing! Add dancers and paint more of the village.');
      wake();
    });
    const onVis = () => { visible.current = !document.hidden; if (visible.current) wake(); else stopMusic(); };
    document.addEventListener('visibilitychange', onVis);
    const io = stage.current && 'IntersectionObserver' in window ? new IntersectionObserver(([en]) => {
      visible.current = en.isIntersecting && !document.hidden;
      if (visible.current) wake(); else stopMusic();
    }) : null;
    if (stage.current) io?.observe(stage.current);
    return () => {
      cancelAnimationFrame(raf.current); raf.current = 0;
      stopMusic();
      ghost.current?.();
      document.removeEventListener('visibilitychange', onVis);
      io?.disconnect();
    };
  }, [wake]);

  useEffect(() => { music.current?.speed(speed / 10); }, [speed]);

  // ---------- painting ----------
  const villageCheck = () => {
    const ks = new Set(scene.current.items.map((i) => i.k));
    if (ks.has(0) && ks.has(1) && ANIMALS.some((a) => ks.has(a))) done('warli-village');
  };
  const joined = (n: number) => {
    setCount(n);
    if (n >= 20) done('warli-twenty');
    if (n >= 24) {
      try { if (!localStorage.getItem('rangotsav:cheer:warli')) { localStorage.setItem('rangotsav:cheer:warli', '1'); setTimeout(() => cheer('झूमो!', 'Jhoomo!'), (calm() ? 0 : WALK) * 1000); } } catch {}
    }
  };
  const addDancer = (u: number, v: number, quiet = false) => {
    const sc = scene.current;
    if (sc.dancers.length >= MAX_DANCERS) { if (!quiet) flash('The circle is full! 48 dancers.'); return false; }
    sc.dancers.push({ sx: u, sy: v, t0: calm() ? -WALK - 1 : clock.current });
    hist.current.push({ kind: 'd' });
    pluck(3 + (sc.dancers.length % 10), 0.55);
    joined(sc.dancers.length);
    setCanUndo(true);
    wake();
    return true;
  };
  const addItem = (k: number, u: number, v: number) => {
    const sc = scene.current;
    if (sc.items.length >= WARLI_ITEMS) { flash('The wall is full! Undo something to paint more.'); return; }
    sc.items.push({ k, x: u, y: v, t0: calm() ? -1 : clock.current });
    hist.current.push({ kind: 'i' });
    ting(900 + k * 120, 0.35);
    villageCheck();
    setCanUndo(true);
    wake();
  };

  const toUnits = (e: React.PointerEvent) => {
    const b = cv.current!.getBoundingClientRect();
    return { u: (e.clientX - b.left - 4) / Math.max(1, b.width - 8), v: (e.clientY - b.top - 4) / Math.max(1, b.height - 8) };
  };
  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    ghost.current?.();
    startMusic();
    if (!touched) setTouched(true);
    const { u, v } = toUnits(e);
    // the tarpa player: everyone hops
    if (Math.hypot(u - CX, v - (CY - 0.03)) < 0.06) {
      hopAt.current = clock.current;
      if (music.current) whoosh(0.3, 500, 1500, 0.04); else pluck(9, 0.6);
      buzz(10);
      wake();
      return;
    }
    if (tool === 0) addDancer(u, v);
    else addItem(tool - 1, Math.max(0.08, Math.min(0.92, u)), Math.max(0.12, Math.min(0.93, v)));
    buzz(6);
  };

  const undo = () => {
    const a = hist.current.pop(), sc = scene.current;
    if (!a) return;
    if (a.kind === 'd') sc.dancers.pop();
    else if (a.kind === 'i') sc.items.pop();
    else sc.dancers.splice(sc.dancers.length - a.n, a.n);
    setCount(sc.dancers.length);
    setCanUndo(hist.current.length > 0);
    buzz(8);
    wake();
  };
  // Bulao: six more dancers run in from the edges
  const call = () => {
    startMusic();
    setTouched(true);
    const sc = scene.current, n = Math.min(6, MAX_DANCERS - sc.dancers.length);
    if (!n) { flash('The circle is full! 48 dancers.'); return; }
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2;
      sc.dancers.push({ sx: CX + Math.cos(a) * 0.62, sy: CY + Math.sin(a) * 0.62, t0: calm() ? -WALK - 1 : clock.current + k * 0.18 });
    }
    hist.current.push({ kind: 'many', n });
    joined(sc.dancers.length);
    setCanUndo(true);
    whoosh(0.5, 300, 1200, 0.05);
    wake();
  };
  const palto = () => {
    startMusic();
    setDir((d) => -d);
    music.current?.palto();
    done('warli-palto');
    if (!scene.current.dancers.length) say('Palto turns the dancers round. Tap to call some first!', { pose: 'point', ms: 3200 });
    buzz([8, 40, 8]);
    wake();
  };
  const toggleNight = (n: boolean) => {
    setNight(n);
    scene.current.night = n;
    if (side.current) wall.current = wallCanvas(side.current, n, Math.min(2, window.devicePixelRatio || 1));
    buzz(6);
    wake();
  };
  const toggleTune = () => {
    const on = !tune;
    setTune(on); tuneRef.current = on;
    if (on) startMusic(); else stopMusic();
    buzz(6);
  };

  // ---------- share ----------
  const recipe = (): Extract<Recipe, { type: 'warli' }> | null => {
    const sc = scene.current;
    if (!sc.dancers.length && !sc.items.length) return null;
    const q = (v: number) => Math.max(-1000, Math.min(1000, Math.round((v - 0.5) * 2000)));
    const i = encodePts(sc.items.flatMap((it) => [it.k, q(it.x), q(it.y)]));
    return { v: 1, type: 'warli', data: { d: sc.dancers.length, i, s: speed, ...(night ? { n: 1 as const } : {}), ...(dir < 0 ? { r: 1 as const } : {}) } };
  };
  const onShare = () => {
    const S = side.current, r = recipe();
    if (!r || !S || !cv.current) { flash('Tap the wall to call a dancer first!'); return; }
    // the card: everyone in their place
    const d = cv.current.width / S, copy = document.createElement('canvas');
    copy.width = copy.height = cv.current.width;
    const x = copy.getContext('2d')!;
    x.setTransform(d, 0, 0, d, 0, 0);
    drawWarli(x, S, scene.current, { t: clock.current + WALK * 4, phi: phi.current, beat: 0, wall: wallCanvas(S, night, d) });
    const n = r.data.d;
    setShare({
      recipe: r, art: copy, filename: 'my-warli', heading: 'Share your Warli wall',
      kicker: n ? `My Warli · ${n} dancer${n === 1 ? '' : 's'} round the tarpa` : 'My Warli village',
      title: (m) => (m ? `${m}'s Warli wall` : 'A Warli wall'), body: 'Painted in rice-paste white on red earth, the way Warli homes in Maharashtra are.',
      cta: 'Now you join the dance', prompt: 'Join the tarpa dance 🎶 #Rangotsav',
    });
  };

  const T = TOOLS[tool];
  const caption = `${count} dancer${count === 1 ? '' : 's'} round the tarpa · tap to add ${T.en}${dir < 0 ? ' · Palto!' : ''}`;
  return (
    <>
      <ToyShell
        toy="warli" label="Warli wall painting" title="Warli" sub={<span lang="mr">वारली</span>} stageRef={stage} onUndo={undo}
        caption={caption}
        stage={
          <Morph id="warli">
            <div style={{ position: 'relative', lineHeight: 0 }}>
              <canvas ref={cv} className={s.canvas} style={{ width: px, height: px, cursor: 'pointer' }}
                aria-label={`Warli wall with ${count} dancers round the tarpa player. Tap to add ${T.en}; tap the tarpa player in the middle and everyone hops.`}
                onPointerDown={down} />
              <div ref={ghostEl} aria-hidden="true" className={s.ghost} />
              {!touched && <div aria-hidden="true" className={s.hint}><div><i /><b>Tap to call a dancer</b></div></div>}
            </div>
          </Morph>
        }
        actions={<>
          <ToolBtn icon={<UndoIcon />} label="Undo" onClick={undo} disabled={!canUndo} />
          <ToolBtn icon="🔄" label="Palto" onClick={palto} title="Turn the dance the other way" />
          <ToolBtn icon="👐" label="Bulao" onClick={call} title="Call six more dancers" />
          <ToolBtn icon={<BloomIcon />} label="Share" onClick={onShare} go className="rg-bloom" />
        </>}
      >
        <div className={s.field}>
          <span className={s.label}>Paint · {T.name}</span>
          <div role="group" aria-label="What to paint" className={s.row}>
            {TOOLS.map((t, i) => (
              <button key={t.id} className={s.opt} style={{ fontSize: 13, minWidth: 64 }} aria-pressed={tool === i} aria-label={`${t.name} (${t.en})`} onClick={() => { setTool(i); buzz(5); }}>
                <span aria-hidden="true">{t.glyph}</span>
              </button>
            ))}
          </div>
        </div>
        <label className={s.range}>
          <span className={s.label}><span>Speed</span><span>{speed < 8 ? 'Dheere' : speed > 13 ? 'Tez!' : 'Chalo'}</span></span>
          <input type="range" min={4} max={20} value={speed} onChange={(e) => setSpeed(+e.target.value)} aria-valuetext={`${speed / 10} times`} />
        </label>
        <div className={s.field}>
          <span className={s.label}>Time</span>
          <div role="group" aria-label="Day or night" className={s.seg}>
            <button type="button" aria-pressed={!night} onClick={() => toggleNight(false)}>Din</button>
            <button type="button" aria-pressed={night} onClick={() => toggleNight(true)}>Raat</button>
          </div>
        </div>
        <button className={s.toggle} aria-pressed={tune} onClick={toggleTune}>
          <span aria-hidden="true">🎺</span> {tune ? 'Tarpa is playing' : 'Tarpa is quiet'}
        </button>
        <CultureStrip art="warli" />
      </ToyShell>
      <ShareSheet req={share} onClose={() => setShare(null)} />
    </>
  );
}
