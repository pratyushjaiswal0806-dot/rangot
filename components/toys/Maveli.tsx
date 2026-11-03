// King Mahabali (Maveli), who Onam welcomes home, strolls across under his palm-leaf umbrella when
// a pookalam is finished: walks in, stops to admire it and wave, walks on. Poster style, pure SVG
// + CSS. With reduced motion he simply appears for a moment.
import s from './Maveli.module.css';

const INK = '#1B1410', HALDI = '#FFC21A', IVORY = '#FBF3E4', SKIN = '#C98A5A', GOLD = '#E8A317', SINDOOR = '#D63A2A';

export default function Maveli() {
  return (
    <div className={s.walk} aria-hidden="true">
      <svg viewBox="0 0 120 170" className={s.king}>
        {/* the olakkuda, a palm-leaf umbrella */}
        <g className={s.umbrella}>
          <path d="M60 22v58" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M14 34a46 26 0 0 1 92 0Z" fill={HALDI} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          {[24, 38, 52, 68, 82, 96].map((x) => <path key={x} d={`M60 9 ${x} 34`} stroke={INK} strokeWidth="1.4" />)}
          <circle cx="60" cy="9" r="3.5" fill={GOLD} stroke={INK} strokeWidth="2" />
        </g>
        {/* body: a round belly in a white mundu with a gold border */}
        <ellipse cx="60" cy="112" rx="26" ry="24" fill={SKIN} stroke={INK} strokeWidth="3" />
        <path d="M36 122h48l6 34H30Z" fill={IVORY} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M33 150h54" stroke={GOLD} strokeWidth="4" />
        <path d="M44 100q16 10 32 0" fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round" />
        {/* legs, stepping */}
        <path className={s.legL} d="M48 156v10" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <path className={s.legR} d="M72 156v10" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        {/* the arm that waves, and the one holding the umbrella */}
        <path d="M62 84c-6 4-6 10-2 14" fill="none" stroke={SKIN} strokeWidth="7" strokeLinecap="round" />
        <g className={s.wave}><path d="M84 104c10-6 14-16 12-26" fill="none" stroke={SKIN} strokeWidth="7" strokeLinecap="round" /><circle cx="96" cy="76" r="5" fill={SKIN} stroke={INK} strokeWidth="2" /></g>
        {/* head: a big moustache and a tall golden crown */}
        <circle cx="60" cy="74" r="15" fill={SKIN} stroke={INK} strokeWidth="3" />
        <path d="M44 80q8 6 16 0 8 6 16 0-4 8-16 4-12 4-16-4Z" fill={INK} />
        <circle cx="54" cy="70" r="1.8" fill={INK} /><circle cx="66" cy="70" r="1.8" fill={INK} />
        <path d="M46 62l4-20 5 10 5-14 5 14 5-10 4 20Z" fill={GOLD} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="60" cy="54" r="2.5" fill={SINDOOR} />
      </svg>
    </div>
  );
}
