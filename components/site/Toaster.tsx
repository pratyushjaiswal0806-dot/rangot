'use client';
import { useEffect, useState } from 'react';
import { onToast } from '../../lib/toast';

export default function Toaster() {
  const [msg, setMsg] = useState('');
  const [n, setN] = useState(0);
  const [out, setOut] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>, u: ReturnType<typeof setTimeout>;
    const off = onToast((m) => {
      setMsg(m); setN((x) => x + 1); setOut(false);
      clearTimeout(t); clearTimeout(u);
      // fade out, then go
      t = setTimeout(() => setOut(true), 2600);
      u = setTimeout(() => setMsg(''), 2840);
    });
    return () => { off(); clearTimeout(t); clearTimeout(u); };
  }, []);
  if (!msg) return null;
  return <div key={n} role="status" className={`rg-toast${out ? ' rg-toast--out' : ''}`}>{msg}</div>;
}
