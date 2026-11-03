'use client';
// "One art, many floors": pick a place and its floor art draws itself in its own material and
// colours (white rice paste on red earth, chalk on geru, coloured powder, petals). "Sweep" brushes
// it away like every morning; "Draw again" brings it back. Every motif is a few SVG paths built
// here: lines draw themselves, fills pop in, and with reduced motion they're simply there.
import { useEffect, useRef, useState } from 'react';
import { oneLine, shapeDots, sikkuPathD, weave, SIKKU_GRID } from '../../../lib/art/sikku';
import s from './RangoliPlay.module.css';

type Part = { d: string; fill?: string; stroke?: string; w?: number; rot?: number; tf?: string };
type Style = { id: string; name: string; script: string; lang: string; place: string; floor: string; material: string; tool: string; note: string; parts: () => Part[] };

const C = 150;
const LANG: Record<string, string> = { Tamil: 'ta', Bengali: 'bn', Rajasthani: 'raj', Maithili: 'mai', Odia: 'or', Marathi: 'mr', Malayalam: 'ml' };
const PASTE = '#F7F0E1';
const ring = (n: number) => Array.from({ length: n }, (_, k) => (k * 360) / n);
const circle = (r: number, cx = C, cy = C) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
// a petal pointing up from radius r0 to r1, w wide; rotated into place with rot
const petal = (r0: number, r1: number, w: number) => {
  const a = C - r0, b = C - r1, m = a - (r1 - r0) * 0.45;
  return `M${C} ${a}C${C + w} ${m} ${C + w * 0.5} ${b + 8} ${C} ${b}C${C - w * 0.5} ${b + 8} ${C - w} ${m} ${C} ${a}Z`;
};
// a closed ring between two radii (even-odd fill)
const band = (r0: number, r1: number) => circle(r1) + circle(r0);
const foot = (x: number, y: number, flip: boolean): Part[] => {
  const k = flip ? -1 : 1;
  return [
    { d: `M${x} ${y}c${7 * k} 0 ${11 * k} -8 ${10 * k} -18s${-3 * k} -16 ${-9 * k} -16 ${-10 * k} 8 ${-10 * k} 16 ${2 * k} 18 ${9 * k} 18Z`, fill: PASTE },
    ...[[-8, -40, 3.4], [-3, -42, 2.8], [2, -41, 2.6], [6, -38, 2.3], [9, -34, 2]].map(([dx, dy, r]) => ({ d: circle(r, x + dx * k, y + dy), fill: PASTE })),
  ];
};

const STYLES: Style[] = [
  { id: 'kolam', name: 'Kolam', script: 'கோலம்', lang: 'Tamil', place: 'Tamil Nadu', floor: '#3A2A22',
    material: 'Dry rice flour', tool: 'A pinch between thumb and finger', note: 'Dots first, then one line looping round them, drawn on a floor sprinkled with water.',
    parts: () => {
      const dots = shapeDots('diamond'), sc = 264 / SIKKU_GRID, tf = 'translate(18 18)';
      const w = weave(dots, oneLine(dots, new Map(), 3));
      return [
        ...w.loops.map((pts) => ({ d: sikkuPathD(pts, sc), stroke: PASTE, w: 5, tf })),
        ...dots.map(([i, j]) => ({ d: circle(3.2, (i + 0.5) * sc, (j + 0.5) * sc), fill: PASTE, tf })),
      ];
    } },
  { id: 'alpana', name: 'Alpana', script: 'আলপনা', lang: 'Bengali', place: 'West Bengal', floor: '#9A4426',
    material: 'Rice soaked and ground to a paste', tool: 'A fingertip, or a scrap of cloth', note: 'Flowing lotuses and creepers in white, often for Lakshmi puja.',
    parts: () => [
      { d: circle(122), stroke: PASTE, w: 4 },
      ...ring(16).map((rot) => ({ d: `M${C} ${C - 122}c10 -10 22 -4 18 6s-16 4 -12 -4`, stroke: PASTE, w: 3.5, rot })),
      ...ring(8).map((rot) => ({ d: petal(30, 108, 34), stroke: PASTE, w: 4.5, rot })),
      ...ring(8).map((rot) => ({ d: petal(30, 70, 18), fill: PASTE, rot: rot + 22.5 })),
      { d: circle(26), stroke: PASTE, w: 4.5 },
      ...ring(8).map((rot) => ({ d: circle(4, C, C - 15), fill: PASTE, rot })),
    ] },
  { id: 'mandana', name: 'Mandana', script: 'मांडणा', lang: 'Rajasthani', place: 'Rajasthan', floor: '#A8432A',
    material: 'Khadia chalk on a floor of red earth and cow dung', tool: 'A tuft of hair, a twig or a finger', note: 'Sharp geometry in white, drawn by women for festivals, weddings and births.',
    parts: () => [
      { d: 'M40 40h220v220H40Z', stroke: PASTE, w: 4 },
      { d: Array.from({ length: 11 }, (_, k) => `M${40 + k * 20} 40l10 -14 10 14`).join('') + Array.from({ length: 11 }, (_, k) => `M${40 + k * 20} 260l10 14 10 -14`).join(''), stroke: PASTE, w: 3 },
      { d: 'M150 58 242 150 150 242 58 150Z', stroke: PASTE, w: 4 },
      { d: 'M85 85h130v130H85Z', stroke: PASTE, w: 4 },
      { d: 'M85 85 215 215M215 85 85 215', stroke: PASTE, w: 3 },
      { d: circle(30), fill: PASTE },
      { d: circle(16), fill: '#A8432A' },
      ...[[150, 70], [230, 150], [150, 230], [70, 150]].map(([x, y]) => ({ d: circle(6, x, y), fill: PASTE })),
    ] },
  { id: 'aripan', name: 'Aripan', script: 'अरिपन', lang: 'Maithili', place: 'Mithila, Bihar', floor: '#6E4A2E',
    material: 'Rice paste, sometimes with vermilion', tool: 'Two fingers dipped in the paste', note: 'Lotuses, fish and footprints for pujas and weddings. The fish stands for plenty.',
    parts: () => [
      ...ring(12).map((rot) => ({ d: `M${C} 40v26`, stroke: PASTE, w: 4, rot })),
      { d: circle(70), stroke: PASTE, w: 4 },
      ...ring(10).map((rot) => ({ d: petal(14, 62, 18), stroke: PASTE, w: 3.5, rot })),
      { d: circle(12), fill: PASTE },
      { d: 'M70 252c22 -22 62 -22 84 0c-22 22 -62 22 -84 0Zm84 0 18 -14v28Z', stroke: PASTE, w: 3.5 },
      { d: 'M230 252c-22 -22 -62 -22 -84 0c22 22 62 22 84 0Zm-84 0 -18 -14v28Z', stroke: PASTE, w: 3.5, rot: 0 },
      { d: circle(3.5, 86, 248), fill: PASTE },
      { d: circle(3.5, 214, 248), fill: PASTE },
    ] },
  { id: 'jhoti', name: 'Jhoti', script: 'ଝୋଟି', lang: 'Odia', place: 'Odisha', floor: '#7A5A3C',
    material: 'Pithau, a white rice paste', tool: 'A fingertip or a twig wrapped in cloth', note: 'On Manabasa Thursdays, Lakshmi’s footprints walk in from the door, past sheaves of paddy.',
    parts: () => [
      { d: 'M120 64V28h60v36', stroke: PASTE, w: 4 },
      ...[0, 1, 2].flatMap((k) => [...foot(128 - k * 4, 132 + k * 58, false), ...foot(172 + k * 4, 112 + k * 58, true)]),
      ...[46, 254].flatMap((x) => [
        { d: `M${x} 270V90`, stroke: PASTE, w: 3.5 },
        ...Array.from({ length: 7 }, (_, k) => ({ d: `M${x} ${110 + k * 22}c-14 -6 -18 -16 -16 -24M${x} ${110 + k * 22}c14 -6 18 -16 16 -24`, stroke: PASTE, w: 3 })),
      ]),
    ] },
  { id: 'rangoli', name: 'Rangoli', script: 'रांगोळी', lang: 'Marathi', place: 'Maharashtra', floor: '#3B2117',
    material: 'Coloured powder', tool: 'Powder let fall in a thin line from the fingers', note: 'Bright colours poured inside white outlines, biggest at Diwali.',
    parts: () => [
      ...ring(12).map((rot) => ({ d: petal(70, 128, 26), fill: '#C93A82', rot })),
      ...ring(12).map((rot) => ({ d: petal(70, 128, 26), stroke: PASTE, w: 2.5, rot })),
      ...ring(8).map((rot) => ({ d: petal(28, 84, 26), fill: '#FFC21A', rot: rot + 22.5 })),
      ...ring(8).map((rot) => ({ d: petal(28, 84, 26), stroke: PASTE, w: 2.5, rot: rot + 22.5 })),
      { d: circle(30), fill: '#2F6B3B' },
      { d: circle(14), fill: '#E8761E' },
      ...ring(24).map((rot) => ({ d: circle(4.5, C, 12), fill: '#E8761E', rot })),
    ] },
  { id: 'pookalam', name: 'Pookalam', script: 'പൂക്കളം', lang: 'Malayalam', place: 'Kerala', floor: '#4A2C1A',
    material: 'Only flower petals', tool: 'Hands, petal by petal', note: 'Laid for the ten days of Onam, a ring bigger each day.',
    parts: () => [
      { d: band(118, 136), fill: '#E8761E' },
      { d: band(98, 118), fill: '#FFC21A' },
      { d: band(80, 98), fill: '#FBF6EA' },
      ...ring(16).map((rot, k) => ({ d: `M${C} ${C - 80}L${C + 31} ${C - 74}L${C} ${C - 30}Z`, fill: k % 2 ? '#7A3B9E' : '#D63A2A', rot })),
      { d: band(18, 32), fill: '#2F6B3B' },
      { d: circle(18), fill: '#FFC21A' },
    ] },
];

export default function RangoliPlay() {
  const [i, setI] = useState(0);
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<'draw' | 'sweep' | 'gone'>('draw');
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const st = STYLES[i];
  const parts = st.parts();
  const lines = parts.filter((p) => p.stroke).length;
  useEffect(() => () => clearTimeout(t.current), []);

  const choose = (k: number) => { clearTimeout(t.current); setI(k); setPhase('draw'); setRun((r) => r + 1); };
  const sweep = () => {
    if (phase !== 'draw') { choose(i); return; }
    setPhase('sweep');
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    t.current = setTimeout(() => setPhase('gone'), calm ? 0 : 1100);
  };

  let li = 0, fi = 0;
  return (
    <div className={s.play}>
      <div className={s.places} role="group" aria-label="Pick a floor art">
        {STYLES.map((x, k) => (
          <button key={x.id} type="button" aria-pressed={k === i} onClick={() => choose(k)} className={s.place}>
            <b>{x.name}</b><span>{x.place}</span>
          </button>
        ))}
      </div>
      <div className={s.body}>
        <div className={s.floor} style={{ background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,.08), transparent 60%), ${st.floor}` }}>
          {phase !== 'gone' && (
            <svg key={run} viewBox="0 0 300 300" className={phase === 'sweep' ? s.sweeping : undefined} role="img" aria-label={`A ${st.name} from ${st.place}`}>
              {parts.map((p, k) => {
                const anim = p.stroke
                  ? { pathLength: 1, strokeDasharray: 1, style: { animation: `kolamDraw ${Math.max(0.6, 2.4 - lines * 0.04)}s ease-in-out ${(li++ * 0.09).toFixed(2)}s both` } }
                  : { className: s.fill, style: { animationDelay: `${(0.6 + fi++ * 0.04).toFixed(2)}s` } };
                const el = <path d={p.d} fill={p.fill ?? 'none'} fillRule="evenodd" stroke={p.stroke} strokeWidth={p.w} strokeLinecap="round" strokeLinejoin="round" {...anim} />;
                return <g key={k} transform={p.tf ?? (p.rot ? `rotate(${p.rot} ${C} ${C})` : undefined)}>{el}</g>;
              })}
            </svg>
          )}
          {phase === 'sweep' && (
            <svg className={s.broom} viewBox="0 0 60 120" aria-hidden="true">
              <path d="M30 4v58" stroke="#1B1410" strokeWidth="6" strokeLinecap="round" />
              <path d="M30 4v58" stroke="#C99A3A" strokeWidth="3" strokeLinecap="round" />
              <path d="M22 60h16l18 56H4Z" fill="#E0B256" stroke="#1B1410" strokeWidth="3" strokeLinejoin="round" />
              <path d="M24 70 14 112M30 70v42M36 70l10 42" stroke="#A87A2A" strokeWidth="2" />
            </svg>
          )}
          {phase === 'gone' && <p className={s.empty}>Swept clean. Tomorrow morning, it starts again.</p>}
        </div>
        <div className={s.info} aria-live="polite">
          <p className={s.name}><b>{st.name}</b> <span lang={LANG[st.lang]}>{st.script}</span></p>
          <p className={s.where}>{st.place} · {st.lang}</p>
          <dl className={s.facts}>
            <div><dt>Made of</dt><dd>{st.material}</dd></div>
            <div><dt>Drawn with</dt><dd>{st.tool}</dd></div>
          </dl>
          <p className={s.note}>{st.note}</p>
          <button type="button" className={s.sweep} onClick={sweep}>{phase === 'draw' ? 'Sweep it away' : 'Draw again'}</button>
        </div>
      </div>
    </div>
  );
}
