'use client';
// True while the element is on screen (or near it). Canvases use it to animate only when seen.
import { useEffect, useState, type RefObject } from 'react';

export function useInView(ref: RefObject<Element | null>, rootMargin = '120px'): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setOn(true); return; }
    const io = new IntersectionObserver(([en]) => setOn(en.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return on;
}
