// Full-screen celebrations drawn on a throwaway canvas over the page.
import { calm } from './motion';
import { drawSparks, explode, flyRocket, glowSprite, rocket, stepSparks, type Rocket, type Spark } from './art/sparks';
import { burst, whoosh } from './sfx';

const TAU = Math.PI * 2;
const GULAL = ['#E8457F', '#FFC21A', '#2FA35E', '#F07A1E', '#8A46B8', '#2F86D6', '#E0302A'];
const reduced = calm;
function overlay(): { cv: HTMLCanvasElement; x: CanvasRenderingContext2D; W: number; H: number; done: () => void } {
  const W = innerWidth, H = innerHeight, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  cv.setAttribute('aria-hidden', 'true');
  Object.assign(cv.style, { position: 'fixed', left: '0', top: '0', width: W + 'px', height: H + 'px', pointerEvents: 'none', zIndex: '135', transition: 'opacity .9s' });
  document.body.appendChild(cv);
  return { cv, x: cv.getContext('2d')!, W, H, done: () => { cv.style.opacity = '0'; setTimeout(() => cv.remove(), 950); } };
}

// Holi gulal: a few powder clouds bursting across the screen.
export function gulal() {
  const { x, W, H, done } = overlay();
  const phone = Math.min(W, H) < 700;
  type Pt = { x: number; y: number; vx: number; vy: number; r: number; c: string; t0: number; big: boolean };
  const P: Pt[] = [], nB = phone ? 4 : 6, per = phone ? 50 : 85;
  for (let b = 0; b < nB; b++) {
    const bx = W * (0.12 + Math.random() * 0.76), by = H * (0.18 + Math.random() * 0.64), col = GULAL[(b * 3 + Math.floor(Math.random() * 7)) % 7], t0 = b * 150;
    for (let i = 0; i < per; i++) {
      const big = i < per * 0.3, a = Math.random() * TAU, v = 2 + Math.random() * (big ? 3 : 9);
      P.push({ x: bx, y: by, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5, r: big ? 18 + Math.random() * 30 : 2 + Math.random() * 5, c: col, t0, big });
    }
  }
  if (reduced()) {
    for (const p of P) {
      for (let k = 0; k < 26; k++) { p.x += p.vx; p.y += p.vy; p.vx *= 0.95; p.vy = p.vy * 0.95 + 0.06; }
      x.globalAlpha = p.big ? 0.2 : 0.7; x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, p.r, 0, TAU); x.fill();
    }
    setTimeout(done, 1400);
    return;
  }
  const start = performance.now();
  const step = (now: number) => {
    const t = now - start;
    x.clearRect(0, 0, W, H);
    for (const p of P) {
      if (t < p.t0) continue;
      const life = Math.max(0, 1 - (t - p.t0) / 2400);
      if (!life) continue;
      p.x += p.vx; p.y += p.vy; p.vx *= 0.95; p.vy = p.vy * 0.95 + 0.06;
      if (p.big) p.r *= 1.01;
      x.globalAlpha = (p.big ? 0.22 : 0.8) * life; x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, p.r, 0, TAU); x.fill();
    }
    if (t < 3200) requestAnimationFrame(step); else done();
  };
  requestAnimationFrame(step);
}

// Marigold petals bursting out of a point and fluttering down (stamps, unlocks, shares).
export function petalBurst(cx = innerWidth / 2, cy = innerHeight / 3, n = 34) {
  if (reduced()) return;
  const { x, W, H, done } = overlay();
  const cols = ['#FFC21A', '#E8761E', '#FFC21A', '#CC3B22', '#FBF3E4', '#C93A82'];
  const P = Array.from({ length: n }, () => {
    const a = Math.random() * TAU, v = 4 + Math.random() * 7;
    return { x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, r: 5 + Math.random() * 6, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 0.3, c: cols[Math.floor(Math.random() * cols.length)] };
  });
  const start = performance.now();
  const step = (now: number) => {
    const t = now - start, life = Math.max(0, 1 - t / 1700);
    x.clearRect(0, 0, W, H);
    for (const p of P) {
      p.x += p.vx; p.y += p.vy; p.vx *= 0.96; p.vy = p.vy * 0.96 + 0.32; p.rot += p.vr;
      x.save(); x.globalAlpha = life; x.translate(p.x, p.y); x.rotate(p.rot); x.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(p.rot * 2)));
      x.beginPath(); x.moveTo(-p.r, 0); x.quadraticCurveTo(0, -p.r * 0.8, p.r, 0); x.quadraticCurveTo(0, p.r * 0.8, -p.r, 0);
      x.fillStyle = p.c; x.fill(); x.lineWidth = 1.2; x.strokeStyle = '#1B1410'; x.stroke(); x.restore();
    }
    if (life > 0) requestAnimationFrame(step); else done();
  };
  requestAnimationFrame(step);
}

// Diwali fireworks over the whole page: n rockets rise from the bottom and burst across the top
// half (or all at one point). With reduced motion, a still burst that fades.
export function fireworks(n = 3, at?: { x: number; y: number }) {
  const { x, W, H, done } = overlay();
  const sp: Spark[] = [], rk: Rocket[] = [], glow = glowSprite(), t0 = performance.now();
  if (reduced()) {
    for (let i = 0; i < Math.min(n, 2); i++) explode(sp, at ? at.x : W * (0.3 + 0.4 * i), at ? at.y : H * 0.3, i * 7, 70);
    for (const s of sp) { s.x += s.vx * 6; s.y += s.vy * 6; s.life = s.max * 0.3; }
    drawSparks(x, sp, glow);
    setTimeout(done, 1200);
    return;
  }
  for (let i = 0; i < n; i++) {
    const tx = at ? at.x : W * (0.14 + Math.random() * 0.72), ty = at ? at.y : H * (0.12 + Math.random() * 0.32);
    rk.push(rocket(tx + (Math.random() - 0.5) * 90, H + 12, tx, ty, t0 + i * 280));
    setTimeout(() => whoosh(0.7, 300, 1800, 0.07), i * 280);
  }
  let last = t0;
  const step = (now: number) => {
    const dt = Math.min(50, now - last);
    last = now;
    x.clearRect(0, 0, W, H);
    for (let k = rk.length - 1; k >= 0; k--) {
      if (now < rk[k].t0) continue;
      if (flyRocket(rk[k], now, sp)) { burst(0.7); explode(sp, rk[k].tx, rk[k].ty, rk[k].kind, 90); rk.splice(k, 1); }
    }
    stepSparks(sp, dt);
    drawSparks(x, sp, glow);
    if ((rk.length || sp.length) && now - t0 < 6000) requestAnimationFrame(step); else done();
  };
  requestAnimationFrame(step);
}

// A rangoli opening up from a point: rings of petals unfold outwards one after another, turn a
// little and fade. For the big wins (a whole carpet laid, one unbroken kolam line).
export function bloomRing(cx = innerWidth / 2, cy = innerHeight / 2) {
  if (reduced()) return;
  const { x, W, H, done } = overlay();
  const u = Math.min(W, H) / 640;
  const rings = [{ n: 8, r: 50, c: '#FFC21A' }, { n: 12, r: 100, c: '#E8761E' }, { n: 16, r: 152, c: '#C93A82' }, { n: 24, r: 206, c: '#FBF3E4' }];
  const t0 = performance.now(), D = 1400;
  const step = (now: number) => {
    const t = Math.max(0, now - t0), fade = t > 850 ? Math.max(0, 1 - (t - 850) / 550) : 1;
    x.clearRect(0, 0, W, H);
    rings.forEach((g, i) => {
      const k = Math.max(0, Math.min(1, (t - i * 110) / 650));
      if (!k) return;
      const e = 1 + 2.2 * (k - 1) ** 3 + 1.2 * (k - 1) ** 2; // ease-out with a little overshoot
      const R = g.r * u * e, len = (18 + i * 4) * u * e, wid = len * 0.42, spin = (1 - k) * 0.7 + i * 0.13;
      x.globalAlpha = fade;
      for (let j = 0; j < g.n; j++) {
        const a = spin + (j / g.n) * TAU;
        x.save(); x.translate(cx + Math.cos(a) * R, cy + Math.sin(a) * R); x.rotate(a);
        x.beginPath(); x.moveTo(-len / 2, 0); x.quadraticCurveTo(0, -wid, len / 2, 0); x.quadraticCurveTo(0, wid, -len / 2, 0);
        x.fillStyle = g.c; x.fill(); x.lineWidth = 1.6; x.strokeStyle = '#1B1410'; x.stroke(); x.restore();
      }
    });
    x.globalAlpha = 1;
    if (t < D) requestAnimationFrame(step); else done();
  };
  requestAnimationFrame(step);
}
