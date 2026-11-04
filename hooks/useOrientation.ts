'use client';
// True while a touch phone is held upright (portrait, narrow, coarse pointer). Drawing toys use it to
// offer a bigger sideways canvas; desktops and tablets never match.
import { useEffect, useState } from 'react';

const Q = '(orientation: portrait) and (max-width: 640px) and (pointer: coarse)';

export function useUprightPhone(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(Q);
    const read = () => setOn(mq.matches);
    read();
    mq.addEventListener('change', read);
    return () => mq.removeEventListener('change', read);
  }, []);
  return on;
}
