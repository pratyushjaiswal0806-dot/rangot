'use client';
// "Sangeet": the story's own music (lib/music.ts). It plays while the story fills the screen (not
// while you're back up at the toy, and not while the picture book is open, which plays it itself),
// fades out when you scroll away, and comes back when you return. Browsers allow sound only after a
// tap, so it waits for one; the site's sound toggle mutes it, and this button turns it off for good.
// The music code is only fetched the first time it plays.
import { useCallback, useEffect, useRef, useState } from 'react';
import { bookOpen, musicOn, onBook, onMusicPref, setMusicOn } from '../../lib/musicPref';
import { isMuted, onMute, setMuted } from '../../lib/sfx';
import type { ToyId } from '../../lib/toys';
import s from './Kahani.module.css';

type Music = typeof import('../../lib/music');
let mod: Promise<Music> | null = null;
const music = () => (mod ??= import('../../lib/music'));

export default function KahaniMusic({ toy }: { toy: ToyId }) {
  const [on, setOn] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [about, setAbout] = useState<{ name: string; note: string } | null>(null);
  const inView = useRef(false);
  const want = useRef(false);

  // play or stop to match: switched on, story on screen, tab visible, not muted, no picture book
  const sync = useCallback(() => {
    const go = musicOn() && inView.current && !document.hidden && !isMuted() && !bookOpen();
    want.current = go;
    music().then((m) => {
      if (want.current !== go) return; // something changed while the code loaded
      if (go) { const ok = m.playTune(toy, 1, 'page'); setPlaying(ok); if (ok) setAbout(m.tuneFor(toy)); }
      else { m.stopTune('page'); setPlaying(false); }
    });
  }, [toy]);

  useEffect(() => {
    setOn(musicOn());
    const story = document.getElementById('kahani');
    // "on screen" means the story crosses the middle of the window
    const io = story && 'IntersectionObserver' in window ? new IntersectionObserver(([en]) => { inView.current = en.isIntersecting; sync(); }, { rootMargin: '-40% 0px -40% 0px' }) : null;
    if (story) io?.observe(story);
    // no tap yet, so no sound yet: try again on the first one
    const tap = () => sync();
    window.addEventListener('pointerdown', tap, { once: true });
    window.addEventListener('keydown', tap, { once: true });
    const offs = [onMute(sync), onBook(sync), onMusicPref(() => { setOn(musicOn()); sync(); })];
    document.addEventListener('visibilitychange', sync);
    return () => {
      io?.disconnect();
      window.removeEventListener('pointerdown', tap);
      window.removeEventListener('keydown', tap);
      offs.forEach((f) => f());
      document.removeEventListener('visibilitychange', sync);
      want.current = false;
      if (mod) mod.then((m) => m.stopTune('page'));
    };
  }, [sync, toy]);

  const toggle = () => {
    const next = !on;
    setOn(next);
    if (next && isMuted()) setMuted(false); // turning the music on turns sound on
    inView.current = true; // the button is on screen, so the story is too
    setMusicOn(next);
  };

  return (
    <div className={s.music}>
      <button type="button" className={s.musicBtn} aria-pressed={on} onClick={toggle} data-playing={playing ? '' : undefined}>
        <span aria-hidden="true" className={s.bars}><i /><i /><i /><i /></span>
        <span className={s.musicText}><b>Sangeet</b><small>{on ? (playing ? 'playing · tap to stop' : 'story music is on') : 'story music is off'}</small></span>
      </button>
      {playing && about && <p className={s.nowPlaying}><b>♪ {about.name}.</b> {about.note} <span>Played live by code, not a recording.</span></p>}
    </div>
  );
}
