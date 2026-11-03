// Cheenti (चींटी, "ant"): the site's guide. A little ant from the kolam story, the one who
// comes for breakfast when a kolam is drawn in rice flour. Poster style like the rest of the site:
// ink outline, haldi scarf, a rice grain for later. Pure SVG + CSS (Cheenti.module.css), so it
// renders on the server too; each pose is a class that turns the limbs, and each pose has a
// little loop (blinks, antennae, waving) that's off with reduced motion, leaving the pose itself.
import s from './Cheenti.module.css';

export type CheentiPose = 'idle' | 'wave' | 'cheer' | 'eat' | 'peek' | 'point' | 'walk' | 'talk' | 'sleep';

const INK = '#1B1410', BODY = '#7A3E22', SHINE = '#A35A33', HALDI = '#FFC21A', SINDOOR = '#D63A2A', IVORY = '#FBF3E4';
const limb = { fill: 'none', stroke: INK, strokeWidth: 3.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
// a limb as a bent stick with a round hand or foot, hinged at (x, y) (its CSS transform-origin)
function Limb({ x, y, d, end, cls }: { x: number; y: number; d: string; end: [number, number]; cls: string }) {
  return (
    <g className={cls} style={{ transformOrigin: `${x}px ${y}px` }}>
      <path d={`M${x} ${y}${d}`} {...limb} />
      <circle cx={end[0]} cy={end[1]} r="2.6" fill={BODY} stroke={INK} strokeWidth="2" />
    </g>
  );
}

export default function Cheenti({ pose = 'idle', className = '', title }: { pose?: CheentiPose; className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 100 124" className={`${s.ant} ${s[pose]} ${className}`} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <g className={s.body}>
        {/* legs */}
        <Limb cls={s.legL} x={44} y={104} d="l-3 8l-3 3" end={[37, 116]} />
        <Limb cls={s.legR} x={56} y={104} d="l3 8l3 3" end={[63, 116]} />
        {/* abdomen with a shine and stripes */}
        <ellipse cx="50" cy="88" rx="21" ry="19" fill={BODY} stroke={INK} strokeWidth="3" />
        <path d="M33 82q17 7 34 0M32 92q18 7 36 0" fill="none" stroke={INK} strokeWidth="1.8" opacity=".55" />
        <ellipse cx="42" cy="79" rx="5" ry="3" fill={SHINE} transform="rotate(-25 42 79)" />
        {/* lower arms (behind the scarf) */}
        <Limb cls={s.armLL} x={42} y={67} d="l-6 6l1 6" end={[37, 79]} />
        <Limb cls={s.armLR} x={58} y={67} d="l6 6l-1 6" end={[63, 79]} />
        {/* thorax and scarf */}
        <ellipse cx="50" cy="63" rx="11" ry="8.5" fill={BODY} stroke={INK} strokeWidth="3" />
        <g className={s.scarf}>
          <path d="M60 58c6 3 10 9 16 9-2 4-7 5-11 3-3-2-5-6-7-8Z" fill={HALDI} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        </g>
        <path d="M38 55q12 7 24 0l1 5q-13 7-26 0Z" fill={HALDI} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        {[42, 50, 58].map((x) => <circle key={x} cx={x} cy={59.4} r="1.2" fill={SINDOOR} />)}
        {/* upper arms */}
        <Limb cls={s.armUL} x={41} y={60} d="l-4 8l1 7" end={[38, 75]} />
        <Limb cls={s.armUR} x={59} y={60} d="l4 8l-1 7" end={[62, 75]} />
        {/* the rice grain she carries for later (in her hands when eating) */}
        <ellipse className={s.grain} cx="50" cy="77" rx="4.4" ry="2.6" fill={IVORY} stroke={INK} strokeWidth="1.6" style={{ transformOrigin: '50px 77px' }} />
        {/* head */}
        <g className={s.head} style={{ transformOrigin: '50px 56px' }}>
          <g className={s.antL} style={{ transformOrigin: '44px 22px' }}>
            <path d="M44 22C40 14 36 10 31 8" {...limb} strokeWidth="2.6" />
            <circle cx="30.5" cy="7.5" r="3.6" fill={HALDI} stroke={INK} strokeWidth="2" />
          </g>
          <g className={s.antR} style={{ transformOrigin: '56px 22px' }}>
            <path d="M56 22C60 14 64 10 69 8" {...limb} strokeWidth="2.6" />
            <circle cx="69.5" cy="7.5" r="3.6" fill={HALDI} stroke={INK} strokeWidth="2" />
          </g>
          <circle cx="50" cy="38" r="19" fill={BODY} stroke={INK} strokeWidth="3" />
          <ellipse cx="42" cy="27" rx="6" ry="3.4" fill={SHINE} transform="rotate(-20 42 27)" />
          <circle cx="36.5" cy="45" r="3.2" fill="#E8457F" opacity=".5" />
          <circle cx="63.5" cy="45" r="3.2" fill="#E8457F" opacity=".5" />
          <g className={s.eyes} style={{ transformOrigin: '50px 37px' }}>
            <ellipse cx="42.5" cy="36" rx="5.6" ry="6.6" fill={IVORY} stroke={INK} strokeWidth="2" />
            <ellipse cx="57.5" cy="36" rx="5.6" ry="6.6" fill={IVORY} stroke={INK} strokeWidth="2" />
            <g className={s.pupils}>
              <circle cx="43.4" cy="37.4" r="3.1" fill={INK} /><circle cx="56.6" cy="37.4" r="3.1" fill={INK} />
              <circle cx="44.6" cy="35.9" r="1" fill={IVORY} /><circle cx="57.8" cy="35.9" r="1" fill={IVORY} />
            </g>
          </g>
          {/* closed eyes, for sleeping */}
          <path className={s.shut} d="M37.5 37q5 3.5 10 0M52.5 37q5 3.5 10 0" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
          <path className={s.mouth} d="M44.5 46.5q5.5 5 11 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" style={{ transformOrigin: '50px 47px' }} />
          <ellipse className={s.open} cx="50" cy="48" rx="3.6" ry="3" fill={SINDOOR} stroke={INK} strokeWidth="2" style={{ transformOrigin: '50px 48px' }} />
        </g>
      </g>
      {/* zzz, for sleeping */}
      <g className={s.zzz} fill={IVORY} stroke={INK} strokeWidth="1" fontFamily="Sarpanch, sans-serif" fontWeight="900">
        <text x="70" y="22" fontSize="11">z</text><text x="78" y="13" fontSize="9">z</text><text x="85" y="6" fontSize="7">z</text>
      </g>
    </svg>
  );
}
