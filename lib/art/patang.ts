// Patang: an Indian fighter kite over the rooftops of old Ahmedabad on Uttarayan. The kite is a
// paper diamond on a bamboo spine and bow, in two colours and one of four patterns, with an
// optional tail. The sky, the skyline, the strings (sagging when slack) and, at night, the paper
// lanterns (tukkal) tied along the string are drawn here; the flying itself lives in the toy and,
// for share links, in a scripted flight (replayFlight). Positions are in stage units (0…1).
type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
const INK = '#1B1410';

export const KITE_COLOURS: [string, string][] = [
  ['Haldi', '#FFC21A'], ['Sindoor', '#D63A2A'], ['Rani', '#C93A82'], ['Neel', '#2D4C7C'],
  ['Hara', '#2F6B3B'], ['Doodh', '#FBF3E4'], ['Kaala', '#1B1410'], ['Aasmaani', '#5BB8E8'],
];
export const PATTERNS = ['Aadha', 'Chaukda', 'Chaand', 'Aankh'];
export const PATTERN_EN = ['half and half', 'four corners', 'a moon', 'an eye'];
export const TAILS = ['No tail', 'Short tail', 'Long tail'];
export type Design = { a: number; b: number; p: number; t: number };

export const ROOF = 0.8; // where the rooftops start
export const ME = { x: 0.13, y: 0.84 }; // your hand on your rooftop
export const THEM = [{ x: 0.78, y: 0.83 }, { x: 0.93, y: 0.86 }, { x: 0.55, y: 0.87 }]; // the neighbours' roofs

const rnd = (a: number, b: number) => { const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return s - Math.floor(s); };

// ---------- the sky and the old city ----------
export function drawSky(x: Ctx, S: number, night: boolean, t: number) {
  const g = x.createLinearGradient(0, 0, 0, S * ROOF);
  if (night) { g.addColorStop(0, '#0E1236'); g.addColorStop(1, '#3A2858'); }
  else { g.addColorStop(0, '#6EC3EE'); g.addColorStop(0.7, '#BFE6F7'); g.addColorStop(1, '#FBE7C2'); }
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  if (night) {
    x.fillStyle = '#FBF3E4';
    for (let i = 0; i < 40; i++) { x.globalAlpha = 0.35 + rnd(i, 3) * 0.5; x.fillRect(rnd(i, 1) * S, rnd(i, 2) * S * 0.6, S * 0.004, S * 0.004); }
    x.globalAlpha = 1;
    x.beginPath(); x.arc(S * 0.84, S * 0.14, S * 0.05, 0, TAU); x.fillStyle = '#FFF1C8'; x.fill();
  } else {
    // the January sun, and clouds drifting with the wind
    x.beginPath(); x.arc(S * 0.86, S * 0.13, S * 0.055, 0, TAU); x.fillStyle = '#FFE08A'; x.fill();
    x.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 4; i++) {
      const cx = ((rnd(i, 7) + t * 0.008 * (1 + i * 0.3)) % 1.3) * S - S * 0.15, cy = S * (0.12 + rnd(i, 8) * 0.35), r = S * (0.03 + rnd(i, 9) * 0.03);
      x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.arc(cx + r * 1.1, cy - r * 0.4, r * 1.2, 0, TAU); x.arc(cx + r * 2.3, cy, r * 0.9, 0, TAU); x.fill();
    }
  }
  skyline(x, S, night);
}

// Old Ahmedabad: tall pol houses with flat roofs and water tanks, a pair of minarets, a temple
// spire, and the near roofs where everyone stands with their kites.
function skyline(x: Ctx, S: number, night: boolean) {
  const far = night ? '#2A1E44' : '#C9A27A', near = night ? '#1B1430' : '#9C6B47', front = night ? '#120C22' : '#6E4630';
  x.fillStyle = far;
  let px = 0;
  for (let i = 0; px < S; i++) {
    const w = S * (0.05 + rnd(i, 11) * 0.06), h = S * (0.06 + rnd(i, 12) * 0.08);
    x.fillRect(px, S * 0.78 - h, w + 1, h + S);
    px += w;
  }
  // minarets and a temple shikhara on the far skyline
  for (const mx of [0.33, 0.39]) {
    x.fillRect(S * (mx - 0.008), S * 0.56, S * 0.016, S * 0.25);
    x.beginPath(); x.arc(S * mx, S * 0.56, S * 0.012, Math.PI, 0); x.fill();
    x.fillRect(S * (mx - 0.012), S * 0.62, S * 0.024, S * 0.006); x.fillRect(S * (mx - 0.012), S * 0.68, S * 0.024, S * 0.006);
  }
  x.fillRect(S * 0.3, S * 0.7, S * 0.12, S * 0.1);
  x.beginPath(); x.moveTo(S * 0.6, S * 0.72); x.quadraticCurveTo(S * 0.63, S * 0.6, S * 0.635, S * 0.57); x.quadraticCurveTo(S * 0.64, S * 0.6, S * 0.67, S * 0.72); x.fill();
  x.fillStyle = near;
  px = -S * 0.02;
  for (let i = 0; px < S; i++) {
    const w = S * (0.08 + rnd(i, 21) * 0.07), h = S * (0.03 + rnd(i, 22) * 0.05), top = S * ROOF - h;
    x.fillRect(px, top, w - S * 0.006, S);
    if (rnd(i, 23) > 0.5) x.fillRect(px + w * 0.6, top - S * 0.025, S * 0.035, S * 0.025); // a water tank
    if (night && rnd(i, 24) > 0.4) { x.fillStyle = '#FFC94A'; x.fillRect(px + w * 0.25, top + S * 0.03, S * 0.012, S * 0.016); x.fillStyle = near; }
    px += w;
  }
  // the three roofs with people on them: yours (left) and the neighbours'
  x.fillStyle = front;
  x.fillRect(0, S * 0.86, S * 0.3, S); x.fillRect(S * 0.66, S * 0.85, S * 0.34, S); x.fillRect(S * 0.46, S * 0.9, S * 0.2, S);
  x.fillStyle = night ? '#2A1E44' : '#E8C48E';
  for (const [a, b] of [[0, 0.3], [0.66, 1], [0.46, 0.66]]) x.fillRect(S * a, S * (b === 0.66 ? 0.9 : a ? 0.85 : 0.86), S * (b - a), S * 0.008);
  const person = (px2: number, py: number) => {
    x.fillStyle = INK;
    x.beginPath(); x.arc(px2 * S, (py - 0.055) * S, S * 0.011, 0, TAU); x.fill();
    x.fillRect((px2 - 0.009) * S, (py - 0.044) * S, S * 0.018, S * 0.04);
  };
  person(ME.x - 0.01, 0.86); for (const r of THEM) person(r.x - 0.01, r.y + 0.03);
}

// ---------- strings ----------
// From a hand to a kite, sagging when slack (0 taut … 1 slack); at night, paper lanterns hang along it.
export function stringPoints(ax: number, ay: number, kx: number, ky: number, slack: number, n = 12): number[] {
  const mx = (ax + kx) / 2, my = (ay + ky) / 2 + 0.03 + slack * 0.16, out: number[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push(u * u * ax + 2 * u * t * mx + t * t * kx, u * u * ay + 2 * u * t * my + t * t * ky); }
  return out;
}
export function drawString(x: Ctx, S: number, pts: number[], colour: string, lanterns = 0, t = 0) {
  x.beginPath(); x.moveTo(pts[0] * S, pts[1] * S);
  for (let i = 2; i < pts.length; i += 2) x.lineTo(pts[i] * S, pts[i + 1] * S);
  x.strokeStyle = colour; x.lineWidth = Math.max(1, S * 0.002); x.stroke();
  // tukkal: paper lanterns tied along the string on Uttarayan night
  for (let k = 1; k <= lanterns; k++) {
    const i = Math.round(((k / (lanterns + 1)) * (pts.length / 2 - 1))) * 2, lx = pts[i] * S, ly = pts[i + 1] * S + S * 0.012, fl = 0.8 + Math.sin(t * 9 + k * 3) * 0.2;
    const g = x.createRadialGradient(lx, ly, 0, lx, ly, S * 0.04);
    g.addColorStop(0, `rgba(255,200,90,${0.55 * fl})`); g.addColorStop(1, 'rgba(255,160,40,0)');
    x.fillStyle = g; x.beginPath(); x.arc(lx, ly, S * 0.04, 0, TAU); x.fill();
    x.fillStyle = '#FFD27A'; x.strokeStyle = '#8A3A10'; x.lineWidth = S * 0.0015;
    x.beginPath(); x.ellipse(lx, ly, S * 0.008, S * 0.012, 0, 0, TAU); x.fill(); x.stroke();
  }
}

// ---------- the kite ----------
// cx, cy: the kite's middle; ang: which way its nose points (0 up); size: half its height.
export function drawKite(x: Ctx, S: number, cx: number, cy: number, ang: number, size: number, d: Design, t = 0, cut = false) {
  const s = size * S, A = KITE_COLOURS[d.a]?.[1] ?? '#FFC21A', B = KITE_COLOURS[d.b]?.[1] ?? '#D63A2A';
  x.save();
  x.translate(cx * S, cy * S); x.rotate(ang);
  // the tail streams out behind, waving
  if (d.t) {
    const len = d.t === 1 ? 1.2 : 2.2;
    x.beginPath(); x.moveTo(0, s * 0.95);
    for (let i = 1; i <= 12; i++) { const k = i / 12; x.lineTo(Math.sin(t * 7 - k * 6) * s * 0.18 * k, s * (0.95 + k * len)); }
    x.lineWidth = s * 0.09; x.strokeStyle = B; x.lineCap = 'round'; x.stroke();
  }
  // a fighter kite: the bow bends the top into a curve
  const w = s * 0.92;
  const shape = () => { x.beginPath(); x.moveTo(0, -s); x.quadraticCurveTo(w * 0.62, -s * 0.42, w, -s * 0.12); x.lineTo(0, s); x.lineTo(-w, -s * 0.12); x.quadraticCurveTo(-w * 0.62, -s * 0.42, 0, -s); x.closePath(); };
  shape(); x.fillStyle = A; x.fill();
  x.save(); shape(); x.clip(); x.fillStyle = B;
  if (d.p === 0) x.fillRect(0, -s, w, s * 2);
  else if (d.p === 1) { x.fillRect(0, -s, w, s * 0.88); x.fillRect(-w, -s * 0.12, w, s * 1.2); }
  else if (d.p === 2) { x.beginPath(); x.arc(0, -s * 0.2, s * 0.32, 0, TAU); x.fill(); x.fillStyle = A; x.beginPath(); x.arc(s * 0.12, -s * 0.28, s * 0.28, 0, TAU); x.fill(); }
  else {
    x.beginPath(); x.ellipse(0, -s * 0.18, s * 0.42, s * 0.22, 0, 0, TAU); x.fill();
    x.fillStyle = A; x.beginPath(); x.arc(0, -s * 0.18, s * 0.15, 0, TAU); x.fill();
    x.fillStyle = INK; x.beginPath(); x.arc(0, -s * 0.18, s * 0.07, 0, TAU); x.fill();
  }
  x.restore();
  shape(); x.lineWidth = Math.max(1, s * 0.05); x.strokeStyle = INK; x.stroke();
  // spine and bow (bamboo)
  x.beginPath(); x.moveTo(0, -s); x.lineTo(0, s); x.moveTo(-w, -s * 0.12); x.quadraticCurveTo(0, -s * 0.72, w, -s * 0.12);
  x.lineWidth = Math.max(1, s * 0.035); x.strokeStyle = 'rgba(27,20,16,.6)'; x.stroke();
  // the little paper tab at the bottom (a fighter kite's tail flap)
  x.beginPath(); x.moveTo(0, s * 0.82); x.lineTo(s * 0.2, s * 1.08); x.lineTo(-s * 0.2, s * 1.08); x.closePath();
  x.fillStyle = B; x.fill(); x.lineWidth = Math.max(1, s * 0.04); x.strokeStyle = INK; x.stroke();
  if (cut) { x.beginPath(); x.moveTo(0, s * 0.2); x.lineTo(s * 0.4, s * 1.8); x.strokeStyle = 'rgba(251,243,228,.8)'; x.lineWidth = 1; x.stroke(); }
  x.restore();
}

// ---------- the share replay: a scripted flight ----------
// Up from the rooftop, then loops across the sky; with kites cut, one neighbour's kite crosses
// the string at 3.4 s and is cut, drifting away. Returns where everything is at time T (s).
export function replayFlight(T: number) {
  const up = Math.min(1, T / 1.6), e = 1 - (1 - up) ** 3;
  const lx = 0.5 + 0.22 * Math.sin(T * 0.9), ly = 0.32 + 0.1 * Math.sin(T * 1.8);
  const kx = ME.x + (lx - ME.x) * e, ky = ME.y + (ly - ME.y) * e;
  const nx = Math.cos(T * 0.9) * 0.22 * 0.9, ny = Math.cos(T * 1.8) * 0.1 * 1.8;
  const ang = up < 1 ? 0.1 : Math.atan2(nx, -ny) * 0.35;
  return { kx, ky, ang, slack: up < 1 ? 0.1 : 0.15 + 0.1 * Math.sin(T * 1.3) };
}
// the neighbour's kite in the replay: flies in, is cut at 3.4 s, then drifts off spinning
export function rivalFlight(T: number) {
  const CUT = 3.4;
  if (T < CUT) { const k = Math.min(1, T / 2.2); return { x: THEM[0].x - 0.35 * k, y: 0.5 - 0.12 * k + Math.sin(T * 2) * 0.02, ang: -0.4, cut: false }; }
  const f = T - CUT;
  return { x: THEM[0].x - 0.35 + f * 0.09, y: 0.38 + f * 0.05 + Math.sin(f * 3) * 0.02, ang: f * 2.4, cut: true };
}
export const REPLAY_SECONDS = 6.5;

// The OG image: the kite big against the sky, its string down to the roofs.
export function patangSvg(d: Design, night: boolean, S = 600): string {
  const A = KITE_COLOURS[d.a]?.[1] ?? '#FFC21A', B = KITE_COLOURS[d.b]?.[1] ?? '#D63A2A';
  const sky = night ? ['#0E1236', '#3A2858'] : ['#6EC3EE', '#FBE7C2'];
  const kite = 'M300 90Q388 175 440 220L300 400 160 220Q212 175 300 90Z';
  const fill = d.p === 0 ? `<path d="M300 90Q388 175 440 220L300 400Z" fill="${B}"/>`
    : d.p === 1 ? `<path d="M300 90Q388 175 440 220L300 236ZM300 236 160 220 300 400Z" fill="${B}"/>`
      : d.p === 2 ? `<circle cx="300" cy="200" r="55" fill="${B}"/><circle cx="320" cy="186" r="48" fill="${A}"/>`
        : `<ellipse cx="300" cy="202" rx="70" ry="38" fill="${B}"/><circle cx="300" cy="202" r="26" fill="${A}"/><circle cx="300" cy="202" r="12" fill="${INK}"/>`;
  const tail = d.t ? `<path d="M300 400q-20 40 0 80t0 ${d.t === 2 ? '80q20 40 0 80' : '20'}" fill="none" stroke="${B}" stroke-width="14" stroke-linecap="round"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 600 600"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient><clipPath id="k"><path d="${kite}"/></clipPath></defs>`
    + `<rect width="600" height="600" fill="url(#s)"/>`
    + `<path d="M0 520h60v-30h50v40h70v-50h40v60h80v-20h60v30h70v-45h50v35h70v100H0Z" fill="${night ? '#1B1430' : '#9C6B47'}"/>`
    + `<path d="M300 400Q200 520 80 560" fill="none" stroke="${night ? '#FBF3E4' : '#1B1410'}" stroke-width="2"/>${tail}`
    + `<path d="${kite}" fill="${A}"/><g clip-path="url(#k)">${fill}</g><path d="${kite}" fill="none" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`
    + `<path d="M300 90V400M160 220Q300 120 440 220" fill="none" stroke="rgba(27,20,16,.6)" stroke-width="5"/>`
    + `<path d="M300 370l30 40h-60Z" fill="${B}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/></svg>`;
}
