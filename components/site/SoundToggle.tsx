'use client';
// Sound on/off, remembered in this browser.
import { useSyncExternalStore } from 'react';
import { isMuted, onMute, setMuted, ting } from '../../lib/sfx';

export default function SoundToggle({ className }: { className?: string }) {
  const muted = useSyncExternalStore(onMute, isMuted, () => false);
  return (
    <button type="button" className={className} aria-pressed={!muted} aria-label={muted ? 'Sound off. Turn sound on' : 'Sound on. Turn sound off'}
      onClick={() => { setMuted(!muted); if (muted) setTimeout(() => ting(880, 0.6), 30); }}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
        {muted ? <path d="M16 9.5l5 5M21 9.5l-5 5" /> : <><path d="M15.5 9a4.5 4.5 0 0 1 0 6" /><path d="M18.5 6.5a8 8 0 0 1 0 11" /></>}
      </svg>
    </button>
  );
}
