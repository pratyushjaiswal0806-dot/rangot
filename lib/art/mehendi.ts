// Mehendi: two open palms side by side. Strokes recorded on one hand mirror onto the other
// (recipe stroke m=1), and are clipped to the hands like paste on skin.
import { TAU } from './palette';

type Ctx = CanvasRenderingContext2D;
export const HENNA: [string, string][] = [['Fresh paste', '#4A3B1C'], ['Deep stain', '#6B2410'], ['Bright stain', '#9A3B12'], ['Bridal maroon', '#5A0F1E']];
const SKIN = '#E9C29B', SKIN_EDGE = '#B98557', BG = '#F6E7C8';

// One right hand in a side×side square; the left hand is its mirror across the centre line.
// Every part is a rounded rect with the same winding, so the nonzero fill (and clip) is a clean
// union with no holes where fingers overlap the palm.
function rightHand(S: number): Path2D {
  const p = new Path2D(), u = S / 100;
  const cap = (x0: number, y0: number, x1: number, y1: number, w: number) => {
    const L = Math.hypot(x1 - x0, y1 - y0), deg = (Math.atan2(x1 - x0, -(y1 - y0)) * 180) / Math.PI;
    const f = new Path2D();
    f.roundRect((-w / 2) * u, -(L + w / 2) * u, w * u, (L + w) * u, (w / 2) * u);
    p.addPath(f, new DOMMatrix().translateSelf(x0 * u, y0 * u).rotateSelf(deg));
  };
  p.roundRect(57 * u, 48 * u, 33 * u, 40 * u, [4 * u, 4 * u, 12 * u, 12 * u]);
  p.roundRect(61 * u, 80 * u, 25 * u, 21 * u, 0);
  cap(61.5, 52, 60.5, 22, 7);
  cap(69.5, 52, 69.5, 13, 7.4);
  cap(77.5, 52, 78.5, 17, 7.2);
  cap(85, 54, 87.5, 29, 6.4);
  cap(60, 74, 54.5, 56, 7.5); // thumb, kept clear of the centre line
  return p;
}

export function handsPath(S: number): Path2D {
  const both = new Path2D(), r = rightHand(S);
  both.addPath(r);
  both.addPath(r, new DOMMatrix([-1, 0, 0, 1, S, 0]));
  return both;
}

export function handOutline(x: Ctx, S: number) {
  x.fillStyle = BG;
  x.fillRect(0, 0, S, S);
  x.fillStyle = 'rgba(122,14,58,.06)';
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) { x.beginPath(); x.arc((i + 0.5) * S / 9, (j + 0.5) * S / 9, S / 160, 0, TAU); x.fill(); }
  const hands = handsPath(S);
  x.lineJoin = 'round';
  x.lineWidth = S / 70; x.strokeStyle = SKIN_EDGE; x.stroke(hands);
  x.fillStyle = SKIN; x.fill(hands);
  x.lineWidth = S / 300; x.strokeStyle = 'rgba(185,133,87,.45)';
  for (const f of [1, -1]) {
    x.save(); if (f < 0) { x.translate(S, 0); x.scale(-1, 1); }
    const u = S / 100;
    x.beginPath(); x.moveTo(60 * u, 62 * u); x.quadraticCurveTo(72 * u, 58 * u, 88 * u, 60 * u); x.stroke();
    x.beginPath(); x.moveTo(62 * u, 72 * u); x.quadraticCurveTo(68 * u, 64 * u, 82 * u, 68 * u); x.stroke();
    x.restore();
  }
}

// Background plus clip: callers draw strokes after this and x.restore() before redrawing.
export function mehendiBase(x: Ctx, S: number) {
  x.restore();
  x.save();
  handOutline(x, S);
  x.clip(handsPath(S));
}
