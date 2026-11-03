'use client';
// "Dye in the right order": tap the three dye pots in the order you'd dip. Between dips another
// round of knots is tied, and each round keeps the colour the cloth had when it was tied. Dyes
// mix like real ones (multiply), so a light dye after a dark one simply vanishes. Untie to see
// the dots. Below it: the names of a few knot clusters, drawn.
import { useState } from 'react';
import s from './Play.module.css';

const CLOTH = '#FBF6EA';
const DYES = [
  { id: 'yellow', name: 'Haldi yellow', hex: '#F2B705' },
  { id: 'red', name: 'Sindoor red', hex: '#C8102E' },
  { id: 'maroon', name: 'Maroon', hex: '#5A0F1E' },
];
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c: number[]) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
// dye on dye: each colour filters the light the last one let through
const mix = (picks: number[]) => hex(picks.reduce((c, p) => c.map((v, i) => (v * rgb(DYES[p].hex)[i]) / 255), rgb(CLOTH)));

// the knots tied before each dip: chaubundi clusters, then single dots, then small ones
const TIERS: [number, number, number][][] = [
  Array.from({ length: 25 }, (_, k) => [30 + (k % 5) * 60, 30 + Math.floor(k / 5) * 60, 0] as [number, number, number]),
  Array.from({ length: 16 }, (_, k) => [60 + (k % 4) * 60, 60 + Math.floor(k / 4) * 60, 1] as [number, number, number]),
  Array.from({ length: 20 }, (_, k) => [30 + (k % 5) * 60, 60 + Math.floor(k / 5) * 60, 2] as [number, number, number]),
];

const KNOTS: { id: string; name: string; script: string; note: string; pts: [number, number][] }[] = [
  { id: 'ekdali', name: 'Ekdali', script: 'एकदाली', note: 'One dot: a single knot.', pts: [[0, 0]] },
  { id: 'trikunti', name: 'Trikunti', script: 'त्रिकुंटी', note: 'A cluster of three dots.', pts: [[0, -9], [-8, 5], [8, 5]] },
  { id: 'chaubundi', name: 'Chaubundi', script: 'चौबुंदी', note: 'Four dots in a little square or flower.', pts: [[0, -9], [9, 0], [0, 9], [-9, 0]] },
  { id: 'satbundi', name: 'Satbundi', script: 'सतबुंदी', note: 'Seven dots: six round one.', pts: [[0, 0], ...Array.from({ length: 6 }, (_, k) => [Math.round(Math.cos((k * Math.PI) / 3) * 11), Math.round(Math.sin((k * Math.PI) / 3) * 11)] as [number, number])] },
  { id: 'dungar', name: 'Dungar shahi', script: 'डुंगर शाही', note: 'The mountain pattern: dots piled into peaks.', pts: [[-24, 14], [-16, 14], [-8, 14], [0, 14], [8, 14], [16, 14], [24, 14], [-20, 6], [-12, 6], [12, 6], [20, 6], [-16, -2], [16, -2], [-4, 6], [4, 6], [0, -2], [-4, -10], [4, -10], [0, -18]] },
];

function Dot({ x, y, tier, c, tied }: { x: number; y: number; tier: number; c: string; tied: boolean }) {
  const pts: [number, number, number][] = tier === 0 ? [[-6, 0, 4], [6, 0, 4], [0, -6, 4], [0, 6, 4]] : tier === 1 ? [[0, 0, 5]] : [[0, 0, 3.4]];
  return (
    <g transform={`translate(${x} ${y})`}>
      {pts.map(([dx, dy, r], i) => tied
        ? <g key={i}><circle cx={dx} cy={dy} r={r + 1} fill="#EDE3CC" stroke="#1B1410" strokeWidth=".8" /><path d={`M${dx - r} ${dy}h${2 * r}`} stroke="#9A7A4A" strokeWidth="1" /></g>
        : <circle key={i} cx={dx} cy={dy} r={r} fill={c} className={s.pop} style={{ animationDelay: `${(x + y) / 900}s` }} />)}
    </g>
  );
}

export default function BandhaniPlay() {
  const [picks, setPicks] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [knot, setKnot] = useState(2);
  const done = picks.length === 3;
  const ground = mix(picks);
  const right = picks.join() === '0,1,2';
  // a dye is lost if anything darker went on before it
  const lost = picks.filter((p, i) => picks.slice(0, i).some((q) => q > p)).map((p) => DYES[p].name.toLowerCase());
  const k = KNOTS[knot];

  const dip = (i: number) => { if (!done && !picks.includes(i)) setPicks((ps) => [...ps, i]); };
  const reset = () => { setPicks([]); setOpen(false); };

  return (
    <div className={s.play}>
      <div className={s.body}>
        <div className={s.stage} style={{ background: ground, transition: 'background-color .6s' }}>
          <svg viewBox="0 0 300 300" role="img" aria-label={open ? (right ? 'The cloth untied: white, yellow and red dots on maroon' : 'The cloth untied: the colours have gone muddy') : `The cloth after ${picks.length} dip${picks.length === 1 ? '' : 's'}, with knots tied`}>
            {TIERS.map((tier, t) => (t <= picks.length) && tier.map(([x, y]) => (
              <Dot key={`${t}-${x}-${y}`} x={x} y={y} tier={t} c={mix(picks.slice(0, t))} tied={!open} />
            )))}
          </svg>
        </div>
        <div className={s.info}>
          <span className={s.label}>{done ? 'All three dips done' : `Dip ${picks.length + 1} of 3: which pot?`}</span>
          <div className={s.btns} role="group" aria-label="Dye pots">
            {DYES.map((d, i) => (
              <button key={d.id} type="button" className={s.chip} onClick={() => dip(i)} disabled={done || picks.includes(i)} aria-pressed={picks.includes(i)}>
                <b style={{ display: 'flex', alignItems: 'center', gap: 8 }}><i aria-hidden="true" style={{ width: 18, height: 18, borderRadius: '50%', background: d.hex, border: '2px solid #1B1410' }} />{d.name}</b>
                <span>{picks.includes(i) ? `Dip ${picks.indexOf(i) + 1}` : 'Dip'}</span>
              </button>
            ))}
          </div>
          <p className={s.note} aria-live="polite">
            {!picks.length && 'The white cloth already has its first knots tied. Choose the first dye.'}
            {picks.length > 0 && !done && `Dipped in ${DYES[picks[picks.length - 1]].name.toLowerCase()}. More knots are tied to keep this colour. Next pot?`}
            {done && !open && 'Now the best part: pull the cloth and the knots pop open.'}
            {done && open && (right
              ? 'Sahi! Light to dark: white, yellow and red dots on a deep maroon ground. That’s how a rangrez does it.'
              : `Arre! The ${lost.join(' and ')} went on after a darker dye, so ${lost.length > 1 ? 'they' : 'it'} vanished. Light dyes can’t cover dark ones: go yellow, red, then maroon.`)}
          </p>
          <div className={s.btns}>
            {done && !open && <button type="button" className={s.btn} onClick={() => setOpen(true)}>Untie the knots</button>}
            {picks.length > 0 && <button type="button" className={`${s.btn} ${s.ghost}`} onClick={reset}>Fresh cloth</button>}
          </div>
        </div>
      </div>

      <div className={s.info}>
        <span className={s.label}>Knots with names</span>
        <div className={s.chips} role="group" aria-label="Knot patterns">
          {KNOTS.map((x, i) => (
            <button key={x.id} type="button" className={s.chip} aria-pressed={i === knot} onClick={() => setKnot(i)}><b>{x.name}</b><span>{x.pts.length} dot{x.pts.length > 1 ? 's' : ''}</span></button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <svg viewBox="-36 -30 72 60" width="144" height="120" role="img" aria-label={`${k.name}: ${k.note}`} style={{ background: '#B3122A', border: '3px solid #1B1410', boxShadow: '4px 4px 0 #120A07', flex: 'none' }}>
            {k.pts.map(([x, y], i) => <circle key={`${knot}-${i}`} cx={x} cy={y} r="3.4" fill="#FBF6EA" className={s.pop} style={{ animationDelay: `${i * 0.03}s` }} />)}
          </svg>
          <p className={s.note} aria-live="polite" style={{ flex: '1 1 200px' }}><b>{k.name}</b> <span lang="hi">{k.script}</span>. {k.note}</p>
        </div>
      </div>
    </div>
  );
}
