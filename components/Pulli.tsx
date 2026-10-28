'use client';
// The daily Pulli puzzle. Left: today's woven line (no dots). Right: your board; the line
// weaves around your dots live as you tap. Six checks to match it exactly.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { C } from '../lib/art/palette';
import { drawKolam, kolamSegs } from '../lib/art/kolam';
import { istDay } from '../lib/festivals';
import { GRID, TRIES, evaluate, key, loadToday, msToNext, puzzleNumber, pulliStats, recordResult, saveToday, shareText, target, type Dot, type Mark } from '../lib/pulli';
import { copy, whatsapp } from '../lib/share';
import { stamp } from '../lib/progress';
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
    return () => clearInterval(iv);
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
      setStats(recordResult(day, ev.won, next.length));
      stamp('pulli');
      track('pulli_solved', { won: ev.won, tries: next.length });
      fetch('/api/pulli', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ day, tries: ev.won ? next.length : 0 }) }).catch(() => {});
    } else {
      setMsg(`${ev.marks.filter((m) => m === 'hit').length} right, ${ev.missing} still missing.`);
    }
  }, [day, over, dots, guesses, tgt]);

  if (!day) return <main className="rg-page" />;
  const url = `${location.origin}/pulli`;
  const text = shareText(day, guesses, !!over?.won, tgt, url);

  return (
    <main className="rg-page">
      <header className="rg-top">
        <a href="/" className="rg-logo">Rangotsav</a>
        <span className="rg-chip" style={{ pointerEvents: 'none' }}>Streak {stats.streak} 🔥</span>
      </header>
      <section className="rg-pulli">
        <div className="rg-pulli__head">
          <p className="rg-kicker">Daily puzzle #{puzzleNumber(day)}</p>
          <h1 className="rg-title">Pulli</h1>
          <p className="rg-p">Find the dots behind today&apos;s kolam. It has <b>{tgt.length} pulli</b>. Tap the grid to place dots, and the line weaves around them. You get {TRIES} checks.</p>
          <p className="rg-small" style={{ color: 'var(--parch)' }}>After a check: <b style={{ color: '#7fd68f' }}>green</b> = right spot, <b style={{ color: '#ffcf5a' }}>gold</b> = a missing dot is right next to it, grey = not close.</p>
        </div>
        <div className="rg-pulli__boards">
          <figure>
            <figcaption className="rg-label" style={{ color: 'var(--marigold)' }}>Today&apos;s kolam</figcaption>
            <canvas ref={tRef} className="rg-pulli__cv" role="img" aria-label={`Today's kolam line, made from ${tgt.length} dots`} />
          </figure>
          <figure>
            <figcaption className="rg-label" style={{ color: 'var(--marigold)' }}>Your dots · {dots.length}/{tgt.length}</figcaption>
            <canvas ref={bRef} className="rg-pulli__cv" style={{ cursor: over ? 'default' : 'pointer', touchAction: 'manipulation' }} onPointerDown={tap} role="img" aria-label={`Your board, ${dots.length} dots placed. Tap a cell to add or remove a dot.`} />
          </figure>
        </div>
        {!over ? (
          <div className="rg-pulli__actions">
            <button className="rg-btn rg-btn--primary" onClick={check} style={{ minWidth: 200 }}>Check ({TRIES - guesses.length} left)</button>
            <button className="rg-btn" onClick={() => setBoard(new Map())}>Clear</button>
            <p className="rg-status" role="status" aria-live="polite" style={{ color: 'var(--marigold)', width: '100%', textAlign: 'center' }}>{msg}</p>
          </div>
        ) : (
          <div className="rg-pulli__done">
            <h2 className="rg-h" style={{ color: 'var(--marigold)' }}>{over.won ? `Shabaash! ${guesses.length}/${TRIES}` : 'So close! Tomorrow, then.'}</h2>
            <pre className="rg-pulli__share" aria-label="Your result">{text.split('\n').slice(0, -1).join('\n')}</pre>
            <div className="rg-actions">
              <button className="rg-btn rg-btn--primary" onClick={async () => setMsg((await copy(text)) ? 'Copied! Paste it in your group chat.' : '')}>Copy result</button>
              <button className="rg-btn rg-btn--wa" onClick={() => whatsapp(text)}>WhatsApp</button>
            </div>
            <p className="rg-status" role="status" style={{ color: 'var(--marigold)' }}>{msg}</p>
            <div className="rg-pulli__stats">
              <span><b>{stats.played}</b> played</span><span><b>{stats.played ? Math.round((stats.won / stats.played) * 100) : 0}%</b> won</span>
              <span><b>{stats.streak}</b> streak</span><span><b>{stats.best}</b> best</span>
            </div>
            {global && global.played > 0 && <p className="rg-p">{global.solved.toLocaleString('en-IN')} of {global.played.toLocaleString('en-IN')} players solved today&apos;s Pulli.</p>}
            <p className="rg-p">Next Pulli in <b>{left}</b>.</p>
            <a className="rg-btn rg-btn--block" href="/?tool=kolam">Weave a kolam of your own →</a>
          </div>
        )}
        {guesses.length > 0 && (
          <ol className="rg-pulli__history" aria-label="Your checks">
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
      </section>
      <footer className="rg-foot">A Pegasus · RVITM project · <a href="/">rangotsav</a></footer>
    </main>
  );
}
