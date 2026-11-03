'use client';
// "The colour of a flame": a lamp and a shelf of eight jars. Tip a spoonful from a jar into the
// flame and it burns that metal's colour for a moment (iron and aluminium throw sparks instead).
// Drop strontium and copper one after the other and it burns purple, the way firework makers mix
// it. A tally keeps count; with reduced motion the colour simply changes.
import { useEffect, useRef, useState } from 'react';
import { drawSparks, glowSprite, spray, stepSparks, type Spark } from '../../../lib/art/sparks';
import { calm } from '../../../lib/motion';
import { chime, pluck, ting, whoosh } from '../../../lib/sfx';
import p from './Play.module.css';
import s from './PhuljhadiPlay.module.css';

type Salt = { id: string; sym: string; name: string; jar: string; flame: string; colour: string; spark?: boolean; note: string };
const SALTS: Salt[] = [
  { id: 'sr', sym: 'Sr', name: 'Strontium', jar: '#E0302A', flame: '#FF3B30', colour: 'red', note: 'The red in rockets, red sparklers and road flares.' },
  { id: 'na', sym: 'Na', name: 'Sodium', jar: '#F2B705', flame: '#FFC21A', colour: 'deep yellow', note: 'Common salt has it. Its yellow is so strong it can drown out the other colours.' },
  { id: 'ca', sym: 'Ca', name: 'Calcium', jar: '#E8761E', flame: '#FF7A1E', colour: 'orange', note: 'Firework makers add it to deepen other colours.' },
  { id: 'ba', sym: 'Ba', name: 'Barium', jar: '#2FA35E', flame: '#58FF7A', colour: 'bright green', note: 'Barium salts pollute the air, which is why “green” crackers are made without them.' },
  { id: 'cu', sym: 'Cu', name: 'Copper', jar: '#1E9FC0', flame: '#38D3FF', colour: 'blue-green', note: 'Blue is the hardest firework colour: too hot, and copper loses its blue.' },
  { id: 'k', sym: 'K', name: 'Potassium', jar: '#8A46B8', flame: '#CDA4FF', colour: 'pale lilac', note: 'Potassium nitrate, saltpetre, is also the main part of gunpowder.' },
  { id: 'fe', sym: 'Fe', name: 'Iron', jar: '#7A5236', flame: '#FFB347', colour: 'gold sparks', spark: true, note: 'Iron filings burn into gold sparks that fork into stars. That is the phuljhadi!' },
  { id: 'al', sym: 'Al', name: 'Aluminium', jar: '#9AA3AD', flame: '#FFB347', colour: 'white sparks', spark: true, note: 'Silvery-white sparks and a dazzling flash.' },
];
const SPARK: Record<string, string> = { fe: '#FFC94A', al: '#FFF6E0' };
const LAMP = '#FFB347'; // an ordinary flame, before anything goes in
const PURPLE = { id: 'mix', sym: 'Sr+Cu', name: 'Strontium and copper', flame: '#B46BFF', colour: 'purple', note: 'Red and blue-green together: purple, just as firework makers mix it.' };

export default function PhuljhadiPlay() {
  const [flame, setFlame] = useState(LAMP);
  const [shown, setShown] = useState<{ sym: string; name: string; colour: string; note: string } | null>(null);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [spoon, setSpoon] = useState<{ c: string; n: number } | null>(null);
  const [flare, setFlare] = useState(0);
  const cv = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ id: string; t: number } | null>(null);
  const back = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const drop = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fizz = useRef<{ c: string; until: number } | null>(null);
  const raf = useRef(0);

  useEffect(() => () => { clearTimeout(back.current); clearTimeout(drop.current); cancelAnimationFrame(raf.current); }, []);

  // sparks from the flame's tip while iron or aluminium burns
  const sparkle = (c: string) => {
    const el = cv.current;
    if (!el || calm()) return;
    const x = el.getContext('2d')!, W = el.clientWidth, H = el.clientHeight, d = Math.min(2, window.devicePixelRatio || 1);
    if (el.width !== Math.round(W * d) || el.height !== Math.round(H * d)) { el.width = Math.round(W * d); el.height = Math.round(H * d); }
    x.setTransform(d, 0, 0, d, 0, 0);
    const sp: Spark[] = [], glow = glowSprite();
    fizz.current = { c, until: performance.now() + 1400 };
    cancelAnimationFrame(raf.current);
    let t0 = 0;
    const step = (now: number) => {
      const dt = t0 ? Math.min(50, now - t0) : 16.67;
      t0 = now;
      const f = fizz.current;
      // the flame sits mid-stage (the lamp drawing scales to the stage's height)
      if (f && now < f.until) spray(sp, W * 0.5, H * 0.42, f.c, 14, 5, 500);
      stepSparks(sp, dt, 500);
      x.clearRect(0, 0, W, H);
      drawSparks(x, sp, glow);
      raf.current = sp.length || (f && now < f.until) ? requestAnimationFrame(step) : 0;
    };
    raf.current = requestAnimationFrame(step);
  };

  const burn = (k: Salt) => {
    const now = performance.now(), prev = last.current, mixed = prev && now - prev.t < 3500 && ((prev.id === 'sr' && k.id === 'cu') || (prev.id === 'cu' && k.id === 'sr'));
    last.current = { id: k.id, t: now };
    const show = mixed ? PURPLE : k;
    setFlame(k.spark ? LAMP : show.flame);
    setShown({ sym: show.sym, name: show.name, colour: show.colour, note: show.note });
    setFlare((n) => n + 1);
    setFound((f) => { const g = new Set(f).add(k.id); if (mixed) g.add('mix'); return g; });
    whoosh(0.5, 500, 2200, 0.06);
    if (mixed) { chime(6, 4); ting(1320, 0.5); } else pluck(3 + SALTS.indexOf(k), 0.6);
    if (k.spark) sparkle(SPARK[k.id]);
    clearTimeout(back.current);
    back.current = setTimeout(() => setFlame(LAMP), 3200);
  };
  const pick = (k: Salt) => {
    clearTimeout(drop.current);
    if (calm()) { burn(k); return; }
    // the spoon tips over the lamp, the pinch falls, then the flame catches it
    setSpoon({ c: k.jar, n: Date.now() });
    drop.current = setTimeout(() => { burn(k); setSpoon(null); }, 520);
  };

  const n = SALTS.filter((k) => found.has(k.id)).length;
  return (
    <div className={p.play}>
      <div className={p.body}>
        <div className={`${p.stage} ${s.stage}`} style={{ ['--flame' as string]: flame }}>
          <svg viewBox="0 0 300 300" className={s.lamp} role="img" aria-label={shown ? `The flame burns ${shown.colour}` : 'A lamp with a small orange flame'}>
            <defs>
              <radialGradient id="ph-glow"><stop offset="0" stopColor="var(--flame)" stopOpacity=".55" /><stop offset="1" stopColor="var(--flame)" stopOpacity="0" /></radialGradient>
              <linearGradient id="ph-flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".35" stopColor="var(--flame)" /><stop offset="1" stopColor="var(--flame)" stopOpacity=".85" /></linearGradient>
            </defs>
            <circle cx="150" cy="150" r="110" fill="url(#ph-glow)" className={s.halo} />
            <g key={flare} className={s.flame}>
              <path d="M150 70c-34 44-44 80-26 104 10 13 42 13 52 0 18-24 8-60-26-104Z" fill="url(#ph-flame)" stroke="#1B1410" strokeWidth="3" strokeLinejoin="round" />
              <path d="M150 128c-12 16-15 28-8 36 4 4 12 4 16 0 7-8 4-20-8-36Z" fill="#FFF8E6" />
            </g>
            <path d="M150 186v10" stroke="#1B1410" strokeWidth="4" strokeLinecap="round" />
            <path d="M84 196h132c-6 30-34 46-66 46s-60-16-66-46Z" fill="#C9962E" stroke="#1B1410" strokeWidth="4" strokeLinejoin="round" />
            <path d="M216 200c12-2 20 4 22 12" fill="none" stroke="#1B1410" strokeWidth="4" strokeLinecap="round" />
            <path d="M120 242h60l8 16h-76Z" fill="#A87A22" stroke="#1B1410" strokeWidth="4" strokeLinejoin="round" />
            <path d="M98 210q52 14 104 0" fill="none" stroke="#FFE29A" strokeWidth="3" strokeLinecap="round" opacity=".7" />
          </svg>
          <canvas ref={cv} aria-hidden="true" className={s.sparks} />
          {spoon && (
            <span key={spoon.n} aria-hidden="true" className={s.spoon} style={{ ['--salt' as string]: spoon.c }}>
              <i /><b /><b /><b /><b />
            </span>
          )}
        </div>
        <div className={p.info}>
          <div className={s.shelf} role="group" aria-label="Jars of metal salts">
            {SALTS.map((k) => (
              <button key={k.id} type="button" className={s.jar} onClick={() => pick(k)} aria-label={`Drop ${k.name} into the flame${found.has(k.id) ? ' (tried)' : ''}`} style={{ ['--jar' as string]: k.jar }}>
                <span aria-hidden="true" className={s.pot}><b>{k.sym}</b></span>
                <span className={s.jarName}>{k.name}</span>
                {found.has(k.id) && <span aria-hidden="true" className={s.tick}>✓</span>}
              </button>
            ))}
          </div>
          <div aria-live="polite" className={s.card}>
            {shown
              ? <><p className={p.name}><b>{shown.colour}</b> <span>{shown.sym}</span></p><p className={p.where}>{shown.name}</p><p className={p.note}>{shown.note}</p></>
              : <p className={p.note}>Pick a jar. A pinch goes into the flame.</p>}
          </div>
          <p className={s.tally}><b>{n}</b> of {SALTS.length} tried{found.has('mix') ? ' · ★ purple found' : ' · try strontium, then copper'}</p>
        </div>
      </div>
    </div>
  );
}
