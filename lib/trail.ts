// Particles that follow a finger over a toy's stage: rice powder falling from the fingertip,
// petals, sparks, drips of dye, specks of ink, puffs of dust. One canvas laid over the stage per
// toy (pointer-events off, so drawing is untouched); its loop runs only while particles are alive.
// Phones keep fewer particles. Nothing at all with reduced motion.
import { calm } from './motion';
import { drawSparks, glowSprite, spray, stepSparks, type Spark } from './art/sparks';

export type TrailKind = 'powder' | 'petal' | 'spark' | 'drop' | 'chip' | 'dust';
type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; r: number; rot: number; vr: number };
const TAU = Math.PI * 2;

export type Trail = {
  // a finger moving at `speed` px per frame over client point (cx, cy)
  emit: (cx: number, cy: number, speed?: number, color?: string) => void;
  // a one-off burst (a block pressed, a knot popping, a puff of flour)
  burst: (cx: number, cy: number, color?: string, n?: number) => void;
  stop: () => void;
};

export function trail(stage: HTMLElement, kind: TrailKind): Trail {
  const phone = Math.min(innerWidth, innerHeight) < 700, cap = phone ? 120 : 300;
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  Object.assign(cv.style, { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '3' });
  stage.appendChild(cv);
  const x = cv.getContext('2d')!;
  const ps: P[] = [], sp: Spark[] = [], glow = kind === 'spark' ? glowSprite() : null;
  let W = 0, H = 0, raf = 0, last = 0, dead = false;

  const fit = () => {
    const r = stage.getBoundingClientRect();
    if (Math.round(r.width) !== W || Math.round(r.height) !== H) {
      W = Math.round(r.width); H = Math.round(r.height);
      const d = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * d); cv.height = Math.round(H * d);
      x.setTransform(d, 0, 0, d, 0, 0);
    }
    return r;
  };
  const add = (p: Partial<P> & { x: number; y: number; c: string }) => { if (ps.length < cap) ps.push({ vx: 0, vy: 0, life: 0, max: 30, r: 2, rot: Math.random() * TAU, vr: 0, ...p }); };

  const loop = (now: number) => {
    const dt = last ? Math.min(50, now - last) : 16.67, k = dt / 16.67;
    last = now;
    x.clearRect(0, 0, W, H);
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life += k;
      if (p.life >= p.max) { ps.splice(i, 1); continue; }
      const a = 1 - p.life / p.max;
      if (kind === 'petal') { p.vx = Math.sin(p.life * 0.12 + p.rot) * 0.9; p.vy = Math.min(1.6, p.vy + 0.04 * k); }
      else if (kind === 'dust') { p.r += 0.35 * k; p.vx *= 0.96; p.vy = p.vy * 0.96 - 0.02 * k; }
      else if (kind === 'chip') { p.vx *= 0.88 ** k; p.vy = p.vy * 0.88 ** k + 0.12 * k; }
      else if (kind === 'drop') { p.vy = Math.min(2.6, p.vy + 0.035 * k); if (p.y > H - 4) { p.life = p.max; continue; } }
      else { p.vx *= 0.97; p.vy += 0.05 * k; } // powder
      p.x += p.vx * k; p.y += p.vy * k; p.rot += p.vr * k;
      x.globalAlpha = kind === 'dust' ? a * 0.35 : a;
      x.fillStyle = p.c;
      if (kind === 'petal') {
        x.save(); x.translate(p.x, p.y); x.rotate(p.rot); x.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(p.rot * 2)));
        x.beginPath(); x.moveTo(-p.r, 0); x.quadraticCurveTo(0, -p.r * 0.8, p.r, 0); x.quadraticCurveTo(0, p.r * 0.8, -p.r, 0);
        x.fill(); x.lineWidth = 1; x.strokeStyle = '#1B1410'; x.stroke(); x.restore();
      } else if (kind === 'drop') {
        // a drop with a thin streak of dye running behind it
        const st = Math.min(3, 1 + p.vy * 0.5);
        x.globalAlpha = a * 0.45; x.fillRect(p.x - p.r * 0.35, p.y - p.r * st * 4, p.r * 0.7, p.r * st * 4);
        x.globalAlpha = a; x.beginPath(); x.ellipse(p.x, p.y, p.r, p.r * st, 0, 0, TAU); x.fill();
        x.lineWidth = 1; x.strokeStyle = 'rgba(27,20,16,.5)'; x.stroke();
      } else if (kind === 'dust') {
        x.beginPath(); x.arc(p.x, p.y, p.r, 0, TAU); x.fill();
      } else {
        x.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r);
      }
    }
    x.globalAlpha = 1;
    if (glow) { stepSparks(sp, dt, cap); drawSparks(x, sp, glow); }
    raf = !dead && (ps.length || sp.length) ? requestAnimationFrame(loop) : 0;
    if (!raf) { last = 0; x.clearRect(0, 0, W, H); }
  };
  const wake = () => { if (!raf && !dead) raf = requestAnimationFrame(loop); };

  return {
    emit(cx, cy, speed = 0, c = '#FBF3E4') {
      if (dead || calm()) return;
      const r = fit(), px = cx - r.left, py = cy - r.top;
      if (kind === 'spark') spray(sp, px, py, c, speed, 4, cap);
      else if (kind === 'petal') { if (Math.random() < 0.35 + speed * 0.02) add({ x: px, y: py, c, r: 4 + Math.random() * 3, vy: 0.4, max: 60 + Math.random() * 30, vr: (Math.random() - 0.5) * 0.2 }); }
      else if (kind === 'drop') add({ x: px + (Math.random() - 0.5) * 10, y: py, c, r: 2 + Math.random() * 1.8, vy: 0.2, max: 70 + Math.random() * 40 });
      else {
        const n = Math.min(4, 1 + Math.floor(speed / 6));
        for (let i = 0; i < n; i++) add({ x: px + (Math.random() - 0.5) * 6, y: py + (Math.random() - 0.5) * 6, c, r: 0.8 + Math.random() * 1.2, vx: (Math.random() - 0.5) * 1.2, vy: 0.2 + Math.random() * 0.8, max: 24 + Math.random() * 22 });
      }
      wake();
    },
    burst(cx, cy, c = '#1B1410', n = 12) {
      if (dead || calm()) return;
      const r = fit(), px = cx - r.left, py = cy - r.top;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU, v = kind === 'dust' ? 0.6 + Math.random() * 1.2 : 2 + Math.random() * 3.5;
        if (kind === 'spark') { spray(sp, px, py, c, 30, 2, cap); continue; }
        add({ x: px, y: py, c, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (kind === 'dust' ? 0.4 : 1), r: kind === 'dust' ? 6 + Math.random() * 8 : kind === 'petal' ? 4 + Math.random() * 3 : 1.6 + Math.random() * 1.8, max: kind === 'dust' ? 40 + Math.random() * 20 : 20 + Math.random() * 14, vr: (Math.random() - 0.5) * 0.3 });
      }
      wake();
    },
    stop() { dead = true; cancelAnimationFrame(raf); cv.remove(); },
  };
}
