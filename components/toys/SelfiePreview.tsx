'use client';
// The selfie booth's preview (shelf tile, the story's "next toy" card): a truck-art frame with a
// silhouette where your face goes and your name painted on it.
import { useEffect, useRef } from 'react';
import { drawFrame, H as SH, W as SW } from '../../lib/art/selfie';

export default function SelfiePreview({ name, className }: { name: string; className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = cv.current;
    if (!el) return;
    const fonts = document.fonts ? document.fonts.load("400 100px 'Yatra One'").catch(() => null) : Promise.resolve();
    fonts.then(() => {
      const f = drawFrame('hornok', name), x = el.getContext('2d')!;
      x.fillStyle = '#2A1710'; x.fillRect(0, 0, SW, SH);
      x.save(); x.clip(f.hole);
      const g = x.createLinearGradient(0, f.box.y, 0, f.box.y + f.box.h); g.addColorStop(0, '#4A0A26'); g.addColorStop(1, '#7A0E3A');
      x.fillStyle = g; x.fillRect(f.box.x, f.box.y, f.box.w, f.box.h);
      x.fillStyle = 'rgba(251,243,228,.28)';
      x.beginPath(); x.arc(SW / 2, f.box.y + f.box.h * 0.44, 150, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.ellipse(SW / 2, f.box.y + f.box.h + 120, 300, 330, 0, Math.PI, 0); x.fill();
      x.restore();
      x.drawImage(f.over, 0, 0);
    });
  }, [name]);
  return <canvas ref={cv} width={SW} height={SH} aria-hidden="true" className={className} />;
}
