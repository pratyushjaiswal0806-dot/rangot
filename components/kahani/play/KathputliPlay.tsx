'use client';
// "The shadow game": the cloth screen of a shadow theatre, lit by an oil lamp behind it. Drag the
// puppet about the screen and slide it between the screen and the lamp: the nearer the lamp, the
// bigger and softer its shadow (the lamp is not a single point, so the edges blur); pressed to the
// screen it is small and sharp. A tholu bommalata puppet is painted leather, so its shadow glows in
// colour, and its arm is jointed; a ravanachhaya deer is one piece of hide, dark and jointless.
// The strip under the stage shows the same thing from the side: the lamp's rays past the puppet.
import { useRef, useState } from 'react';
import { chime, pluck, whoosh } from '../../../lib/sfx';
import p from './Play.module.css';
import s from './KathputliPlay.module.css';

const PUPPETS = [
  { id: 'tholu', name: 'Tholu bommalata', where: 'Andhra Pradesh · Telugu', note: 'Thin leather, painted on both sides: the lamp shines through the paint, so the shadow glows in colour. The arm has joints, worked by a rod.' },
  { id: 'ravana', name: 'Ravanachhaya', where: 'Odisha · Odia', note: 'Cut from a single piece of deer hide, with no joints and no paint. The shadow is dark, and the whole figure has to tell the story.' },
] as const;
type Id = (typeof PUPPETS)[number]['id'];

const MAX_D = 0.75;
// what to find: a huge shadow, a sharp one, the jointed arm waving, and the jointless deer
const GOALS = ['big', 'sharp', 'wave', 'ravana'] as const;
const TODO: Record<(typeof GOALS)[number], string> = { big: 'make it huge', sharp: 'press it to the screen', wave: 'wave the jointed arm', ravana: 'try the deer' }; // the puppet can go three quarters of the way back to the lamp

// m: how much bigger the shadow is than the puppet; blur: how soft its edge is (screen units)
const optics = (v: number) => { const d = (v / 100) * MAX_D; return { d, m: 1 / (1 - d), blur: 4.5 * (d / (1 - d)) }; };

function Tholu({ wave }: { wave: number }) {
  return (
    <g>
      <path d="M0 18V96" stroke="#1B1410" strokeWidth="1.5" opacity=".55" />
      <path d="M-11 -8q-5 22 0 40h22q5-18 0-40Z" fill="#D63A2A" fillOpacity=".78" stroke="#1B1410" strokeWidth="1.6" />
      <path d="M-14 30-20 56h40l-6-26Z" fill="#FFC21A" fillOpacity=".8" stroke="#1B1410" strokeWidth="1.6" strokeLinejoin="round" />
      {[[-8, 40], [0, 44], [8, 40], [-12, 50], [12, 50], [0, 52]].map(([x, y]) => <circle key={x + ',' + y} cx={x} cy={y} r="1.6" fill="#FFF3D0" />)}
      <path d="M-10-4-20 14l-4 12" fill="none" stroke="#2F6B3B" strokeOpacity=".85" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="0" cy="-20" r="9.5" fill="#2F6B3B" fillOpacity=".78" stroke="#1B1410" strokeWidth="1.6" />
      <path d="M-8-26 0-44l8 18Z" fill="#FFC21A" fillOpacity=".85" stroke="#1B1410" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="3.5" cy="-21" r="1.8" fill="#FFF3D0" />
      {/* the jointed arm: the forearm swings at the elbow when it waves */}
      <path d="M10-4 22 8" stroke="#2F6B3B" strokeOpacity=".85" strokeWidth="5" strokeLinecap="round" />
      <g key={wave} className={wave ? s.wave : undefined} style={{ transformBox: 'view-box', transformOrigin: '22px 8px' }}>
        <path d="M22 8 32-6" stroke="#2F6B3B" strokeOpacity=".85" strokeWidth="5" strokeLinecap="round" />
        <circle cx="33" cy="-8" r="3.4" fill="#C98A5A" fillOpacity=".85" stroke="#1B1410" strokeWidth="1.2" />
        <path d="M33-8 46 40" stroke="#1B1410" strokeWidth="1.2" opacity=".5" />
      </g>
    </g>
  );
}

function Deer() {
  return (
    <g fill="#1B1410" fillOpacity=".9">
      <path d="M-30 6q2-16 22-16h22q14 0 16-8l6-14q4-4 8 0l2 8-6 4-2 12q-2 8-8 14 4 10 0 22l4 22h-6l-6-20q-12 6-30 4l-6 16-4 6h-6l4-24q-10-6-10-18Z" />
      <path d="M30-30l-4-16M30-40l-8-4M36-28l6-14M38-36l8-2" stroke="#1B1410" strokeOpacity=".9" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M-30 6-38-2" stroke="#1B1410" strokeOpacity=".9" strokeWidth="4" strokeLinecap="round" />
      <path d="M0 22V96" stroke="#1B1410" strokeWidth="1.5" opacity=".55" />
    </g>
  );
}

export default function KathputliPlay() {
  const [who, setWho] = useState<Id>('tholu');
  const [dist, setDist] = useState(10);
  const [pos, setPos] = useState({ x: 150, y: 150 });
  const [wave, setWave] = useState(0);
  const [found, setFound] = useState<Set<(typeof GOALS)[number]>>(new Set());
  const [said, setSaid] = useState<string | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null);

  const o = optics(dist);
  const P = PUPPETS.find((x) => x.id === who)!;
  const mark = (k: (typeof GOALS)[number]) => setFound((f) => {
    if (f.has(k)) return f;
    const g = new Set(f).add(k);
    if (g.size === GOALS.length) chime(5, 5); else pluck(6 + g.size, 0.6);
    return g;
  });

  const toSvg = (e: React.PointerEvent) => {
    const b = svg.current!.getBoundingClientRect();
    return { x: ((e.clientX - b.left) / b.width) * 300, y: ((e.clientY - b.top) / b.height) * 300 };
  };
  const down = (e: React.PointerEvent) => {
    const q = toSvg(e);
    drag.current = { id: e.pointerId, dx: pos.x - q.x, dy: pos.y - q.y };
    try { svg.current!.setPointerCapture(e.pointerId); } catch {}
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    e.preventDefault();
    const q = toSvg(e);
    setPos({ x: Math.max(30, Math.min(270, q.x + d.dx)), y: Math.max(50, Math.min(250, q.y + d.dy)) });
  };
  const up = () => { drag.current = null; };

  const slide = (v: number) => {
    setDist(v);
    const { m, d } = optics(v);
    if (m >= 2.5) mark('big');
    if (d <= 0.02) mark('sharp');
    if (Math.abs(v - dist) > 12) whoosh(0.3, 400, 1200, 0.03);
  };
  const doWave = () => {
    if (who === 'ravana') { setSaid('No joints to move! A ravanachhaya figure is one piece of hide.'); pluck(1, 0.5); return; }
    setWave((n) => n + 1);
    setSaid(null);
    mark('wave');
    pluck(8, 0.6);
  };
  const pick = (id: Id) => {
    setWho(id);
    setSaid(null);
    if (id === 'ravana') mark('ravana');
    pluck(id === 'tholu' ? 5 : 3, 0.6);
  };

  const size = o.m >= 2.5 ? 'big and soft' : o.d <= 0.05 ? 'small and sharp' : 'a little bigger, a little softer';
  const label = `${P.name} shadow on a lit screen: ${size}, ${o.m.toFixed(1)} times the puppet's size`;
  // the side view: lamp at the left, screen at the right, the puppet between
  const L = 250, sx = 280, lx = sx - L, px = sx - o.d * L, h0 = 12, top = 30 - h0, bot = 30 + h0;
  const hit = (y: number) => 30 + (y - 30) * o.m;
  return (
    <div className={p.play}>
      <div role="group" aria-label="Shadow puppet" className={p.chips}>
        {PUPPETS.map((x) => (
          <button key={x.id} type="button" className={p.chip} aria-pressed={who === x.id} onClick={() => pick(x.id)}>
            <b>{x.name}</b><span>{x.where.split(' · ')[0]}</span>
          </button>
        ))}
      </div>
      <div className={p.body}>
        <div>
          <div className={`${p.stage} ${s.stage}`}>
            <svg ref={svg} viewBox="0 0 300 300" role="img" aria-label={label} className={s.screen}
              onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
              <defs>
                <radialGradient id="kp-lamp" cx="40%" cy="62%" r="70%"><stop offset="0" stopColor="#FFF4D2" /><stop offset=".55" stopColor="#F7C877" /><stop offset="1" stopColor="#8A4A1E" /></radialGradient>
                <filter id="kp-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={o.blur.toFixed(2)} /></filter>
              </defs>
              <rect width="300" height="300" fill="url(#kp-lamp)" />
              {/* blurred out here, in screen units, so the blur doesn't grow with the shadow's scale */}
              <g className={s.flicker} filter={o.blur > 0.15 ? 'url(#kp-soft)' : undefined}>
                <g style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${o.m.toFixed(3)})`, opacity: 1 - 0.35 * (o.d / MAX_D) }}>
                  {who === 'tholu' ? <Tholu wave={wave} /> : <Deer />}
                </g>
              </g>
              <path d="M0 0h300v300H0Z" fill="none" stroke="#5A1A12" strokeWidth="14" />
            </svg>
          </div>
          <svg viewBox="0 0 300 60" className={s.side} role="img" aria-label={`Side view: the puppet is ${Math.round(o.d * 100)} percent of the way from the screen to the lamp`}>
            <path d={`M${lx} 30L${sx} ${hit(top)}M${lx} 30L${sx} ${hit(bot)}`} stroke="#FFC21A" strokeWidth="1.2" strokeDasharray="3 3" opacity=".8" />
            <path d={`M${sx} 4V56`} stroke="#FFE6A8" strokeWidth="6" />
            <path d={`M${sx} ${Math.max(4, hit(top))}V${Math.min(56, hit(bot))}`} stroke="#1B1410" strokeWidth="6" />
            <path d={`M${px} ${top}V${bot}`} stroke={who === 'tholu' ? '#D63A2A' : '#1B1410'} strokeWidth="5" strokeLinecap="round" />
            <path d={`M${lx} 38c-5-5-5-11 0-16 5 5 5 11 0 16Z`} fill="#FFC21A" stroke="#1B1410" strokeWidth="1.5" />
            <path d={`M${lx - 8} 40h16l-3 5h-10Z`} fill="#B4542A" stroke="#1B1410" strokeWidth="1.5" />
            <text x={lx} y="56" textAnchor="middle" className={s.tag}>LAMP</text>
            <text x={sx - 6} y="56" textAnchor="end" className={s.tag}>SCREEN</text>
          </svg>
        </div>
        <div className={p.info}>
          <label className={p.label} htmlFor="kp-dist">Puppet distance · {o.d <= 0.02 ? 'on the screen' : `${Math.round(o.d * 100)}% of the way to the lamp`}</label>
          <input id="kp-dist" className={p.range} type="range" min={0} max={100} value={dist} onChange={(e) => slide(+e.target.value)}
            aria-valuetext={`${size}, shadow ${o.m.toFixed(1)} times bigger`} />
          <div className={s.ends} aria-hidden="true"><span>Screen</span><span>Lamp</span></div>
          <div className={p.btns}>
            <button type="button" className={p.btn} onClick={doWave}>Wave the arm</button>
            <button type="button" className={`${p.btn} ${p.ghost}`} onClick={() => { setPos({ x: 150, y: 150 }); setDist(10); }}>Centre it</button>
          </div>
          <div aria-live="polite" className={s.card}>
            <p className={p.name}><b>{P.name}</b></p>
            <p className={p.where}>{P.where} · shadow {o.m.toFixed(1)}× · {size}</p>
            <p className={p.note}>{said ?? P.note}</p>
          </div>
          <p className={s.tally}>
            <b>{found.size}</b> of {GOALS.length} · {GOALS.filter((k) => !found.has(k)).map((k) => TODO[k]).slice(0, 2).join(', ') || 'all found ★'}
          </p>
        </div>
      </div>
    </div>
  );
}
