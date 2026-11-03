// Kathputli: a Rajasthani string puppet on its little stage. The puppet is a tiny ragdoll (head,
// chest, hip, elbows, hands) stepped at a fixed 60 per second with Verlet physics; three strings
// hang it from a wooden control bar (the middle one holds the head, the two ends hold the hands),
// and strings only pull, never push, so tilting the bar lifts one hand and drops the other. The
// skirt flares and swings with the hip. Everything is in stage units (0…1 of the square), so the
// toy, the replay player and the reel all run the same show. A show is a list of control-bar
// samples (x, y, tilt) at 30 a second; replaying it runs the same physics again.
import { C } from './palette';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
const INK = '#1B1410';

export const FLOOR = 0.84; // the stage floor
const SKIRT = 0.17;
const BAR = 0.12; // half the control bar
const HEAD_STR = 0.22, HAND_STR = 0.34;
// where the bar rests: the skirt's hem just touches the floor
export const REST = { x: 0.5, y: 0.26 };
// the control bar stays inside the stage (y below 0.32 lets the strings go slack and the puppet slump)
export const clampX = (x: number) => Math.max(0.16, Math.min(0.84, x));
export const clampY = (y: number) => Math.max(0.1, Math.min(0.32, y));
const G = 0.00085, DAMP = 0.982;
const BAR_SPEED = 0.018, MAX_V = 0.018; // per 1/60 s step
const KEEL = 0.035;
export const RATE = 30; // control samples per second in a show

type Look = { skin: string; head: string; trim: string; jacket: string; skirt: string; band: string };
export const PUPPETS: { id: string; name: string; line: string; look: Look }[] = [
  { id: 'raja', name: 'Raja Amar Singh', line: 'Khamma ghani!', look: { skin: '#E3A877', head: '#E8761E', trim: '#FFC21A', jacket: '#C42330', skirt: '#FFC21A', band: '#2F6B3B' } },
  { id: 'anarkali', name: 'Anarkali', line: 'Nacho, nacho!', look: { skin: '#EBB78C', head: '#C93A82', trim: '#FFC21A', jacket: '#2F6B3B', skirt: '#C93A82', band: '#FFC21A' } },
  { id: 'sapera', name: 'Sapera', line: 'Saanp aaya! Look out!', look: { skin: '#C98A5A', head: '#2D4C7C', trim: '#FBF3E4', jacket: '#E8761E', skirt: '#7A0E3A', band: '#FFC21A' } },
];
export const BACKDROPS = ['Mahal', 'Thar', 'Mela'];

// ---------- the rig ----------
// points: 0 head, 1 chest, 2 hip, 3 left elbow, 4 left hand, 5 right elbow, 6 right hand
const STICKS: [number, number, number][] = [[0, 1, 0.07], [1, 2, 0.12], [0, 2, 0.185], [1, 3, 0.07], [3, 4, 0.07], [1, 5, 0.07], [5, 6, 0.07]];
export type Rig = { p: number[]; q: number[]; cx: number; cy: number; ca: number; vx: number; hv: number };
const START = [0.5, 0.48, 0.5, 0.55, 0.5, 0.67, 0.46, 0.6, 0.44, 0.66, 0.54, 0.6, 0.56, 0.66];

export function newRig(): Rig {
  const r: Rig = { p: START.slice(), q: START.slice(), cx: REST.x, cy: REST.y, ca: 0, vx: 0, hv: 0 };
  for (let k = 0; k < 120; k++) stepRig(r, REST.x, REST.y, 0); // let it settle on its strings
  return r;
}

// One 1/60 s step towards a control target (tx, ty) with an extra bar tilt ta (radians).
export function stepRig(r: Rig, tx: number, ty: number, ta: number) {
  // the hand holding the bar follows the target, but no faster than a real arm (a flick across a
  // phone screen would otherwise fling the puppet over its own bar)
  const px = r.cx, lim = (d: number) => Math.max(-BAR_SPEED, Math.min(BAR_SPEED, d));
  r.cx += lim((tx - r.cx) * 0.35);
  r.cy += lim((ty - r.cy) * 0.35);
  r.vx = r.cx - px;
  r.ca += (Math.max(-0.55, Math.min(0.55, -r.vx * 9)) + ta - r.ca) * 0.25;
  const { p, q } = r, hx = p[4];
  for (let i = 0; i < 14; i += 2) {
    let vx = (p[i] - q[i]) * DAMP, vy = (p[i + 1] - q[i + 1]) * DAMP;
    const sp = Math.hypot(vx, vy);
    if (sp > MAX_V) { vx *= MAX_V / sp; vy *= MAX_V / sp; }
    q[i] = p[i]; q[i + 1] = p[i + 1];
    p[i] += vx; p[i + 1] += vy + (i === 4 ? G * 1.8 : G);
  }
  // the skirt is weighted, so the body swings back upright: the hip drifts back under the chest
  p[4] += (p[2] - p[4]) * KEEL;
  const c = Math.cos(r.ca), s = Math.sin(r.ca);
  const ends: [number, number, number, number][] = [[r.cx, r.cy, 0, HEAD_STR], [r.cx - BAR * c, r.cy - BAR * s, 4, HAND_STR], [r.cx + BAR * c, r.cy + BAR * s, 6, HAND_STR]];
  for (let it = 0; it < 8; it++) {
    for (const [a, b, len] of STICKS) {
      const ax = p[a * 2], ay = p[a * 2 + 1], bx = p[b * 2], by = p[b * 2 + 1];
      const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1e-6, k = ((d - len) / d) * 0.5;
      p[a * 2] += dx * k; p[a * 2 + 1] += dy * k; p[b * 2] -= dx * k; p[b * 2 + 1] -= dy * k;
    }
    // strings only pull
    for (const [ex, ey, i, len] of ends) {
      const dx = p[i * 2] - ex, dy = p[i * 2 + 1] - ey, d = Math.hypot(dx, dy);
      if (d > len) { p[i * 2] = ex + (dx / d) * len; p[i * 2 + 1] = ey + (dy / d) * len; }
    }
    // the floor and the wings
    const lim = [FLOOR - 0.06, FLOOR - SKIRT + 0.03, FLOOR - SKIRT + 0.03, FLOOR - 0.01, FLOOR - 0.01, FLOOR - 0.01, FLOOR - 0.01];
    for (let i = 0; i < 7; i++) {
      if (p[i * 2 + 1] > lim[i]) p[i * 2 + 1] = lim[i];
      p[i * 2] = Math.max(0.08, Math.min(0.92, p[i * 2]));
    }
  }
  r.hv = r.hv * 0.8 + (p[4] - hx) * 0.2;
}

// The dance "Nacho" plays: sway across the stage over eight beats, hop on every beat, and tip the
// bar every two beats so the hands take turns going up.
export function dancePose(t: number, bpm = 104) {
  const b = (t * bpm) / 60;
  return { x: REST.x + 0.17 * Math.sin((b * Math.PI) / 4), y: REST.y - 0.06 * Math.abs(Math.sin(b * Math.PI)), a: 0.6 * Math.sin((b * Math.PI) / 2) };
}

// A show: samples of (x, y, tilt), turned into recipe ints and back (see PuppetData in lib/recipe.ts).
export type Sample = { x: number; y: number; a: number };
export const toInts = (s: Sample[]) => s.flatMap((v) => [Math.round((v.x - 0.5) * 2000), Math.round((v.y - 0.5) * 2000), Math.round(v.a * 1000)]);
export function fromInts(n: number[]): Sample[] {
  const out: Sample[] = [];
  for (let i = 0; i + 2 < n.length; i += 3) out.push({ x: n[i] / 2000 + 0.5, y: n[i + 1] / 2000 + 0.5, a: n[i + 2] / 1000 });
  return out;
}
// The control target at time t (s) in a show, between samples.
export function sampleAt(s: Sample[], t: number): Sample {
  const f = Math.max(0, Math.min(s.length - 1, t * RATE)), i = Math.floor(f), k = f - i, a = s[i], b = s[Math.min(s.length - 1, i + 1)];
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, a: a.a + (b.a - a.a) * k };
}

// ---------- drawing ----------
const pt = (r: Rig, i: number, S: number) => ({ x: r.p[i * 2] * S, y: r.p[i * 2 + 1] * S });

function backdrop(x: Ctx, S: number, b: number) {
  if (b === 1) {
    // Thar: a desert night, dunes, the moon and a camel on the skyline
    const g = x.createLinearGradient(0, 0, 0, S * FLOOR); g.addColorStop(0, '#1B1238'); g.addColorStop(1, '#5A2A55');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    x.fillStyle = '#FBF3E4';
    for (let i = 0; i < 26; i++) { const sx = ((i * 97) % 89) / 89, sy = ((i * 53) % 61) / 61; x.globalAlpha = 0.4 + (i % 3) * 0.2; x.fillRect(S * (0.06 + sx * 0.88), S * (0.12 + sy * 0.4), S * 0.004, S * 0.004); }
    x.globalAlpha = 1;
    x.beginPath(); x.arc(S * 0.76, S * 0.24, S * 0.06, 0, TAU); x.fillStyle = '#FFF1C8'; x.fill();
    x.fillStyle = '#C98A4B';
    x.beginPath(); x.moveTo(0, S * 0.7); x.quadraticCurveTo(S * 0.3, S * 0.56, S * 0.62, S * 0.7); x.quadraticCurveTo(S * 0.85, S * 0.62, S, S * 0.66); x.lineTo(S, S * FLOOR); x.lineTo(0, S * FLOOR); x.fill();
    x.fillStyle = '#E0A55E';
    x.beginPath(); x.moveTo(0, S * 0.77); x.quadraticCurveTo(S * 0.45, S * 0.68, S, S * 0.78); x.lineTo(S, S * FLOOR); x.lineTo(0, S * FLOOR); x.fill();
    // a camel, walking the far dune
    x.fillStyle = INK;
    x.save(); x.translate(S * 0.3, S * 0.6); x.scale(S / 600, S / 600);
    x.beginPath(); x.ellipse(0, 0, 18, 9, 0, 0, TAU); x.ellipse(-4, -9, 8, 7, 0, 0, TAU); x.fill();
    x.fillRect(14, -14, 4, 14); x.beginPath(); x.ellipse(20, -16, 7, 4, 0, 0, TAU); x.fill();
    for (const lx of [-12, -5, 6, 12]) x.fillRect(lx, 4, 3, 16);
    x.restore();
  } else if (b === 2) {
    // Mela: an evening fair, bunting across the sky
    const g = x.createLinearGradient(0, 0, 0, S * FLOOR); g.addColorStop(0, '#F7B267'); g.addColorStop(1, '#E8761E');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    const flags = [C.vermilion, C.marigold, C.green, C.magenta, '#2D4C7C'];
    for (const [y0, sag] of [[0.2, 0.05], [0.32, 0.07]] as const) {
      x.strokeStyle = INK; x.lineWidth = S * 0.003;
      x.beginPath(); x.moveTo(S * 0.05, S * y0); x.quadraticCurveTo(S * 0.5, S * (y0 + sag * 2), S * 0.95, S * y0); x.stroke();
      for (let k = 0; k < 12; k++) {
        const t = (k + 0.5) / 12, fx = S * (0.05 + 0.9 * t), fy = S * (y0 + sag * 2 * 2 * t * (1 - t));
        x.beginPath(); x.moveTo(fx - S * 0.025, fy); x.lineTo(fx + S * 0.025, fy); x.lineTo(fx, fy + S * 0.05); x.closePath();
        x.fillStyle = flags[k % 5]; x.fill(); x.lineWidth = S * 0.0025; x.stroke();
      }
    }
  } else {
    // Mahal: a palace wall with three scalloped arches
    x.fillStyle = '#5A1A2E'; x.fillRect(0, 0, S, S);
    for (let k = 0; k < 3; k++) {
      const cx = S * (0.24 + k * 0.26), w = S * 0.09, top = S * 0.3;
      x.beginPath(); x.moveTo(cx - w, S * FLOOR); x.lineTo(cx - w, top + w); x.arc(cx, top + w, w, Math.PI, 0); x.lineTo(cx + w, S * FLOOR);
      x.fillStyle = '#3A0F1E'; x.fill(); x.strokeStyle = C.marigold; x.lineWidth = S * 0.012; x.stroke();
      x.strokeStyle = INK; x.lineWidth = S * 0.003; x.stroke();
      x.beginPath(); x.arc(cx, top - S * 0.02, S * 0.014, 0, TAU); x.fillStyle = C.marigold; x.fill();
    }
  }
}

function snake(x: Ctx, S: number, r: Rig, t: number) {
  // a basket on the floor; the snake rises as the sapera lifts his pungi
  const bx = S * 0.76, by = S * FLOOR, hand = r.p[13];
  const h = Math.max(0.02, Math.min(0.17, (0.66 - hand) * 0.9)) * S, sway = Math.sin(t * 3.2) * S * 0.018;
  x.lineCap = 'round';
  x.strokeStyle = INK; x.lineWidth = S * 0.026;
  x.beginPath(); x.moveTo(bx, by - S * 0.03); x.quadraticCurveTo(bx + sway * 2, by - S * 0.03 - h * 0.5, bx + sway, by - S * 0.03 - h); x.stroke();
  x.strokeStyle = '#4F8A3C'; x.lineWidth = S * 0.018; x.stroke();
  x.beginPath(); x.ellipse(bx + sway, by - S * 0.04 - h, S * 0.024, S * 0.02, 0, 0, TAU); x.fillStyle = '#4F8A3C'; x.fill(); x.lineWidth = S * 0.004; x.strokeStyle = INK; x.stroke();
  x.fillStyle = '#FFC21A'; for (const e of [-1, 1]) { x.beginPath(); x.arc(bx + sway + e * S * 0.009, by - S * 0.044 - h, S * 0.004, 0, TAU); x.fill(); }
  x.beginPath(); x.ellipse(bx, by - S * 0.02, S * 0.06, S * 0.03, 0, 0, TAU); x.fillStyle = '#B97A3E'; x.fill(); x.lineWidth = S * 0.005; x.strokeStyle = INK; x.stroke();
  x.strokeStyle = 'rgba(27,20,16,.45)'; x.lineWidth = S * 0.003;
  for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(bx + k * S * 0.02, by - S * 0.045); x.lineTo(bx + k * S * 0.022, by + S * 0.004); x.stroke(); }
}

function puppet(x: Ctx, S: number, r: Rig, who: number) {
  const L = PUPPETS[who].look, o = S * 0.0045;
  const head = pt(r, 0, S), chest = pt(r, 1, S), hip = pt(r, 2, S);
  const ang = Math.atan2(hip.x - chest.x, hip.y - chest.y), nx = Math.cos(ang), ny = -Math.sin(ang); // across the body
  const dirx = Math.sin(ang), diry = Math.cos(ang); // down the body
  // skirt: flares with the hip's speed, trails behind as it moves, pools on the floor
  const flare = Math.min(0.05, Math.abs(r.hv) * 6), lag = Math.max(-0.05, Math.min(0.05, -r.hv * 5));
  const hemY = Math.min(S * (FLOOR + 0.005), hip.y + diry * SKIRT * S), hemX = hip.x + dirx * SKIRT * S + lag * S;
  const wt = 0.034 * S, wb = (0.066 + flare + Math.max(0, hip.y + diry * SKIRT * S - S * FLOOR) / S * 0.6) * S;
  x.lineJoin = 'round';
  x.beginPath();
  x.moveTo(hip.x - nx * wt, hip.y - ny * wt);
  x.lineTo(hemX - wb, hemY); x.quadraticCurveTo(hemX, hemY + S * 0.02, hemX + wb, hemY);
  x.lineTo(hip.x + nx * wt, hip.y + ny * wt); x.closePath();
  x.fillStyle = L.skirt; x.fill(); x.lineWidth = o; x.strokeStyle = INK; x.stroke();
  for (const k of [0.62, 0.82]) {
    const ly = hip.y + (hemY - hip.y) * k, lx = hip.x + (hemX - hip.x) * k, lw = wt + (wb - wt) * k;
    x.beginPath(); x.moveTo(lx - lw, ly); x.quadraticCurveTo(lx, ly + S * 0.012, lx + lw, ly);
    x.lineWidth = S * 0.012; x.strokeStyle = k > 0.7 ? L.band : L.trim; x.stroke();
  }
  // arms: sleeves from the shoulders, out to the hands
  const sh = 0.036 * S;
  const arm = (s: number, e: number, h: number) => {
    const S0 = { x: chest.x + nx * sh * s, y: chest.y + ny * sh * s }, E = pt(r, e, S), H = pt(r, h, S);
    x.lineCap = 'round';
    x.beginPath(); x.moveTo(S0.x, S0.y); x.lineTo(E.x, E.y); x.lineTo(H.x, H.y);
    x.lineWidth = S * 0.026; x.strokeStyle = INK; x.stroke();
    x.lineWidth = S * 0.017; x.strokeStyle = L.jacket; x.stroke();
    x.beginPath(); x.arc(H.x, H.y, S * 0.012, 0, TAU); x.fillStyle = L.skin; x.fill(); x.lineWidth = o * 0.8; x.strokeStyle = INK; x.stroke();
    return { E, H };
  };
  arm(-1, 3, 4);
  // torso: an angrakha jacket with a necklace
  x.beginPath();
  x.moveTo(chest.x - nx * sh, chest.y - ny * sh); x.lineTo(chest.x + nx * sh, chest.y + ny * sh);
  x.lineTo(hip.x + nx * wt, hip.y + ny * wt); x.lineTo(hip.x - nx * wt, hip.y - ny * wt); x.closePath();
  x.fillStyle = L.jacket; x.fill(); x.lineWidth = o; x.strokeStyle = INK; x.stroke();
  x.beginPath(); x.arc(chest.x + dirx * S * 0.012, chest.y + diry * S * 0.012, S * 0.02, ang + 0.2, ang + Math.PI - 0.2);
  x.lineWidth = S * 0.006; x.strokeStyle = L.trim; x.stroke();
  const right = arm(1, 5, 6);
  // what the right hand holds: the raja's sword, the sapera's pungi
  const fx = right.H.x - right.E.x, fy = right.H.y - right.E.y, fl = Math.hypot(fx, fy) || 1, ux = fx / fl, uy = fy / fl;
  if (who === 0) {
    const tip = { x: right.H.x + ux * S * 0.1 - uy * S * 0.02, y: right.H.y + uy * S * 0.1 + ux * S * 0.02 };
    x.beginPath(); x.moveTo(right.H.x, right.H.y); x.quadraticCurveTo(right.H.x + ux * S * 0.06 + uy * S * 0.012, right.H.y + uy * S * 0.06 - ux * S * 0.012, tip.x, tip.y);
    x.lineWidth = S * 0.011; x.strokeStyle = INK; x.stroke(); x.lineWidth = S * 0.006; x.strokeStyle = '#DCE1E6'; x.stroke();
    x.beginPath(); x.moveTo(right.H.x - uy * S * 0.016, right.H.y + ux * S * 0.016); x.lineTo(right.H.x + uy * S * 0.016, right.H.y - ux * S * 0.016);
    x.lineWidth = S * 0.007; x.strokeStyle = C.marigold; x.stroke();
  } else if (who === 2) {
    x.beginPath(); x.ellipse(right.H.x + ux * S * 0.014, right.H.y + uy * S * 0.014, S * 0.016, S * 0.012, Math.atan2(uy, ux), 0, TAU);
    x.fillStyle = '#B97A3E'; x.fill(); x.lineWidth = o * 0.8; x.strokeStyle = INK; x.stroke();
    for (const s of [-1, 1]) {
      x.beginPath(); x.moveTo(right.H.x + ux * S * 0.026 + uy * s * S * 0.004, right.H.y + uy * S * 0.026 - ux * s * S * 0.004);
      x.lineTo(right.H.x + ux * S * 0.06 + uy * s * S * 0.006, right.H.y + uy * S * 0.06 - ux * s * S * 0.006);
      x.lineWidth = S * 0.006; x.strokeStyle = INK; x.stroke();
    }
  }
  // head: big painted almond eyes, as kathputli faces have
  x.save(); x.translate(head.x, head.y); x.rotate(-ang);
  x.beginPath(); x.moveTo(0, S * 0.02); x.lineTo(0, S * 0.05); x.lineWidth = S * 0.014; x.strokeStyle = L.skin; x.stroke();
  x.beginPath(); x.ellipse(0, 0, S * 0.03, S * 0.037, 0, 0, TAU); x.fillStyle = L.skin; x.fill(); x.lineWidth = o; x.strokeStyle = INK; x.stroke();
  for (const s of [-1, 1]) {
    x.beginPath(); x.moveTo(s * S * 0.003, -S * 0.002); x.quadraticCurveTo(s * S * 0.013, -S * 0.014, s * S * 0.026, -S * 0.002); x.quadraticCurveTo(s * S * 0.013, S * 0.007, s * S * 0.003, -S * 0.002);
    x.fillStyle = '#FBF3E4'; x.fill(); x.lineWidth = S * 0.0035; x.strokeStyle = INK; x.stroke();
    x.beginPath(); x.arc(s * S * 0.013, -S * 0.003, S * 0.0045, 0, TAU); x.fillStyle = INK; x.fill();
    x.beginPath(); x.moveTo(s * S * 0.004, -S * 0.014); x.quadraticCurveTo(s * S * 0.014, -S * 0.022, s * S * 0.027, -S * 0.013); x.lineWidth = S * 0.003; x.stroke();
  }
  x.beginPath(); x.moveTo(0, -S * 0.004); x.lineTo(-S * 0.004, S * 0.01); x.lineTo(S * 0.001, S * 0.012); x.lineWidth = S * 0.0025; x.strokeStyle = INK; x.stroke();
  x.beginPath(); x.ellipse(0, S * 0.021, S * 0.006, S * 0.003, 0, 0, TAU); x.fillStyle = '#C42330'; x.fill();
  if (who === 0) {
    // a twirled moustache, and a striped pagdi with a plume
    x.beginPath(); x.moveTo(0, S * 0.015);
    for (const s of [-1, 1]) { x.moveTo(0, S * 0.015); x.quadraticCurveTo(s * S * 0.016, S * 0.024, s * S * 0.026, S * 0.008); }
    x.lineWidth = S * 0.006; x.strokeStyle = INK; x.stroke();
    x.beginPath(); x.ellipse(0, -S * 0.03, S * 0.038, S * 0.024, 0, Math.PI, 0); x.lineTo(S * 0.038, -S * 0.022); x.lineTo(-S * 0.038, -S * 0.022); x.closePath();
    x.fillStyle = L.head; x.fill(); x.lineWidth = o; x.strokeStyle = INK; x.stroke();
    x.beginPath(); for (const k of [-0.6, 0, 0.6]) { x.moveTo(-S * 0.034, -S * 0.03 + k * S * 0.01); x.lineTo(S * 0.034, -S * 0.04 + k * S * 0.01); } x.lineWidth = S * 0.004; x.strokeStyle = L.trim; x.stroke();
    x.beginPath(); x.moveTo(S * 0.012, -S * 0.05); x.quadraticCurveTo(S * 0.03, -S * 0.08, S * 0.02, -S * 0.09); x.lineWidth = S * 0.007; x.strokeStyle = '#FBF3E4'; x.stroke();
  } else if (who === 1) {
    // an odhni over the head, a bindi and a nath
    x.beginPath(); x.moveTo(-S * 0.042, S * 0.05); x.quadraticCurveTo(-S * 0.046, -S * 0.05, 0, -S * 0.048); x.quadraticCurveTo(S * 0.046, -S * 0.05, S * 0.042, S * 0.05);
    x.quadraticCurveTo(S * 0.036, -S * 0.02, 0, -S * 0.03); x.quadraticCurveTo(-S * 0.036, -S * 0.02, -S * 0.042, S * 0.05);
    x.fillStyle = L.head; x.fill(); x.lineWidth = o; x.strokeStyle = INK; x.stroke();
    x.fillStyle = L.trim; for (const [dx, dy] of [[-0.03, 0], [0.03, 0], [-0.02, -0.03], [0.02, -0.03], [0, -0.04]]) { x.beginPath(); x.arc(dx * S, dy * S, S * 0.003, 0, TAU); x.fill(); }
    x.beginPath(); x.arc(0, -S * 0.019, S * 0.0035, 0, TAU); x.fillStyle = '#C42330'; x.fill();
    x.beginPath(); x.arc(-S * 0.006, S * 0.012, S * 0.005, 0, TAU); x.lineWidth = S * 0.002; x.strokeStyle = C.marigold; x.stroke();
  } else {
    // a beard, and a blue turban with a white band
    x.beginPath(); x.moveTo(-S * 0.026, S * 0.01); x.quadraticCurveTo(0, S * 0.07, S * 0.026, S * 0.01); x.quadraticCurveTo(0, S * 0.04, -S * 0.026, S * 0.01);
    x.fillStyle = INK; x.fill();
    x.beginPath(); x.ellipse(0, -S * 0.028, S * 0.036, S * 0.026, 0, Math.PI, 0); x.lineTo(S * 0.036, -S * 0.02); x.lineTo(-S * 0.036, -S * 0.02); x.closePath();
    x.fillStyle = L.head; x.fill(); x.lineWidth = o; x.strokeStyle = INK; x.stroke();
    x.beginPath(); x.moveTo(-S * 0.036, -S * 0.026); x.lineTo(S * 0.036, -S * 0.026); x.lineWidth = S * 0.007; x.strokeStyle = L.trim; x.stroke();
  }
  x.restore();
}

// Draws the whole stage: backdrop, floor, the puppet on its strings, the curtains (open 0…1) and the
// painted frame. bubble: something the puppet is saying, shown beside its head.
export function drawKathputli(x: Ctx, S: number, r: Rig, who: number, bg: number, o: { curtain?: number; t?: number; bubble?: string } = {}) {
  const open = o.curtain ?? 1, t = o.t ?? 0;
  backdrop(x, S, bg);
  // the stage floor and its painted front
  x.fillStyle = '#8A5A34'; x.fillRect(0, S * FLOOR, S, S * (1 - FLOOR));
  x.strokeStyle = 'rgba(27,20,16,.35)'; x.lineWidth = S * 0.002;
  for (let k = 1; k < 6; k++) { x.beginPath(); x.moveTo(0, S * (FLOOR + k * 0.012)); x.lineTo(S, S * (FLOOR + k * 0.012)); x.stroke(); }
  x.fillStyle = '#7A0E3A'; x.fillRect(0, S * 0.92, S, S * 0.08);
  for (let k = 0; k < 20; k++) { x.beginPath(); x.moveTo(S * (k / 20), S * 0.92); x.lineTo(S * ((k + 0.5) / 20), S * 0.96); x.lineTo(S * ((k + 1) / 20), S * 0.92); x.fillStyle = k % 2 ? C.marigold : '#FBF3E4'; x.fill(); }
  x.strokeStyle = INK; x.lineWidth = S * 0.005; x.beginPath(); x.moveTo(0, S * FLOOR); x.lineTo(S, S * FLOOR); x.moveTo(0, S * 0.92); x.lineTo(S, S * 0.92); x.stroke();
  if (who === 2) snake(x, S, r, t);
  puppet(x, S, r, who);
  // strings and the control bar
  const c = Math.cos(r.ca), s = Math.sin(r.ca), bx = r.cx * S, by = r.cy * S;
  const L = { x: bx - BAR * c * S, y: by - BAR * s * S }, R = { x: bx + BAR * c * S, y: by + BAR * s * S };
  x.strokeStyle = 'rgba(251,243,228,.85)'; x.lineWidth = Math.max(1, S * 0.0018);
  x.beginPath();
  x.moveTo(bx, by); x.lineTo(r.p[0] * S, r.p[1] * S);
  x.moveTo(L.x, L.y); x.lineTo(r.p[8] * S, r.p[9] * S);
  x.moveTo(R.x, R.y); x.lineTo(r.p[12] * S, r.p[13] * S);
  x.stroke();
  x.lineCap = 'round';
  x.beginPath(); x.moveTo(L.x, L.y); x.lineTo(R.x, R.y); x.moveTo(bx - s * S * 0.03, by + c * S * 0.03); x.lineTo(bx + s * S * 0.03, by - c * S * 0.03);
  x.lineWidth = S * 0.016; x.strokeStyle = INK; x.stroke(); x.lineWidth = S * 0.009; x.strokeStyle = '#B97A3E'; x.stroke();
  // curtains, gathered to the sides when open
  const cw = S * (0.5 - 0.38 * open);
  for (const side of [0, 1]) {
    x.save();
    if (side) { x.translate(S, 0); x.scale(-1, 1); }
    x.beginPath(); x.moveTo(0, S * 0.08); x.lineTo(cw, S * 0.08); x.bezierCurveTo(cw - S * 0.03, S * 0.4, cw + S * 0.02, S * 0.6, cw * (open > 0.9 ? 0.82 : 1), S * 0.92); x.lineTo(0, S * 0.92); x.closePath();
    x.fillStyle = '#8E1B1B'; x.fill();
    x.save(); x.clip();
    for (let k = 0; k < 6; k++) { x.fillStyle = k % 2 ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.18)'; x.fillRect((cw * k) / 6, 0, cw / 12, S); }
    x.restore();
    x.lineWidth = S * 0.006; x.strokeStyle = INK; x.stroke();
    x.beginPath(); x.moveTo(0, S * 0.9); x.lineTo(cw, S * 0.9); x.lineWidth = S * 0.012; x.strokeStyle = C.marigold; x.stroke();
    if (open > 0.6) { x.beginPath(); x.ellipse(cw * 0.75, S * 0.52, S * 0.012, S * 0.03, 0.4, 0, TAU); x.fillStyle = C.marigold; x.fill(); x.lineWidth = S * 0.003; x.strokeStyle = INK; x.stroke(); }
    x.restore();
  }
  // the painted frame: pillars and a scalloped valance with the name on it
  for (const px of [0, S * 0.955]) {
    x.fillStyle = C.marigold; x.fillRect(px, 0, S * 0.045, S * 0.92);
    for (let k = 0; k < 9; k++) { x.beginPath(); const cy = S * (0.14 + k * 0.088), cx = px + S * 0.0225; x.moveTo(cx, cy - S * 0.03); x.lineTo(cx + S * 0.014, cy); x.lineTo(cx, cy + S * 0.03); x.lineTo(cx - S * 0.014, cy); x.closePath(); x.fillStyle = C.vermilion; x.fill(); }
    x.lineWidth = S * 0.005; x.strokeStyle = INK; x.strokeRect(px, 0, S * 0.045, S * 0.92);
  }
  x.fillStyle = '#7A0E3A'; x.fillRect(0, 0, S, S * 0.1);
  x.beginPath();
  for (let k = 0; k < 12; k++) { const cx = S * ((k + 0.5) / 12); x.moveTo(cx - S / 24, S * 0.1); x.arc(cx, S * 0.1, S / 24, Math.PI, 0, true); }
  x.fillStyle = C.marigold; x.fill(); x.lineWidth = S * 0.004; x.strokeStyle = INK; x.stroke();
  x.beginPath(); x.moveTo(0, S * 0.1); x.lineTo(S, S * 0.1); x.stroke();
  x.font = `700 ${Math.round(S * 0.055)}px 'Palanquin Dark', sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = '#3A0507'; x.fillText('कठपुतली', S / 2 + S * 0.004, S * 0.055);
  x.fillStyle = C.marigold; x.fillText('कठपुतली', S / 2, S * 0.05);
  if (o.bubble) {
    const hx = r.p[0] * S, hy = r.p[1] * S;
    x.font = `700 ${Math.round(S * 0.032)}px Mukta, sans-serif`;
    const tw = x.measureText(o.bubble).width, bw = tw + S * 0.04, bh = S * 0.06, left = Math.min(S * 0.95 - bw, hx + S * 0.05), top = Math.max(S * 0.11, hy - S * 0.12);
    x.beginPath(); x.roundRect(left, top, bw, bh, S * 0.02); x.moveTo(left + S * 0.02, top + bh); x.lineTo(hx + S * 0.025, hy - S * 0.03); x.lineTo(left + S * 0.05, top + bh);
    x.fillStyle = '#FBF3E4'; x.fill(); x.lineWidth = S * 0.004; x.strokeStyle = INK; x.stroke();
    x.fillStyle = INK; x.textAlign = 'left'; x.fillText(o.bubble, left + S * 0.02, top + bh / 2 + S * 0.002);
  }
}

// A short dance for the shelf tile and samples: six seconds of Nacho, as a show.
export function sampleShow(seconds = 6): Sample[] {
  return Array.from({ length: seconds * RATE }, (_, i) => dancePose(i / RATE));
}

// The OG image: the stage with its curtains open and the puppet hanging still (no canvas on the server).
export function kathputliSvg(who: number, bg: number, S = 600): string {
  const L = PUPPETS[who]?.look ?? PUPPETS[0].look, sky = ['#5A1A2E', '#2A1850', '#F0A050'][bg] ?? '#5A1A2E', u = S / 600;
  const g = (s: string) => s.replace(/(\d+(?:\.\d+)?)/g, (n) => String(+n * u));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><rect width="${S}" height="${S}" fill="${sky}"/>`
    + `<rect y="${504 * u}" width="${S}" height="${96 * u}" fill="#8A5A34"/><rect y="${552 * u}" width="${S}" height="${48 * u}" fill="#7A0E3A"/>`
    + g(`<path d="M300 60 300 250M228 60 250 360M372 60 350 360" stroke="#FBF3E4" stroke-width="1.5"/>`)
    + g(`<path d="M228 60h144" stroke="#1B1410" stroke-width="10" stroke-linecap="round"/>`)
    + `<path d="${g('M280 366 L250 504 Q300 516 350 504 L320 366Z')}" fill="${L.skirt}" stroke="#1B1410" stroke-width="${3 * u}"/>`
    + `<path d="${g('M278 294h44l-2 72h-40Z')}" fill="${L.jacket}" stroke="#1B1410" stroke-width="${3 * u}"/>`
    + `<path d="${g('M280 300 258 330 250 360M320 300 342 330 350 360')}" fill="none" stroke="${L.jacket}" stroke-width="${10 * u}" stroke-linecap="round"/>`
    + `<ellipse cx="${300 * u}" cy="${252 * u}" rx="${18 * u}" ry="${22 * u}" fill="${L.skin}" stroke="#1B1410" stroke-width="${3 * u}"/>`
    + `<path d="${g('M278 236a22 16 0 0 1 44 0Z')}" fill="${L.head}" stroke="#1B1410" stroke-width="${3 * u}"/>`
    + `<path d="${g('M290 250q5-6 10 0q-5 4-10 0ZM300 250q5-6 10 0q-5 4-10 0Z')}" fill="#FBF3E4" stroke="#1B1410" stroke-width="${1.5 * u}"/>`
    + `<path d="${g('M293.5 249.5h3M303.5 249.5h3')}" stroke="#1B1410" stroke-width="${3 * u}" stroke-linecap="round"/>`
    + `<path d="${g('M296 264h8')}" stroke="#C42330" stroke-width="${3 * u}" stroke-linecap="round"/>`
    + `<path d="${g('M262 470q38 9 76 0M256 492q44 10 88 0')}" fill="none" stroke="${L.trim}" stroke-width="${6 * u}"/>`
    + `<path d="${g('M0 0h72v552H0ZM528 0h72v552h-72Z')}" fill="#8E1B1B"/><rect width="${S}" height="${60 * u}" fill="#7A0E3A"/>`
    + Array.from({ length: 12 }, (_, k) => `<path d="${g(`M${k * 50} 60a25 25 0 0 0 50 0Z`)}" fill="#FFC21A" stroke="#1B1410" stroke-width="${2 * u}"/>`).join('')
    + `</svg>`;
}
