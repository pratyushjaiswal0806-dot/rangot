'use client';
// "Don't lift your finger": trace a sikku kolam in one stroke. Start on the glowing dot and follow
// the faint line; stray too far or lift your finger before the end and the flour scatters.
// Close the loop and ants come for breakfast. "Show me" draws it by itself (and is the way to
// play without a pointer). The loops come from lib/art/sikku.ts, the same weave as the toy.
import { useEffect, useMemo, useRef, useState } from 'react';
import { oneLine, weave, type Dot, type Pt } from '../../../lib/art/sikku';
import s from './KolamPlay.module.css';

const LEVELS: { label: string; dots: Dot[] }[] = [
  { label: '1 pulli', dots: [[0, 0]] },
  { label: '4 pulli', dots: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  { label: '5 pulli', dots: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] },
  { label: '9 pulli', dots: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]] },
];
const V = 300, PAD = 40, TOL = 26;
const STEPS = 10;

// The loop's points are edge midpoints joined by quadratic curves through the halfway points
// (see tracePath in lib/art/sikku.ts); sample it into a polyline in viewBox units.
function sample(pts: Pt[], sc: number, ox: number, oy: number) {
  const n = pts.length, out: { x: number; y: number }[] = [];
  const P = (k: number) => ({ x: ox + pts[((k % n) + n) % n].x * sc, y: oy + pts[((k % n) + n) % n].y * sc });
  const mid = (k: number) => { const a = P(k), b = P(k + 1); return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
  for (let k = 0; k < n; k++) {
    const a = mid(k - 1), c = P(k), b = mid(k);
    for (let t = 0; t < STEPS; t++) {
      const u = t / STEPS, v = 1 - u;
      out.push({ x: v * v * a.x + 2 * v * u * c.x + u * u * b.x, y: v * v * a.y + 2 * v * u * c.y + u * u * b.y });
    }
  }
  return out;
}
const poly = (p: { x: number; y: number }[]) => p.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join('');

type State = 'ready' | 'tracing' | 'oops' | 'done';

export default function KolamPlay() {
  const [lv, setLv] = useState(1);
  const [prog, setProg] = useState(0);
  const [state, setState] = useState<State>('ready');
  const [ants, setAnts] = useState<{ x: number; y: number; a: number }[]>([]);
  const svg = useRef<SVGSVGElement>(null);
  const raf = useRef(0);

  const { path, dots, sc, ox, oy } = useMemo(() => {
    const d = LEVELS[lv].dots;
    const w = weave(d, oneLine(d, new Map(), 2));
    const cols = Math.max(...d.map(([i]) => i)) + 1, rows = Math.max(...d.map(([, j]) => j)) + 1;
    const sc = Math.min((V - PAD * 2) / cols, (V - PAD * 2) / rows, 110);
    const ox = (V - cols * sc) / 2, oy = (V - rows * sc) / 2;
    return { path: sample(w.loops[0], sc, ox, oy), dots: d, sc, ox, oy };
  }, [lv]);
  const N = path.length;

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const reset = (k = lv) => { cancelAnimationFrame(raf.current); setLv(k); setProg(0); setAnts([]); setState('ready'); };

  const toSvg = (e: React.PointerEvent) => {
    const m = svg.current!.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  const near = (q: { x: number; y: number }, k: number) => Math.hypot(q.x - path[k % N].x, q.y - path[k % N].y);

  // breakfast: ants walk the finished loop
  const feast = () => {
    setState('done');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t0 = performance.now(), count = Math.min(7, 2 + lv * 2);
    const tick = (t: number) => {
      // (a frame's timestamp can be a hair before t0)
      const f = Math.max(0, (t - t0) / 9000);
      setAnts(Array.from({ length: count }, (_, k) => {
        const i = Math.floor((f * N + (k * N) / count)) % N, a = path[i], b = path[(i + 2) % N];
        return { x: a.x, y: a.y, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
      }));
      if (f < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const down = (e: React.PointerEvent) => {
    if (state === 'done') return;
    if (near(toSvg(e), 0) > TOL * 1.4) { setState('oops'); setProg(0); return; }
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setProg(0); setState('tracing');
  };
  const move = (e: React.PointerEvent) => {
    if (state !== 'tracing') return;
    const q = toSvg(e);
    // look a little way ahead along the line for the closest sample the finger is on
    let best = -1, bd = TOL;
    for (let k = prog; k <= Math.min(N, prog + 14); k++) { const d = near(q, k); if (d < bd) { bd = d; best = k; } }
    if (best >= 0) { if (best >= N - 2) { setProg(N); feast(); } else setProg(best); return; }
    // nowhere near the next stretch of line: the flour scatters
    let off = true;
    for (let k = Math.max(0, prog - 6); k <= Math.min(N, prog + 20); k++) if (near(q, k) < TOL * 2) { off = false; break; }
    if (off) { setState('oops'); setProg(0); }
  };
  const up = () => { if (state === 'tracing') { setState('oops'); setProg(0); } };

  const show = () => {
    reset();
    const t0 = performance.now(), dur = 900 + N * 9;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setProg(N); feast(); return; }
    setState('tracing');
    const tick = (t: number) => {
      const f = Math.min(1, Math.max(0, (t - t0) / dur));
      setProg(Math.floor(f * N));
      if (f < 1) raf.current = requestAnimationFrame(tick); else feast();
    };
    raf.current = requestAnimationFrame(tick);
  };

  const start = path[0], dir = path[3];
  const msg = state === 'done' ? (lv < LEVELS.length - 1 ? 'One line, no lifting! And here come the ants for breakfast.' : 'Nine pulli in one stroke. Ammamma would be proud.')
    : state === 'oops' ? 'Oops, the flour scattered. Start again on the glowing dot.'
    : state === 'tracing' ? 'Keep going, don’t lift…'
    : 'Put your finger on the glowing dot and follow the line.';

  return (
    <div className={s.play}>
      <div className={s.levels} role="group" aria-label="How many dots">
        {LEVELS.map((l, k) => <button key={l.label} type="button" aria-pressed={k === lv} onClick={() => reset(k)}>{l.label}</button>)}
      </div>
      <div className={s.body}>
        <svg ref={svg} viewBox={`0 0 ${V} ${V}`} className={`${s.floor} ${state === 'oops' ? s.shake : ''}`} role="img"
          aria-label={`A kolam of ${dots.length} dots to trace in one line`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <rect width={V} height={V} fill="#3A2A22" />
          <path d={poly(path) + 'Z'} fill="none" stroke="rgba(251,243,228,.22)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 12" />
          {prog > 1 && <path d={poly(path.slice(0, prog + 1)) + (prog >= N ? 'Z' : '')} fill="none" stroke="#FBF3E4" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" className={state === 'done' ? s.glow : undefined} />}
          {dots.map(([i, j]) => <circle key={i + '-' + j} cx={ox + (i + 0.5) * sc} cy={oy + (j + 0.5) * sc} r="6" fill="#FFC21A" stroke="#1B1410" strokeWidth="2" />)}
          {state !== 'done' && (
            <g className={state === 'tracing' ? undefined : s.pulse}>
              <circle cx={start.x} cy={start.y} r="13" fill="#D63A2A" stroke="#FBF3E4" strokeWidth="3" />
              <path d={`M${start.x} ${start.y}L${dir.x} ${dir.y}`} stroke="#FBF3E4" strokeWidth="3" strokeLinecap="round" markerEnd="url(#kpArrow)" />
            </g>
          )}
          <defs><marker id="kpArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 10 5 0 10Z" fill="#FBF3E4" /></marker></defs>
          {ants.map((a, k) => (
            <g key={k} transform={`translate(${a.x} ${a.y}) rotate(${a.a}) scale(.8)`}>
              <path d="M-6 -5-9 -10M-1 -5v-7M4 -5l3 -7M-6 5l-3 5M-1 5v7M4 5l3 6" stroke="#1B1410" strokeWidth="1.6" strokeLinecap="round" />
              <ellipse cx="-7" rx="5" ry="4" fill="#1B1410" /><ellipse rx="3.4" ry="3" fill="#1B1410" /><ellipse cx="7" rx="4" ry="3.4" fill="#1B1410" />
            </g>
          ))}
        </svg>
        <div className={s.info}>
          <p className={s.msg} aria-live="polite">{msg}</p>
          <div className={s.meter} aria-hidden="true"><i style={{ width: `${(Math.min(prog, N) / N) * 100}%` }} /></div>
          <div className={s.btns}>
            <button type="button" onClick={show}>Show me</button>
            {state === 'done' && lv < LEVELS.length - 1 && <button type="button" className={s.go} onClick={() => reset(lv + 1)}>More pulli →</button>}
            {state !== 'ready' && state !== 'done' && <button type="button" onClick={() => reset()}>Start over</button>}
          </div>
          <p className={s.tip}>The rule of the sikku kolam: the line goes round every dot, crosses itself between them, and comes home to where it began.</p>
        </div>
      </div>
    </div>
  );
}
