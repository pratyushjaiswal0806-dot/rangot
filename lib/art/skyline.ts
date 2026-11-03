// A Bengaluru-ish night skyline, drawn once to an offscreen canvas: houses and flats with lit
// windows, a temple gopuram, a domed hall, coconut palms and a string of lights across the roofs.
// Shared by the diya night sky (components/home/DiyaSky.tsx) and the Phuljhadi toy.
import { mkRng } from '../rng';

const TAU = Math.PI * 2;

// W wide and `base` tall (the buildings stand on its bottom edge); the seed keeps one width's
// skyline the same on every draw. d is the pixel ratio to draw at.
export function skyline(W: number, base = 130, seed = Math.round(W), d = Math.min(2, window.devicePixelRatio || 1)): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = Math.round(W * d); cv.height = Math.round(base * d);
  const x = cv.getContext('2d')!, r = mkRng(seed);
  x.scale(d, d);
  const ink = '#1B0812', win = (wx: number, wy: number) => { if (r() < 0.55) { x.fillStyle = r() < 0.8 ? '#FFC21A' : '#E8761E'; x.fillRect(wx, wy, 3, 4); x.fillStyle = ink; } };
  x.fillStyle = ink;
  let px = -10;
  while (px < W + 10) {
    const k = r();
    if (k < 0.12 && px > 40 && px < W - 120) { // temple gopuram: stepped tiers and a kalasha
      const w = 70 + r() * 30, tiers = 5;
      for (let t = 0; t < tiers; t++) { const tw = w * (1 - t * 0.16), th = 14; x.fillRect(px + (w - tw) / 2, base - 28 - (t + 1) * th, tw, th + 1); }
      x.fillRect(px, base - 28, w, 28);
      x.beginPath(); x.arc(px + w / 2, base - 28 - tiers * 14 - 6, 6, 0, TAU); x.fill();
      x.fillRect(px + w / 2 - 1, base - 28 - tiers * 14 - 18, 2, 10);
      px += w + 6;
    } else if (k < 0.22 && px > 40 && px < W - 140) { // a domed hall
      const w = 110 + r() * 30;
      x.fillRect(px, base - 46, w, 46);
      x.beginPath(); x.ellipse(px + w / 2, base - 46, w * 0.2, w * 0.2, 0, Math.PI, 0); x.fill();
      x.fillRect(px + w / 2 - 1.5, base - 46 - w * 0.2 - 12, 3, 12);
      for (let c = 0; c < 6; c++) win(px + 8 + c * (w - 16) / 6, base - 34);
      px += w + 4;
    } else if (k < 0.36) { // a coconut palm
      const tx = px + 10, th = 50 + r() * 26;
      x.strokeStyle = ink; x.lineWidth = 4; x.beginPath(); x.moveTo(tx, base); x.quadraticCurveTo(tx + 8, base - th / 2, tx + 4, base - th); x.stroke();
      for (let f = 0; f < 7; f++) { const a = -Math.PI / 2 + (f - 3) * 0.45; x.beginPath(); x.moveTo(tx + 4, base - th); x.quadraticCurveTo(tx + 4 + Math.cos(a) * 16, base - th + Math.sin(a) * 16 - 6, tx + 4 + Math.cos(a) * 26, base - th + Math.sin(a) * 26 + 6); x.lineWidth = 3; x.stroke(); }
      px += 22;
    } else { // houses and flats with lit windows
      const w = 26 + r() * 46, h = 24 + r() * (r() < 0.3 ? 70 : 34);
      x.fillRect(px, base - h, w, h);
      if (r() < 0.3) { x.beginPath(); x.moveTo(px - 3, base - h); x.lineTo(px + w / 2, base - h - 12); x.lineTo(px + w + 3, base - h); x.fill(); }
      for (let wy = base - h + 6; wy < base - 8; wy += 10) for (let wx = px + 5; wx < px + w - 6; wx += 9) win(wx, wy);
      px += w + r() * 3;
    }
  }
  // a string of lights across the rooftops
  x.strokeStyle = 'rgba(255,194,26,.5)'; x.lineWidth = 1;
  x.beginPath(); for (let sx = 0; sx <= W; sx += 8) x.lineTo(sx, base - 60 + Math.sin(sx / 60) * 8); x.stroke();
  for (let sx = 4; sx < W; sx += 16) { x.fillStyle = ['#FFC21A', '#E8761E', '#C93A82', '#4F8A3C'][(sx / 16) % 4 | 0]; x.beginPath(); x.arc(sx, base - 60 + Math.sin(sx / 60) * 8 + 2, 1.8, 0, TAU); x.fill(); }
  return cv;
}
