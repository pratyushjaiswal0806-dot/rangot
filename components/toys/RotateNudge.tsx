'use client';
// "Turn your phone sideways": a slim dismissible chip at the top of the stage when a phone is held upright.
// Never covers the work; dismissing is remembered for the session, and turning the phone hides it.
import { useEffect, useState } from 'react';
import { useUprightPhone } from '../../hooks/useOrientation';
import s from './RotateNudge.module.css';

const KEY = 'rg-rotate-dismissed';

export default function RotateNudge({ soft }: { soft?: boolean }) {
  const upright = useUprightPhone();
  const [gone, setGone] = useState(true);
  useEffect(() => {
    try { setGone(sessionStorage.getItem(KEY) === '1'); } catch { setGone(false); }
  }, []);
  if (!upright || gone || soft) return null;
  const dismiss = () => { setGone(true); try { sessionStorage.setItem(KEY, '1'); } catch { /* private mode */ } };
  return (
    <div className={s.nudge} role="status" aria-label="Turn your phone sideways to put the tools beside the canvas">
      <div className={s.card}>
        <svg className={s.phone} width="28" height="28" viewBox="0 0 72 72" aria-hidden="true">
          <rect x="22" y="8" width="28" height="56" rx="5" fill="#FBF3E4" stroke="#1B1410" strokeWidth="4" />
          <circle cx="36" cy="57" r="2.6" fill="#1B1410" />
          <path d="M10 22a28 28 0 0 1 12-12M62 50a28 28 0 0 1-12 12" fill="none" stroke="#FFC21A" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <b className={s.head}>Sideways: tools sit beside the canvas</b>
        <button type="button" className={s.btn} onClick={dismiss} aria-label="Dismiss">✕</button>
      </div>
    </div>
  );
}
