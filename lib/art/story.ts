// 9:16 Instagram story cards around a creation. Three looks; all carry the maker's name, a
// "your turn" line and the short link, so a story viewer knows exactly where to go.
import { C, INK, TAU } from './palette';
import { stripes, pMark } from './plate';

export type StoryTemplate = 'ruby' | 'marigold' | 'midnight';
export const TEMPLATES: { id: StoryTemplate; label: string; swatch: [string, string] }[] = [
  { id: 'ruby', label: 'Ruby', swatch: [C.ruby, C.marigold] },
  { id: 'marigold', label: 'Marigold', swatch: [C.marigold, C.ruby] },
  { id: 'midnight', label: 'Midnight diya', swatch: [INK, C.saffron] },
];
export type StoryText = { title: string; kicker: string; body?: string; cta: string; link: string };

export const W = 1080, H = 1920;
const YA = "'Yatra One', serif", SP = 'Sarpanch, sans-serif', MU = 'Mukta, sans-serif';
type Ctx = CanvasRenderingContext2D;

function fit(x: Ctx, text: string, maxW: number, size: number, font: (s: number) => string) {
  let s = size;
  x.font = font(s);
  while (s > 18 && x.measureText(text).width > maxW) { s -= 2; x.font = font(s); }
  return s;
}
function wrap(x: Ctx, text: string, maxW: number): string[] {
  const words = text.split(' '), out: string[] = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (x.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t;
  }
  if (cur) out.push(cur);
  return out;
}
function spaced(x: Ctx, px: number) { if ('letterSpacing' in x) (x as Ctx & { letterSpacing: string }).letterSpacing = px + 'px'; }

// Background and frame only (the reel draws this once and composites the replay on top).
export function storyBackground(x: Ctx, t: StoryTemplate) {
  x.lineJoin = 'round';
  if (t === 'ruby') {
    x.fillStyle = C.ruby; x.fillRect(0, 0, W, H);
    stripes(x, 0, 0, W, H, 'rgba(255,194,26,.07)', 54, 18);
    x.strokeStyle = INK; x.lineWidth = 16; x.strokeRect(36, 36, W - 72, H - 72);
    x.strokeStyle = C.marigold; x.lineWidth = 6; x.strokeRect(56, 56, W - 112, H - 112);
  } else if (t === 'marigold') {
    x.fillStyle = C.marigold; x.fillRect(0, 0, W, H);
    // toran: alternating leaves and buds along the top
    x.fillStyle = INK; x.fillRect(0, 0, W, 14);
    for (let i = 0; i < 18; i++) {
      const cx = 30 + i * 60, leaf = i % 2 === 0;
      x.beginPath();
      if (leaf) { x.moveTo(cx, 14); x.quadraticCurveTo(cx + 22, 60, cx, 104); x.quadraticCurveTo(cx - 22, 60, cx, 14); x.fillStyle = i % 4 ? C.leaf : C.green; }
      else { x.arc(cx, 40, 14, 0, TAU); x.fillStyle = C.saffron; }
      x.fill(); x.lineWidth = 4; x.strokeStyle = INK; x.stroke();
    }
    x.strokeStyle = INK; x.lineWidth = 12; x.strokeRect(40, 150, W - 80, H - 190);
  } else {
    x.fillStyle = INK; x.fillRect(0, 0, W, H);
    const g = x.createRadialGradient(W / 2, 900, 80, W / 2, 900, 900);
    g.addColorStop(0, 'rgba(232,118,30,.28)'); g.addColorStop(1, 'rgba(27,20,16,0)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // a few fixed "stars" (no randomness, so the reel background stays still)
    x.fillStyle = 'rgba(251,243,228,.5)';
    for (let i = 0; i < 70; i++) { const sx = (i * 397) % W, sy = (i * 211) % 420 + 30; x.fillRect(sx, sy, i % 5 ? 2 : 4, i % 5 ? 2 : 4); }
    for (let i = 0; i < 9; i++) diya(x, 120 + i * 105, 1840, 30);
  }
}

function diya(x: Ctx, cx: number, cy: number, r: number) {
  const g = x.createRadialGradient(cx, cy - r * 1.3, 2, cx, cy - r * 1.3, r * 2.6);
  g.addColorStop(0, 'rgba(255,194,26,.55)'); g.addColorStop(1, 'rgba(255,194,26,0)');
  x.fillStyle = g; x.beginPath(); x.arc(cx, cy - r * 1.3, r * 2.6, 0, TAU); x.fill();
  x.beginPath(); x.moveTo(cx - r, cy - r * .2); x.quadraticCurveTo(cx, cy + r * 1.1, cx + r, cy - r * .2); x.closePath();
  x.fillStyle = C.terracotta; x.fill(); x.lineWidth = 3; x.strokeStyle = INK; x.stroke();
  x.beginPath(); x.moveTo(cx, cy - r * 1.6); x.quadraticCurveTo(cx + r * .5, cy - r * .7, cx, cy - r * .25); x.quadraticCurveTo(cx - r * .5, cy - r * .7, cx, cy - r * 1.6);
  x.fillStyle = C.marigold; x.fill();
}

// Where the art goes on each template (the reel uses this to place the replay).
export function artBox(t: StoryTemplate, aw: number, ah: number) {
  const maxW = t === 'midnight' ? 820 : 860, maxH = 900, top = t === 'marigold' ? 470 : 440;
  const k = Math.min(maxW / aw, maxH / ah), w = Math.round(aw * k), h = Math.round(ah * k);
  return { x: Math.round((W - w) / 2), y: top + Math.round((maxH - h) / 2), w, h };
}

export function storyFrame(x: Ctx, t: StoryTemplate, b: { x: number; y: number; w: number; h: number }) {
  if (t === 'midnight') {
    x.save(); x.shadowColor = 'rgba(255,194,26,.55)'; x.shadowBlur = 60;
    x.fillStyle = INK; x.fillRect(b.x - 10, b.y - 10, b.w + 20, b.h + 20); x.restore();
    x.strokeStyle = C.marigold; x.lineWidth = 5; x.strokeRect(b.x - 10, b.y - 10, b.w + 20, b.h + 20);
    return;
  }
  x.fillStyle = INK; x.fillRect(b.x - 16 + 22, b.y - 16 + 22, b.w + 32, b.h + 32);
  x.fillRect(b.x - 16, b.y - 16, b.w + 32, b.h + 32);
  x.fillStyle = t === 'ruby' ? C.ivory : C.parch; x.fillRect(b.x - 8, b.y - 8, b.w + 16, b.h + 16);
}

export function storyText(x: Ctx, t: StoryTemplate, s: StoryText) {
  const fg = t === 'marigold' ? C.ruby : C.marigold, fg2 = t === 'marigold' ? INK : C.ivory;
  x.textAlign = 'center'; x.textBaseline = 'middle';
  // header
  const headY = t === 'marigold' ? 230 : 190;
  x.font = `400 92px ${YA}`;
  if (t !== 'midnight') { x.lineWidth = 16; x.strokeStyle = INK; x.strokeText('RANGOTSAV', W / 2, headY); }
  x.fillStyle = fg; x.fillText('RANGOTSAV', W / 2, headY);
  x.font = `800 40px ${SP}`; spaced(x, 6); x.fillStyle = fg2;
  fit(x, s.kicker.toUpperCase(), W - 200, 40, (z) => `800 ${z}px ${SP}`);
  x.fillText(s.kicker.toUpperCase(), W / 2, headY + 110); spaced(x, 0);
  // title + body under the art
  const ty = 1440;
  const ts = fit(x, s.title, W - 160, 110, (z) => `400 ${z}px ${YA}`);
  if (t === 'ruby') { x.lineWidth = ts * 0.14; x.strokeStyle = INK; x.strokeText(s.title, W / 2, ty); }
  x.fillStyle = t === 'ruby' ? C.ivory : fg; x.fillText(s.title, W / 2, ty);
  let y = ty + ts * 0.5 + 40;
  if (s.body) {
    x.font = `700 42px ${MU}`; x.fillStyle = fg2;
    for (const line of wrap(x, s.body, W - 220).slice(0, 3)) { x.fillText(line, W / 2, y + 10); y += 54; }
  }
  // call to action pill + link
  const py = Math.max(y + 60, 1700);
  x.font = `800 44px ${SP}`;
  const cw = Math.min(W - 160, x.measureText(s.cta).width + 90);
  x.fillStyle = t === 'marigold' ? INK : C.marigold;
  x.beginPath(); x.roundRect(W / 2 - cw / 2, py - 44, cw, 88, 44); x.fill();
  x.fillStyle = t === 'marigold' ? C.marigold : INK;
  fit(x, s.cta, cw - 60, 44, (z) => `800 ${z}px ${SP}`);
  x.fillText(s.cta, W / 2, py + 2);
  x.font = `800 38px ${SP}`; x.fillStyle = fg2; x.fillText(s.link, W / 2, py + 92);
  if (t !== 'midnight') pMark(x, W - 120, H - 130, 30);
}

export function storyCard(art: HTMLCanvasElement, t: StoryTemplate, s: StoryText) {
  const o = document.createElement('canvas');
  o.width = W; o.height = H;
  const x = o.getContext('2d')!;
  storyBackground(x, t);
  const b = artBox(t, art.width, art.height);
  storyFrame(x, t, b);
  x.drawImage(art, b.x, b.y, b.w, b.h);
  if (t !== 'midnight') { x.lineWidth = 6; x.strokeStyle = INK; x.strokeRect(b.x - 8, b.y - 8, b.w + 16, b.h + 16); }
  storyText(x, t, s);
  return o;
}

export const CAPTION = 'Made at Rangotsav: draw rangoli, weave kolam, block-print cloth and paint truck art. #Rangotsav #IndianArt #Rangoli #Kolam';
