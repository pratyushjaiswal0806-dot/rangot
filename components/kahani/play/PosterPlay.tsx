'use client';
// "A sign in four coats": type a word and add the coats the way a sign painter does, one at a
// time: base colour, drop shadow, shine, outline. Each coat is one more copy of the word,
// offset and stacked in SVG. Hindi words work too (the display font has Devanagari).
import { useLayoutEffect, useRef, useState } from 'react';
import s from './Play.module.css';

const COATS = [
  { name: 'Base', note: 'A flat coat of colour. Readable up close, but it melts into a busy street.' },
  { name: 'Shadow', note: 'A darker copy set down and to the right. Now the word lifts off the board.' },
  { name: 'Shine', note: 'A thin light edge on the top and left, as if the sun caught the letters.' },
  { name: 'Outline', note: 'A crisp dark line round everything. You can read it from across the road now.' },
];
const BOARDS = [
  { name: 'Chai shop', bg: '#1E6B52', base: '#FFC21A', shadow: '#7A0E3A', shine: '#FFF3C4', line: '#1B1410' },
  { name: 'Kirana', bg: '#B3122A', base: '#FBF3E4', shadow: '#1B1410', shine: '#FFFFFF', line: '#2D4C7C' },
  { name: 'Cinema', bg: '#203A6B', base: '#FF9EC0', shadow: '#1B1410', shine: '#FFFFFF', line: '#FFC21A' },
];
const WORDS = ['CHAI', 'चाय', 'MELA', 'मिठाई'];

export default function PosterPlay() {
  const [word, setWord] = useState('CHAI');
  const [coats, setCoats] = useState(1);
  const [board, setBoard] = useState(0);
  const b = BOARDS[board];
  const w = word.trim().slice(0, 10) || 'CHAI';
  // set big, then shrink the whole stack until the word fits the board (scripts vary a lot in width)
  const fs = 110;
  const base = useRef<SVGTextElement>(null);
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    const fit = () => { const len = base.current?.getComputedTextLength() ?? 0; setK(len ? Math.min(1, 250 / len) : 1); };
    fit();
    document.fonts?.ready.then(fit);
  }, [w]);
  const text = (dx: number, dy: number, p: React.SVGProps<SVGTextElement>) => (
    <text x={150 + dx} y={160 + dy} textAnchor="middle" dominantBaseline="middle" fontSize={fs} fontFamily="'Palanquin Dark', sans-serif" fontWeight="700" {...p}>{w}</text>
  );

  return (
    <div className={s.play}>
      <div className={s.body}>
        <div className={s.stage} style={{ background: b.bg, aspectRatio: '1' }}>
          <svg viewBox="0 0 300 300" role="img" aria-label={`“${w}” painted with ${coats} coat${coats > 1 ? 's' : ''}: ${COATS.slice(0, coats).map((c) => c.name.toLowerCase()).join(', ')}`}>
            <rect x="10" y="10" width="280" height="280" fill="none" stroke={b.base} strokeWidth="3" strokeDasharray="1 7" strokeLinecap="round" />
            <g transform={`translate(150 160) scale(${k}) translate(-150 -160)`}>
            {coats >= 2 && text(fs * 0.07, fs * 0.07, { fill: b.shadow, stroke: b.shadow, strokeWidth: fs * 0.04, strokeLinejoin: 'round', className: s.pop })}
            {coats >= 3 && text(-fs * 0.022, -fs * 0.022, { fill: b.shine })}
            {text(0, 0, { fill: b.base, ref: base })}
            {coats >= 4 && text(0, 0, { fill: 'none', stroke: b.line, strokeWidth: fs * 0.022, strokeLinejoin: 'round' })}
            </g>
            <text x="150" y="262" textAnchor="middle" fontSize="13" fontFamily="Sarpanch, sans-serif" fontWeight="800" letterSpacing="3" fill={b.base} opacity=".85">{b.name.toUpperCase()}</text>
          </svg>
        </div>
        <div className={s.info}>
          <label className={s.label} htmlFor="pp-word">Your word</label>
          <input id="pp-word" className={s.input} value={word} maxLength={10} onChange={(e) => setWord(e.target.value)} autoComplete="off" />
          <div className={s.btns} role="group" aria-label="Try a word">
            {WORDS.map((x) => <button key={x} type="button" className={`${s.chip}`} aria-pressed={x === word} onClick={() => setWord(x)}><b>{x}</b></button>)}
          </div>
          <span className={s.label}>Coat {coats} of 4 · {COATS[coats - 1].name}</span>
          <p className={s.note} aria-live="polite">{COATS[coats - 1].note}</p>
          <div className={s.btns}>
            <button type="button" className={`${s.btn} ${s.ghost}`} onClick={() => setCoats((c) => Math.max(1, c - 1))} disabled={coats === 1}>Scrape a coat</button>
            <button type="button" className={s.btn} onClick={() => setCoats((c) => Math.min(4, c + 1))} disabled={coats === 4}>Next coat</button>
            <button type="button" className={`${s.btn} ${s.ghost}`} onClick={() => setBoard((v) => (v + 1) % BOARDS.length)}>New board</button>
          </div>
        </div>
      </div>
    </div>
  );
}
