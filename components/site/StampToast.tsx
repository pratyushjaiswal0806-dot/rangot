'use client';
// Rewards you can see: the first time you try an art form, a passport stamp slams onto the
// screen; a Chunauti (challenge) met gets a star and a cheer; when an unlock is earned, it says
// what and where. One at a time, with a bell chord.
import { useEffect, useRef, useState } from 'react';
import { STAMP_EVT, STAR_EVT, UNLOCK_EVT, sawUnlock, unseenUnlocks } from '../../lib/progress';
import { cheer } from '../../lib/toast';
import { petalBurst } from '../../lib/fx';
import { buzz, chord } from '../../lib/sfx';
import { track } from '../../lib/track';
import s from './StampToast.module.css';

type Item = { kind: 'stamp'; id: string; label: string; glyph: string; n: number; total: number } | { kind: 'star'; id: string; label: string; n: number; total: number } | { kind: 'unlock'; id: string; label: string; toy: string };

export default function StampToast() {
  const [cur, setCur] = useState<Item | null>(null);
  const [out, setOut] = useState(false);
  const queue = useRef<Item[]>([]);
  const busy = useRef(false);
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const next = () => {
      const it = queue.current.shift();
      if (!it) { busy.current = false; setCur(null); return; }
      busy.current = true;
      setOut(false);
      setCur(it);
      chord();
      buzz([10, 40, 18]);
      if (it.kind === 'unlock') { sawUnlock(it.id); track('unlock', { id: it.id }); }
      if (it.kind === 'star') { track('challenge', { id: it.id }); setTimeout(() => cheer(), 350); }
      setTimeout(() => { const r = el.current?.getBoundingClientRect(); if (r) petalBurst(r.left + 40, r.top + r.height / 2, it.kind === 'unlock' ? 46 : 26); }, 260);
      // slide away, then the next one (or nothing)
      timer = setTimeout(() => { setOut(true); timer = setTimeout(next, 260); }, it.kind === 'stamp' ? 2400 : 3400);
    };
    const add = (kind: Item['kind']) => (e: Event) => {
      const it = { kind, ...(e as CustomEvent).detail } as Item;
      if (queue.current.some((q) => q.kind === it.kind && q.id === it.id)) return;
      // unlocks jump the queue: they're the bigger news
      if (kind === 'unlock') queue.current.unshift(it); else queue.current.push(it);
      if (!busy.current) next();
    };
    // unlocks earned on a page that closed before its toast showed
    for (const u of unseenUnlocks()) queue.current.push({ kind: 'unlock', ...u });
    if (queue.current.length) setTimeout(next, 400);
    const onS = add('stamp'), onU = add('unlock'), onC = add('star');
    window.addEventListener(STAMP_EVT, onS);
    window.addEventListener(UNLOCK_EVT, onU);
    window.addEventListener(STAR_EVT, onC);
    return () => { clearTimeout(timer); window.removeEventListener(STAMP_EVT, onS); window.removeEventListener(UNLOCK_EVT, onU); window.removeEventListener(STAR_EVT, onC); };
  }, []);

  if (!cur) return null;
  return (
    <div ref={el} key={cur.kind + cur.id} role="status" className={`${s.toast} ${cur.kind === 'unlock' ? s.unlock : ''} ${cur.kind === 'star' ? s.star : ''} ${out ? s.out : ''}`}>
      <span aria-hidden="true" className={s.stamp}><b>{cur.kind === 'stamp' ? cur.glyph : '★'}</b></span>
      {cur.kind === 'stamp' && <span className={s.text}><small>Stamp collected · {cur.n}/{cur.total}</small><strong>{cur.label}</strong></span>}
      {cur.kind === 'star' && <span className={s.text}><small>Chunauti poori! · ★ {cur.n}/{cur.total}</small><strong>{cur.label}</strong></span>}
      {cur.kind === 'unlock' && <span className={s.text}><small>Unlocked!</small><strong>{cur.label}</strong><em>Find it in {cur.toy}</em></span>}
    </div>
  );
}
