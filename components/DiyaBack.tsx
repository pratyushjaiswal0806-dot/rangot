'use client';
// "Light a diya back": one per device per link. The sender sees the count when they revisit.
import { useEffect, useState } from 'react';
import { track } from '../lib/track';

export default function DiyaBack({ id, by, dark }: { id: string; by?: string; dark?: boolean }) {
  const [count, setCount] = useState<number | null>(null);
  const [lit, setLit] = useState(false);
  const [busy, setBusy] = useState(false);
  const k = 'rangotsav:lit:' + id;

  useEffect(() => {
    try { setLit(localStorage.getItem(k) === '1'); } catch {}
    fetch(`/api/creations/${id}/diya`).then((r) => (r.ok ? r.json() : null)).then((d) => d && typeof d.count === 'number' && setCount(d.count)).catch(() => {});
  }, [id, k]);

  const light = async () => {
    if (lit || busy) return;
    setBusy(true);
    try { navigator.vibrate?.([12, 50, 22]); } catch {}
    const r = await fetch(`/api/creations/${id}/diya`, { method: 'POST' }).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    setBusy(false);
    setLit(true);
    try { localStorage.setItem(k, '1'); } catch {}
    if (r && typeof r.count === 'number') setCount(r.count);
    else setCount((c) => (c ?? 0) + 1);
    track('diya_back');
  };

  const who = by || 'them';
  return (
    <div className="rg-diyaback">
      <button className={'rg-btn rg-btn--block ' + (lit ? '' : 'rg-btn--primary')} onClick={light} disabled={busy} aria-pressed={lit}>
        <span aria-hidden="true" className={'rg-mini-diya' + (lit ? ' is-lit' : '')} />
        {lit ? 'Your diya is lit' : `Light a diya back for ${who}`}
      </button>
      <p className="rg-small" role="status" aria-live="polite" style={{ color: dark ? 'var(--parch)' : undefined, textAlign: 'center', marginTop: 8 }}>
        {count == null ? ' ' : count === 0 ? 'Be the first to light one.' : `${count.toLocaleString('en-IN')} ${count === 1 ? 'diya' : 'diyas'} lit for ${who} so far`}
      </p>
    </div>
  );
}
