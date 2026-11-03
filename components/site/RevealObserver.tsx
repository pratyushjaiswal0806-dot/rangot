'use client';
// Starts the entrance animations of [data-reveal] elements (letters popping in, cards settling)
// when they scroll into view, by setting --rv: running on them. [data-live] elements get
// --live: running while on screen and paused while off it, so idle loops (a story picture's
// sway, a blinking eye) don't burn battery out of sight. Watches for elements that mount later
// (route changes, islands).
import { useEffect } from 'react';

export default function RevealObserver() {
  useEffect(() => {
    const run = (el: Element) => (el as HTMLElement).style.setProperty('--rv', 'running');
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach(run);
      return;
    }
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } }), { threshold: 0.12 });
    const live = new IntersectionObserver((es) => es.forEach((en) => (en.target as HTMLElement).style.setProperty('--live', en.isIntersecting ? 'running' : 'paused')), { threshold: 0 });
    const seen = new WeakSet<Element>(), seenLive = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll('[data-reveal]').forEach((el) => { if (!seen.has(el)) { seen.add(el); io.observe(el); } });
      document.querySelectorAll('[data-live]').forEach((el) => { if (!seenLive.has(el)) { seenLive.add(el); live.observe(el); } });
    };
    scan();
    let raf = 0;
    const mo = new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; scan(); }); });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); live.disconnect(); mo.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  return null;
}
