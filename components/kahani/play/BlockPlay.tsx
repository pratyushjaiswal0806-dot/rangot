'use client';
// "Press the layers": three carved blocks for one flower butta, the rekh (outline), then a red
// and a green fill block. Pick a block and press; every press lands a hair off, like a hand
// lining it up by eye. Start with a fill and the printer tuts. Choose a Sanganer white ground
// or a Bagru harda-yellow one.
import { useState } from 'react';
import s from './Play.module.css';

type Press = { dx: number; dy: number; rot: number }[];
const SPOTS = [55, 150, 245].flatMap((y) => [55, 150, 245].map((x) => [x, y] as [number, number]));
const PETALS = [0, 72, 144, 216, 288];
const LEAF = 'M0 14C4 4 16 2 26 4C22 14 12 18 0 14Z';

const BLOCKS = [
  { id: 'rekh', name: 'Rekh', role: 'Outline', ink: '#2A1A12', note: 'The outline block goes first. Its lines are what the colours line up against.' },
  { id: 'red', name: 'Red fill', role: 'Petals', ink: '#B4262A', note: 'A fill block for the petals, cut to sit just inside the outline. Madder root gives the red.' },
  { id: 'green', name: 'Green fill', role: 'Leaves', ink: '#3F6B3A', note: 'A second fill for the leaves and stem. One more block, one more colour.' },
];
const GROUNDS = [
  { id: 'sanganer', name: 'Sanganer', sub: 'White ground', hex: '#FBF6EA' },
  { id: 'bagru', name: 'Bagru', sub: 'Harda ground', hex: '#E6D19A' },
];

const wobble = (): Press => SPOTS.map(() => ({ dx: (Math.random() - 0.5) * 5, dy: (Math.random() - 0.5) * 5, rot: (Math.random() - 0.5) * 4 }));

function Layer({ b, press }: { b: number; press: Press }) {
  const ink = BLOCKS[b].ink;
  return (
    <g fill={b ? ink : 'none'} stroke={b ? 'none' : ink} strokeWidth={b ? 0 : 2.6} strokeLinejoin="round" opacity={b ? 0.92 : 1} style={{ mixBlendMode: 'multiply' }}>
      {SPOTS.map(([x, y], i) => {
        const p = press[i];
        return (
          <g key={i} transform={`translate(${x + p.dx} ${y - 6 + p.dy}) rotate(${p.rot})`}>
            {b !== 2 && PETALS.map((a) => <ellipse key={a} cx="0" cy={b ? -10.5 : -11} rx={b ? 5.6 : 6.6} ry={b ? 9 : 10} transform={`rotate(${a})`} />)}
            {b !== 1 && <>
              <path d="M0 18v16" stroke={b ? ink : undefined} strokeWidth={b ? 3 : undefined} />
              <path d={LEAF} transform="translate(0 16)" />
              <path d={LEAF} transform="translate(0 16) scale(-1 1)" />
            </>}
            {b === 0 && <><circle r="4" /><circle r="1.8" fill={ink} /></>}
          </g>
        );
      })}
    </g>
  );
}

export default function BlockPlay() {
  const [presses, setPresses] = useState<(Press | null)[]>([null, null, null]);
  const [order, setOrder] = useState<number[]>([]);
  const [ground, setGround] = useState(0);
  const [cur, setCur] = useState(0);
  const all = presses.every(Boolean);
  const outlineLate = order.length > 0 && order[0] !== 0;

  const press = (b: number) => {
    if (presses[b]) return;
    setPresses((ps) => ps.map((p, i) => (i === b ? wobble() : p)));
    setOrder((o) => [...o, b]);
    const free = [0, 1, 2].find((i) => i !== b && !presses[i]);
    if (free != null) setCur(free);
  };
  const reset = () => { setPresses([null, null, null]); setOrder([]); setCur(0); };
  const bk = BLOCKS[cur];
  const last = order.length ? BLOCKS[order[order.length - 1]] : null;

  return (
    <div className={s.play}>
      <div className={s.chips} role="group" aria-label="Pick the cloth">
        {GROUNDS.map((g, i) => <button key={g.id} type="button" className={s.chip} aria-pressed={i === ground} onClick={() => setGround(i)}><b>{g.name}</b><span>{g.sub}</span></button>)}
      </div>
      <div className={s.body}>
        <div className={s.stage} style={{ background: GROUNDS[ground].hex, transition: 'background-color .4s', cursor: all ? 'default' : 'pointer' }} onClick={() => press(cur)}>
          <svg viewBox="0 0 300 300" role="img" aria-label={`Cloth with ${order.length} of 3 blocks pressed`}>
            <rect width="300" height="300" fill="url(#bp-weave)" />
            <defs>
              <pattern id="bp-weave" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 2h4M2 0v4" stroke="rgba(27,20,16,.05)" strokeWidth="1" /></pattern>
            </defs>
            {[1, 2, 0].map((b) => presses[b] && <Layer key={b + '-' + order.indexOf(b)} b={b} press={presses[b]!} />)}
          </svg>
        </div>
        <div className={s.info}>
          <span className={s.label}>{all ? 'All three blocks pressed' : 'Choose a block, then press'}</span>
          <div className={s.chips} role="group" aria-label="Blocks">
            {BLOCKS.map((b, i) => (
              <button key={b.id} type="button" className={s.chip} aria-pressed={i === cur && !presses[i]} disabled={!!presses[i]} onClick={() => setCur(i)}>
                <b style={{ display: 'flex', alignItems: 'center', gap: 8 }}><i aria-hidden="true" style={{ width: 16, height: 16, background: b.ink, border: '2px solid #1B1410' }} />{b.name}</b>
                <span>{presses[i] ? `Pressed ${order.indexOf(i) + 1}` : b.role}</span>
              </button>
            ))}
          </div>
          <p className={s.note} aria-live="polite">
            {!last && bk.note}
            {last && !all && (outlineLate && order.length === 1 ? 'Hmm, a printer would start with the rekh: without the outline there’s nothing to line the colour up against. Carry on, and see.' : `Pressed the ${last.name.toLowerCase()} block. Look closely: each flower landed slightly differently. Next: ${bk.name.toLowerCase()}.`)}
            {all && (outlineLate ? 'Done! See how the colours sit a little loose? Printers press the rekh first so every fill has lines to aim for.' : 'Shabash! Outline, then fills: a butta in three presses. Those tiny shifts are how you tell real hand block print from a machine copy.')}
          </p>
          <div className={s.btns}>
            {!all && <button type="button" className={s.btn} onClick={() => press(cur)} disabled={!!presses[cur]}>Press the {bk.name.toLowerCase()} block</button>}
            {order.length > 0 && <button type="button" className={`${s.btn} ${s.ghost}`} onClick={reset}>Fresh cloth</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
