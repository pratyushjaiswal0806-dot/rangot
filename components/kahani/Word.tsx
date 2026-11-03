'use client';
// A glossary word inside story text: dotted underline, tap for a little card with the word in its
// own script, the language and what it means. The card goes into <body> (story cards are tilted,
// which would trap a positioned child), under or over the word and kept on screen; it closes on
// Escape or a tap elsewhere.
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { TOYS } from '../../lib/toys';
import { wordById } from '../../lib/words';
import s from './Word.module.css';

export default function Word({ id, children }: { id: string; children: ReactNode }) {
  const w = wordById(id);
  const [at, setAt] = useState<{ x: number; y: number; up: boolean } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLSpanElement>(null);
  const cid = useId();

  useEffect(() => {
    if (!at) return;
    const close = () => setAt(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close(); btn.current?.focus(); } };
    const onDown = (e: PointerEvent) => { if (!card.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) close(); };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('resize', close);
    return () => { window.removeEventListener('keydown', onKey, true); window.removeEventListener('pointerdown', onDown); window.removeEventListener('resize', close); };
  }, [at]);

  if (!w) return <>{children}</>;
  const toy = w.toy ? TOYS.find((t) => t.id === w.toy) : undefined;
  const open = () => {
    if (at) { setAt(null); return; }
    const b = btn.current!.getBoundingClientRect();
    const half = Math.min(150, (window.innerWidth - 32) / 2);
    const up = b.bottom + 220 > window.innerHeight && b.top > 240;
    // page coordinates, so the card stays with its word as the page scrolls
    setAt({ x: scrollX + Math.min(Math.max(b.left + b.width / 2, 16 + half), window.innerWidth - 16 - half), y: scrollY + (up ? b.top - 8 : b.bottom + 8), up });
  };

  return (
    <>
      <button ref={btn} type="button" className={s.word} onClick={open} aria-expanded={!!at} aria-controls={at ? cid : undefined}>{children}</button>
      {at && createPortal(
        <span ref={card} id={cid} role="dialog" aria-label={`${w.term}: meaning`} className={s.card} style={{ left: at.x, top: at.y, translate: at.up ? '-50% -100%' : '-50% 0' }}>
          <span className={s.head}><b>{w.term}</b><span className={s.script}>{w.script}</span></span>
          <span className={s.lang}>{w.lang}</span>
          <span className={s.meaning}>{w.meaning}</span>
          <span className={s.links}>
            {toy && <Link href={toy.href}>Try {toy.title} →</Link>}
            <Link href={`/words#${w.id}`}>All words</Link>
          </span>
        </span>,
        document.body,
      )}
    </>
  );
}
