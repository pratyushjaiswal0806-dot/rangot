'use client';
// "Tie the kanna": a test kite on a short line in a steady breeze. Slide the kanna (the bridle
// knot) along the spine and watch: tied too near the nose, the kite sits flat to the wind and keeps
// sinking back; too near the tail, it catches too much wind and loops; about a third of the way
// down, it climbs and rides steady. The motion is a simple story, not physics: each kind of flight
// is a little loop of height and tilt. With reduced motion the kite just shows its pose.
import { useEffect, useRef, useState } from 'react';
import { calm } from '../../../lib/motion';
import { chime, pluck } from '../../../lib/sfx';
import p from './Play.module.css';
import s from './PatangPlay.module.css';

type Mode = 'flat' | 'steady' | 'loop';
const modeOf = (k: number): Mode => (k < 20 ? 'flat' : k > 52 ? 'loop' : 'steady');
const SAY: Record<Mode, { name: string; note: string }> = {
  flat: { name: 'Bahut upar', note: 'Tied too near the nose, the kite lies almost flat to the wind. It can’t climb, so it keeps sinking back and wobbling.' },
  steady: { name: 'Bilkul sahi!', note: 'About a third of the way down the spine, the kite meets the wind at just the right slant. It climbs and rides steady overhead.' },
  loop: { name: 'Bahut neeche', note: 'Tied too near the tail, the kite stands up into the wind, catches too much of it and loops round and round.' },
};

// where the kite is (stage units of a 300 box) and how it's tilted (degrees), at time t
function flight(k: number, t: number) {
  const m = modeOf(k);
  if (m === 'flat') return { x: 150 + Math.sin(t * 1.4) * 30, y: 170 + Math.abs(Math.sin(t * 1.1)) * 50, a: Math.sin(t * 2.6) * 26 };
  if (m === 'loop') {
    const sp = 1.6 + ((k - 52) / 48) * 2.4, r = 38;
    return { x: 160 + Math.cos(t * sp) * r, y: 130 + Math.sin(t * sp) * r, a: ((t * sp * 180) / Math.PI + 90) % 360 };
  }
  const off = Math.abs(k - 35) / 17;
  return { x: 175 + Math.sin(t * 0.9) * 10 * (0.3 + off), y: 78 + off * 30 + Math.sin(t * 1.3) * 5, a: 12 + Math.sin(t * 2) * 12 * off };
}

export default function PatangPlay() {
  const [k, setK] = useState(10);
  const [seen, setSeen] = useState<Set<Mode>>(new Set(['flat']));
  const [pose, setPose] = useState(() => flight(10, 0));
  const kRef = useRef(k);
  kRef.current = k;
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calm()) return;
    let raf = 0, on = true;
    const io = box.current && 'IntersectionObserver' in window ? new IntersectionObserver(([en]) => { on = en.isIntersecting; if (on && !raf) raf = requestAnimationFrame(tick); }) : null;
    const t0 = performance.now();
    const tick = (now: number) => { setPose(flight(kRef.current, (now - t0) / 1000)); raf = on ? requestAnimationFrame(tick) : 0; };
    raf = requestAnimationFrame(tick);
    if (box.current) io?.observe(box.current);
    return () => { cancelAnimationFrame(raf); io?.disconnect(); };
  }, []);

  const slide = (v: number) => {
    setK(v);
    if (calm()) setPose(flight(v, 0));
    const m = modeOf(v);
    setSeen((old) => {
      if (old.has(m)) return old;
      const n = new Set(old).add(m);
      if (n.size === 3) chime(5, 5); else pluck(m === 'steady' ? 9 : 4, 0.6);
      return n;
    });
  };

  const m = modeOf(k), S = SAY[m];
  // the kanna knot sits k% of the way down the kite's spine (the kite is 60 tall about its middle)
  const kn = -30 + (k / 100) * 60, rad = (pose.a * Math.PI) / 180;
  const knot = { x: pose.x - Math.sin(rad) * kn, y: pose.y + Math.cos(rad) * kn };
  return (
    <div className={p.play}>
      <div className={p.body}>
        <div className={`${p.stage} ${s.stage}`} ref={box}>
          <svg viewBox="0 0 300 300" role="img" aria-label={`A test kite with its kanna ${k}% of the way down the spine: ${S.note}`}>
            <defs><linearGradient id="pp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6EC3EE" /><stop offset="1" stopColor="#FBE7C2" /></linearGradient></defs>
            <rect width="300" height="300" fill="url(#pp-sky)" />
            {[0, 1, 2, 3].map((i) => <path key={i} className={s.wind} style={{ animationDelay: `${i * 0.45}s` }} d={`M-40 ${60 + i * 50}h46`} />)}
            <path d={`M60 280Q${(60 + knot.x) / 2} ${knot.y + 60} ${knot.x} ${knot.y}`} fill="none" stroke="#1B1410" strokeWidth="1.5" />
            <g transform={`translate(${pose.x} ${pose.y}) rotate(${pose.a})`}>
              <path d="M0 -30Q18 -12 28 -4L0 30L-28 -4Q-18 -12 0 -30Z" fill="#FFC21A" />
              <path d="M0 -30Q18 -12 28 -4L0 30Z" fill="#D63A2A" />
              <path d="M0 -30Q18 -12 28 -4L0 30L-28 -4Q-18 -12 0 -30Z" fill="none" stroke="#1B1410" strokeWidth="3" strokeLinejoin="round" />
              <path d="M0 -30V30M-28 -4Q0 -22 28 -4" fill="none" stroke="rgba(27,20,16,.55)" strokeWidth="2" />
              <path d={`M0 -24L0 ${kn}L0 22`} fill="none" stroke="#7A0E3A" strokeWidth="1.2" strokeDasharray="2 2" />
              <circle cx="0" cy={kn} r="4.5" fill="#7A0E3A" stroke="#FBF3E4" strokeWidth="1.5" />
            </g>
            <path d="M0 280h300v20H0Z" fill="#9C6B47" />
            <circle cx="60" cy="276" r="7" fill="#1B1410" />
          </svg>
        </div>
        <div className={p.info}>
          <label className={p.label} htmlFor="pp-kanna">Kanna · {k}% down the spine</label>
          <input id="pp-kanna" className={p.range} type="range" min={0} max={100} value={k} onChange={(e) => slide(+e.target.value)} aria-valuetext={`${k}%: ${S.name}`} />
          <div className={s.ends} aria-hidden="true"><span>Nose</span><span>Tail</span></div>
          <div aria-live="polite" className={s.card}>
            <p className={p.name}><b>{S.name}</b></p>
            <p className={p.note}>{S.note}</p>
          </div>
          <p className={s.tally}><b>{seen.size}</b> of 3 flights seen{seen.size === 3 ? ' ★' : m === 'flat' ? ' · slide the kanna down' : ''}</p>
        </div>
      </div>
    </div>
  );
}
