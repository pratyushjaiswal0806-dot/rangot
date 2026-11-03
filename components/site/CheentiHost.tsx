'use client';
// Where Cheenti appears when she has something to say (lib/cheenti.ts): she climbs up from the
// bottom edge with a speech bubble and ducks away after a few seconds (✕ sends her off sooner).
// On a toy she stands on the bottom edge of the toy's stage, so she never covers its controls;
// elsewhere, in the bottom-left corner. She never takes taps except on her ✕.
import { useEffect, useRef, useState } from 'react';
import Cheenti from './Cheenti';
import { onSay, type Say } from '../../lib/cheenti';
import s from './CheentiHost.module.css';

type Shown = Say & { n: number; left: number; bottom: number; maxW: number; dark: boolean };

export default function CheentiHost() {
  const [m, setM] = useState<Shown | null>(null);
  const [out, setOut] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let n = 0;
    const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
    const off = onSay((say) => {
      clear();
      const stage = document.querySelector<HTMLElement>('[data-stage]');
      const r = stage?.getBoundingClientRect();
      const onStage = !!r && r.bottom > 80 && r.top < innerHeight - 80;
      const left = onStage ? r!.left + 8 : 12, bottom = onStage ? Math.max(8, innerHeight - r!.bottom + 4) : 12;
      const maxW = Math.min(300, (onStage ? r!.width : innerWidth) - 96);
      setOut(false);
      setM({ ...say, n: ++n, left, bottom, maxW, dark: onStage || document.documentElement.dataset.theme === 'night' });
      timers.current.push(setTimeout(() => setOut(true), say.ms ?? 5200), setTimeout(() => setM(null), (say.ms ?? 5200) + 380));
    });
    return () => { off(); clear(); };
  }, []);

  if (!m) return null;
  const close = () => { timers.current.forEach(clearTimeout); setOut(true); timers.current = [setTimeout(() => setM(null), 380)]; };
  return (
    <div key={m.n} className={`${s.host} ${out ? s.out : ''} ${m.dark ? s.dark : ''}`} style={{ left: m.left, bottom: `calc(${m.bottom}px + env(safe-area-inset-bottom))` }}>
      <div className={s.pit}><div className={s.ant}><Cheenti pose={m.pose ?? 'talk'} /></div></div>
      <div className={s.bubble} style={{ maxWidth: m.maxW }}>
        <span role="status">{m.text}</span>
        <button type="button" className={s.x} onClick={close} aria-label="Close Cheenti's tip">✕</button>
      </div>
    </div>
  );
}
