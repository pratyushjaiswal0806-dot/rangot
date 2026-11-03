'use client';
// "Did you know?" while you draw: rotates through a few facts about the art form.
import { useEffect, useState } from 'react';
import culture from '../../data/culture.json';

export default function CultureStrip({ art }: { art: keyof typeof culture }) {
  const facts = culture[art]?.facts ?? [];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % Math.max(1, facts.length)), 9000);
    return () => clearInterval(t);
  }, [facts.length]);
  if (!facts.length) return null;
  return (
    <button type="button" className="rg-tool__fact" onClick={() => setI((x) => (x + 1) % facts.length)} aria-live="polite" style={{ textAlign: 'left', cursor: 'pointer', color: '#1B1410' }}>
      <b>Did you know?</b> {facts[i]} <span aria-hidden="true" style={{ opacity: 0.6 }}>›</span>
    </button>
  );
}
