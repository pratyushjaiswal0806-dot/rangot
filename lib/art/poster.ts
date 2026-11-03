// Mela poster: one word in hand-painted sign lettering, bent into a banner, an arch, a staircase
// or a jittery hand-painted shake, over a backdrop (sunburst rays, halftone dots, stripes, a
// marquee of light bulbs), with two nudged shadow layers for a misregistered screen print.
// "Nachao" makes the letters dance (dance = seconds into the dance) and the bulbs chase. Words in Devanagari or Kannada work
// too: letters are split into whole graphemes so matras stay attached.
import { C, INK, PALS } from './palette';
import { hashStr, mkRng } from '../rng';

export const LAYOUTS = ['Banner', 'Arch', 'Steps', 'Shake'];
export const BACKDROPS = ['Plain', 'Sunburst', 'Dots', 'Stripes', 'Bulbs'];
export type Pal = { name: string; bg: string; fg: string; mis: string };

export function graphemes(w: string): string[] {
  try { return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(w)].map((s) => s.segment); } catch { return [...w]; }
}

type Geom = { ch: string; ty: number; rot: number; skew: number; sc: number };
// Per-letter lift, twist, slant and scale (ty in units of fs/100).
export function posterGeom(word: string, tilt: number, layout = 0): Geom[] {
  const g = graphemes(word), mid = (g.length - 1) / 2, r = mkRng(hashStr(word) || 1);
  return g.map((ch, i) => {
    if (layout === 2) return { ch, ty: (mid - i) * tilt * 1.6, rot: -tilt * 0.45, skew: -tilt * 0.5, sc: 1 };
    if (layout === 3) return { ch, ty: (r() - 0.5) * tilt * 3, rot: (r() - 0.5) * tilt * 2.4, skew: (r() - 0.5) * tilt * 0.8, sc: 0.86 + r() * 0.28 };
    if (layout === 1) return { ch, ty: 0, rot: 0, skew: 0, sc: 1 };
    return { ch, ty: Math.sin(i * 1.3 + 0.6) * tilt * 1.1, rot: (i % 2 ? 1 : -1) * tilt * 0.55 + Math.sin(i) * tilt * 0.3, skew: -tilt * 0.35, sc: 1 };
  });
}

type Ctx = CanvasRenderingContext2D;
function backdrop(x: Ctx, kind: number, pal: Pal, l: number, t: number, w: number, h: number, dance = 0) {
  x.save();
  x.beginPath(); x.rect(l, t, w, h); x.clip();
  const cx = l + w / 2, cy = t + h * 0.47;
  if (kind === 1) {
    // sunburst rays, the cinema-hoarding classic
    const n = 28;
    x.fillStyle = 'rgba(255,255,255,.13)';
    for (let i = 0; i < n; i += 2) {
      const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
      x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a0) * 1600, cy + Math.sin(a0) * 1600); x.lineTo(cx + Math.cos(a1) * 1600, cy + Math.sin(a1) * 1600); x.closePath(); x.fill();
    }
  } else if (kind === 2) {
    // halftone dots, bigger towards the corners
    x.fillStyle = 'rgba(27,20,16,.22)';
    for (let yy = t + 14; yy < t + h; yy += 30) for (let xx = l + 14 + ((Math.round((yy - t) / 30) % 2) * 15); xx < l + w; xx += 30) {
      const d = Math.hypot(xx - cx, yy - cy) / Math.hypot(w / 2, h / 2);
      x.beginPath(); x.arc(xx, yy, 2 + d * 9, 0, Math.PI * 2); x.fill();
    }
  } else if (kind === 3) {
    x.strokeStyle = 'rgba(255,255,255,.12)';
    x.lineWidth = 34;
    x.beginPath();
    for (let d = -h; d < w + h; d += 92) { x.moveTo(l + d, t); x.lineTo(l + d - h, t + h); }
    x.stroke();
  } else if (kind === 4) {
    // a marquee of light bulbs round the edge; every third one lit, chasing while it dances
    const gap = 46, inset = 30, pts: [number, number][] = [];
    for (let xx = l + inset; xx <= l + w - inset; xx += gap) pts.push([xx, t + inset]);
    for (let yy = t + inset + gap; yy <= t + h - inset; yy += gap) pts.push([l + w - inset, yy]);
    for (let xx = l + w - inset - gap; xx >= l + inset; xx -= gap) pts.push([xx, t + h - inset]);
    for (let yy = t + h - inset - gap; yy > t + inset; yy -= gap) pts.push([l + inset, yy]);
    const step = Math.floor(dance * 7);
    pts.forEach(([bx, by], i) => {
      const on = dance ? (i + step) % 3 === 0 : i % 2 === 0;
      if (on) { x.fillStyle = 'rgba(255,214,90,.32)'; x.beginPath(); x.arc(bx, by, 24, 0, Math.PI * 2); x.fill(); }
      x.beginPath(); x.arc(bx, by, 11, 0, Math.PI * 2);
      x.fillStyle = on ? '#FFF1B8' : 'rgba(27,20,16,.45)'; x.fill();
      x.lineWidth = 3; x.strokeStyle = INK; x.stroke();
    });
  }
  x.restore();
  void pal;
}

// Draws the 1080×1350 poster. wobble (0…1) jiggles the letters for a moment after a change;
// dance (seconds, 0 = still) keeps every letter bouncing to its own beat.
export function drawPoster(cv: HTMLCanvasElement, word: string, tilt: number, off: number, pal: Pal, layout = 0, bg = 0, wobble = 0, dance = 0) {
  const W = 1080, H = 1350;
  if (cv.width !== W) cv.width = W;
  if (cv.height !== H) cv.height = H;
  const x = cv.getContext('2d')!;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.fillStyle = INK; x.fillRect(0, 0, W, H);
  x.fillStyle = C.marigold; x.fillRect(12, 12, W - 24, H - 24);
  x.fillStyle = INK; x.fillRect(56, 56, W - 112, H - 112);
  x.fillStyle = pal.bg; x.fillRect(64, 64, W - 128, H - 128);
  backdrop(x, bg, pal, 64, 64, W - 128, H - 128, dance);
  for (const [a, b] of [[90, 90], [W - 90, 90], [90, H - 90], [W - 90, H - 90]]) {
    x.save(); x.translate(a, b); x.rotate(Math.PI / 4);
    x.fillStyle = C.marigold; x.fillRect(-14, -14, 28, 28);
    x.lineWidth = 4; x.strokeStyle = INK; x.strokeRect(-14, -14, 28, 28);
    x.restore();
  }
  const t = tilt * (1 + wobble * 0.6);
  const g = posterGeom(word, t, layout), n = g.length;
  const FONT = (s: number) => `900 ${s}px Sarpanch, 'Baloo Tamma 2', sans-serif`;
  let fs = Math.min(420, 860 / (n * 0.7));
  x.font = FONT(fs);
  const tot = g.reduce((a, l) => a + x.measureText(l.ch).width * l.sc, 0);
  if (tot > 860) { fs *= 860 / tot; x.font = FONT(fs); }
  const ws = g.map((l) => x.measureText(l.ch).width * l.sc), tot2 = ws.reduce((a, b) => a + b, 0), k = fs / 100;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  // the arch: letters along a circle whose curve tightens as the tilt grows
  const R = Math.max(520, 2600 - t * 95), sweep = tot2 / R;
  const place = (i: number, cum: number) => {
    if (layout !== 1) return { px: -tot2 / 2 + cum + ws[i] / 2, py: g[i].ty * k, a: (g[i].rot * Math.PI) / 180 };
    const th = -sweep / 2 + (cum + ws[i] / 2) / R;
    return { px: R * Math.sin(th), py: R * (1 - Math.cos(th)) - (R * (1 - Math.cos(sweep / 2))) / 2, a: th };
  };
  const layer = (dx: number, dy: number, col: string) => {
    x.save();
    x.translate(W / 2, H / 2);
    if (layout !== 1) x.rotate((-t * 0.25 * Math.PI) / 180);
    let cum = 0;
    g.forEach((l, i) => {
      const p = place(i, cum), jig = wobble ? Math.sin(i * 2.1 + wobble * 18) * wobble * 6 : 0;
      // dancing: a hop on its own beat, a sway and a squash at the bottom of each hop
      const hop = dance ? Math.abs(Math.sin(dance * 5.2 + i * 0.85)) : 0, sway = dance ? Math.sin(dance * 3.1 + i * 1.3) * 0.12 : 0;
      x.save();
      x.translate(p.px + dx, p.py + dy + jig * k - hop * 26 * k);
      x.rotate(p.a + (jig * Math.PI) / 360 + sway);
      if (dance) x.scale(1 + (1 - hop) * 0.06, 1 - (1 - hop) * 0.06);
      x.transform(1, 0, Math.tan((l.skew * Math.PI) / 180), 1, 0, 0);
      x.scale(l.sc, l.sc);
      x.fillStyle = col;
      x.fillText(l.ch, 0, 0);
      x.restore();
      cum += ws[i];
    });
    x.restore();
  };
  layer((off + 4) * k, (off * 0.8 + 4) * k, INK);
  layer(off * k, off * 0.8 * k, pal.mis);
  layer(0, 0, pal.fg);
  x.fillStyle = pal.fg;
  x.font = '800 30px Sarpanch, sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'alphabetic';
  x.fillText('RANGOTSAV · KARKHANA · PEGASUS RVITM', W / 2, H - 100);
}

export const palette = (p: number): Pal => PALS[p] ?? PALS[0];
