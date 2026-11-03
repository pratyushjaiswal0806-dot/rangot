'use client';
// A number that rolls to its new value instead of jumping (captions, scores, counters). Screen
// readers get only the final value.
import { useEffect, useRef, useState } from 'react';
import { calm } from '../../lib/motion';

export default function Count({ value, ms = 500, className }: { value: number; ms?: number; className?: string }) {
  const [n, setN] = useState(value);
  const cur = useRef(value);
  useEffect(() => {
    const from = cur.current;
    if (from === value) return;
    if (calm()) { cur.current = value; setN(value); return; }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - t0) / ms)), v = Math.round(from + (value - from) * (1 - (1 - k) ** 3));
      cur.current = v; setN(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}><span aria-hidden="true">{n}</span><span className="sr-only">{value}</span></span>;
}
