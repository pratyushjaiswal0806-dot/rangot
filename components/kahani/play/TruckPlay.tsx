'use client';
// "Decode the truck": the back of a painted lorry with numbered spots. Tap one to find out what
// it says or does. A counter keeps track of how many you've decoded.
import { useState } from 'react';
import Rich from '../Rich';
import s from './Play.module.css';
import t from './TruckPlay.module.css';

const INK = '#1B1410', HALDI = '#FFC21A', SINDOOR = '#D63A2A', IVORY = '#FBF3E4', LEAF = '#2F6B3B', NIGHT = '#2D4C7C', MAROON = '#7A0E3A';

const SPOTS: { x: number; y: number; name: string; says?: string; note: string }[] = [
  { x: 150, y: 45, name: 'The eyes', note: 'Painted eyes watch the road behind, and stare down the [[nazar]], the evil eye, before it can do harm.' },
  { x: 72, y: 104, name: 'HORN … PLEASE', note: 'Honk before you overtake. Old trucks had poor side mirrors, so a horn was how the driver knew you were there.' },
  { x: 176, y: 106, name: 'OK', note: 'The mystery. One story says wartime trucks ran *On Kerosene* and OK warned you to keep back. Nobody really knows.' },
  { x: 37, y: 154, name: 'Nazar battu', note: 'A fierce face with a lolling tongue: the [[nazarbattu|nazar battu]]. It is ugly on purpose, to catch the evil eye first.' },
  { x: 266, y: 166, name: 'Nimbu-mirchi', note: 'A lemon and green chillies on a thread, the [[nimbumirchi|nimbu-mirchi]]. Many drivers hang a fresh one every week.' },
  { x: 50, y: 192, name: 'Use dipper at night', says: 'USE DIPPER AT NIGHT', note: 'Please dip your headlights at night, so you don’t dazzle the driver ahead.' },
  { x: 28, y: 220, name: 'Buri nazar…', says: 'BURI NAZAR WALE TERA MUNH KALA', note: '“Evil-eyed one, may your face turn black!” The rudest, most loved line on the road.' },
  { x: 28, y: 251, name: 'Mera Bharat Mahan', says: 'MERA BHARAT MAHAN', note: '“My India is great.” A favourite on lorries and buses for decades.' },
  { x: 196, y: 281, name: 'Tassels', note: 'Swinging tassels and chains dance as the truck moves. Black ones double as protection from nazar.' },
];

function Art() {
  const txt = { fontFamily: 'Sarpanch, sans-serif', fontWeight: 900, textAnchor: 'middle' as const };
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true">
      <rect width="300" height="300" fill="#6E7F8C" />
      <rect x="20" y="20" width="260" height="222" fill={HALDI} stroke={INK} strokeWidth="3" />
      <rect x="20" y="20" width="260" height="52" fill={SINDOOR} stroke={INK} strokeWidth="3" />
      {[110, 190].map((x) => (
        <g key={x}>
          <path d={`M${x - 26} 45c10-16 42-16 52 0-10 16-42 16-52 0Z`} fill={IVORY} stroke={INK} strokeWidth="2.5" />
          <circle cx={x} cy="45" r="9" fill={NIGHT} stroke={INK} strokeWidth="2" /><circle cx={x} cy="45" r="3.5" fill={INK} />
          <path d={`M${x - 22} 36l-5-7M${x - 10} 32l-2-8M${x + 2} 31v-8M${x + 14} 33l3-8`} stroke={INK} strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
      {Array.from({ length: 26 }, (_, k) => <path key={k} d={`M${20 + k * 10} 72h10l-5 9Z`} fill={[LEAF, IVORY, NIGHT][k % 3]} stroke={INK} strokeWidth="1" />)}
      <rect x="58" y="90" width="184" height="80" fill={IVORY} stroke={INK} strokeWidth="2.5" />
      <text x="92" y="137" fontSize="21" fill={SINDOOR} {...txt}>HORN</text>
      {Array.from({ length: 8 }, (_, k) => <ellipse key={k} cx="150" cy="114" rx="5.5" ry="8" fill="#E86A92" stroke={INK} strokeWidth="1.5" transform={`rotate(${k * 45} 150 130)`} />)}
      <circle cx="150" cy="130" r="16" fill={NIGHT} stroke={INK} strokeWidth="2" />
      <text x="150" y="137" fontSize="18" fill={HALDI} {...txt}>OK</text>
      <text x="210" y="136" fontSize="15" fill={LEAF} {...txt}>PLEASE</text>
      <circle cx="37" cy="128" r="15" fill={INK} stroke={IVORY} strokeWidth="1.5" />
      <circle cx="31" cy="123" r="4" fill={IVORY} /><circle cx="43" cy="123" r="4" fill={IVORY} />
      <circle cx="31" cy="123" r="1.6" fill={SINDOOR} /><circle cx="43" cy="123" r="1.6" fill={SINDOOR} />
      <path d="M32 132h10v9c0 3-10 3-10 0Z" fill={SINDOOR} /><path d="M28 131l2 4M46 131l-2 4" stroke={IVORY} strokeWidth="2" />
      <path d="M28 113l-4-6M46 113l4-6" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M266 88v10" stroke={INK} strokeWidth="1.5" />
      {[[266, 104, 'c'], [266, 120, 'l'], [266, 138, 'c'], [266, 154, 'c']].map(([x, y, k], i) => k === 'l'
        ? <circle key={i} cx={x as number} cy={y as number} r="8" fill="#D9E04A" stroke={INK} strokeWidth="1.5" />
        : <path key={i} d={`M${x} ${(y as number) - 6}c3 0 4 4 3 12-1 4-5 4-6 0-1-8 0-12 3-12Z`} fill={LEAF} stroke={INK} strokeWidth="1.2" />)}
      <text x="150" y="196" fontSize="13" fill={INK} {...txt}>USE DIPPER AT NIGHT</text>
      <rect x="20" y="206" width="260" height="28" fill={MAROON} stroke={INK} strokeWidth="2.5" />
      <text x="158" y="224" fontSize="9.5" fill={IVORY} {...txt}>BURI NAZAR WALE TERA MUNH KALA</text>
      <rect x="12" y="242" width="276" height="20" fill={INK} />
      <text x="158" y="256" fontSize="10" fill={HALDI} {...txt}>MERA BHARAT MAHAN</text>
      {[70, 230].map((x) => <circle key={x} cx={x} cy="284" r="18" fill={INK} stroke="#555" strokeWidth="4" />)}
      {[112, 126, 140, 160, 174, 188].map((x, i) => (
        <g key={x}><path d={`M${x} 262v${14 + (i % 2) * 6}`} stroke={i % 3 ? INK : SINDOOR} strokeWidth="3" /><circle cx={x} cy={278 + (i % 2) * 6} r="3" fill={i % 2 ? HALDI : SINDOOR} stroke={INK} strokeWidth="1" /></g>
      ))}
    </svg>
  );
}

export default function TruckPlay() {
  const [sel, setSel] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(() => new Set());
  const pick = (i: number) => { setSel(i); setSeen((v) => new Set(v).add(i)); };
  const cur = sel == null ? null : SPOTS[sel];

  return (
    <div className={s.play}>
      <div className={s.body}>
        <div className={s.stage}>
          <Art />
          {SPOTS.map((p, i) => (
            <button key={i} type="button" className={`${t.spot} ${seen.has(i) ? t.seen : ''}`} style={{ left: `${(p.x / 300) * 100}%`, top: `${(p.y / 300) * 100}%` }}
              aria-pressed={sel === i} aria-label={`${i + 1}: ${p.name}`} onClick={() => pick(i)}>{i + 1}</button>
          ))}
        </div>
        <div className={s.info}>
          <span className={s.label}>Decoded {seen.size} of {SPOTS.length}{seen.size === SPOTS.length ? ' · Ustad of the highway!' : ''}</span>
          <div aria-live="polite" className={s.info}>
            {cur ? (
              <>
                <p className={s.name}><b>{cur.name}</b></p>
                {cur.says && <p className={s.where}>Painted: {cur.says}</p>}
                <p className={s.note}><Rich text={cur.note} /></p>
              </>
            ) : <p className={s.note}>Every truck back is a little newspaper. Tap number 1 to start.</p>}
          </div>
          <div className={s.btns}>
            <button type="button" className={s.btn} onClick={() => pick(sel == null ? 0 : (sel + 1) % SPOTS.length)}>{sel == null ? 'Start' : 'Next spot'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
