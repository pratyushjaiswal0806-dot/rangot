'use client';
// "Rangotsav" that turns into ರಂಗೋತ್ಸವ and रंगोत्सव as it scrolls up the screen, or when you
// pick a script.
import { useEffect, useRef, useState } from 'react';
import s from './About.module.css';

const SCRIPTS: [string, string][] = [['EN', 'Latin'], ['ಕನ್ನಡ', 'Kannada'], ['हिंदी', 'Devanagari']];
const TILT = [-2, 1.5, -1, 2, -1.5, 1, -2, 1.5, -1];

export default function ScriptTitle() {
  const [m, setM] = useState(0);
  const el = useRef<HTMLHeadingElement>(null);
  const pinned = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const e = el.current;
        if (!e || pinned.current) return;
        const r = e.getBoundingClientRect(), y = (r.top + r.height / 2) / innerHeight;
        setM(y > 0.62 ? 0 : y > 0.4 ? 1 : 2);
      });
    };
    window.addEventListener('scroll', on, { passive: true });
    on();
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);
  const pick = (i: number) => {
    if (pinned.current) clearTimeout(pinned.current);
    pinned.current = setTimeout(() => { pinned.current = null; }, 2500);
    setM(i);
  };
  const st = (i: number) => ({ opacity: m === i ? 1 : 0, transform: m === i ? 'translateY(0) rotate(-1deg)' : i < m ? 'translateY(-28px) rotate(-3deg)' : 'translateY(28px) rotate(2deg)' });
  return (
    <>
      <h1 ref={el} aria-label="Rangotsav, ರಂಗೋತ್ಸವ, रंगोत्सव" className={s.morph}>
        <span aria-hidden="true" className={s.latin} style={st(0)}>{[...'Rangotsav'].map((c, i) => <span key={i} style={{ display: 'inline-block', rotate: `${TILT[i]}deg` }}>{c}</span>)}</span>
        <span aria-hidden="true" lang="kn" className={s.kn} style={st(1)}>ರಂಗೋತ್ಸವ</span>
        <span aria-hidden="true" lang="hi" className={s.hi} style={st(2)}>रंगोत्सव</span>
      </h1>
      <p className={s.kicker}>ABOUT <span aria-hidden="true">──</span> <span lang="kn">ಪರಿಚಯ</span> <span aria-hidden="true">──</span> <span lang="hi">परिचय</span></p>
      <div role="group" aria-label="Choose a script" className={s.scripts}>
        {SCRIPTS.map(([l, n], i) => <button key={n} className={s.script} aria-label={'Show ' + n} aria-pressed={m === i} onClick={() => pick(i)}>{l}</button>)}
      </div>
    </>
  );
}
