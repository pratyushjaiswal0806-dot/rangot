'use client';
// Cheenti's tips on or off (the footer), remembered in this browser. Turning her back on, she waves.
import { useEffect, useState } from 'react';
import { cheentiOn, say, setCheentiOn } from '../../lib/cheenti';

export default function CheentiToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(true);
  useEffect(() => setOn(cheentiOn()), []);
  return (
    <button type="button" className={className} aria-pressed={on} onClick={() => { setCheentiOn(!on); setOn(!on); if (!on) setTimeout(() => say('Main wapas aa gayi! Tips are back on.', { pose: 'wave', ms: 3200 }), 30); }}>
      🐜 Cheenti&apos;s tips: {on ? 'on' : 'off'}
    </button>
  );
}
