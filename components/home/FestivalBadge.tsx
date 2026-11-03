'use client';
// Hero badge: "Diwali in 11 days · light a diya" or "Happy Pongal!". Rendered after mount
// (the page is prerendered, and "today" is the visitor's day in IST).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { countdown, currentFestival, upcoming, type Festival } from '../../lib/festivals';

export default function FestivalBadge() {
  const [f, setF] = useState<{ fest: Festival; label: string; on: boolean } | null>(null);
  useEffect(() => {
    const cur = currentFestival();
    const fest = cur ?? upcoming()[0];
    if (!fest) return;
    const c = countdown(fest);
    if (!cur && c.days > 45) return; // nothing close: keep the hero clean
    setF({ fest, label: cur ? `${fest.greet.en}!` : c.label, on: !!cur });
  }, []);
  if (!f) return null;
  return (
    <Link href="/#diya" className="rg-fest" style={{ ['--accent' as string]: f.fest.accent }}>
      <span aria-hidden="true" className="rg-mini-diya is-lit" />
      <span><b>{f.label}</b> <span className="rg-fest__cta">{f.on ? 'Send someone a diya →' : 'Light a diya →'}</span></span>
    </Link>
  );
}
