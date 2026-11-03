'use client';
// Marigold petals drifting down over the page. Fewer on phones; none with reduced motion.
import { useEffect, useState } from 'react';
import { C } from '../../lib/art/palette';
import { mkRng } from '../../lib/rng';

const rnd = mkRng(7);
const PETALS = Array.from({ length: 14 }, (_, i) => {
  const w = 10 + rnd() * 8;
  return { left: (rnd() * 100).toFixed(1) + '%', w: Math.round(w), h: Math.round(w * 1.35), dur: (12 + rnd() * 10).toFixed(1) + 's', delay: (-rnd() * 22).toFixed(1) + 's', dx: ((rnd() - 0.5) * 120).toFixed(0) + 'px', color: [C.marigold, C.saffron, C.vermilion, C.magenta, C.marigold, C.ivory][i % 6] };
});

export default function Petals({ amount = 'festive' }: { amount?: 'festive' | 'gentle' | 'off' }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (amount === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const phone = Math.min(innerWidth, screen.width || 9999) < 700;
    setN(amount === 'gentle' ? (phone ? 2 : 6) : phone ? 4 : 14);
  }, [amount]);
  if (!n) return null;
  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 80, overflow: 'hidden' }}>
      {PETALS.slice(0, n).map((p, i) => (
        <div key={i} style={{ position: 'absolute', top: 0, left: p.left, width: p.w, height: p.h, background: p.color, border: '1.5px solid #1B1410', borderRadius: '60% 0 60% 0', ['--dx' as string]: p.dx, animation: `petalFall ${p.dur} linear ${p.delay} infinite`, willChange: 'transform' }} />
      ))}
    </div>
  );
}
