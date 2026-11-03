'use client';
// Big moments ("वाह!", "Shabash!"): Hinglish poster lettering slams onto the middle of the screen
// over a burst of halftone rays, Cheenti jumps for joy, a rangoli blooms open and a bell chord
// rings, then it all clears. Anyone can cheer() (lib/toast.ts); one at a time, the newest wins.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Desi from './Desi';
import Cheenti from './Cheenti';
import { onCheer, type CheerMsg } from '../../lib/toast';
import { bloomRing, petalBurst } from '../../lib/fx';
import { buzz, chord } from '../../lib/sfx';
import s from './Cheer.module.css';

export default function Cheer() {
  const [c, setC] = useState<(CheerMsg & { n: number }) | null>(null);
  const card = useRef<HTMLSpanElement>(null);
  // long words ("Onashamsakal!") are wider than a phone: shrink the lettering until the card fits,
  // before it's painted (so it never shows cut off at the edges first)
  useLayoutEffect(() => {
    const el = card.current, word = el?.firstElementChild as HTMLElement | null;
    if (!el || !word) return;
    word.style.fontSize = '';
    const room = document.documentElement.clientWidth - 24;
    for (let k = 0; k < 4 && el.scrollWidth > room; k++) {
      const now = parseFloat(getComputedStyle(word).fontSize);
      word.style.fontSize = `${Math.max(28, Math.floor(now * (room / el.scrollWidth) * 0.97))}px`;
    }
  }, [c]);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>, n = 0;
    const off = onCheer((m) => {
      setC({ ...m, n: ++n });
      chord();
      buzz([12, 40, 24]);
      const at = m.at ?? { x: innerWidth / 2, y: innerHeight * 0.42 };
      bloomRing(at.x, at.y);
      setTimeout(() => petalBurst(at.x, at.y, 40), 120);
      clearTimeout(t);
      t = setTimeout(() => setC(null), 1700);
    });
    return () => { off(); clearTimeout(t); };
  }, []);
  if (!c) return null;
  return (
    <div key={c.n} role="status" className={s.cheer}>
      <span aria-hidden="true" className={s.rays} />
      <span ref={card} className={s.card}>
        <Desi text={c.text} label={c.label} className={s.word} rough={false} />
        <span className={s.ant}><Cheenti pose="cheer" /></span>
      </span>
    </div>
  );
}
