'use client';
// Notes when the visitor has moved between pages inside the site, so "back" can safely use the
// browser history instead of dropping them off the site. Also measures the visit: how many toys
// were opened and how long the tab was actually in front, sent once when the page is left
// (the "do people stay?" number).
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { markInternalNav } from '../../lib/nav';
import { TOYS } from '../../lib/toys';
import { track } from '../../lib/track';

export default function NavTracker() {
  const path = usePathname();
  const first = useRef(path);
  const toys = useRef(new Set<string>());

  useEffect(() => {
    if (path !== first.current) markInternalNav();
    if (TOYS.some((t) => t.href === path)) toys.current.add(path);
  }, [path]);

  useEffect(() => {
    let active = 0, since = document.hidden ? 0 : performance.now(), sent = false;
    const vis = () => {
      if (document.hidden) { if (since) active += performance.now() - since; since = 0; }
      else since = performance.now();
    };
    const leave = () => {
      if (sent) return;
      vis();
      sent = true;
      track('session', { toys: toys.current.size, secs: Math.round(active / 1000) });
    };
    document.addEventListener('visibilitychange', vis);
    window.addEventListener('pagehide', leave);
    return () => { document.removeEventListener('visibilitychange', vis); window.removeEventListener('pagehide', leave); };
  }, []);
  return null;
}
