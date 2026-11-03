// Truck-art name plates in four loud, hand-printed styles (recipe k):
//   0 Poster    desi-maximalism film poster: blue border, red field, a cusped frame with the
//               nazar face, nimbu-mirchi, lotus vines, soda bottles, starbursts, a two-tone title
//   1 Matchbox  a vintage matchbox label: striker strip, sunburst, a truck, "MADE IN भारत"
//   2 Stamp     an Indian postage stamp: perforations, postmark, a halftone truck, gold Hindi name
//   3 Mandala   the site's Hinglish poster: haldi letters over a sindoor mandala
// Each comes as a 1080×1920 wallpaper or a square sticker (drawn at 1080 and scaled to 512).
// The name is also painted in Devanagari, spelled by ear (lib/translit.ts).
import { C, INK, TAU } from './palette';
import { eye, splitName } from './plate';
import { DOTS, LINES, SOLID } from './mandala';
import { toDevanagari } from '../translit';
import { hashStr, mkRng } from '../rng';

type X = CanvasRenderingContext2D;
type Rng = () => number;
const DISP = "'Palanquin Dark', 'Baloo Tamma 2', sans-serif", SAR = 'Sarpanch, sans-serif', YA = "'Yatra One', serif", MU = 'Mukta, sans-serif';

// The line painted on the plate: [as painted in English, the same in Hindi]. Recipe s.
export const SLOGANS: [string, string][] = [
  ['NAZAR NA LAGE', 'नज़र ना लगे'], ['BURI NAZAR WALE TERA MUH KALA', 'बुरी नज़र वाले तेरा मुँह काला'], ['USE DIPPER AT NIGHT', 'रात को डिपर जलाओ'],
  ['MAA KA ASHIRWAD', 'माँ का आशीर्वाद'], ['DEKHO MAGAR PYAAR SE', 'देखो मगर प्यार से'], ['JALNE WALE JALTE RAHO', 'जलने वाले जलते रहो'],
  ['PHIR MILENGE', 'फिर मिलेंगे'], ['HORN OK PLEASE', 'हॉर्न ओके प्लीज़'],
];
export const PLATE_STYLES: { label: string; swatch: string[] }[] = [
  { label: 'Poster', swatch: ['#1E5BC6', '#C81E1E', '#FFE600', '#FF8A00'] },
  { label: 'Matchbox', swatch: ['#E8D5AE', '#F4D31F', '#E3201B', '#F26B21'] },
  { label: 'Stamp', swatch: ['#0E0B09', '#E3C99A', '#B0201A', '#D9A93A'] },
  { label: 'Mandala', swatch: ['#D63A2A', '#FFD23F', '#6B0F12', '#FBF3E4'] },
];

// ---------- print texture ----------
let NOISE: HTMLCanvasElement | null = null;
function noiseTile() {
  if (NOISE) return NOISE;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!, im = g.createImageData(256, 256), r = mkRng(99);
  for (let i = 0; i < im.data.length; i += 4) { const v = r(); im.data[i] = im.data[i + 1] = im.data[i + 2] = v * 255; im.data[i + 3] = Math.abs(v - 0.5) * 2 * 150; }
  g.putImageData(im, 0, 0);
  return (NOISE = c);
}
function grain(x: X, w: number, h: number, a: number) {
  x.save(); x.globalAlpha = a; x.globalCompositeOperation = 'overlay';
  x.fillStyle = x.createPattern(noiseTile(), 'repeat')!; x.fillRect(0, 0, w, h); x.restore();
}
// soft blotches, for ink that soaked in unevenly
function mottle(x: X, x0: number, y0: number, w: number, h: number, col: string, n: number, rmax: number, a: number, r: Rng) {
  x.save(); x.globalAlpha = a;
  for (let i = 0; i < n; i++) {
    const px = x0 + r() * w, py = y0 + r() * h, rr = rmax * (0.3 + r() * 0.7), g = x.createRadialGradient(px, py, 0, px, py, rr);
    g.addColorStop(0, col); g.addColorStop(1, 'transparent');
    x.fillStyle = g; x.fillRect(px - rr, py - rr, rr * 2, rr * 2);
  }
  x.restore();
}
function dotGrid(x: X, x0: number, y0: number, w: number, h: number, cell: number, rad: number, col: string) {
  x.save(); x.beginPath(); x.rect(x0, y0, w, h); x.clip(); x.fillStyle = col; x.beginPath();
  for (let j = 0, y = y0; y < y0 + h + cell; y += cell, j++) for (let px = x0 + (j % 2) * cell / 2; px < x0 + w + cell; px += cell) { x.moveTo(px + rad, y); x.arc(px, y, rad, 0, TAU); }
  x.fill(); x.restore();
}

// ---------- lettering ----------
function fit(x: X, text: string, font: (s: number) => string, maxW: number, maxS: number) {
  x.font = font(maxS);
  const s = Math.floor(Math.min(maxS, (maxS * maxW) / Math.max(1, x.measureText(text).width)));
  x.font = font(s);
  return s;
}
// block letters with a solid extruded side, a two-tone face split across the middle, inked edges
function extrude(x: X, text: string, cx: number, cy: number, s: number, o: { top: string; bottom?: string; side: string; ink?: string; depth?: number; split?: number }) {
  const dep = Math.round(o.depth ?? s * 0.09), ink = o.ink ?? INK, lw = Math.max(3, s * 0.045);
  x.save(); x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  x.strokeStyle = ink; x.lineWidth = lw * 2;
  for (let k = dep; k >= 0; k -= 2) x.strokeText(text, cx + k * 0.7, cy + k);
  x.fillStyle = o.side;
  for (let k = dep; k >= 1; k--) x.fillText(text, cx + k * 0.7, cy + k);
  const sy = cy + s * ((o.split ?? 0.55) - 0.5) * 0.7;
  x.save(); x.beginPath(); x.rect(0, cy - s * 2, x.canvas.width * 4, sy - (cy - s * 2)); x.clip(); x.fillStyle = o.top; x.fillText(text, cx, cy); x.restore();
  x.save(); x.beginPath(); x.rect(0, sy, x.canvas.width * 4, s * 2); x.clip(); x.fillStyle = o.bottom ?? o.top; x.fillText(text, cx, cy); x.restore();
  x.lineWidth = lw; x.strokeText(text, cx, cy);
  x.restore();
}
// off-register print: cyan and magenta ghosts peeking out from under the colour
function misreg(x: X, text: string, cx: number, cy: number, fill: string | CanvasGradient, off: number) {
  x.save(); x.textAlign = 'center'; x.textBaseline = 'middle';
  x.globalAlpha = 0.75; x.fillStyle = '#19A7D8'; x.fillText(text, cx - off, cy + off * 0.6);
  x.fillStyle = '#E2177A'; x.fillText(text, cx + off, cy - off * 0.4);
  x.globalAlpha = 1; x.fillStyle = fill; x.fillText(text, cx, cy); x.restore();
}
// Hinglish sign-painter letters: Latin one by one with a tilt, Indic words whole, a halftone
// through the face and a deep block shadow. Returns nothing; draws centred on cx, cy.
function desiLine(x: X, text: string, cx: number, cy: number, s: number, fill: string, dot: string, ext: string, r: Rng) {
  x.font = `700 ${s}px ${DISP}`;
  const bits = text.split(/([\u0900-\u097F\u200C\u200D]+|\s+)/).filter(Boolean).flatMap((b) => (/[\u0900-\u097F]/.test(b) || /^\s+$/.test(b) ? [b] : [...b]));
  const ws = bits.map((b) => (/^\s+$/.test(b) ? s * 0.28 : x.measureText(b).width));
  let px = cx - ws.reduce((a, b) => a + b, 0) / 2;
  const at = bits.map((b, i) => { const p = { b, x: px + ws[i] / 2, rot: (r() - 0.5) * 0.09, dy: (r() - 0.5) * s * 0.06 }; px += ws[i]; return p; }).filter((p) => !/^\s+$/.test(p.b));
  const paint = (dx: number, dy: number, col: string) => {
    x.fillStyle = col;
    for (const p of at) { x.save(); x.translate(p.x + dx, cy + p.dy + dy); x.rotate(p.rot); x.fillText(p.b, 0, 0); x.restore(); }
  };
  x.save(); x.textAlign = 'center'; x.textBaseline = 'middle';
  const dep = Math.round(s * 0.08);
  for (let k = dep; k >= 1; k--) paint(k * 0.8, k * 0.8, ext);
  // the face, with dots printed through it, on its own layer
  const L = document.createElement('canvas');
  L.width = x.canvas.width; L.height = x.canvas.height;
  const g = L.getContext('2d')!;
  g.setTransform(x.getTransform()); g.font = x.font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = fill;
  for (const p of at) { g.save(); g.translate(p.x, cy + p.dy); g.rotate(p.rot); g.fillText(p.b, 0, 0); g.restore(); }
  g.globalCompositeOperation = 'source-atop';
  dotGrid(g, 0, cy - s, 1080, s * 2, Math.max(5, s * 0.045), Math.max(1.2, s * 0.011), dot);
  x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(L, 0, 0); x.restore();
}

// ---------- ornaments ----------
function burst(x: X, cx: number, cy: number, ro: number, ri: number, n: number, fill: string, r?: Rng, rot = 0) {
  x.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i / (n * 2)) * TAU, rr = i % 2 ? ri : ro * (r ? 0.78 + r() * 0.44 : 1);
    if (i) x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); else x.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  x.closePath(); x.fillStyle = fill; x.fill();
}
function leaf(x: X, x0: number, y0: number, x1: number, y1: number, w: number) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, l = Math.hypot(x1 - x0, y1 - y0) || 1, nx = (-(y1 - y0) / l) * w, ny = ((x1 - x0) / l) * w;
  x.beginPath(); x.moveTo(x0, y0); x.quadraticCurveTo(mx + nx, my + ny, x1, y1); x.quadraticCurveTo(mx - nx, my - ny, x0, y0); x.closePath();
}
function lotus(x: X, cx: number, cy: number, r: number) {
  x.lineJoin = 'round';
  for (const [deg, k, col] of [[-64, 0.78, '#D93A84'], [64, 0.78, '#D93A84'], [-34, 0.94, '#F065A6'], [34, 0.94, '#F065A6'], [0, 1, '#FF9CCB']] as [number, number, string][]) {
    const a = ((deg - 90) * Math.PI) / 180;
    leaf(x, cx, cy, cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k, r * 0.3);
    x.fillStyle = col; x.fill(); x.lineWidth = r * 0.045; x.strokeStyle = '#6E0E33'; x.stroke();
    x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * r * k * 0.7, cy + Math.sin(a) * r * k * 0.7); x.lineWidth = r * 0.02; x.stroke();
  }
  x.beginPath(); x.ellipse(cx, cy, r * 0.46, r * 0.16, 0, 0, Math.PI); x.fillStyle = '#2F8A3C'; x.fill(); x.lineWidth = r * 0.045; x.strokeStyle = INK; x.stroke();
}
function vine(x: X, x0: number, y0: number, x1: number, y1: number, sway: number, r: Rng) {
  x.lineCap = 'round'; x.strokeStyle = '#1F6B2E'; x.lineWidth = 10;
  x.beginPath(); x.moveTo(x0, y0); x.bezierCurveTo(x0 + sway, y0 + (y1 - y0) * 0.33, x1 - sway, y0 + (y1 - y0) * 0.66, x1, y1); x.stroke();
  for (let t = 0.12; t < 0.9; t += 0.16) {
    const y = y0 + (y1 - y0) * t, xx = x0 + (x1 - x0) * t + Math.sin(t * Math.PI * 2) * sway * 0.55, s = t * 10 % 2 < 1 ? 1 : -1;
    leaf(x, xx, y, xx + s * (44 + r() * 16), y - 30 - r() * 14, 13);
    x.fillStyle = s > 0 ? '#3FA34D' : '#2F8A3C'; x.fill(); x.lineWidth = 3; x.strokeStyle = '#123F1C'; x.stroke();
  }
}
function paisley(x: X, cx: number, cy: number, s: number, rot: number, cols: string[]) {
  x.save(); x.translate(cx, cy); x.rotate(rot);
  cols.forEach((c, i) => {
    const k = s * (1 - i * 0.24);
    x.beginPath(); x.moveTo(0, 40 * k); x.bezierCurveTo(-40 * k, 40 * k, -46 * k, -12 * k, -14 * k, -32 * k);
    x.bezierCurveTo(6 * k, -44 * k, 30 * k, -46 * k, 26 * k, -66 * k); x.bezierCurveTo(56 * k, -30 * k, 46 * k, 40 * k, 0, 40 * k); x.closePath();
    x.fillStyle = c; x.fill(); x.lineWidth = Math.max(2, s * 0.06); x.strokeStyle = INK; x.stroke();
  });
  for (let i = 0; i < 9; i++) { const a = -2.4 + (i / 8) * 3.2; x.beginPath(); x.arc(Math.cos(a) * 58 * s, Math.sin(a) * 52 * s - 6 * s, 4.5 * s, 0, TAU); x.fillStyle = '#FFE14A'; x.fill(); }
  x.restore();
}
function chili(x: X, cx: number, cy: number, len: number, rot: number) {
  x.save(); x.translate(cx, cy); x.rotate(rot); x.lineJoin = 'round';
  x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(len * 0.3, -len * 0.15, len * 0.78, -len * 0.08, len, len * 0.16);
  x.bezierCurveTo(len * 0.7, len * 0.08, len * 0.32, len * 0.16, 0, len * 0.15); x.closePath();
  x.fillStyle = '#D8231B'; x.fill(); x.lineWidth = len * 0.035; x.strokeStyle = '#4A0705'; x.stroke();
  x.beginPath(); x.moveTo(len * 0.12, len * 0.02); x.quadraticCurveTo(len * 0.45, -len * 0.06, len * 0.7, 0); x.lineWidth = len * 0.03; x.strokeStyle = 'rgba(255,255,255,.7)'; x.stroke();
  x.beginPath(); x.moveTo(len * 0.02, len * 0.07); x.quadraticCurveTo(-len * 0.12, len * 0.02, -len * 0.16, -len * 0.1); x.lineWidth = len * 0.06; x.strokeStyle = '#2F8A3C'; x.lineCap = 'round'; x.stroke();
  x.restore();
}
function lemon(x: X, cx: number, cy: number, r: number) {
  x.beginPath(); x.ellipse(cx, cy, r, r * 0.8, 0, 0, TAU); x.fillStyle = '#E9E23A'; x.fill(); x.lineWidth = r * 0.12; x.strokeStyle = '#4A4A0A'; x.stroke();
  x.beginPath(); x.ellipse(cx - r * 0.3, cy - r * 0.25, r * 0.25, r * 0.15, -0.5, 0, TAU); x.fillStyle = 'rgba(255,255,255,.7)'; x.fill();
}
// nimbu-mirchi: the lemon and chillies hung on a thread against the evil eye
function nimbuMirchi(x: X, cx: number, top: number, len: number) {
  const c = len / 7;
  x.strokeStyle = INK; x.lineWidth = Math.max(2, len * 0.012); x.beginPath(); x.moveTo(cx, top); x.lineTo(cx, top + len * 0.86); x.stroke();
  for (let i = 0; i < 5; i++) chili(x, cx + (i % 2 ? 4 : -4), top + c * (0.5 + i * 0.9), c * 1.25, Math.PI / 2 + (i % 2 ? -0.32 : 0.32));
  lemon(x, cx, top + len * 0.9, c * 0.75);
}
function bottle(x: X, cx: number, base: number, h: number, body: string, rot: number) {
  x.save(); x.translate(cx, base); x.rotate(rot); const w = h * 0.3;
  x.beginPath(); x.moveTo(-w / 2, 0); x.lineTo(-w / 2, -h * 0.52); x.quadraticCurveTo(-w / 2, -h * 0.66, -w * 0.2, -h * 0.72); x.lineTo(-w * 0.2, -h * 0.95);
  x.lineTo(w * 0.2, -h * 0.95); x.lineTo(w * 0.2, -h * 0.72); x.quadraticCurveTo(w / 2, -h * 0.66, w / 2, -h * 0.52); x.lineTo(w / 2, 0); x.closePath();
  x.fillStyle = body; x.fill(); x.lineWidth = 4; x.strokeStyle = INK; x.stroke();
  x.fillStyle = '#FBF3E4'; x.fillRect(-w / 2 + 3, -h * 0.4, w - 6, h * 0.2); x.fillStyle = '#D8231B'; x.fillRect(-w / 2 + 3, -h * 0.34, w - 6, h * 0.06);
  x.fillStyle = '#C9C9C9'; x.fillRect(-w * 0.26, -h, w * 0.52, h * 0.07); x.strokeRect(-w * 0.26, -h, w * 0.52, h * 0.07);
  x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(-w * 0.34, -h * 0.5, w * 0.1, h * 0.4);
  x.restore();
}
function marigold(x: X, cx: number, cy: number, r: number, col: string) {
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; x.beginPath(); x.arc(cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 0.62, r * 0.42, 0, TAU); x.fillStyle = i % 2 ? col : '#FF9F1C'; x.fill(); }
  x.beginPath(); x.arc(cx, cy, r * 0.42, 0, TAU); x.fillStyle = '#C2410C'; x.fill();
}
function mustache(x: X, cx: number, cy: number, w: number) {
  x.lineCap = 'round'; x.strokeStyle = INK;
  for (const s of [-1, 1]) {
    x.beginPath(); x.moveTo(cx, cy);
    x.bezierCurveTo(cx + s * w * 0.18, cy - w * 0.1, cx + s * w * 0.3, cy + w * 0.12, cx + s * w * 0.44, cy - w * 0.02);
    x.bezierCurveTo(cx + s * w * 0.53, cy - w * 0.1, cx + s * w * 0.47, cy - w * 0.22, cx + s * w * 0.39, cy - w * 0.15);
    x.lineWidth = w * 0.075; x.stroke();
  }
}
// the nazar face painted on a truck's back: big lashed eyes, a red tilak, a proud moustache
function nazarFace(x: X, cx: number, cy: number, w: number) {
  eye(x, cx - w * 0.25, cy, w * 0.42); eye(x, cx + w * 0.25, cy, w * 0.42);
  x.save(); x.translate(cx, cy - w * 0.2);
  x.beginPath(); x.moveTo(0, -w * 0.1); x.quadraticCurveTo(w * 0.035, 0, 0, w * 0.07); x.quadraticCurveTo(-w * 0.035, 0, 0, -w * 0.1);
  x.fillStyle = '#D8231B'; x.fill(); x.lineWidth = w * 0.01; x.strokeStyle = INK; x.stroke(); x.restore();
  mustache(x, cx, cy + w * 0.28, w * 0.8);
}
// a Tata-style lorry from the front: painted crown board, fringed windscreen, grille, headlamps,
// a hazard-striped bumper, tassels and a nimbu-mirchi. w wide; about 1.25w tall.
function truckFront(x: X, cx: number, top: number, w: number, body = '#1D9A8A', crown = '#FFD23F') {
  const u = w / 100; x.lineJoin = 'round'; x.strokeStyle = INK;
  // crown board
  x.beginPath(); x.moveTo(cx - 42 * u, top + 24 * u); x.lineTo(cx - 42 * u, top + 10 * u);
  for (let i = 1; i <= 6; i++) { const px = cx - 42 * u + i * 14 * u; x.quadraticCurveTo(px - 7 * u, top - 4 * u + (i % 2) * 3 * u, px, top + (i === 0 || i === 6 ? 10 : 4) * u); }
  x.lineTo(cx + 42 * u, top + 24 * u); x.closePath(); x.fillStyle = crown; x.fill(); x.lineWidth = 1.6 * u; x.stroke();
  lotus(x, cx, top + 21 * u, 13 * u);
  for (const s of [-1, 1]) { marigold(x, cx + s * 28 * u, top + 15 * u, 4.5 * u, '#E8761E'); eye(x, cx + s * 14 * u, top + 15 * u, 9 * u); }
  // cab
  x.fillStyle = body; x.beginPath(); x.roundRect(cx - 47 * u, top + 23 * u, 94 * u, 50 * u, 4 * u); x.fill(); x.lineWidth = 1.8 * u; x.stroke();
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? cx - 41 * u : cx + 2 * u;
    const g = x.createLinearGradient(0, top + 28 * u, 0, top + 52 * u); g.addColorStop(0, '#BFE8F7'); g.addColorStop(1, '#4C9FD0');
    x.fillStyle = g; x.fillRect(x0, top + 28 * u, 39 * u, 24 * u); x.lineWidth = 1.4 * u; x.strokeRect(x0, top + 28 * u, 39 * u, 24 * u);
    x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 1.6 * u; x.beginPath(); x.moveTo(x0 + 8 * u, top + 48 * u); x.lineTo(x0 + 20 * u, top + 31 * u); x.moveTo(x0 + 14 * u, top + 48 * u); x.lineTo(x0 + 24 * u, top + 34 * u); x.stroke(); x.strokeStyle = INK;
  }
  // fringe (jhalar) along the windscreen top
  const fc = ['#D8231B', '#FFD23F', '#2F8A3C', '#F065A6'];
  for (let i = 0; i < 18; i++) { const px = cx - 43 * u + i * 5.06 * u; x.beginPath(); x.moveTo(px, top + 27 * u); x.lineTo(px + 5 * u, top + 27 * u); x.lineTo(px + 2.5 * u, top + 33 * u); x.closePath(); x.fillStyle = fc[i % 4]; x.fill(); x.lineWidth = 0.6 * u; x.stroke(); }
  // painted band with the OK diamond
  x.fillStyle = '#FFD23F'; x.fillRect(cx - 44 * u, top + 56 * u, 88 * u, 13 * u); x.lineWidth = 1.2 * u; x.strokeRect(cx - 44 * u, top + 56 * u, 88 * u, 13 * u);
  for (let i = 0; i < 12; i++) { x.beginPath(); x.arc(cx - 40 * u + i * 7.3 * u, top + 62.5 * u, 1.6 * u, 0, TAU); x.fillStyle = i % 2 ? '#D8231B' : '#2D4C7C'; x.fill(); }
  x.save(); x.translate(cx, top + 62.5 * u); x.rotate(Math.PI / 4); x.fillStyle = '#D8231B'; x.fillRect(-6 * u, -6 * u, 12 * u, 12 * u); x.strokeRect(-6 * u, -6 * u, 12 * u, 12 * u); x.restore();
  x.fillStyle = '#FBF3E4'; x.font = `900 ${6 * u}px ${SAR}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('OK', cx, top + 63 * u);
  // bonnet, grille, headlamps
  x.fillStyle = '#B8361F'; x.beginPath(); x.roundRect(cx - 49 * u, top + 72 * u, 98 * u, 27 * u, 3 * u); x.fill(); x.lineWidth = 1.8 * u; x.stroke();
  x.fillStyle = '#D9D9D9'; x.fillRect(cx - 20 * u, top + 75 * u, 40 * u, 21 * u); x.strokeRect(cx - 20 * u, top + 75 * u, 40 * u, 21 * u);
  x.lineWidth = 1 * u; for (let i = 1; i < 8; i++) { x.beginPath(); x.moveTo(cx - 20 * u + i * 5 * u, top + 75 * u); x.lineTo(cx - 20 * u + i * 5 * u, top + 96 * u); x.stroke(); }
  for (const s of [-1, 1]) {
    x.beginPath(); x.arc(cx + s * 34 * u, top + 85.5 * u, 9.5 * u, 0, TAU); x.fillStyle = '#E6E6E6'; x.fill(); x.lineWidth = 1.6 * u; x.stroke();
    const g = x.createRadialGradient(cx + s * 34 * u - 2 * u, top + 83 * u, 1, cx + s * 34 * u, top + 85.5 * u, 7 * u); g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#FFD23F');
    x.beginPath(); x.arc(cx + s * 34 * u, top + 85.5 * u, 6.8 * u, 0, TAU); x.fillStyle = g; x.fill(); x.lineWidth = 1 * u; x.stroke();
  }
  // bumper with hazard stripes
  x.save(); x.beginPath(); x.rect(cx - 53 * u, top + 99 * u, 106 * u, 10 * u); x.clip(); x.fillStyle = '#FFD23F'; x.fillRect(cx - 53 * u, top + 99 * u, 106 * u, 10 * u);
  x.fillStyle = INK; for (let i = -2; i < 24; i++) { x.beginPath(); x.moveTo(cx - 53 * u + i * 8 * u, top + 109 * u); x.lineTo(cx - 49 * u + i * 8 * u, top + 99 * u); x.lineTo(cx - 45 * u + i * 8 * u, top + 99 * u); x.lineTo(cx - 49 * u + i * 8 * u, top + 109 * u); x.fill(); }
  x.restore(); x.lineWidth = 1.8 * u; x.strokeRect(cx - 53 * u, top + 99 * u, 106 * u, 10 * u);
  // wheels peeking under the bumper
  for (const s of [-1, 1]) { x.fillStyle = INK; x.fillRect(cx + s * 38 * u - 9 * u, top + 109 * u, 18 * u, 11 * u); x.fillStyle = '#9A9A9A'; x.fillRect(cx + s * 38 * u - 4 * u, top + 111 * u, 8 * u, 5 * u); }
  // tassels (phundne)
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const px = cx + s * (52 - i * 4) * u;
    x.strokeStyle = INK; x.lineWidth = 0.6 * u; x.beginPath(); x.moveTo(px, top + 104 * u); x.lineTo(px, top + 112 * u); x.stroke();
    x.beginPath(); x.moveTo(px, top + 112 * u); x.lineTo(px - 2.2 * u, top + 121 * u); x.lineTo(px + 2.2 * u, top + 121 * u); x.closePath(); x.fillStyle = fc[(i + (s > 0 ? 1 : 0)) % 4]; x.fill(); x.stroke();
  }
  nimbuMirchi(x, cx, top + 109 * u, 26 * u);
}
function postmark(x: X, cx: number, cy: number, r: number, ring: string, mid: string[], col: string, rot: number) {
  x.save(); x.translate(cx, cy); x.rotate(rot); x.strokeStyle = col; x.fillStyle = col;
  x.lineWidth = r * 0.045; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.stroke();
  x.lineWidth = r * 0.03; x.beginPath(); x.arc(0, 0, r * 0.64, 0, TAU); x.stroke();
  x.font = `800 ${r * 0.2}px ${MU}`; x.textAlign = 'center'; x.textBaseline = 'middle';
  const chars = [...ring], step = TAU / chars.length;
  chars.forEach((ch, i) => { x.save(); x.rotate(-Math.PI / 2 + i * step); x.translate(0, -r * 0.82); x.fillText(ch, 0, 0); x.restore(); });
  x.font = `800 ${r * 0.24}px ${MU}`; mid.forEach((l, i) => x.fillText(l, 0, (i - (mid.length - 1) / 2) * r * 0.26));
  // wavy cancellation lines
  x.lineWidth = r * 0.035;
  for (let j = 0; j < 5; j++) { x.beginPath(); for (let t = 0; t <= 1; t += 0.02) { const px = r * 1.15 + t * r * 2.6, py = (j - 2) * r * 0.24 + Math.sin(t * TAU * 2.2) * r * 0.07; if (t) x.lineTo(px, py); else x.moveTo(px, py); } x.stroke(); }
  x.restore();
}
// re-print a drawing as a coarse colour halftone with off-register cyan/magenta fringes
function halftone(x: X, src: HTMLCanvasElement, dx: number, dy: number, cell: number) {
  const w = src.width, h = src.height, d = src.getContext('2d')!.getImageData(0, 0, w, h).data;
  const pass = (fn: (px: number, py: number, r: number, g: number, b: number, l: number) => void) => {
    for (let j = 0, y = 0; y < h; y += cell, j++) for (let px = (j % 2) * cell / 2; px < w; px += cell) {
      const p = ((Math.min(h - 1, Math.round(y)) * w + Math.min(w - 1, Math.round(px))) * 4);
      if (d[p + 3] < 60) continue;
      fn(dx + px, dy + y, d[p], d[p + 1], d[p + 2], (0.3 * d[p] + 0.59 * d[p + 1] + 0.11 * d[p + 2]) / 255);
    }
  };
  x.save();
  x.globalAlpha = 0.45;
  pass((px, py, _r, _g, _b, l) => { if (l > 0.7) return; const rr = cell * 0.5 * (1 - l); x.fillStyle = '#19A7D8'; x.beginPath(); x.arc(px - cell * 0.35, py + cell * 0.25, rr, 0, TAU); x.fill(); x.fillStyle = '#E2177A'; x.beginPath(); x.arc(px + cell * 0.35, py - cell * 0.15, rr, 0, TAU); x.fill(); });
  x.globalAlpha = 0.95;
  pass((px, py, r, g, b, l) => { x.fillStyle = `rgb(${r * 0.92 | 0},${g * 0.88 | 0},${b * 0.85 | 0})`; x.beginPath(); x.arc(px, py, cell * (0.34 + 0.3 * (1 - l)), 0, TAU); x.fill(); });
  x.restore();
}
function credit(x: X, cx: number, y: number, s: number, col: string) {
  x.save(); x.fillStyle = col; x.font = `800 ${s}px ${MU}`; x.textAlign = 'center'; x.textBaseline = 'middle';
  if ('letterSpacing' in x) (x as X & { letterSpacing: string }).letterSpacing = `${s * 0.12}px`;
  x.fillText('RANGOTSAV · A PEGASUS · RVITM PROJECT', cx, y); x.restore();
}
const spaced = (x: X, px: number) => { if ('letterSpacing' in x) (x as X & { letterSpacing: string }).letterSpacing = `${px}px`; };

// ---------- 0: desi maximalism poster ----------
function poster(x: X, H: number, name: string, dev: string, sl: [string, string], r: Rng) {
  const W = 1080, cx = W / 2, sq = H < 1500, m = 44;
  x.fillStyle = '#1E5BC6'; x.fillRect(0, 0, W, H);
  mottle(x, 0, 0, W, H, '#0B2E73', 90, 70, 0.5, r); mottle(x, 0, 0, W, H, '#6FA0F0', 50, 40, 0.35, r);
  // red field with a rounded arch top; cyan corners outside it
  const top = m, rad = sq ? 200 : 260;
  x.fillStyle = '#39B6E8'; x.fillRect(m, m, W - 2 * m, rad);
  const field = () => { x.beginPath(); x.moveTo(m, H - m); x.lineTo(m, top + rad); x.quadraticCurveTo(m, top, m + rad, top); x.lineTo(W - m - rad, top); x.quadraticCurveTo(W - m, top, W - m, top + rad); x.lineTo(W - m, H - m); x.closePath(); };
  field(); x.fillStyle = '#C81E1E'; x.fill(); x.save(); x.clip(); mottle(x, 0, 0, W, H, '#6E0A0D', 70, 160, 0.35, r); x.restore();
  field(); x.lineWidth = 6; x.strokeStyle = '#FFD23F'; x.stroke();
  for (const s of [-1, 1]) { const ox = s < 0 ? m + 70 : W - m - 70; paisley(x, ox, m + 92, sq ? 0.95 : 1.15, s * 0.6, ['#F065A6', '#FFD23F', '#2D4C7C']); }
  // bead string along the arch
  for (let i = 0; i < 15; i++) { const px = m + rad + 10 + i * ((W - 2 * m - 2 * rad - 20) / 14); x.beginPath(); x.arc(px, top + 26, 9, 0, TAU); x.fillStyle = i % 2 ? '#FFD23F' : '#FBF3E4'; x.fill(); x.lineWidth = 2; x.strokeStyle = INK; x.stroke(); }
  // soda bottles
  const bb = sq ? 0 : 7;
  for (let i = 0; i < bb; i++) bottle(x, cx + (i - 3) * 72, top + 260 - Math.abs(i - 3) * 14, 170, i % 2 ? '#3FA34D' : '#E8761E', (i - 3) * 0.08);
  // the cusped frame
  const fy0 = sq ? 110 : 330, fy1 = sq ? 660 : 1250, hw = sq ? 230 : 290, nk = sq ? 120 : 150;
  const frame = (g: number) => {
    x.beginPath(); x.moveTo(cx - nk - g, fy0 + 90); x.quadraticCurveTo(cx - nk - g, fy0 - g, cx, fy0 - g); x.quadraticCurveTo(cx + nk + g, fy0 - g, cx + nk + g, fy0 + 90);
    x.lineTo(cx + nk + g, fy0 + 170); x.quadraticCurveTo(cx + nk + g, fy0 + 215, cx + nk + 60 + g, fy0 + 240); x.quadraticCurveTo(cx + hw + g, fy0 + 275, cx + hw + g, fy0 + 360);
    x.lineTo(cx + hw + g, fy1 + g); x.lineTo(cx - hw - g, fy1 + g); x.lineTo(cx - hw - g, fy0 + 360); x.quadraticCurveTo(cx - hw - g, fy0 + 275, cx - nk - 60 - g, fy0 + 240);
    x.quadraticCurveTo(cx - nk - g, fy0 + 215, cx - nk - g, fy0 + 170); x.closePath();
  };
  frame(16); x.fillStyle = '#FF7A00'; x.fill(); x.lineWidth = 5; x.strokeStyle = INK; x.stroke();
  frame(0); x.fillStyle = '#2E9BE0'; x.fill(); x.save(); x.clip();
  x.fillStyle = 'rgba(255,255,255,.12)'; for (let y = fy0; y < fy1; y += 9) x.fillRect(0, y, W, 3);
  burst(x, cx, (fy0 + fy1) / 2 + 20, hw * 1.3, hw * 0.9, 24, 'rgba(255,255,255,.14)');
  x.restore(); frame(0); x.lineWidth = 5; x.strokeStyle = INK; x.stroke();
  // dotted bulbs around the frame edge
  x.save(); frame(8); x.setLineDash([0.1, 22]); x.lineCap = 'round'; x.lineWidth = 10; x.strokeStyle = '#FFE14A'; x.stroke(); x.restore();
  // inside: the nazar face, marigolds and a nimbu-mirchi
  const fw = sq ? 360 : 470, fcy = sq ? fy0 + 300 : fy0 + 430;
  nazarFace(x, cx, fcy, fw);
  nimbuMirchi(x, cx, fcy + fw * 0.4, sq ? 120 : 250);
  for (const [px, py] of (sq ? [[-1, 0.62], [1, 0.62]] : [[-1, 0.2], [1, 0.2], [-1, 0.78], [1, 0.78]])) marigold(x, cx + px * (hw - 60), fy0 + (fy1 - fy0) * py, sq ? 26 : 32, '#FFC21A');
  // starbursts
  const sy = sq ? fy0 + 110 : fy0 + 120, sr = sq ? 92 : 122;
  [[-1, 'HORN'], [1, 'OK!']].forEach(([s, t]) => {
    const bx = cx + (s as number) * (sq ? 360 : 375);
    burst(x, bx, sy, sr, sr * 0.62, 12, '#FFE14A', undefined, 0.1);
    x.save(); x.translate(bx, sy); x.rotate((s as number) * 0.18); x.fillStyle = INK; x.font = `900 ${sr * 0.42}px ${SAR}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t as string, 0, 4); x.restore();
  });
  // lotus vines up the sides
  if (!sq) for (const s of [-1, 1]) { const vx = s < 0 ? 120 : W - 120; vine(x, vx, 1330, vx + s * 10, 720, s * 46, r); lotus(x, vx + s * 10, 720, 82); lotus(x, vx - s * 6, 1040, 64); }
  else for (const s of [-1, 1]) { const vx = s < 0 ? 110 : W - 110; vine(x, vx, 690, vx, 400, s * 30, r); lotus(x, vx, 400, 66); }
  // slogan ribbon across the bottom of the frame
  const ry = fy1 + 6, rw = sq ? 560 : 680, rh = sq ? 60 : 72;
  for (const s of [-1, 1]) { x.beginPath(); x.moveTo(cx + s * rw / 2, ry - rh / 2 + 14); x.lineTo(cx + s * (rw / 2 + 50), ry - rh / 2 + 14); x.lineTo(cx + s * (rw / 2 + 28), ry + 14); x.lineTo(cx + s * (rw / 2 + 50), ry + rh / 2 + 14); x.lineTo(cx + s * rw / 2, ry + rh / 2 + 14); x.closePath(); x.fillStyle = '#B8361F'; x.fill(); x.lineWidth = 4; x.strokeStyle = INK; x.stroke(); }
  x.fillStyle = '#FFD23F'; x.fillRect(cx - rw / 2, ry - rh / 2, rw, rh); x.lineWidth = 5; x.strokeStyle = INK; x.strokeRect(cx - rw / 2, ry - rh / 2, rw, rh);
  spaced(x, 3); const fs = fit(x, sl[0], (s) => `800 ${s}px ${SAR}`, rw - 50, rh * 0.62); x.fillStyle = '#B8131A'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(sl[0], cx, ry + fs * 0.05); spaced(x, 0);
  // the title: name in two-tone block letters, the Hindi under it
  const lines = splitName(name.toUpperCase()), ty = sq ? 820 : 1460, tmax = sq ? 200 : 270;
  x.font = `700 ${tmax}px ${DISP}`;
  const ts = Math.min(...lines.map((l) => fit(x, l, (s) => `700 ${s}px ${DISP}`, 900, lines.length > 1 ? tmax * 0.62 : tmax)));
  x.font = `700 ${ts}px ${DISP}`;
  lines.forEach((l, i) => extrude(x, l, cx, ty + (i - (lines.length - 1) / 2) * ts * 0.92, ts, { top: '#FFE600', bottom: '#FF8A00', side: INK, split: 0.52 }));
  const dy = ty + (lines.length * ts * 0.92) / 2 + (sq ? 70 : 110);
  const ds = fit(x, dev, (s) => `700 ${s}px ${DISP}`, 700, sq ? 120 : 160);
  extrude(x, dev, cx, dy, ds, { top: '#FF5A1F', bottom: '#E8361B', side: INK, depth: ds * 0.07 });
  for (const s of [-1, 1]) { chili(x, cx + s * (x.measureText(dev).width / 2 + 40) - (s > 0 ? 0 : 120), dy - 10, 120, s > 0 ? -0.3 : 0.3); }
  credit(x, cx, H - 22, 20, '#FBF3E4');
  grain(x, W, H, 0.5);
}

// ---------- 1: matchbox label ----------
function matchbox(x: X, H: number, name: string, dev: string, sl: [string, string], r: Rng) {
  const W = 1080, sq = H < 1500;
  x.fillStyle = '#E8D5AE'; x.fillRect(0, 0, W, H); mottle(x, 0, 0, W, H, '#C9AE7C', 70, 50, 0.3, r);
  // striker strip of red hexagons
  const sx0 = sq ? 34 : 50, sx1 = sq ? 160 : 230, sy0 = sq ? 40 : 60, sy1 = H - sy0, hr = sq ? 15 : 20;
  x.save(); x.beginPath(); x.rect(sx0, sy0, sx1 - sx0, sy1 - sy0); x.clip(); x.fillStyle = '#C2272B'; x.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
  x.fillStyle = '#E8D5AE';
  for (let j = 0, y = sy0; y < sy1 + hr; y += hr * 1.5, j++) for (let px = sx0 + (j % 2) * hr * 0.87; px < sx1 + hr; px += hr * 1.73) {
    x.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + (k / 6) * TAU; const qx = px + Math.cos(a) * hr * 0.66, qy = y + Math.sin(a) * hr * 0.66; if (k) x.lineTo(qx, qy); else x.moveTo(qx, qy); } x.closePath(); x.fill();
  }
  x.restore();
  x.fillStyle = INK; x.fillRect(sx1 + (sq ? 16 : 24), 0, sq ? 8 : 12, H);
  // the label
  const lx = sx1 + (sq ? 44 : 64), lw = W - lx - (sq ? 30 : 40), ly = sy0, lh = H - 2 * sy0, lcx = lx + lw / 2;
  x.fillStyle = '#F4D31F'; x.fillRect(lx, ly, lw, lh); x.lineWidth = 7; x.strokeStyle = INK; x.strokeRect(lx + 8, ly + 8, lw - 16, lh - 16);
  // brand band: the name
  const bh = sq ? 170 : 220;
  spaced(x, 4); const ns = fit(x, name.toUpperCase(), (s) => `900 ${s}px ${SAR}`, lw - 70, bh * 0.82); x.textAlign = 'center'; x.textBaseline = 'middle';
  x.lineJoin = 'round'; x.lineWidth = ns * 0.12; x.strokeStyle = INK; x.strokeText(name.toUpperCase(), lcx, ly + 14 + bh / 2); x.fillStyle = '#F26B21'; x.fillText(name.toUpperCase(), lcx, ly + 14 + bh / 2); spaced(x, 0);
  // red field with a spiky sunburst and the truck
  const fx = lx + 22, fy = ly + bh + 22, fw = lw - 44, fh = sq ? 560 : 1150;
  x.fillStyle = '#E3201B'; x.fillRect(fx, fy, fw, fh); x.save(); x.beginPath(); x.rect(fx, fy, fw, fh); x.clip();
  mottle(x, fx, fy, fw, fh, '#9E0F12', 40, 70, 0.2, r);
  const tw = sq ? 380 : 560, tcy = fy + fh * (sq ? 0.55 : 0.52);
  burst(x, lcx, tcy - tw * 0.1, tw * 0.86 + 8, tw * 0.5, 34, '#7BD14A', r);
  burst(x, lcx, tcy - tw * 0.1, tw * 0.86, tw * 0.5, 34, '#FFE600', mkRng(hashStr(name) + 3));
  truckFront(x, lcx, tcy - tw * 0.62, tw);
  x.restore(); x.lineWidth = 6; x.strokeStyle = INK; x.strokeRect(fx, fy, fw, fh);
  // the saying in Hindi, top right, and a price
  x.textAlign = 'right'; x.textBaseline = 'top'; const hs = fit(x, sl[1], (s) => `800 ${s}px ${MU}`, fw * 0.6, sq ? 44 : 60);
  x.fillStyle = '#FFE600'; x.fillText(sl[1], fx + fw - 22, fy + 16 + hs * 0.1);
  x.textBaseline = 'bottom'; x.font = `700 ${sq ? 24 : 32}px ${MU}`; x.fillStyle = '#FBF3E4'; x.fillText('Price:-₹10', fx + fw - 22, fy + fh - 12);
  // bottom band
  const by = fy + fh + 18, bcx = lcx;
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = INK;
  const l1 = `${name.toUpperCase()} TRANSPORT CO.`;
  const s1 = fit(x, l1, (s) => `800 ${s}px ${MU}`, lw - 80, sq ? 54 : 74); x.fillText(l1, bcx, by + s1 * 0.75);
  let yy = by + s1 * 1.5;
  if (!sq) { const s2 = fit(x, sl[0], (s) => `800 ${s}px ${MU}`, lw - 80, 64); x.fillText(sl[0], bcx, yy + s2 * 0.62); yy += s2 * 1.3; }
  const s3 = sq ? 36 : 50; x.font = `800 ${s3}px ${MU}`;
  x.textAlign = 'left'; x.fillText('Since 2026', lx + 46, yy + s3 * 0.7);
  x.textAlign = 'right'; x.fillText('MADE IN भारत', lx + lw - 46, yy + s3 * 0.7);
  if (!sq) { x.textAlign = 'center'; x.font = `700 32px ${DISP}`; x.fillText(`${dev} · हॉर्न ओके प्लीज़`, bcx, yy + s3 * 1.9); }
  credit(x, W / 2, H - (sq ? 16 : 26), sq ? 16 : 20, '#5A4426');
  grain(x, W, H, 0.6);
}

// ---------- 2: postage stamp ----------
function stamp(x: X, H: number, name: string, dev: string, sl: [string, string], r: Rng, sticker: boolean) {
  const W = 1080, sq = H < 1500;
  if (!sticker) { x.fillStyle = '#0E0B09'; x.fillRect(0, 0, W, H); }
  const px0 = sq ? 60 : 80, py0 = sq ? 60 : 210, pw = W - 2 * px0, ph = sq ? H - 120 : 1460;
  // aged paper
  const g = x.createRadialGradient(W / 2, py0 + ph * 0.45, 50, W / 2, py0 + ph / 2, ph * 0.75); g.addColorStop(0, '#EBD6AA'); g.addColorStop(1, '#C9A46A');
  x.fillStyle = g; x.fillRect(px0, py0, pw, ph);
  x.save(); x.beginPath(); x.rect(px0, py0, pw, ph); x.clip();
  mottle(x, px0, py0, pw, ph, '#A47B44', 30, 90, 0.12, r); mottle(x, px0, py0, pw, ph, '#5C7A2E', 4, 6, 0.6, r);
  // the halftone truck
  const tw = sq ? 430 : 700, off = document.createElement('canvas');
  off.width = Math.round(tw * 1.12); off.height = Math.round(tw * 1.45);
  const o = off.getContext('2d')!;
  burst(o, off.width / 2, tw * 0.62, tw * 0.62, tw * 0.44, 28, '#E8761E', mkRng(hashStr(name)));
  truckFront(o, off.width / 2, tw * 0.1, tw * 0.95, '#2D4C7C', '#FFD23F');
  halftone(x, off, (W - off.width) / 2 + (sq ? 110 : 50), sq ? py0 + 215 : py0 + 290, sq ? 8 : 11);
  // भारत INDIA, top left
  x.fillStyle = INK; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
  x.font = `800 ${sq ? 78 : 104}px ${MU}`; x.fillText('भारत', px0 + 50, py0 + (sq ? 110 : 150));
  x.font = `800 ${sq ? 70 : 92}px ${MU}`; spaced(x, -2); x.fillText('INDIA', px0 + 50, py0 + (sq ? 190 : 255)); spaced(x, 0);
  x.fillStyle = '#B0201A'; x.font = `800 ${sq ? 44 : 60}px ${MU}`; x.fillText('₹ 5', px0 + 52, py0 + (sq ? 250 : 335));
  // the postmark, over the corner
  x.globalAlpha = 0.72;
  postmark(x, px0 + pw - (sq ? 200 : 250), py0 + (sq ? 170 : 230), sq ? 130 : 175, `★ ${sl[0]} ★ RANGOTSAV `, ['HORN', 'OK'], '#231A14', -0.28);
  x.globalAlpha = 1;
  // the name, running up the left edge in small red Hindi
  x.save(); x.translate(px0 + 44, py0 + ph * (sq ? 0.62 : 0.6)); x.rotate(-Math.PI / 2); x.fillStyle = '#B0201A'; x.font = `700 ${sq ? 30 : 40}px ${DISP}`; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(`${dev} · ट्रक कला`, 0, 0); x.restore();
  // the big gold Hindi name
  const gy = py0 + ph - (sq ? 80 : 105), gs = fit(x, dev, (s) => `400 ${s}px ${YA}`, pw - 160, sq ? 130 : 170);
  const gold = x.createLinearGradient(0, gy - gs / 2, 0, gy + gs / 2); gold.addColorStop(0, '#FFF0B0'); gold.addColorStop(0.5, '#E6B84A'); gold.addColorStop(1, '#A8761E');
  misreg(x, dev, W / 2 + 30, gy, gold, Math.max(3, gs * 0.03));
  grain(x, W, H, 0.45);
  x.restore();
  // perforations: punched out for the sticker, black on the wallpaper
  const hr = sq ? 13 : 16, gap = hr * 2.6;
  x.save(); if (sticker) x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#0E0B09';
  for (let t = px0; t <= px0 + pw + 1; t += pw / Math.round(pw / gap)) { x.beginPath(); x.arc(t, py0, hr, 0, TAU); x.arc(t, py0 + ph, hr, 0, TAU); x.fill(); }
  for (let t = py0; t <= py0 + ph + 1; t += ph / Math.round(ph / gap)) { x.beginPath(); x.arc(px0, t, hr, 0, TAU); x.arc(px0 + pw, t, hr, 0, TAU); x.fill(); }
  x.restore();
  if (!sq) {
    x.fillStyle = '#E8D5AE'; x.textAlign = 'center'; x.textBaseline = 'middle'; spaced(x, 10);
    x.font = `900 40px ${SAR}`; x.fillText('RANGOTSAV POST', W / 2, 110);
    x.font = `800 34px ${SAR}`; x.fillText(name.toUpperCase(), W / 2, 1755); spaced(x, 0);
    x.font = `700 40px ${DISP}`; x.fillStyle = '#D9A93A'; x.fillText(sl[1], W / 2, 1815);
    credit(x, W / 2, 1880, 20, '#8C7A5E');
  }
}

// ---------- 3: Hinglish mandala poster ----------
function mandala(x: X, H: number, name: string, dev: string, sl: [string, string], r: Rng) {
  const W = 1080, cx = W / 2, sq = H < 1500;
  x.fillStyle = '#D63A2A'; x.fillRect(0, 0, W, H);
  dotGrid(x, 0, 0, W, H, 9, 1.6, 'rgba(70,0,0,.22)');
  const my = sq ? 500 : 860, R = sq ? 560 : 720;
  x.save(); x.translate(cx, my); x.scale(R / 100, R / 100); x.rotate(hashStr(name) % 360 / 57.3);
  x.fillStyle = 'rgba(90,8,8,.32)'; x.fill(new Path2D(SOLID));
  x.strokeStyle = 'rgba(90,8,8,.45)'; x.lineWidth = 0.9; x.lineCap = 'round'; x.stroke(new Path2D(LINES));
  x.beginPath(); for (const [dx, dy] of DOTS) { x.moveTo(dx + 1.3, dy); x.arc(dx, dy, 1.3, 0, TAU); } x.fill();
  x.restore();
  // the saying in Hindi, small, up top
  x.textAlign = 'center'; x.textBaseline = 'middle';
  const hs = fit(x, sl[1], (s) => `700 ${s}px ${DISP}`, 860, sq ? 60 : 84);
  x.fillStyle = '#5A0B0E'; x.fillText(sl[1], cx + 4, (sq ? 120 : 250) + 4); x.fillStyle = '#FBF3E4'; x.fillText(sl[1], cx, sq ? 120 : 250);
  // the name, then the name again in Devanagari
  x.font = `700 10px ${DISP}`;
  const ls = fit(x, name, (s) => `700 ${s}px ${DISP}`, 900, sq ? 230 : 280), ds = fit(x, dev, (s) => `700 ${s}px ${DISP}`, 880, sq ? 220 : 270);
  desiLine(x, name, cx, sq ? 400 : 760, ls, '#FFD23F', 'rgba(200,95,0,.5)', '#5A0B0E', r);
  desiLine(x, dev, cx, sq ? 400 + ls * 0.6 + ds * 0.55 : 760 + ls * 0.6 + ds * 0.6, ds, '#FFD23F', 'rgba(200,95,0,.5)', '#5A0B0E', r);
  x.fillStyle = '#FFD23F'; x.font = `800 ${sq ? 22 : 30}px ${MU}`; x.textAlign = 'right';
  x.fillText('your name · आपका नाम · painted by hand', cx + 430, sq ? 780 : 1290);
  x.textAlign = 'center';
  if (!sq) { eye(x, cx - 170, 1460, 230); eye(x, cx + 170, 1460, 230); mustache(x, cx, 1580, 300); }
  spaced(x, sq ? 8 : 12); x.font = `900 ${sq ? 52 : 64}px ${SAR}`; x.lineWidth = sq ? 9 : 12; x.strokeStyle = '#5A0B0E'; x.lineJoin = 'round';
  x.strokeText('HORN OK PLEASE', cx, sq ? 900 : 1720); x.fillStyle = '#FBF3E4'; x.fillText('HORN OK PLEASE', cx, sq ? 900 : 1720); spaced(x, 0);
  credit(x, cx, H - (sq ? 40 : 60), sq ? 18 : 22, '#FFD23F');
  grain(x, W, H, 0.4);
}

// Draws the plate into cv. fmt picks wallpaper (1080×1920) or sticker (512 square, transparent
// edges on the stamp); s is the saying, k the style.
export function drawPlate(cv: HTMLCanvasElement, fmt: 'wallpaper' | 'sticker', raw: string, sl = 0, k = 0) {
  const st = fmt === 'sticker', name = (raw || '').trim() || 'Apna Naam', dev = (raw || '').trim() ? toDevanagari(name) : 'अपना नाम';
  const W = st ? 512 : 1080, H = st ? 512 : 1920;
  if (cv.width !== W) cv.width = W;
  if (cv.height !== H) cv.height = H;
  const x = cv.getContext('2d')!;
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H);
  if (st) x.scale(512 / 1080, 512 / 1080);
  const h = st ? 1080 : 1920, say = SLOGANS[sl] ?? SLOGANS[0], r = mkRng(hashStr(name) ^ (k * 7919));
  x.lineJoin = 'round';
  [poster, matchbox, (a: X, b: number, c: string, d: string, e: [string, string], f: Rng) => stamp(a, b, c, d, e, f, st), mandala][k % 4](x, h, name, dev, say, r);
  x.setTransform(1, 0, 0, 1, 0, 0);
}
