'use client';
// The element's content-box size, updated (debounced) as it resizes. Drawing stages use it to
// fit their canvas to the space left between the top bar and the tray.
import { useEffect, useState, type RefObject } from 'react';

export function useElementSize(ref: RefObject<Element | null>, delay = 120): { w: number; h: number } {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const read = () => {
      const r = el.getBoundingClientRect();
      setSize((s) => (Math.abs(s.w - r.width) < 1 && Math.abs(s.h - r.height) < 1 ? s : { w: r.width, h: r.height }));
    };
    read();
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(read, delay); });
    ro.observe(el);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [ref, delay]);
  return size;
}

// Room a stage keeps around the work. Phones (and short, sideways screens) give the frame almost
// nothing so the canvas runs edge to edge; the caption sits under the work, except on a short wide
// stage (a phone turned sideways) where it floats over the stage instead (see .caption in ToyShell.module.css).
export const framePad = (w: number, h: number) => (w < 520 || h < 520 ? 12 : 28);
export const captionH = (w: number, h: number) => (h < 520 && w > h ? 0 : 26);

// The biggest square that fits a stage.
export function fitSquare(w: number, h: number, min = 220): number {
  const p = framePad(w, h);
  return Math.max(min, Math.floor(Math.min(w - p, h - p - captionH(w, h))));
}
