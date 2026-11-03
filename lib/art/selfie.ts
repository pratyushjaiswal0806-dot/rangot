// Truck-art selfie frames (1080×1350, Instagram portrait). Each frame is drawn once into an
// overlay canvas with a hole where the photo goes; the booth draws the camera (or a chosen photo)
// into that hole every frame and the overlay on top. Built from the truck-plate pieces.
import { C, INK, TAU } from './palette';
import { checker, extruded, eye, flower, okBanner, pMark, splitName, stripes } from './plate';

export const W = 1080, H = 1350;
export type FrameId = 'hornok' | 'nazar' | 'marigold';
export const FRAMES: { id: FrameId; label: string }[] = [
  { id: 'hornok', label: 'Horn OK Please' },
  { id: 'nazar', label: 'Nazar Battu' },
  { id: 'marigold', label: 'Marigold' },
];
export type Frame = { over: HTMLCanvasElement; hole: Path2D; box: { x: number; y: number; w: number; h: number } };

const LETTER = { f1: C.vermilion, f2: C.saffron, side: '#4A0A26' };

function archPath(l: number, t: number, r: number, b: number) {
  const p = new Path2D(), cx = (l + r) / 2, w = r - l;
  p.moveTo(l, b); p.lineTo(l, t + w * 0.32);
  p.bezierCurveTo(l, t + w * 0.12, cx - w * 0.22, t + w * 0.04, cx, t);
  p.bezierCurveTo(cx + w * 0.22, t + w * 0.04, r, t + w * 0.12, r, t + w * 0.32);
  p.lineTo(r, b); p.closePath();
  return p;
}
function roundRect(l: number, t: number, r: number, b: number, rad: number) { const p = new Path2D(); p.roundRect(l, t, r - l, b - t, rad); return p; }

function namePlate(x: CanvasRenderingContext2D, name: string, bx: number, by: number, bw: number, bh: number) {
  x.fillStyle = INK; x.fillRect(bx - 7, by - 7, bw + 14, bh + 14);
  x.fillStyle = C.green; x.fillRect(bx, by, bw, bh);
  x.fillStyle = C.ivory; x.fillRect(bx + 14, by + 14, bw - 28, bh - 28);
  x.lineWidth = 4; x.strokeStyle = INK; x.strokeRect(bx + 14, by + 14, bw - 28, bh - 28);
  for (const [fx, fy] of [[bx + 36, by + 36], [bx + bw - 36, by + 36], [bx + 36, by + bh - 36], [bx + bw - 36, by + bh - 36]]) flower(x, fx, fy, 18, C.magenta, C.marigold);
  extruded(x, splitName(name), bx + bw / 2 - 4, by + bh / 2 + 6, bw - 130, bh - 52, 150, LETTER);
}

export function drawFrame(id: FrameId, rawName: string): Frame {
  const over = document.createElement('canvas');
  over.width = W; over.height = H;
  const x = over.getContext('2d')!, name = rawName.trim() || 'Apna Naam', cx = W / 2;
  x.lineJoin = 'round';
  let hole: Path2D, box: Frame['box'];

  if (id === 'hornok') {
    checker(x, 0, 0, W, H, 24);
    for (const [i, c] of [[36, INK], [39, C.marigold], [50, INK], [53, C.green], [64, INK], [67, C.vermilion], [78, INK], [81, C.indigo]] as [number, string][]) { x.fillStyle = c; x.fillRect(i, i, W - 2 * i, H - 2 * i); }
    stripes(x, 81, 81, W - 162, H - 162, '#264470', 46, 14);
    box = { x: 130, y: 300, w: 820, h: 760 };
    hole = archPath(box.x, box.y, box.x + box.w, box.y + box.h);
    namePlate(x, name, 150, 96, 780, 176);
    x.save(); x.translate(0, 0); x.lineWidth = 26; x.strokeStyle = INK; x.stroke(hole); x.lineWidth = 8; x.strokeStyle = C.marigold; x.stroke(hole); x.restore();
    for (const [fx, fy] of [[150, 1050], [930, 1050]]) flower(x, fx, fy, 40, C.marigold, C.vermilion);
    okBanner(x, cx, 1160, 740, 104, 60, 8);
    pMark(x, cx, 1268, 30);
  } else if (id === 'nazar') {
    x.fillStyle = C.ruby; x.fillRect(0, 0, W, H);
    stripes(x, 0, 0, W, H, '#8C1646', 54, 18);
    for (let i = 0; i < 34; i++) for (const [px, py] of [[i * (W / 33), 26], [i * (W / 33), H - 26]]) { x.beginPath(); x.arc(px, py, 16, 0, TAU); x.fillStyle = i % 2 ? C.marigold : C.saffron; x.fill(); x.lineWidth = 4; x.strokeStyle = INK; x.stroke(); }
    for (let j = 1; j < 42; j++) for (const px of [26, W - 26]) { x.beginPath(); x.arc(px, j * (H / 42), 16, 0, TAU); x.fillStyle = j % 2 ? C.marigold : C.saffron; x.fill(); x.lineWidth = 4; x.strokeStyle = INK; x.stroke(); }
    eye(x, 330, 175, 300); eye(x, 750, 175, 300);
    x.save(); x.translate(cx, 175); x.rotate(Math.PI / 4); x.fillStyle = C.marigold; x.fillRect(-22, -22, 44, 44); x.lineWidth = 5; x.strokeStyle = INK; x.strokeRect(-22, -22, 44, 44); x.restore();
    box = { x: 150, y: 300, w: 780, h: 720 };
    hole = roundRect(box.x, box.y, box.x + box.w, box.y + box.h, 70);
    x.lineWidth = 26; x.strokeStyle = INK; x.stroke(hole); x.lineWidth = 9; x.strokeStyle = C.ivory; x.stroke(hole);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    for (const [t, y] of [['BURI NAZAR WALE', 1102], ['TERA MUH KALA', 1186]] as [string, number][]) {
      x.font = '900 82px Sarpanch, sans-serif';
      x.fillStyle = INK; x.fillText(t, cx + 6, y + 6);
      x.fillStyle = C.marigold; x.fillText(t, cx, y);
    }
    x.font = "400 60px 'Yatra One', serif"; x.fillStyle = C.ivory; x.fillText('— ' + name + ' —', cx, 1270);
  } else {
    // marigold: a sunburst, a toran across the top, garlands down the sides, diyas below
    x.fillStyle = C.marigold; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { const a0 = (i / 40) * TAU, a1 = ((i + 1) / 40) * TAU; x.beginPath(); x.moveTo(cx, 640); x.arc(cx, 640, 1400, a0, a1); x.closePath(); x.fillStyle = i % 2 ? C.saffron : C.marigold; x.fill(); }
    box = { x: 170, y: 230, w: 740, h: 840 };
    hole = archPath(box.x, box.y, box.x + box.w, box.y + box.h);
    x.lineWidth = 30; x.strokeStyle = INK; x.stroke(hole); x.lineWidth = 10; x.strokeStyle = C.vermilion; x.stroke(hole);
    x.fillStyle = INK; x.fillRect(0, 0, W, 16);
    for (let i = 0; i < 19; i++) {
      const tx = 30 + i * (W - 60) / 18;
      if (i % 2) { x.beginPath(); x.ellipse(tx, 70, 20, 52, 0, 0, TAU); x.fillStyle = i % 4 === 1 ? C.green : C.leaf; x.fill(); x.lineWidth = 4; x.strokeStyle = INK; x.stroke(); }
      else for (const [r, y, c] of [[20, 40, C.marigold], [17, 72, C.saffron], [14, 100, C.marigold]] as [number, number, string][]) { x.beginPath(); x.arc(tx, y, r, 0, TAU); x.fillStyle = c; x.fill(); x.lineWidth = 3.5; x.strokeStyle = INK; x.stroke(); }
    }
    for (const gx of [70, W - 70]) for (let y = 170; y < 1080; y += 34) { x.beginPath(); x.arc(gx, y, 17, 0, TAU); x.fillStyle = (y / 34) % 2 < 1 ? C.vermilion : C.ivory; x.fill(); x.lineWidth = 3.5; x.strokeStyle = INK; x.stroke(); }
    x.fillStyle = INK; x.fillRect(0, 1090, W, H - 1090);
    x.fillStyle = C.ruby; x.fillRect(0, 1100, W, H - 1100);
    for (let i = 0; i < 9; i++) {
      const dx = 70 + i * (W - 140) / 8, dy = 1300;
      x.beginPath(); x.arc(dx, dy - 30, 22, 0, TAU); x.fillStyle = 'rgba(255,194,26,.25)'; x.fill();
      x.beginPath(); x.moveTo(dx - 26, dy - 16); x.quadraticCurveTo(dx, dy + 18, dx + 26, dy - 16); x.closePath(); x.fillStyle = C.terracotta; x.fill(); x.lineWidth = 3; x.strokeStyle = INK; x.stroke();
      x.beginPath(); x.moveTo(dx, dy - 50); x.quadraticCurveTo(dx + 9, dy - 32, dx, dy - 20); x.quadraticCurveTo(dx - 9, dy - 32, dx, dy - 50); x.fillStyle = C.marigold; x.fill();
    }
    extruded(x, splitName(name), cx - 4, 1182, 900, 150, 140, LETTER);
  }
  // punch the photo hole
  x.save(); x.globalCompositeOperation = 'destination-out'; x.fill(hole); x.restore();
  return { over, hole, box };
}

// ---------- stickers ----------
export type StickerId = 'flower' | 'eye' | 'ok' | 'diya' | 'star';
export const STICKERS: { id: StickerId; label: string }[] = [
  { id: 'flower', label: 'Flower' }, { id: 'eye', label: 'Nazar eye' }, { id: 'ok', label: 'OK' }, { id: 'diya', label: 'Diya' }, { id: 'star', label: 'Star' },
];
export type Sticker = { id: StickerId; x: number; y: number; s: number };
export const STICKER_R = 70; // hit radius at s = 1

// With t (seconds), stickers move: the nazar eye blinks, the flower and the OK badge turn, the
// diya flickers and the star twinkles. Without it they hold still (the shot you share).
export function drawSticker(x: CanvasRenderingContext2D, st: Sticker, t?: number) {
  x.save(); x.translate(st.x, st.y); x.scale(st.s, st.s); x.lineJoin = 'round';
  if (t != null) {
    const ph = st.x * 0.013 + st.y * 0.007; // each sticker on its own beat
    if (st.id === 'eye') { const b = (t * 0.45 + ph) % 1; if (b > 0.94) x.scale(1, Math.max(0.08, Math.abs(b - 0.97) / 0.03)); }
    else if (st.id === 'flower' || st.id === 'ok') x.rotate(Math.sin(t * 1.4 + ph) * 0.25);
    else if (st.id === 'diya') x.scale(1 + Math.sin(t * 9 + ph) * 0.025, 1 + Math.cos(t * 11 + ph) * 0.04);
    else { const k = 1 + Math.sin(t * 4 + ph) * 0.08; x.scale(k, k); x.rotate(Math.sin(t * 2 + ph) * 0.2); }
  }
  if (st.id === 'flower') flower(x, 0, 0, 56, C.magenta, C.marigold);
  else if (st.id === 'eye') eye(x, 0, 0, 150);
  else if (st.id === 'ok') {
    for (let i = 0; i < 12; i++) { x.save(); x.rotate((i / 12) * TAU); x.beginPath(); x.ellipse(0, -60, 14, 24, 0, 0, TAU); x.fillStyle = i % 2 ? C.saffron : C.marigold; x.fill(); x.lineWidth = 3; x.strokeStyle = INK; x.stroke(); x.restore(); }
    x.beginPath(); x.arc(0, 0, 52, 0, TAU); x.fillStyle = C.vermilion; x.fill(); x.lineWidth = 6; x.strokeStyle = INK; x.stroke();
    x.fillStyle = C.ivory; x.font = '900 46px Sarpanch, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('OK', 0, 3);
  } else if (st.id === 'diya') {
    x.beginPath(); x.arc(0, -30, 50, 0, TAU); x.fillStyle = 'rgba(255,194,26,.3)'; x.fill();
    x.beginPath(); x.moveTo(-58, -8); x.quadraticCurveTo(0, 62, 58, -8); x.closePath(); x.fillStyle = C.terracotta; x.fill(); x.lineWidth = 6; x.strokeStyle = INK; x.stroke();
    x.beginPath(); x.moveTo(0, -78); x.quadraticCurveTo(22, -40, 0, -14); x.quadraticCurveTo(-22, -40, 0, -78); x.fillStyle = C.marigold; x.fill(); x.lineWidth = 4; x.stroke();
  } else {
    x.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 26 : 62, a = -Math.PI / 2 + (i / 10) * TAU; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    x.closePath(); x.fillStyle = C.marigold; x.fill(); x.lineWidth = 6; x.strokeStyle = INK; x.stroke();
  }
  x.restore();
}

// Draw `src` (video or image) to cover the box, optionally mirrored (front camera).
export function drawCover(x: CanvasRenderingContext2D, src: CanvasImageSource, sw: number, sh: number, b: Frame['box'], mirror: boolean) {
  if (!sw || !sh) return;
  const k = Math.max(b.w / sw, b.h / sh), dw = sw * k, dh = sh * k;
  x.save();
  if (mirror) { x.translate(b.x + b.w, 0); x.scale(-1, 1); x.drawImage(src, b.w / 2 - dw / 2, b.y + b.h / 2 - dh / 2, dw, dh); }
  else x.drawImage(src, b.x + b.w / 2 - dw / 2, b.y + b.h / 2 - dh / 2, dw, dh);
  x.restore();
}
