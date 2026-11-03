'use client';
// "Grow a kolam by rule": each step adds a ring of pulli round the last grid (a diamond that
// goes 1, 1-3-1, 1-3-5-3-1 … or a square that goes 1×1, 2×2 …), and the same weaving rule
// (oneLine in lib/art/sikku.ts, as in the Kolam toy) turns the bigger grid into one line again.
import { useMemo, useState } from 'react';
import { oneLine, sikkuPathD, weave, SIKKU_GRID, type Dot } from '../../../lib/art/sikku';
import s from './Play.module.css';

const RULES = [
  { id: 'diamond', name: 'Diamond', sub: '1 · 1-3-1 · 1-3-5-3-1', steps: 4,
    dots: (n: number): Dot[] => { const o: Dot[] = []; for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) if (Math.abs(i - 3) + Math.abs(j - 3) < n) o.push([i, j]); return o; } },
  { id: 'square', name: 'Square', sub: '1×1 · 2×2 · 3×3', steps: 7,
    dots: (n: number): Dot[] => { const o: Dot[] = [], a = Math.floor((7 - n) / 2); for (let j = a; j < a + n; j++) for (let i = a; i < a + n; i++) o.push([i, j]); return o; } },
];
const SC = 280 / SIKKU_GRID;

// how the grid reads, row by row: "1-3-5-3-1"
const rows = (d: Dot[]) => {
  const m = new Map<number, number>();
  d.forEach(([, j]) => m.set(j, (m.get(j) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([, c]) => c).join('-');
};

export default function PulliPlay() {
  const [r, setR] = useState(0);
  const [n, setN] = useState(2);
  const rule = RULES[r];
  const { dots, loops } = useMemo(() => {
    const d = rule.dots(n);
    return { dots: d, loops: weave(d, oneLine(d, new Map(), 7)).loops };
  }, [rule, n]);
  const choose = (k: number) => { setR(k); setN((v) => Math.min(v, RULES[k].steps)); };

  return (
    <div className={s.play}>
      <div className={s.chips} role="group" aria-label="Growth rule">
        {RULES.map((x, k) => <button key={x.id} type="button" className={s.chip} aria-pressed={k === r} onClick={() => choose(k)}><b>{x.name}</b><span>{x.sub}</span></button>)}
      </div>
      <div className={s.body}>
        <div className={s.stage}>
          <svg viewBox="0 0 300 300" role="img" aria-label={`Step ${n}: ${dots.length} dots in rows ${rows(dots)}, woven into ${loops.length} line${loops.length > 1 ? 's' : ''}`}>
            <g transform="translate(10 10)">
              {Array.from({ length: SIKKU_GRID * SIKKU_GRID }, (_, k) => <circle key={k} cx={((k % 7) + 0.5) * SC} cy={(Math.floor(k / 7) + 0.5) * SC} r="1.6" fill="rgba(251,243,228,.18)" />)}
              {loops.map((pts, k) => (
                <path key={`${r}-${n}-${k}`} d={sikkuPathD(pts, SC)} fill="none" stroke="#FBF3E4" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"
                  pathLength={1} strokeDasharray={1} style={{ animation: `kolamDraw ${1.2 + n * 0.35}s ease-in-out both` }} />
              ))}
              {dots.map(([i, j]) => <circle key={`${i},${j}`} cx={(i + 0.5) * SC} cy={(j + 0.5) * SC} r="3.6" fill="#FFC21A" />)}
            </g>
          </svg>
        </div>
        <div className={s.info}>
          <label className={s.label} htmlFor="pl-step">Step {n} of {rule.steps}</label>
          <input id="pl-step" className={s.range} type="range" min={1} max={rule.steps} value={n} onChange={(e) => setN(+e.target.value)} aria-valuetext={`Step ${n}, ${dots.length} dots`} />
          <dl className={s.facts} aria-live="polite">
            <div><dt>Rows</dt><dd>{rows(dots)}</dd></div>
            <div><dt>Pulli</dt><dd>{dots.length}</dd></div>
            <div><dt>Lines</dt><dd>{loops.length === 1 ? 'Still one unbroken line' : `${loops.length} lines`}</dd></div>
          </dl>
          <p className={s.note}>{n === 1
            ? 'One dot, one loop round it. Now add a ring of dots.'
            : `Each step the grid grows by a ring, ${rule.id === 'diamond' ? 'two more dots on the middle row' : 'one more row and column'}, and the same moves still give a single line.`}</p>
          <div className={s.btns}>
            <button type="button" className={`${s.btn} ${s.ghost}`} onClick={() => setN((v) => Math.max(1, v - 1))} disabled={n === 1}>Shrink</button>
            <button type="button" className={s.btn} onClick={() => setN((v) => Math.min(rule.steps, v + 1))} disabled={n === rule.steps}>Grow</button>
          </div>
        </div>
      </div>
    </div>
  );
}
