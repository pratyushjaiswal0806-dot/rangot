// The Kalakaar certificate (1080×1350): earned by trying every art form. A ruby card with a
// marigold border, the passport stamps in a ring, and the holder's name.
import { STAMPS } from '../progress';

const INK = '#1B1410', RUBY = '#7A0E3A', GOLD = '#FFC21A', IVORY = '#FBF3E4';

export function drawCertificate(name: string, date = new Date()): HTMLCanvasElement {
  const W = 1080, H = 1350, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const x = cv.getContext('2d')!;
  x.fillStyle = INK; x.fillRect(0, 0, W, H);
  x.fillStyle = GOLD; x.fillRect(16, 16, W - 32, H - 32);
  x.fillStyle = INK; x.fillRect(48, 48, W - 96, H - 96);
  x.fillStyle = RUBY; x.fillRect(58, 58, W - 116, H - 116);
  x.strokeStyle = GOLD; x.lineWidth = 3; x.setLineDash([14, 10]); x.strokeRect(84, 84, W - 168, H - 168); x.setLineDash([]);
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = GOLD; x.font = "800 34px Sarpanch, sans-serif"; x.fillText('RANGOTSAV · FESTIVAL PASSPORT', W / 2, 170);
  x.font = "400 190px 'Yatra One', serif";
  x.fillStyle = INK; x.fillText('Kalakaar', W / 2 + 8, 330 + 8);
  x.fillStyle = GOLD; x.fillText('Kalakaar', W / 2, 330);
  x.fillStyle = IVORY; x.font = '600 38px Mukta, sans-serif'; x.fillText('This certifies that', W / 2, 470);
  const n = name || 'This kalakaar';
  let fs = 110; x.font = `400 ${fs}px 'Yatra One', serif`;
  while (x.measureText(n).width > W - 240 && fs > 50) { fs -= 6; x.font = `400 ${fs}px 'Yatra One', serif`; }
  x.fillStyle = GOLD; x.fillText(n, W / 2, 570);
  x.fillStyle = IVORY; x.font = '600 38px Mukta, sans-serif';
  x.fillText('tried every art form at Rangotsav:', W / 2, 670);
  x.fillText('rangoli, kolam, bandhani, block print and more.', W / 2, 720);
  // the passport stamps in a ring, shrinking as more toys join so they never overlap
  const cx = W / 2, cy = 960, R = 190, r = Math.min(48, (Math.PI * R) / STAMPS.length - 5);
  STAMPS.forEach((s, i) => {
    const a = -Math.PI / 2 + (i / STAMPS.length) * Math.PI * 2, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R;
    x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fillStyle = 'rgba(255,194,26,.22)'; x.fill();
    x.lineWidth = 4; x.strokeStyle = GOLD; x.stroke();
    x.fillStyle = IVORY; x.font = `400 ${Math.round(r * 0.92)}px 'Yatra One', serif`; x.fillText(s.glyph, px, py + 2);
  });
  x.beginPath(); x.arc(cx, cy, 72, 0, Math.PI * 2); x.fillStyle = INK; x.fill(); x.lineWidth = 6; x.strokeStyle = GOLD; x.stroke();
  x.fillStyle = GOLD; x.font = '900 76px Sarpanch, sans-serif'; x.fillText('P', cx, cy + 4);
  x.fillStyle = IVORY; x.font = '700 30px Mukta, sans-serif';
  x.fillText(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · a Pegasus · RVITM project', W / 2, H - 140);
  return cv;
}
