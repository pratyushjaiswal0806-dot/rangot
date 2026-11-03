'use client';
// "Swap the backdrop": a sitter in front of the painted backdrops an old Indian studio kept, from
// an 1890s palace hall to this toy's truck-art frame. Flip the print between black-and-white and
// hand-coloured, and press "Click!" for the flash (a long-exposure joke: sit still).
import { useState } from 'react';
import s from './Play.module.css';
import f from './SelfiePlay.module.css';

const INK = '#1B1410', HALDI = '#FFC21A', SINDOOR = '#D63A2A', IVORY = '#FBF3E4', LEAF = '#2F6B3B', NIGHT = '#2D4C7C';

const SCENES: { id: string; name: string; era: string; note: string; art: React.ReactNode }[] = [
  { id: 'palace', name: 'Palace hall', era: '1890s', note: 'Columns, heavy drapes, a patterned carpet and a carved chair. Deen Dayal’s Indore studio used one such set again and again for nobles and officers.',
    art: (
      <>
        <rect width="300" height="300" fill="#C9B48E" />
        {[40, 150, 260].map((x) => <path key={x} d={`M${x - 46} 220V96a46 46 0 0 1 92 0v124`} fill="#A88D62" stroke={INK} strokeWidth="2" />)}
        {[22, 96, 204, 278].map((x) => <g key={x}><rect x={x - 9} y="60" width="18" height="160" fill="#E6D7B4" stroke={INK} strokeWidth="2" /><rect x={x - 13} y="52" width="26" height="10" fill="#E6D7B4" stroke={INK} strokeWidth="2" /></g>)}
        <path d="M0 0h300v30c-40 24-60-6-100 12S120 20 80 36 20 10 0 30Z" fill="#7A0E3A" stroke={INK} strokeWidth="2" />
        <rect y="220" width="300" height="80" fill="#8E2A2A" />
        {Array.from({ length: 10 }, (_, k) => <path key={k} d={`M${k * 30 + 15} 236l10 14-10 14-10-14Z`} fill={HALDI} opacity=".7" />)}
      </>
    ) },
  { id: 'lake', name: 'Lake and hills', era: 'Mid 1900s', note: 'A lake between snowy mountains, with a little boat: a trip to the hills without leaving town. A favourite of neighbourhood studios.',
    art: (
      <>
        <rect width="300" height="300" fill="#BFD9FF" />
        <path d="M0 170 70 70l40 50 50-80 70 90 70-40v80Z" fill="#7FA88A" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M140 60l20-20 22 30-14-6-10 10ZM50 100l20-30 18 24-12-4Z" fill={IVORY} />
        <rect y="170" width="300" height="60" fill="#4D6FA3" />
        <path d="M190 190h44l-6 8h-32Z" fill="#8A5A3A" /><path d="M206 190v-16l14 12" fill="none" stroke={INK} strokeWidth="1.5" />
        {[20, 60, 260].map((x) => <path key={x} d={`M${x} 230c-6-30 4-60 14-70 4 20 0 50-6 70Z`} fill={LEAF} />)}
        <rect y="230" width="300" height="70" fill="#9C7B57" />
      </>
    ) },
  { id: 'garden', name: 'Garden', era: 'Wedding portraits', note: 'Flower beds, a fountain and a stone railing: the backdrop for a newly married couple or a proud family.',
    art: (
      <>
        <rect width="300" height="300" fill="#DDEBC8" />
        <path d="M0 120c50-30 100-30 150 0s100 30 150 0v100H0Z" fill="#9CC48A" />
        <path d="M130 200h40l-6-40h-28Z" fill={IVORY} stroke={INK} strokeWidth="2" />
        <path d="M150 160c-10-20-30-24-40-20M150 160c10-20 30-24 40-20M150 160v-30" stroke="#7FB4E0" strokeWidth="4" fill="none" strokeLinecap="round" />
        {[30, 70, 230, 270].map((x, i) => <g key={x}>{[0, 1, 2].map((k) => <circle key={k} cx={x + k * 8 - 8} cy={180 - (k % 2) * 6} r="7" fill={[SINDOOR, HALDI, '#E86A92'][(k + i) % 3]} stroke={INK} strokeWidth="1" />)}</g>)}
        <rect y="200" width="300" height="20" fill={IVORY} stroke={INK} strokeWidth="2" />
        {Array.from({ length: 15 }, (_, k) => <rect key={k} x={k * 20 + 6} y="220" width="8" height="24" fill={IVORY} stroke={INK} strokeWidth="1.5" />)}
        <rect y="244" width="300" height="56" fill="#B9A58C" />
      </>
    ) },
  { id: 'truck', name: 'Truck frame', era: 'Today', note: 'This toy’s backdrop: the back of a painted lorry, with eyes on top and HORN OK PLEASE below your face.',
    art: (
      <>
        <rect width="300" height="300" fill={HALDI} />
        <rect width="300" height="56" fill={SINDOOR} />
        {[110, 190].map((x) => <g key={x}><path d={`M${x - 24} 28c10-15 38-15 48 0-10 15-38 15-48 0Z`} fill={IVORY} stroke={INK} strokeWidth="2" /><circle cx={x} cy="28" r="8" fill={NIGHT} /><circle cx={x} cy="28" r="3" fill={INK} /></g>)}
        {Array.from({ length: 30 }, (_, k) => <path key={k} d={`M${k * 10} 56h10l-5 8Z`} fill={[LEAF, IVORY, NIGHT][k % 3]} />)}
        <rect x="30" y="74" width="240" height="180" rx="16" fill="#E8DCC0" stroke={INK} strokeWidth="4" />
        <rect y="262" width="300" height="38" fill={INK} />
        <text x="150" y="288" textAnchor="middle" fontSize="20" fontWeight="900" fontFamily="Sarpanch, sans-serif" fill={HALDI}>HORN OK PLEASE</text>
      </>
    ) },
];

function Sitter({ scene }: { scene: string }) {
  return (
    <g>
      {scene !== 'truck' && <path d="M214 262V172h36v44h10v46M214 216h46" fill="none" stroke="#5A3A22" strokeWidth="7" strokeLinejoin="round" />}
      <circle cx="150" cy="128" r="26" fill="#C98A64" stroke={INK} strokeWidth="2" />
      <path d="M124 124c0-22 12-32 26-32s26 10 26 32c-6-10-16-14-26-14s-20 4-26 14Z" fill={INK} />
      <path d="M100 262c0-56 20-86 50-86s50 30 50 86Z" fill={scene === 'garden' ? '#B3122A' : NIGHT} stroke={INK} strokeWidth="2" />
      <path d="M150 176v86" stroke={HALDI} strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" />
    </g>
  );
}

export default function SelfiePlay() {
  const [i, setI] = useState(0);
  const [colour, setColour] = useState(false);
  const [flash, setFlash] = useState(0);
  const sc = SCENES[i];
  const click = () => setFlash((n) => n + 1);

  return (
    <div className={s.play}>
      <div className={s.chips} role="group" aria-label="Pick a backdrop">
        {SCENES.map((x, k) => <button key={x.id} type="button" className={s.chip} aria-pressed={k === i} onClick={() => setI(k)}><b>{x.name}</b><span>{x.era}</span></button>)}
      </div>
      <div className={s.body}>
        <div className={`${s.stage} ${f.print}`} style={{ background: IVORY }}>
          <svg viewBox="0 0 300 300" role="img" aria-label={`A studio portrait in front of the ${sc.name.toLowerCase()} backdrop, ${colour ? 'hand-coloured' : 'in black and white'}`} className={colour ? f.tint : f.mono}>
            {sc.art}
            <Sitter scene={sc.id} />
          </svg>
          {flash > 0 && <span key={flash} className={f.flash} aria-hidden="true" />}
        </div>
        <div className={s.info}>
          <p className={s.name}><b>{sc.name}</b></p>
          <p className={s.where}>{sc.era}</p>
          <p className={s.note} aria-live="polite">{sc.note}</p>
          <div className={s.btns} role="group" aria-label="Print">
            <button type="button" className={s.chip} aria-pressed={!colour} onClick={() => setColour(false)}><b>Black &amp; white</b><span>Straight from the plate</span></button>
            <button type="button" className={s.chip} aria-pressed={colour} onClick={() => setColour(true)}><b>Hand-coloured</b><span>Tinted with a brush</span></button>
          </div>
          <div className={s.btns}>
            <button type="button" className={s.btn} onClick={click}>Click! (sit still)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
