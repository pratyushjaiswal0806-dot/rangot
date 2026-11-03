'use client';
// "Atham to Thiruvonam": the ten days of Onam on a slider. Each day the carpet grows a ring,
// from one small ring of thumba on Atham to ten on Thiruvonam, with the day's name and what
// happens on it. "Play the ten days" walks through them by itself.
import { useEffect, useRef, useState } from 'react';
import s from './Play.module.css';

const C = 150;
const circle = (r: number) => `M${C - r} ${C}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const r0 = (k: number) => (k ? 16 + 13.4 * (k - 1) : 0);
const r1 = (k: number) => 16 + 13.4 * k;

type Ring = { kind: 'band' | 'teeth' | 'petals'; a: string; b?: string; n?: number; flower: string };
// ring k is laid on day k + 1, centre outwards
const RINGS: Ring[] = [
  { kind: 'band', a: '#F6F1E3', flower: 'Thumba' },
  { kind: 'band', a: '#FFC21A', flower: 'Mukkutti' },
  { kind: 'teeth', a: '#F07F13', b: '#FFC21A', n: 12, flower: 'Chendumalli (marigold)' },
  { kind: 'band', a: '#D7262E', flower: 'Chethi (ixora)' },
  { kind: 'petals', a: '#7B3F98', b: '#F6F1E3', n: 16, flower: 'Vadamalli and thumba' },
  { kind: 'band', a: '#E8649A', flower: 'Arali (oleander)' },
  { kind: 'teeth', a: '#3F7D2E', b: '#8CBF3F', n: 24, flower: 'Leaves' },
  { kind: 'band', a: '#F2A65A', flower: 'Kanakambaram' },
  { kind: 'petals', a: '#F07F13', b: '#FFC21A', n: 28, flower: 'Marigold, two shades' },
  { kind: 'teeth', a: '#8E1630', b: '#D7262E', n: 36, flower: 'Chembarathi (hibiscus)' },
];

const DAYS: { name: string; ml: string; note: string }[] = [
  { name: 'Atham', ml: 'അത്തം', note: 'One small ring, often of thumba. In Thrippunithura the Athachamayam parade sets out and Onam begins.' },
  { name: 'Chithira', ml: 'ചിത്തിര', note: 'A second ring and a second colour. Homes get a good clean before the guest arrives.' },
  { name: 'Chodhi', ml: 'ചോതി', note: 'Three rings. Time to shop for onakkodi, the new clothes worn for Onam.' },
  { name: 'Vishakam', ml: 'വിശാഖം', note: 'Four rings. Markets fill with the harvest, and many families start planning the feast.' },
  { name: 'Anizham', ml: 'അനിഴം', note: 'Five rings. Snake boats are out on the rivers, practising for the boat races.' },
  { name: 'Thriketta', ml: 'തൃക്കേട്ട', note: 'Six rings. Schools close for the holidays and families head home.' },
  { name: 'Moolam', ml: 'മൂലം', note: 'Seven rings. Towns and temples start their Onam feasts, songs and dances.' },
  { name: 'Pooradam', ml: 'പൂരാടം', note: 'Eight rings. In many homes, clay figures called Onathappan are set in the courtyard.' },
  { name: 'Uthradam', ml: 'ഉത്രാടം', note: 'Nine rings. “First Onam”: the last-minute rush for vegetables, flowers and gifts.' },
  { name: 'Thiruvonam', ml: 'തിരുവോണം', note: 'Ten rings, the biggest carpet. Mahabali is said to visit; new clothes, and the sadya on a banana leaf.' },
];

function RingArt({ k, ring }: { k: number; ring: Ring }) {
  const a = r0(k), b = r1(k), n = ring.n ?? 0, step = 360 / Math.max(1, n);
  const edge = { stroke: 'rgba(27,20,16,.45)', strokeWidth: 1 };
  return (
    <g className={s.pop} style={{ transformOrigin: `${C}px ${C}px`, transformBox: 'view-box' }}>
      <path d={a ? circle(b) + circle(a) : circle(b)} fill={ring.a} fillRule="evenodd" {...edge} />
      {ring.kind === 'teeth' && Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M${C} ${C - b + 1}L${C + ((b - a) * 0.55)} ${C - a - 1}H${C - ((b - a) * 0.55)}Z`} fill={ring.b} transform={`rotate(${i * step} ${C} ${C})`} />
      ))}
      {ring.kind === 'petals' && Array.from({ length: n }, (_, i) => (
        <ellipse key={i} cx={C} cy={C - (a + b) / 2} rx={(b - a) * 0.22} ry={(b - a) * 0.4} fill={ring.b} transform={`rotate(${i * step} ${C} ${C})`} />
      ))}
    </g>
  );
}

export default function PookalamPlay() {
  const [day, setDay] = useState(1);
  const [auto, setAuto] = useState(false);
  const t = useRef<ReturnType<typeof setInterval>>(undefined);
  const d = DAYS[day - 1], ring = RINGS[day - 1];

  useEffect(() => {
    if (!auto) return;
    t.current = setInterval(() => setDay((v) => Math.min(10, v + 1)), 1400);
    return () => clearInterval(t.current);
  }, [auto]);
  useEffect(() => { if (day === 10) setAuto(false); }, [day]);

  const play = () => { if (auto) { setAuto(false); return; } setDay(1); setAuto(true); };

  return (
    <div className={s.play}>
      <div className={s.body}>
        <div className={s.stage} style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,.07), transparent 60%), #4A2C1A' }}>
          <svg viewBox="0 0 300 300" role="img" aria-label={`The pookalam on day ${day}: ${day} ring${day > 1 ? 's' : ''} of flowers`}>
            <circle cx={C} cy={C} r={r1(9) + 4} fill="none" stroke="rgba(251,243,228,.18)" strokeWidth="1.5" strokeDasharray="3 5" />
            {RINGS.slice(0, day).map((rg, k) => <RingArt key={k} k={k} ring={rg} />).reverse()}
          </svg>
        </div>
        <div className={s.info}>
          <label className={s.label} htmlFor="pk-day">Day {day} of 10</label>
          <input id="pk-day" className={s.range} type="range" min={1} max={10} value={day} onChange={(e) => { setAuto(false); setDay(+e.target.value); }} aria-valuetext={`Day ${day}, ${d.name}`} />
          <div aria-live="polite" className={s.info}>
            <p className={s.name}><b>{d.name}</b> <span lang="ml">{d.ml}</span></p>
            <p className={s.where}>Today’s ring · {ring.flower}</p>
            <p className={s.note}>{d.note}</p>
          </div>
          <div className={s.btns}>
            <button type="button" className={`${s.btn} ${s.ghost}`} onClick={() => { setAuto(false); setDay((v) => Math.max(1, v - 1)); }} disabled={day === 1} aria-label="Previous day">←</button>
            <button type="button" className={`${s.btn} ${s.ghost}`} onClick={() => { setAuto(false); setDay((v) => Math.min(10, v + 1)); }} disabled={day === 10} aria-label="Next day">→</button>
            <button type="button" className={s.btn} onClick={play}>{auto ? 'Pause' : 'Play the ten days'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
