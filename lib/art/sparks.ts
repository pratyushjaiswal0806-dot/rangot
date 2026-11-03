// Sparks: the particle physics behind the night sky's fireworks (components/home/DiyaSky.tsx),
// full-screen fireworks (lib/fx.ts) and the Phuljhadi sparkler. Speeds are in px per 60 fps
// frame; step() takes the frame time, so a 120 Hz phone plays them at the same pace.
const TAU = Math.PI * 2;

export type Spark = {
  x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; r: number;
  // trail: a rocket's smoke (no gravity, no streak); flash: the white bloom at a burst's heart
  trail?: boolean; flash?: boolean;
  // fork: a sparkler's iron spark, which bursts into smaller sparks this many more times
  fork?: number;
  // drag per frame (default .975) and gravity per frame (default .045)
  drag?: number; g?: number;
};
export type Rocket = { x: number; y: number; x0: number; y0: number; tx: number; ty: number; t0: number; dur: number; kind: number };

// Two-colour firework sets: marigold, rani pink, leaf green, sky blue, sindoor, jamuni.
export const FIREWORK_COLOURS: [string, string][] = [['#FFC21A', '#E8761E'], ['#C93A82', '#FBF3E4'], ['#4F8A3C', '#FFC21A'], ['#2F86D6', '#FBF3E4'], ['#E0302A', '#FFC21A'], ['#8A46B8', '#E8457F']];

// A soft round glow to stamp with drawImage (much cheaper than shadowBlur).
export function glowSprite(inner = 'rgba(255,236,170,1)', mid = 'rgba(255,194,26,.75)', outer = 'rgba(255,140,26,0)'): HTMLCanvasElement {
  const glow = document.createElement('canvas');
  glow.width = glow.height = 32;
  const g = glow.getContext('2d')!, grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, inner); grad.addColorStop(0.25, mid); grad.addColorStop(1, outer);
  g.fillStyle = grad; g.fillRect(0, 0, 32, 32);
  return glow;
}

// Moves every spark on by dt ms, drops the burnt-out ones and splits forking sparks.
export function stepSparks(sp: Spark[], dt = 16.67, cap = 900) {
  const k = Math.max(0.5, Math.min(3, dt / 16.67));
  for (let i = sp.length - 1; i >= 0; i--) {
    const s = sp[i];
    s.life += k; s.x += s.vx * k; s.y += s.vy * k;
    const d = (s.drag ?? 0.975) ** k;
    s.vx *= d; s.vy = s.vy * d + (s.trail ? 0 : (s.g ?? 0.045) * k);
    if (s.life >= s.max) { sp.splice(i, 1); continue; }
    // an iron spark pops into two to four smaller ones, partway through its flight
    if (s.fork && s.life > s.max * 0.35 && Math.random() < 0.12 * k && sp.length < cap) {
      const n = 2 + Math.floor(Math.random() * 3), v = Math.hypot(s.vx, s.vy), a0 = Math.atan2(s.vy, s.vx);
      for (let j = 0; j < n; j++) {
        const a = a0 + (Math.random() - 0.5) * 2.6, w = v * (0.5 + Math.random() * 0.7);
        sp.push({ x: s.x, y: s.y, vx: Math.cos(a) * w, vy: Math.sin(a) * w, life: 0, max: 6 + Math.random() * 8, c: s.c, r: s.r * 0.7, fork: s.fork - 1, drag: 0.9, g: 0.03 });
      }
      sp.splice(i, 1);
    }
  }
}

// Draws the sparks additively (overlapping light gets brighter, like the real thing).
export function drawSparks(x: CanvasRenderingContext2D, sp: Spark[], glow: HTMLCanvasElement) {
  x.save();
  x.globalCompositeOperation = 'lighter';
  x.lineCap = 'round';
  for (const s of sp) {
    const a = Math.max(0, 1 - s.life / s.max);
    if (s.flash) { const z = 40 + (1 - a) * 160; x.globalAlpha = a * 0.9; x.drawImage(glow, s.x - z / 2, s.y - z / 2, z, z); continue; }
    x.globalAlpha = a;
    if (!s.trail) { x.strokeStyle = s.c; x.lineWidth = s.r * (0.6 + a * 0.6); x.beginPath(); x.moveTo(s.x - s.vx * 4, s.y - s.vy * 4); x.lineTo(s.x, s.y); x.stroke(); }
    x.fillStyle = s.c; x.beginPath(); x.arc(s.x, s.y, s.r * (0.5 + a * 0.6), 0, TAU); x.fill();
  }
  x.restore();
}

// A firework bursting at (x, y): kind picks a peony, ring, double ring (chakra) or willow.
export function explode(sp: Spark[], x: number, y: number, kind: number, N = 110) {
  const [c1, c2] = FIREWORK_COLOURS[kind % FIREWORK_COLOURS.length], shape = kind % 4;
  sp.push({ x, y, vx: 0, vy: 0, life: 0, max: 14, c: c1, r: 0, flash: true });
  for (let i = 0; i < N; i++) {
    const a = (i / N) * TAU + Math.random() * 0.1;
    let v = 2 + Math.random() * 4.2;
    if (shape === 1) v = 4.6 + Math.random() * 0.5;
    if (shape === 2) v = (i % 2 ? 2.6 : 5) + Math.random() * 0.3;
    const max = shape === 3 ? 120 : 78; // the willow lingers
    sp.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: max + Math.random() * 20, c: i % 3 ? c1 : c2, r: 3 });
  }
}

export function rocket(x0: number, y0: number, tx: number, ty: number, now = performance.now()): Rocket {
  return { x: x0, y: y0, x0, y0, tx, ty, t0: now, dur: 650 + Math.random() * 250, kind: Math.floor(Math.random() * 24) };
}

// Moves a rocket along its arc, leaving a smoke trail; true once it has reached its burst point.
export function flyRocket(r: Rocket, now: number, sp: Spark[]): boolean {
  const p = Math.min(1, (now - r.t0) / r.dur), e = 1 - (1 - p) ** 2;
  r.x = r.x0 + (r.tx - r.x0) * e; r.y = r.y0 + (r.ty - r.y0) * e;
  sp.push({ x: r.x, y: r.y, vx: (Math.random() - 0.5) * 0.6, vy: 0.8, life: 0, max: 18, c: '#FFE6A0', r: 1.6, trail: true });
  return p >= 1;
}

// A sparkler's spray at (x, y): white-hot specks and forking iron sparks in colour c. `speed` is
// how fast the hand is moving (px per frame): a moving sparkler throws more.
export function spray(sp: Spark[], x: number, y: number, c: string, speed = 0, n = 5, cap = 900) {
  const m = Math.min(sp.length + n + Math.round(speed / 6), cap) - sp.length;
  for (let i = 0; i < m; i++) {
    const a = Math.random() * TAU, v = 1.5 + Math.random() * 4.5, iron = Math.random() < 0.55;
    sp.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.6, life: 0, max: 10 + Math.random() * 16, c: iron ? c : '#FFF6DA', r: iron ? 1.6 : 1.1, fork: iron ? 1 + (Math.random() < 0.3 ? 1 : 0) : 0, drag: 0.92, g: 0.06 });
  }
}
