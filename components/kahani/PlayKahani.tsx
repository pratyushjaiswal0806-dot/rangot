'use client';
// The "▶ Play the Kahani" button in a story's header: opens the chapters as a picture book
// (KahaniPlayer). The player's code is only fetched when someone presses the button.
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import type { PlayerProps } from './KahaniPlayer';
import s from './Kahani.module.css';

const KahaniPlayer = dynamic(() => import('./KahaniPlayer'), { ssr: false });

export default function PlayKahani(props: Omit<PlayerProps, 'onClose'>) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={btn} type="button" className={s.playBtn} onClick={() => setOpen(true)}>
        <span aria-hidden="true" className={s.playDisc}><svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7Z" fill="currentColor" /></svg></span>
        <span className={s.playText}><b>Play the Kahani</b><small>a picture book · {props.chapters.length} chapters · can read aloud</small></span>
      </button>
      {open && <KahaniPlayer {...props} onClose={() => { setOpen(false); setTimeout(() => btn.current?.focus(), 30); }} />}
    </>
  );
}
