'use client';
// The daily Pulli puzzle. Left: today's woven line (no dots). Right: your board; the line
// weaves around your dots live as you tap. Six checks to match it exactly. A miss shakes the
// board; a win makes it glow, gets a cheer and Cheenti comes for breakfast; once today's puzzle
// is over she naps until tomorrow's. The streak's flame grows with the streak.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ToyShell, { ToolBtn } from './toys/ToyShell';
import { useElementSize, framePad, captionH } from '../hooks/useElementSize';
import s from './toys/ToyShell.module.css';
import p from './Pulli.module.css';
import { C } from '../lib/art/palette';
import { drawKolam, kolamSegs } from '../lib/art/kolam';
import { istDay } from '../lib/festivals';
import { GRID, TRIES, evaluate, key, loadToday, msToNext, puzzleNumber, pulliStats, recordResult, saveToday, shareText, target, type Dot, type Mark } from '../lib/pulli';
import { copy, whatsapp } from '../lib/share';
import { stamp } from '../lib/progress';
import Cheenti from './site/Cheenti';
import { say } from '../lib/cheenti';
import { done as earned } from '../lib/challenges';
import { cheer } from '../lib/toast';
import { shake } from '../lib/motion';
import { track } from '../lib/track';

const MARK: Record<Mark, string> = { hit: '#2F6B3B', near: '#DE9B1C', miss: '#8a7f73' };

function useCanvas(draw: (x: CanvasRenderingContext2D, S: number) => void, deps: unknown[]) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const paint = () => {
      const S = Math.round(el.getBoundingClientRect().width) || 320, d = Math.min(2, window.devicePixelRatio || 1);
      el.width = el.height = Math.round(S * d);
      const x = el.getContext('2d')!;
      x.setTransform(d, 0, 0, d, 0, 0);
      draw(x, S);
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

export default function Pulli() {
  const [day, setDay] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<Dot[][]>([]);
  const [board, setBoard] = useState<Map<string, Dot>>(new Map());
  const [over, setOver] = useState<{ won: boolean } | null>(null);
  const [stats, setStats] = useState(() => ({ played: 0, won: 0, streak: 0, best: 0, lastWon: '', dist: [0, 0, 0, 0, 0, 0] }));
  const [global, setGlobal] = useState<{ played: number; solved: number } | null>(null);
  const [msg, setMsg] = useState('');
  const [left, setLeft] = useState('');
  const [glow, setGlow] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const { w: sw, h: sh } = useElementSize(stage);

  useEffect(() => {
    const d = istDay();
    setDay(d);
    const t = loadToday(d);
    setGuesses(t.guesses);
    if (t.done) setOver({ won: t.won });
    setStats(pulliStats());
    fetch('/api/pulli?day=' + d).then((r) => (r.ok ? r.json() : null)).then((g) => g && setGlobal(g)).catch(() => {});
    const tick = () => { const ms = msToNext(); setLeft(`${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`); };
    tick();
    const iv = setInterval(tick, 30000);
    return () => { clearInterval(iv); };
  }, []);

  const tgt = useMemo(() => (day ? target(day) : []), [day]);
  const dots = [...board.values()];
  const last = guesses.at(-1);
  const lastEval = last ? evaluate(last, tgt) : null;

  const tRef = useCanvas((x, S) => { drawKolam(x, S, GRID, tgt, kolamSegs(tgt, S, GRID), C.marigold, false, 1); }, [tgt]);
  const bRef = useCanvas((x, S) => {
    drawKolam(x, S, GRID, dots, kolamSegs(dots, S, GRID), C.ivory, true, 1);
    if (over) return;
    // show last check's marks on dots that are still placed
    if (last && lastEval) {
      const s = S / GRID;
      last.forEach((d, i) => {
        if (!board.has(key(d))) return;
        x.beginPath(); x.arc((d[0] + 0.5) * s, (d[1] + 0.5) * s, s * 0.2, 0, Math.PI * 2);
        x.lineWidth = 4; x.strokeStyle = MARK[lastEval.marks[i]]; x.stroke();
      });
    }
  }, [board, over, last]);

  const tap = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (over) return;
    const b = e.currentTarget.getBoundingClientRect(), s = b.width / GRID;
    const i = Math.min(GRID - 1, Math.max(0, Math.floor((e.clientX - b.left) / s))), j = Math.min(GRID - 1, Math.max(0, Math.floor((e.clientY - b.top) / s)));
    const k = `${i},${j}`;
    setBoard((m) => { const n = new Map(m); if (n.has(k)) n.delete(k); else n.set(k, [i, j]); return n; });
    try { navigator.vibrate?.(6); } catch {}
    setMsg('');
  };

  const check = useCallback(() => {
    if (!day || over) return;
    if (!dots.length) { setMsg('Place some dots first.'); return; }
    const g = [...dots];
    const next = [...guesses, g];
    const ev = evaluate(g, tgt);
    setGuesses(next);
    const done = ev.won || next.length >= TRIES;
    saveToday({ day, guesses: next, done, won: ev.won });
    if (done) {
      setOver({ won: ev.won });
      const st = recordResult(day, ev.won, next.length);
      setStats(st);
      stamp('pulli');
      track('pulli_solved', { won: ev.won, tries: next.length });
      fetch('/api/pulli', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ day, tries: ev.won ? next.length : 0 }) }).catch(() => {});
      if (ev.won) {
        setGlow(true);
        cheer('शाबाश!', 'Shabaash!');
        earned('pulli-solve');
        if (next.length <= 3) earned('pulli-three');
        if (st.streak >= 3) earned('pulli-streak');
        setTimeout(() => say('Breakfast time! Today’s kolam was delicious.', { pose: 'eat', ms: 4200 }), 1900);
      }
    } else {
      setMsg(`${ev.marks.filter((m) => m === 'hit').length} right, ${ev.missing} still missing.`);
      shake(bRef.current, 5, 320);
    }
  }, [day, over, dots, guesses, tgt]);

  // the frame renders at once (the stage must exist for the size hook); today's puzzle fills in after mount
  const text = day ? shareText(day, guesses, !!over?.won, tgt, `${location.origin}/pulli`) : '';

  // two boards in the stage: side by side when the stage is wide, stacked when it is tall
  // (each board wears ~26px of frame: border, mat and its ring)
  const aw = Math.max(160, sw - framePad(sw, sh)), ah = Math.max(200, sh - framePad(sw, sh) - captionH(sw, sh));
  const side = Math.floor(Math.min((aw - 14 - 52) / 2, ah - 24 - 26));
  const stack = Math.floor(Math.min(aw - 26, (ah - 14 - 100) / 2));
  const stacked = stack > side;
  const S = Math.max(120, stacked ? stack : side);

  return (
    <ToyShell
      toy="pulli" label="Pulli, the daily kolam puzzle" title="Pulli Puzzle" sub={<span lang="hi">पुल्ली पहेली</span>} stageRef={stage}
      caption={<span className={s.status}>Streak <b>{stats.streak}</b> 🔥 · puzzle #{day ? puzzleNumber(day) : ''}</span>}
      stage={
        <div className={p.boards} data-stacked={stacked ? '' : undefined}>
          <figure>
            <figcaption className={p.cap}>Today&apos;s kolam</figcaption>
            <canvas ref={tRef} className={s.canvas} style={{ width: S, height: S }} role="img" aria-label={`Today's kolam line, made from ${tgt.length} dots`} />
          </figure>
          <figure>
            <figcaption className={p.cap}>Your dots · {dots.length}/{tgt.length}</figcaption>
            <canvas ref={bRef} className={`${s.canvas}${glow ? ' ' + p.won : ''}`} style={{ width: S, height: S, cursor: over ? 'default' : 'pointer' }} onPointerDown={tap} role="img" aria-label={`Your board, ${dots.length} dots placed. Tap a cell to add or remove a dot.`} />
          </figure>
        </div>
      }
      actions={!over ? (
        <>
          <ToolBtn icon="✔" label={`Check · ${TRIES - guesses.length} left`} onClick={check} go />
          <ToolBtn icon="⟲" label="Clear" onClick={() => setBoard(new Map())} disabled={!board.size} />
        </>
      ) : (
        <>
          <ToolBtn icon="📋" label="Copy result" onClick={async () => setMsg((await copy(text)) ? 'Copied! Paste it in your group chat.' : '')} go />
          <ToolBtn icon="💬" label="WhatsApp" onClick={() => whatsapp(text)} />
        </>
      )}
    >
      <p className={p.help}>Find the dots behind today&apos;s kolam. It has <b>{tgt.length} pulli</b>. Tap the grid to place dots and the line weaves around them. After a check: <b className={p.hit}>green</b> = right spot, <b className={p.near}>gold</b> = a missing dot is right next to it, grey = not close.</p>
      <p className={p.msg} role="status" aria-live="polite">{msg}</p>
      {over && (
        <div className={p.done}>
          <b className={p.verdict}>{over.won ? `Shabaash! ${guesses.length}/${TRIES}` : 'So close! Tomorrow, then.'}</b>
          <pre className={p.share} aria-label="Your result">{text.split('\n').slice(0, -1).join('\n')}</pre>
          <div className={p.stats}>
            <span><b>{stats.played}</b> played</span><span><b>{stats.played ? Math.round((stats.won / stats.played) * 100) : 0}%</b> won</span>
            <span><b>{stats.streak}</b> streak</span><span><b>{stats.best}</b> best</span>
          </div>
          {global && global.played > 0 && <span>{global.solved.toLocaleString('en-IN')} of {global.played.toLocaleString('en-IN')} players solved today&apos;s Pulli.</span>}
          <div className={p.nap}><span className={p.ant}><Cheenti pose="sleep" /></span><span>Kal milte hain! Next Pulli in <b>{left}</b>.</span></div>
          <a className={s.surprise} href="/kolam" style={{ display: 'grid', placeItems: 'center', textDecoration: 'none' }}>Weave a kolam of your own →</a>
        </div>
      )}
      {guesses.length > 0 && (
        <ol className={p.history} aria-label="Your checks">
          {guesses.map((g, gi) => {
            const ev = evaluate(g, tgt);
            const m = new Map(g.map((d, i) => [key(d), ev.marks[i]]));
            return (
              <li key={gi} aria-label={`Check ${gi + 1}: ${ev.marks.filter((x) => x === 'hit').length} right`}>
                {Array.from({ length: GRID * GRID }, (_, k) => { const mk = m.get(`${k % GRID},${Math.floor(k / GRID)}`); return <i key={k} style={{ background: mk ? MARK[mk] : undefined }} />; })}
              </li>
            );
          })}
        </ol>
      )}
    </ToyShell>
  );
}
