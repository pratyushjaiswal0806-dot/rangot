'use client';
// "Shapes become people": a Warli person is a circle and two triangles, so build one. Drag each
// shape onto its dotted outline (or press its button), and when all three are in place the arms
// and legs paint themselves on. Then pick what the person does: dance, farm, play the tarpa or
// hunt. Each limb turns at its joint (CSS transitions on rotate), so poses glide from one to the
// next; with reduced motion they simply change.
import { useRef, useState } from 'react';
import { chime, pluck } from '../../../lib/sfx';
import p from './Play.module.css';
import s from './WarliPlay.module.css';

type Piece = 'head' | 'body' | 'legs';
const TARGET: Record<Piece, { x: number; y: number }> = { head: { x: 150, y: 86 }, body: { x: 150, y: 136 }, legs: { x: 150, y: 190 } };
const START: Record<Piece, { x: number; y: number }> = { head: { x: 56, y: 252 }, body: { x: 150, y: 246 }, legs: { x: 244, y: 250 } };
const NAMES: Record<Piece, { name: string; shape: string; note: string }> = {
  head: { name: 'Head', shape: 'circle', note: 'The circle comes from the sun and the moon. Here it is a head.' },
  body: { name: 'Body', shape: 'triangle', note: 'The triangle comes from mountains and pointed trees. Point down, it makes the chest.' },
  legs: { name: 'Hips', shape: 'triangle', note: 'A second triangle, point up, meets the first at the waist: an hourglass body.' },
};
// joint angles in degrees, measured outwards from hanging straight down: upper arm and forearm on
// the left, then on the right; thigh and shin the same
type Pose = { id: string; name: string; label: string; note: string; arms: [number, number, number, number]; legs: [number, number, number, number]; prop?: 'sickle' | 'tarpa' | 'bow'; bob?: boolean };
const POSES: Pose[] = [
  { id: 'nacho', name: 'Nacho', label: 'Dance', note: 'The tarpa dance: arms up, feet stamping, round and round the tarpa player.', arms: [120, 30, 120, 30], legs: [25, -30, 25, -30], bob: true },
  { id: 'kheti', name: 'Kheti', label: 'Farm', note: 'Rice is planted in the monsoon. Harvest time is when walls get painted.', arms: [15, 20, 50, 40], legs: [15, -15, 15, -15], prop: 'sickle' },
  { id: 'tarpa', name: 'Tarpa', label: 'Play music', note: 'The tarpa player stands in the middle of the dance, blowing his long gourd horn.', arms: [70, 60, 60, 30], legs: [10, 0, 10, 0], prop: 'tarpa' },
  { id: 'shikaar', name: 'Shikaar', label: 'Hunt', note: 'Hunting and fishing scenes fill Warli walls, alongside farming and festivals.', arms: [100, -70, 90, 0], legs: [30, -10, 20, 0], prop: 'bow' },
];
const REST: Pose = { id: 'rest', name: '', label: '', note: '', arms: [30, 10, 30, 10], legs: [12, 4, 12, 4] };

const rot = (deg: number, x: number, y: number) => ({ transform: `rotate(${deg}deg)`, transformOrigin: `${x}px ${y}px`, transformBox: 'view-box' as const });

export default function WarliPlay() {
  const [pos, setPos] = useState<Record<Piece, { x: number; y: number }>>({ ...START });
  const [placed, setPlaced] = useState<Set<Piece>>(new Set());
  const [pose, setPose] = useState<Pose | null>(null);
  const [said, setSaid] = useState<string | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: number; piece: Piece; dx: number; dy: number } | null>(null);
  const whole = placed.size === 3;

  const snap = (piece: Piece) => {
    setPos((q) => ({ ...q, [piece]: TARGET[piece] }));
    setPlaced((pl) => {
      if (pl.has(piece)) return pl;
      const n = new Set(pl).add(piece);
      if (n.size === 3) { chime(5, 5); setSaid('That’s a Warli person! Now pick what they do.'); } else { pluck(5 + n.size * 2, 0.6); setSaid(NAMES[piece].note); }
      return n;
    });
  };
  const toSvg = (e: React.PointerEvent) => {
    const b = svg.current!.getBoundingClientRect();
    return { x: ((e.clientX - b.left) / b.width) * 300, y: ((e.clientY - b.top) / b.height) * 300 };
  };
  const down = (piece: Piece) => (e: React.PointerEvent) => {
    if (placed.has(piece)) return;
    e.preventDefault();
    const q = toSvg(e);
    drag.current = { id: e.pointerId, piece, dx: pos[piece].x - q.x, dy: pos[piece].y - q.y };
    try { svg.current!.setPointerCapture(e.pointerId); } catch {}
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const q = toSvg(e);
    setPos((o) => ({ ...o, [d.piece]: { x: Math.max(20, Math.min(280, q.x + d.dx)), y: Math.max(20, Math.min(280, q.y + d.dy)) } }));
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const at = pos[d.piece], t = TARGET[d.piece];
    if (Math.hypot(at.x - t.x, at.y - t.y) < 34) snap(d.piece);
  };
  const pick = (ps: Pose) => { setPose(ps); setSaid(null); pluck(7 + POSES.indexOf(ps), 0.6); };
  const reset = () => { setPos({ ...START }); setPlaced(new Set()); setPose(null); setSaid(null); };

  const P = pose ?? REST;
  // joints: shoulders at the body triangle's top corners, hips at the legs triangle's bottom corners
  const SL = { x: 118, y: 112 }, SR = { x: 182, y: 112 }, HL = { x: 124, y: 214 }, HR = { x: 176, y: 214 };
  const limb = (o: { x: number; y: number }, a1: number, a2: number, len: number, dir: 1 | -1, hand?: React.ReactNode) => (
    <g style={rot(a1, o.x, o.y)} className={s.joint}>
      <path d={`M${o.x} ${o.y}L${o.x + dir * 4} ${o.y + len}`} />
      <g style={rot(a2, o.x + dir * 4, o.y + len)} className={s.joint}>
        <path d={`M${o.x + dir * 4} ${o.y + len}L${o.x + dir * 6} ${o.y + len * 2}`} />
        {hand}
      </g>
    </g>
  );
  const handR = { x: SR.x + 6, y: SR.y + 52 };
  const prop = P.prop === 'sickle'
    ? <path d={`M${handR.x} ${handR.y}q10 6 8 18-10 6-14 0`} className={s.prop} />
    : P.prop === 'tarpa'
      ? <path d={`M${handR.x} ${handR.y}l18 26`} className={s.prop} />
      // the bow crosses the arm at the hand: across the forearm, which points down before it turns
      : P.prop === 'bow' ? <path d={`M${handR.x - 20} ${handR.y - 2}q20 18 40 0M${handR.x - 20} ${handR.y - 2}h40`} className={s.prop} /> : null;

  const info = said ?? (pose ? pose.note : placed.size ? NAMES[[...placed].pop()!].note : 'Drag the circle and the two triangles onto the dotted outline.');
  return (
    <div className={p.play}>
      <div className={p.body}>
        <div className={`${p.stage} ${s.stage}`}>
          <svg ref={svg} viewBox="0 0 300 300" role="img" aria-label={whole ? `A Warli person${pose ? `, ${pose.label.toLowerCase()}` : ''}` : `A dotted outline of a person; ${placed.size} of 3 shapes placed`}
            onPointerMove={move} onPointerUp={up} onPointerCancel={up} className={s.svg}>
            <rect width="300" height="300" fill="#9A4224" />
            {/* the outline to fill */}
            <g className={s.ghost}>
              <circle cx="150" cy="86" r="18" />
              <path d="M114 112h72l-36 50ZM150 162l32 52h-64Z" />
            </g>
            {/* limbs, painted on once the body is whole */}
            <g className={`${s.limbs} ${whole ? s.on : ''} ${P.bob && whole ? s.bob : ''}`} key={whole ? 'w' : 'p'}>
              {limb(SL, P.arms[0], P.arms[1], 26, -1)}
              {limb(SR, -P.arms[2], -P.arms[3], 26, 1, prop)}
              {limb(HL, P.legs[0], P.legs[1], 20, -1)}
              {limb(HR, -P.legs[2], -P.legs[3], 20, 1)}
            </g>
            {/* the three shapes */}
            {(['legs', 'body', 'head'] as Piece[]).map((k) => {
              const at = pos[k], t = TARGET[k], done = placed.has(k);
              return (
                <g key={k} onPointerDown={down(k)} className={`${s.piece} ${done ? s.placed : ''}`} style={{ transform: `translate(${at.x - t.x}px, ${at.y - t.y}px)` }}>
                  {k === 'head' ? <circle cx="150" cy="86" r="18" /> : k === 'body' ? <path d="M114 112h72l-36 50Z" /> : <path d="M150 162l32 52h-64Z" />}
                </g>
              );
            })}
          </svg>
        </div>
        <div className={p.info}>
          <div className={p.btns} role="group" aria-label="Shapes">
            {(['head', 'body', 'legs'] as Piece[]).map((k) => (
              <button key={k} type="button" className={`${p.btn} ${placed.has(k) ? p.ghost : ''}`} disabled={placed.has(k)} onClick={() => snap(k)}>
                {NAMES[k].shape === 'circle' ? '●' : k === 'body' ? '▼' : '▲'} {NAMES[k].name}
              </button>
            ))}
          </div>
          {/* until the figure is whole its chips are disabled, so the rail itself takes focus (it scrolls on phones) */}
          <div role="group" aria-label="What they do" className={p.chips} tabIndex={whole ? undefined : 0}>
            {POSES.map((ps) => (
              <button key={ps.id} type="button" className={p.chip} aria-pressed={pose?.id === ps.id} disabled={!whole} onClick={() => pick(ps)}>
                <b>{ps.name}</b><span>{ps.label}</span>
              </button>
            ))}
          </div>
          <div aria-live="polite" className={s.card}>
            <p className={p.name}><b>{whole ? (pose ? pose.name : 'Ban gaya!') : `${placed.size} of 3`}</b></p>
            <p className={p.note}>{info}</p>
          </div>
          {placed.size > 0 && <button type="button" className={`${p.btn} ${p.ghost}`} onClick={reset}>Start again</button>}
        </div>
      </div>
    </div>
  );
}
