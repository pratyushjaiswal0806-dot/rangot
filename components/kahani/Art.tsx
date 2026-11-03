// Little poster-style pictures for story chapters: thick ink outlines, haldi, sindoor and ivory.
// Decorative only (the chapter text says it all), so they are aria-hidden. Every one comes alive:
// it builds itself when its chapter scrolls in, then keeps a small loop going while it's on screen
// (a door swings open, ants march off with the flour, a lorry bounces, an eye blinks). The motion
// is all CSS (Art.module.css), so these still render on the server; with reduced motion each
// picture simply stands there, finished. Animated parts never carry an SVG transform attribute
// themselves (a CSS transform-origin would throw it off), so rotated copies are wrapped in a <g>.
import type { CSSProperties, ReactNode } from 'react';
import a from './Art.module.css';

const INK = '#1B1410', HALDI = '#FFC21A', SINDOOR = '#D63A2A', IVORY = '#FBF3E4', MAROON = '#7A0E3A', LEAF = '#2F6B3B';
const line = { fill: 'none', stroke: INK, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

// CSS custom properties for a class: i = entrance order, j = loop offset, t = loop length,
// a = sway angle, s = pulse size, y = bob height, from = where a slide starts, wait = loop start
const v = (o: Record<string, string | number>): CSSProperties => Object.fromEntries(Object.entries(o).map(([k, x]) => ['--' + k, x]));
// an origin in the picture's own 120-unit space, plus any of the above
const at = (x: number, y: number, o: Record<string, string | number> = {}): CSSProperties => ({ transformBox: 'view-box', transformOrigin: `${x}px ${y}px`, ...v(o) });
const lit = (cls: string, x: number, y: number, o: Record<string, string | number> = {}) => ({ className: cls, style: at(x, y, o) });

export type ArtId =
  | 'door' | 'broom' | 'book' | 'legend' | 'map' | 'sun' | 'dots' | 'ants' | 'grid' | 'flower' | 'crown' | 'thumba' | 'knot' | 'cloth'
  | 'waves' | 'block' | 'vat' | 'ship' | 'brush' | 'letter' | 'film' | 'truck' | 'eye' | 'camera' | 'backdrop' | 'pillar' | 'note'
  | 'cradle' | 'diyas' | 'stambh' | 'sparkler' | 'flask' | 'matchbox' | 'torch' | 'puppet' | 'dholak' | 'reed' | 'sword' | 'shadow'
  | 'hut' | 'shapes' | 'tarpa' | 'chauk' | 'paper'
  | 'kite' | 'cut' | 'spool' | 'bird' | 'flag';

// A Warli person in rice-paste white: a circle on two triangles that meet at the waist, arms up or out
const GERU = '#9A4224', PASTE = '#F6EEDB';
function warliMan(x: number, y: number, k = 1, up = false) {
  const p = (a: number, b: number) => `${(x + a * k).toFixed(1)} ${(y + b * k).toFixed(1)}`;
  return (
    <g fill={PASTE} stroke={PASTE} strokeWidth={1.6 * k} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={x} cy={y - 10 * k} r={3 * k} stroke="none" />
      <path d={`M${p(-5, -6)}L${p(5, -6)}L${p(0, 0)}ZM${p(0, 0)}L${p(4.5, 6)}L${p(-4.5, 6)}Z`} />
      <path d={`M${p(-3, 6)}L${p(-5, 10)}L${p(-3.5, 14)}M${p(3, 6)}L${p(5, 10)}L${p(3.5, 14)}`} fill="none" />
      <path d={up ? `M${p(-5, -6)}L${p(-8, -9)}L${p(-8, -14)}M${p(5, -6)}L${p(8, -9)}L${p(8, -14)}` : `M${p(-5, -6)}L${p(-9, -2)}L${p(-12, -4)}M${p(5, -6)}L${p(9, -2)}L${p(12, -4)}`} fill="none" />
    </g>
  );
}

// A little fighter kite (a diamond with a curved top and a paper tab), its middle at x, y
function kiteShape(x: number, y: number, k: number, a: string, b: string) {
  const d = `M${x} ${y - 14 * k}Q${x + 8 * k} ${y - 6 * k} ${x + 13 * k} ${y - 2 * k}L${x} ${y + 14 * k}L${x - 13 * k} ${y - 2 * k}Q${x - 8 * k} ${y - 6 * k} ${x} ${y - 14 * k}Z`;
  return (
    <g strokeLinejoin="round">
      <path d={d} fill={a} />
      <path d={`M${x} ${y - 14 * k}Q${x + 8 * k} ${y - 6 * k} ${x + 13 * k} ${y - 2 * k}L${x} ${y + 14 * k}Z`} fill={b} />
      <path d={d} fill="none" stroke={INK} strokeWidth={2.2 * k} />
      <path d={`M${x} ${y - 14 * k}V${y + 14 * k}M${x - 13 * k} ${y - 2 * k}Q${x} ${y - 10 * k} ${x + 13 * k} ${y - 2 * k}`} fill="none" stroke={INK} strokeWidth={1.2 * k} opacity=".55" />
      <path d={`M${x} ${y + 12 * k}l${3.5 * k} ${5 * k}h${-7 * k}Z`} fill={b} stroke={INK} strokeWidth={1.4 * k} />
    </g>
  );
}

// u keeps ids unique when a picture shows up twice on one page (the story and its picture book)
const ART: Record<ArtId, (u: string) => ReactNode> = {
  // an arched doorway, its doors swinging open, with a flower rangoli on the step
  door: () => (
    <>
      <g className={a.inRise}>
        <path d="M30 96V44a30 30 0 0 1 60 0v52Z" fill={SINDOOR} stroke={INK} strokeWidth="3" />
        <path d="M42 96V48a18 18 0 0 1 36 0v48Z" fill={MAROON} stroke={INK} strokeWidth="3" />
        <path className={a.door} style={at(42, 63)} d="M42 96V48a18 18 0 0 1 18-18v66Z" fill="#B4542A" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path className={a.door} style={at(78, 63)} d="M78 96V48a18 18 0 0 0-18-18v66Z" fill="#B4542A" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      </g>
      <path d="M8 96h104" {...line} />
      <g {...lit(a.lpSpin, 60, 106, { t: '24s' })}>
        {[0, 1, 2, 3, 4, 5].map((k) => <g key={k} transform={`rotate(${k * 30} 60 106)`}><ellipse className={a.inPop} style={v({ i: 6 + k })} cx="60" cy="106" rx="9" ry="4" fill={HALDI} stroke={INK} strokeWidth="2" /></g>)}
      </g>
      <circle className={a.inPop} style={v({ i: 12 })} cx="60" cy="106" r="3.5" fill={SINDOOR} stroke={INK} strokeWidth="2" />
    </>
  ),
  // a grass broom sweeping powder away
  broom: () => (
    <>
      <g {...lit(a.inSwing, 86, 12)}>
        <g {...lit(a.lpSweep, 86, 12, { t: '2.6s' })}>
          <path d="M86 12 58 70" {...line} strokeWidth="5" />
          <path d="M58 70 30 98l18 6 10-10 6 12 8-30Z" fill={HALDI} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M44 88 38 100M52 88 50 104M60 86l2 14" {...line} strokeWidth="2" />
        </g>
      </g>
      {[[14, 104, SINDOOR], [22, 92, '#C93A82'], [12, 88, HALDI], [26, 108, LEAF], [8, 98, '#E8761E']].map(([x, y, c], i) => (
        <circle key={i} className={a.lpScatter} style={v({ j: i, t: '2.6s' })} cx={x as number} cy={y as number} r="3.5" fill={c as string} stroke={INK} strokeWidth="1.5" />
      ))}
    </>
  ),
  // an open notebook of patterns, a page turning over now and then
  book: () => (
    <>
      <path {...lit(a.inOpen, 60, 64)} d="M60 30C46 22 28 22 12 26v70c16-4 34-4 48 4Z" fill={IVORY} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path {...lit(a.inOpen, 60, 64)} d="M60 30c14-8 32-8 48-4v70c-16-4-34-4-48 4Z" fill={IVORY} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {[[26, 48], [42, 48], [26, 66], [42, 66]].map(([x, y], k) => <circle key={x + '' + y} className={a.inPop} style={v({ i: 3 + k })} cx={x} cy={y} r="2.5" fill={INK} />)}
      <path className={a.inDraw} style={v({ i: 6 })} pathLength={1} d="M34 40c8 0 8 8 8 8s0 8 8 8c-8 0-8 8-8 8s0 8-8 8c0-8-8-8-8-8s-8 0-8-8c8 0 8-8 8-8s0-8 8-8Z" fill="none" stroke={SINDOOR} strokeWidth="2.5" />
      <path className={a.inDraw} style={v({ i: 8 })} pathLength={1} d="M72 44h24M72 54h20M72 64h24M72 74h16" {...line} strokeWidth="2" />
      <path {...lit(a.lpPage, 60, 64, { t: '6s' })} d="M60 30c14-8 32-8 48-4v70c-16-4-34-4-48 4Z" fill="#FFF8EA" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    </>
  ),
  // a lotus with rays: the old legend
  legend: () => (
    <>
      <g {...lit(a.lpSpin, 60, 60, { t: '40s' })}>
        {Array.from({ length: 12 }, (_, k) => <g key={k} transform={`rotate(${k * 30} 60 60)`}><path {...lit(a.inGrow, 60, 60, { i: k * 0.3 })} d="M60 60 60 10" stroke={HALDI} strokeWidth="5" strokeLinecap="round" /></g>)}
      </g>
      <circle className={a.inPop} style={v({ i: 2 })} cx="60" cy="60" r="30" fill={IVORY} stroke={INK} strokeWidth="3" />
      <g {...lit(a.lpPulse, 60, 82, { s: 1.06, t: '3.4s' })}>
        <path {...lit(a.inUnroll, 60, 82, { i: 5 })} d="M60 82c-10-8-12-22 0-34 12 12 10 26 0 34Z" fill="#E86A92" stroke={INK} strokeWidth="2.5" />
        <path {...lit(a.inUnroll, 60, 82, { i: 6 })} d="M60 82c-14 0-24-10-26-22 12 0 22 8 26 22Zm0 0c14 0 24-10 26-22-12 0-22 8-26 22Z" fill="#F29BB5" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      </g>
      <path d="M36 84h48" {...line} />
    </>
  ),
  // one word, many scripts, popping up one after another
  map: () => (
    <>
      <g className={a.inPop}><g className={a.lpBob} style={v({ j: 0 })}>
        <path d="M10 18h58v28H30l-10 10V46H10Z" fill={HALDI} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <text x="39" y="38" textAnchor="middle" fontSize="15" fontWeight="700" fill={INK}>கோலம்</text>
      </g></g>
      <g className={a.inPop} style={v({ i: 3 })}><g className={a.lpBob} style={v({ j: 3 })}>
        <path d="M52 52h58v28h-10v10L90 80H52Z" fill={SINDOOR} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <text x="81" y="72" textAnchor="middle" fontSize="15" fontWeight="700" fill={IVORY}>আলপনা</text>
      </g></g>
      <g className={a.inPop} style={v({ i: 6 })}><g className={a.lpBob} style={v({ j: 6 })}>
        <path d="M14 76h44v26H28l-8 8v-8h-6Z" fill={IVORY} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <text x="36" y="94" textAnchor="middle" fontSize="13" fontWeight="700" fill={INK}>मांडणा</text>
      </g></g>
    </>
  ),
  // the sun coming up behind a doorstep
  sun: (u) => (
    <>
      <defs><clipPath id={`art-sun${u}`}><rect x="0" y="0" width="120" height="74" /></clipPath></defs>
      <g clipPath={`url(#art-sun${u})`}>
        <g className={a.inSlide} style={v({ from: '0 46px' })}>
          <g {...lit(a.lpSway, 60, 74, { a: '5deg', t: '6s' })}>
            {Array.from({ length: 9 }, (_, k) => <path key={k} d="M60 74 60 30" stroke={HALDI} strokeWidth="5" strokeLinecap="round" transform={`rotate(${-80 + k * 20} 60 74)`} />)}
          </g>
          <path d="M32 74a28 28 0 0 1 56 0Z" fill={SINDOOR} stroke={INK} strokeWidth="3" />
        </g>
      </g>
      <path d="M6 74h108" {...line} />
      <path d="M22 86h76l8 14H14Z" fill={IVORY} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {[38, 52, 66, 80].map((x, k) => <circle key={x} className={a.inPop} style={v({ i: 6 + k })} cx={x} cy="93" r="2.5" fill={INK} />)}
    </>
  ),
  // a 3 × 3 grid of pulli with a line weaving round it
  dots: () => (
    <>
      <rect x="10" y="10" width="100" height="100" fill={MAROON} stroke={INK} strokeWidth="3" />
      <path className={a.inDraw} style={v({ i: 4 })} pathLength={1} d="M60 22C76 22 98 44 98 60S76 98 60 98 22 76 22 60 44 22 60 22Zm0 18c8 0 20 12 20 20s-12 20-20 20-20-12-20-20 12-20 20-20Z" fill="none" stroke={IVORY} strokeWidth="3.5" fillRule="evenodd" />
      <path className={a.inDraw} style={v({ i: 10 })} pathLength={1} d="M40 40 80 80M80 40 40 80" stroke={IVORY} strokeWidth="3.5" strokeLinecap="round" />
      {[34, 60, 86].flatMap((x) => [34, 60, 86].map((y) => [x, y])).map(([x, y], k) => (
        <g key={x + '-' + y} className={a.lpTwinkle} style={v({ j: k, t: '2.8s' })}><circle className={a.inPop} style={v({ i: k * 0.35 })} cx={x} cy={y} r="4" fill={HALDI} stroke={INK} strokeWidth="1.5" /></g>
      ))}
    </>
  ),
  // a line of ants marching off with the rice flour
  ants: () => (
    <>
      <path className={a.inDraw} pathLength={1} d="M8 34c20-12 40 12 60 0s30-8 44-2" fill="none" stroke={IVORY} strokeWidth="9" strokeLinecap="round" />
      <path className={a.inFade} style={v({ i: 8 })} d="M8 34c20-12 40 12 60 0s30-8 44-2" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
      {[[22, 66, -12], [48, 78, 6], [74, 70, -8], [98, 84, 10]].map(([x, y, r], i) => (
        <g key={i} className={a.lpMarch} style={v({ j: i * 3, t: '4.6s', wait: '0s' })}>
          <g transform={`translate(${x} ${y}) rotate(${r})`}>
            <path className={a.lpLegs} style={v({ t: '.32s', wait: '0s', j: i })} d="M-8 -6 -12 -12M-2 -6l0 -8M4 -6l4 -8M-8 6l-4 6M-2 6v8M4 6l4 7" {...line} strokeWidth="1.8" />
            <ellipse cx="-9" cy="0" rx="6" ry="5" fill={INK} /><ellipse cx="0" cy="0" rx="4" ry="3.5" fill={INK} /><ellipse cx="9" cy="0" rx="5" ry="4" fill={INK} />
            <circle cx="13" cy="-6" r="3" fill={IVORY} stroke={INK} strokeWidth="1.5" />
          </g>
        </g>
      ))}
    </>
  ),
  // a kolam on graph paper, the way a mathematician would draw it
  grid: () => (
    <>
      <rect x="10" y="10" width="100" height="100" fill={IVORY} stroke={INK} strokeWidth="3" />
      {[30, 50, 70, 90].map((g, k) => <path key={g} className={a.inFade} style={v({ i: k * 0.5 })} d={`M${g} 12v96M12 ${g}h96`} stroke="#9BB7D4" strokeWidth="1.2" />)}
      <path className={a.inDraw} style={v({ i: 4 })} pathLength={1} d="M60 24 96 60 60 96 24 60Z" fill="none" stroke={SINDOOR} strokeWidth="3" strokeLinejoin="round" />
      <path className={a.inDraw} style={v({ i: 9 })} pathLength={1} d="M42 42 78 78M78 42 42 78" stroke={SINDOOR} strokeWidth="3" strokeLinecap="round" />
      {[[60, 40], [40, 60], [80, 60], [60, 80], [60, 60]].map(([x, y], k) => (
        <g key={x + '-' + y} className={a.lpPulse} style={v({ j: k, s: 1.35, t: '2.4s' })}><circle className={a.inPop} style={v({ i: 2 + k * 0.5 })} cx={x} cy={y} r="3.5" fill={INK} /></g>
      ))}
      <text className={a.inFade} style={v({ i: 12 })} x="96" y="104" textAnchor="end" fontSize="11" fontWeight="800" fontFamily="Sarpanch, sans-serif" fill={INK}>n = 5</text>
    </>
  ),
  // a pookalam seen from above, ring inside ring, slowly turning
  flower: () => (
    <>
      <circle className={a.inPop} cx="60" cy="60" r="50" fill="#E8761E" stroke={INK} strokeWidth="3" />
      <g {...lit(a.lpSpin, 60, 60, { t: '36s' })}>
        {Array.from({ length: 16 }, (_, k) => <g key={k} transform={`rotate(${k * 22.5} 60 60)`}><path className={a.inPop} style={v({ i: 2 + k * 0.15 })} d="M60 14 66 28H54Z" fill={k % 2 ? SINDOOR : HALDI} /></g>)}
      </g>
      <circle className={a.inPop} style={v({ i: 5 })} cx="60" cy="60" r="32" fill={HALDI} stroke={INK} strokeWidth="2.5" />
      <g {...lit(`${a.lpSpin} ${a.rev}`, 60, 60, { t: '28s' })}>
        {Array.from({ length: 8 }, (_, k) => <g key={k} transform={`rotate(${k * 45} 60 60)`}><ellipse className={a.inPop} style={v({ i: 6 + k * 0.2 })} cx="60" cy="38" rx="6" ry="9" fill={IVORY} stroke={INK} strokeWidth="1.5" /></g>)}
      </g>
      <circle className={a.inPop} style={v({ i: 9 })} cx="60" cy="60" r="12" fill={MAROON} stroke={INK} strokeWidth="2.5" />
      <circle className={a.inPop} style={v({ i: 10 })} cx="60" cy="60" r="5" fill={LEAF} />
    </>
  ),
  // a crown under a palm-leaf umbrella: the king who comes home
  crown: () => (
    <>
      <g {...lit(a.inOpen, 60, 46)}>
        <g {...lit(a.lpSway, 60, 60, { a: '3deg', t: '4s' })}>
          <path d="M14 46a46 34 0 0 1 92 0Z" fill={HALDI} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          {[26, 40, 54, 66, 80, 94].map((x) => <path key={x} d={`M60 14 ${x} 46`} stroke={INK} strokeWidth="1.5" />)}
          <path d="M60 46v14" {...line} />
        </g>
      </g>
      <g className={a.inRise} style={v({ i: 4 })}>
        <path d="M32 100V68l14 12 14-20 14 20 14-12v32Z" fill={HALDI} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M32 92h56" {...line} strokeWidth="2.5" />
        {[46, 60, 74].map((x, k) => <circle key={x} className={a.lpTwinkle} style={v({ j: k * 2, t: '2.2s' })} cx={x} cy="86" r="3.5" fill={SINDOOR} stroke={INK} strokeWidth="1.5" />)}
      </g>
    </>
  ),
  // sprigs of tiny white thumba flowers, swaying
  thumba: () => (
    <g {...lit(a.lpSway, 62, 108, { a: '3deg', t: '4.6s' })}>
      <path className={a.inDraw} pathLength={1} d="M40 108C40 80 34 60 26 40M62 108c0-30 4-52 12-72M84 108c0-24-4-40-12-56" {...line} stroke={LEAF} strokeWidth="4" />
      {[[26, 40], [74, 36], [72, 52], [36, 70], [64, 72], [86, 80]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <g className={a.inPop} style={v({ i: 6 + i * 0.6 })}>
            <path d="M-9 -4c0-8 18-8 18 0 0 6-6 10-9 10s-9-4-9-10Z" fill={IVORY} stroke={INK} strokeWidth="2" />
            <path d="M-4 -6h8" stroke={INK} strokeWidth="1.5" />
          </g>
        </g>
      ))}
      <path className={a.inPop} style={v({ i: 4 })} d="M44 92c-10-2-16-8-18-14 10 0 16 6 18 14Zm38-4c10-2 16-8 18-14-10 0-16 6-18 14Z" fill={LEAF} stroke={INK} strokeWidth="2" />
    </g>
  ),
  // cloth pinched into little tied knots
  knot: () => (
    <>
      <path {...lit(a.inUnroll, 60, 22)} d="M12 26c20-10 76-10 96 0v70c-20 10-76 10-96 0Z" fill={SINDOOR} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {[[34, 44], [60, 40], [86, 44], [46, 64], [74, 64], [34, 84], [60, 82], [86, 84]].map(([x, y], i) => (
        <g key={i} className={a.inPop} style={v({ i: 3 + i * 0.5 })}>
          <g className={a.lpPulse} style={v({ j: i, s: 1.12, t: '2.4s' })}>
            <circle cx={x} cy={y} r="6.5" fill={IVORY} stroke={INK} strokeWidth="2" />
            <path d={`M${x - 6} ${y + 1}h12M${x - 5} ${y + 4}h10`} stroke={HALDI} strokeWidth="2" />
          </g>
        </g>
      ))}
      <path {...lit(a.lpSway, 86, 84, { a: '9deg', t: '2.2s' })} d="M86 84c8 10 16 14 26 14" {...line} stroke={HALDI} strokeWidth="2.5" />
    </>
  ),
  // a red wedding odhni with bandhani dots in squares, rippling
  cloth: () => (
    <g {...lit(a.lpWave, 60, 18, { t: '4s' })}>
      <path {...lit(a.inUnroll, 60, 18)} d="M16 18h88l-8 90H24Z" fill="#B3122A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path className={a.inFade} style={v({ i: 3 })} d="M20 40h82M22 62h78M24 84h74M44 20l-4 86M62 18v90M80 20l4 86" stroke={HALDI} strokeWidth="2" />
      {[[31, 29], [53, 29], [71, 29], [91, 29], [31, 51], [53, 51], [71, 51], [90, 51], [32, 73], [53, 73], [71, 73], [89, 73], [33, 95], [53, 95], [71, 95], [87, 95]].map(([x, y], i) => (
        <g key={i} className={a.inPop} style={v({ i: 4 + i * 0.15 })}>
          <g className={a.lpTwinkle} style={v({ j: (i * 7) % 11, t: '2.6s' })} fill={IVORY}><circle cx={x - 3} cy={y} r="2" /><circle cx={x + 3} cy={y} r="2" /><circle cx={x} cy={y - 3} r="2" /><circle cx={x} cy={y + 3} r="2" /></g>
        </g>
      ))}
    </g>
  ),
  // leheriya: waves of colour on the slant, flowing
  waves: (u) => (
    <>
      <defs><clipPath id={`art-waves${u}`}><rect x="12" y="12" width="96" height="96" /></clipPath></defs>
      <rect x="12" y="12" width="96" height="96" fill={HALDI} />
      <g clipPath={`url(#art-waves${u})`}>
        <g className={a.inSlide} style={v({ from: '-30px 30px' })}>
          <g className={a.lpFlow} style={v({ t: '6s', wait: '.9s' })}>
            {[-108, -84, -60, -36, -12, 12, 36, 60, 84, 108, 132, 156].map((d, i) => <path key={d} d={`M${d} 120 ${d + 108} 12`} stroke={i % 2 ? SINDOOR : LEAF} strokeWidth="9" />)}
          </g>
        </g>
      </g>
      <rect x="12" y="12" width="96" height="96" fill="none" stroke={INK} strokeWidth="3" />
    </>
  ),
  // a carved wooden block, pressing again and again, and the prints it leaves
  block: () => (
    <>
      <g className={a.lpPress} style={v({ t: '2.8s' })}>
        <g className={a.inDrop}>
          <path d="M50 10h20v18H50Z" fill="#B4542A" stroke={INK} strokeWidth="3" />
          <path d="M22 28h76v22H22Z" fill="#C98A4B" stroke={INK} strokeWidth="3" />
          <path d="M22 50h76" stroke="#7A3D17" strokeWidth="5" />
        </g>
      </g>
      <path d="M8 72h104v40H8Z" fill={IVORY} stroke={INK} strokeWidth="3" />
      {[26, 60, 94].map((x, i) => (
        <g key={x} transform={`translate(${x} 92)`}>
          <g className={a.inPop} style={v({ i: 4 + i * 2 })}>
            <path d="M0 -12c8 0 12 8 6 14S-8 8-8 0s4-12 8-12Z" fill={SINDOOR} stroke={INK} strokeWidth="2" />
            <circle cx="-1" cy="-1" r="2.5" fill={INK} />
          </g>
        </g>
      ))}
    </>
  ),
  // a dye pot of indigo, with cloth hung to dry
  vat: () => (
    <>
      <path d="M8 22h104" {...line} />
      {([[16, '#2D4C7C'], [46, '#B4542A'], [76, IVORY]] as const).map(([x, c], i) => (
        <g key={x} {...lit(a.inUnroll, x + 14, 22, { i })}>
          <path {...lit(a.lpSway, x + 14, 22, { j: i * 2, a: '4deg', t: '3.6s' })} d={`M${x} 22h28v34l-6-4-8 6-8-6-6 4Z`} fill={c} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      ))}
      <path className={a.inRise} style={v({ i: 3 })} d="M22 72h76l-6 40H28Z" fill="#8A5A3A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <ellipse className={a.inRise} style={v({ i: 3 })} cx="60" cy="72" rx="38" ry="8" fill="#22375C" stroke={INK} strokeWidth="3" />
      <path {...lit(a.lpRipple, 60, 71, { t: '2.6s' })} d="M46 70c6 3 20 3 28 0" stroke="#5C7FB0" strokeWidth="2" fill="none" />
    </>
  ),
  // a sailing ship carrying bales of printed cloth, bobbing on the waves
  ship: () => (
    <>
      <path {...lit(a.lpSway, 60, 100, { a: '1.5deg', t: '3.2s' })} d="M6 100c12 6 24-6 36 0s24 6 36 0 24-6 36 0" {...line} stroke="#2D4C7C" />
      <g className={a.inSlide} style={v({ from: '-34px 0' })}>
        <g {...lit(a.lpBoat, 60, 92, { t: '3.2s' })}>
          <path d="M16 78h88l-12 18H28Z" fill="#B4542A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M60 78V12" {...line} />
          <path d="M60 16c22 6 34 24 36 54H60Z" fill={IVORY} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M58 26c-14 8-22 24-24 44h24Z" fill={IVORY} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          {[[70, 36], [82, 50], [70, 60], [46, 50]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill={SINDOOR} />)}
          <path d="M26 66h16v12H26Z" fill={HALDI} stroke={INK} strokeWidth="2" />
        </g>
      </g>
    </>
  ),
  // a sign painter's brush and paint tin, a drip falling
  brush: () => (
    <>
      <g className={a.inRise}>
        <path d="M20 66h40v42H20Z" fill="#9AA3AD" stroke={INK} strokeWidth="3" />
        <ellipse cx="40" cy="66" rx="20" ry="6" fill={SINDOOR} stroke={INK} strokeWidth="3" />
        <path d="M30 80h20" stroke={IVORY} strokeWidth="5" />
      </g>
      <g {...lit(a.inSwing, 104, 12, { i: 2 })}>
        <g {...lit(a.lpSway, 104, 12, { a: '4deg', t: '3s' })}>
          <path d="M104 12 66 64" {...line} strokeWidth="7" stroke={INK} />
          <path d="M104 12 66 64" stroke={HALDI} strokeWidth="3" strokeLinecap="round" />
          <path d="M70 58 58 74c-4 6 2 10 8 6l10-12Z" fill={SINDOOR} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      </g>
      <path className={a.inDraw} style={v({ i: 6 })} pathLength={1} d="M58 74c-6 10-4 22-2 30" {...line} stroke={SINDOOR} strokeWidth="4" />
      <circle className={a.lpFall} style={v({ t: '2.4s', wait: '1.6s' })} cx="56" cy="104" r="3" fill={SINDOOR} stroke={INK} strokeWidth="1.2" />
    </>
  ),
  // a big letter with a painted drop shadow and a highlight, coats sliding into place
  letter: () => (
    <>
      <rect className={a.inPop} x="10" y="10" width="100" height="100" fill={HALDI} stroke={INK} strokeWidth="3" />
      <g className={a.lpJitter} style={v({ t: '1.4s', j: 1 })}><text className={a.inSlide} style={v({ i: 4, from: '-6px -6px' })} x="66" y="96" textAnchor="middle" fontSize="88" fontWeight="700" fontFamily="'Palanquin Dark', sans-serif" fill={MAROON}>क</text></g>
      <g className={a.lpJitter} style={v({ t: '1.4s', j: 3 })}><text className={a.inSlide} style={v({ i: 6, from: '2px 2px' })} x="60" y="90" textAnchor="middle" fontSize="88" fontWeight="700" fontFamily="'Palanquin Dark', sans-serif" fill={IVORY}>क</text></g>
      <text className={a.inPop} style={v({ i: 2 })} x="62" y="92" textAnchor="middle" fontSize="88" fontWeight="700" fontFamily="'Palanquin Dark', sans-serif" fill={SINDOOR} stroke={INK} strokeWidth="2">क</text>
    </>
  ),
  // a cinema hoarding on its scaffold, stars twinkling
  film: () => (
    <>
      <path d="M26 84v28M94 84v28M26 98h68" {...line} />
      <g {...lit(a.inUnroll, 60, 14)}>
        <rect x="6" y="14" width="108" height="70" fill={SINDOOR} stroke={INK} strokeWidth="3" />
        <circle cx="40" cy="48" r="18" fill="#E8A07A" stroke={INK} strokeWidth="2.5" />
        <path d="M22 44c2-14 12-20 22-18s14 8 14 14c-10-6-26-6-36 4Z" fill={INK} />
        <path {...lit(a.inOpen, 64, 36, { i: 4 })} d="M64 30h40M64 42h34" stroke={HALDI} strokeWidth="7" />
        <path {...lit(a.inOpen, 64, 64, { i: 6 })} d="M64 58h42M64 70h28" stroke={IVORY} strokeWidth="4" />
      </g>
      {[[100, 22], [14, 76]].map(([x, y], k) => <path key={x} {...lit(a.lpSparkle, x, y, { j: k * 4, t: '1.8s' })} d={`M${x} ${y - 6}l2 4 4 2-4 2-2 4-2-4-4-2 4-2Z`} fill={HALDI} />)}
    </>
  ),
  // the back of a lorry, driving in and bouncing on its springs
  truck: () => (
    <g className={a.inSlide} style={v({ from: '-44px 0' })}>
      <g className={a.lpBounce} style={v({ t: '.9s' })}>
        <path d="M14 10h92v76H14Z" fill={HALDI} stroke={INK} strokeWidth="3" />
        <path d="M14 22h92M14 74h92" stroke={SINDOOR} strokeWidth="6" />
        <path d="M22 32h76v34H22Z" fill={IVORY} stroke={INK} strokeWidth="2.5" />
        <text x="60" y="46" textAnchor="middle" fontSize="11" fontWeight="900" fontFamily="Sarpanch, sans-serif" fill={SINDOOR}>HORN</text>
        <text x="60" y="60" textAnchor="middle" fontSize="11" fontWeight="900" fontFamily="Sarpanch, sans-serif" fill="#2D4C7C">OK PLEASE</text>
        <path d="M10 86h100v10H10Z" fill={INK} />
        {[22, 38, 54, 70, 86, 98].map((x, i) => <path key={x} {...lit(a.lpSway, x, 96, { j: i, a: '14deg', t: '1.1s' })} d={`M${x} 96v8`} stroke={x % 32 ? SINDOOR : HALDI} strokeWidth="3" />)}
      </g>
      {[30, 90].map((x) => (
        <g key={x}>
          <circle cx={x} cy="102" r="10" fill={INK} stroke="#555" strokeWidth="3" />
          <path {...lit(a.lpSpin, x, 102, { t: '1.1s', wait: '0s' })} d={`M${x - 6} 102h12M${x} 96v12`} stroke="#8C8C8C" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
    </g>
  ),
  // painted eyes that keep the evil eye away, blinking and glancing about
  eye: () => (
    <>
      {[34, 86].map((x, k) => (
        <g key={x} {...lit(a.inUnroll, x, 60, { i: k })}>
          <g {...lit(a.lpBlink, x, 60, { t: '4.2s', j: k * 0.4 })}>
            <path d={`M${x - 26} 60c10-18 42-18 52 0-10 18-42 18-52 0Z`} fill={IVORY} stroke={INK} strokeWidth="3" />
            <g className={a.lpLook} style={v({ t: '5s' })}>
              <circle cx={x} cy="60" r="10" fill="#2D4C7C" stroke={INK} strokeWidth="2.5" />
              <circle cx={x} cy="60" r="4" fill={INK} />
            </g>
            <path d={`M${x - 22} 50l-6-8M${x - 10} 45l-3-9M${x + 2} 43v-9M${x + 14} 45l3-9`} {...line} strokeWidth="2.5" />
          </g>
        </g>
      ))}
      <path className={a.inDraw} style={v({ i: 4 })} pathLength={1} d="M8 88c34 14 70 14 104 0" {...line} stroke={SINDOOR} strokeWidth="5" />
    </>
  ),
  // an old box camera on a tripod, under its black cloth; now and then the flash goes off
  camera: () => (
    <>
      <path className={a.inFade} d="M60 70 34 112M60 70l26 42M60 70v42" {...line} />
      <g className={a.inDrop} style={v({ i: 2 })}>
        <path d="M30 36h44v32H30Z" fill="#8A5A3A" stroke={INK} strokeWidth="3" />
        <path d="M74 42h18l8 8v4l-8 8H74Z" fill="#C98A4B" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="100" cy="52" r="5" fill="#2D4C7C" stroke={INK} strokeWidth="2" />
        <g {...lit(a.lpSway, 46, 12, { a: '2deg', t: '3.4s' })}>
          <path d="M30 36C24 20 34 8 50 10c14 2 20 12 24 26Z" fill={INK} />
          <path d="M22 40c-4 10-4 20 0 28h8V36Z" fill={INK} />
        </g>
      </g>
      <circle className={a.lpFlash} style={v({ t: '4s' })} cx="100" cy="52" r="15" fill={IVORY} stroke={HALDI} strokeWidth="2" />
    </>
  ),
  // a painted studio backdrop: lake, hills and a chair in front, clouds drifting
  backdrop: () => (
    <>
      <g {...lit(a.inUnroll, 60, 10)}>
        <rect x="8" y="10" width="104" height="74" fill="#BFD9FF" stroke={INK} strokeWidth="3" />
        <g className={a.lpDrift} style={v({ t: '7s' })}><ellipse cx="26" cy="22" rx="8" ry="3.2" fill={IVORY} /><ellipse cx="88" cy="18" rx="6" ry="2.6" fill={IVORY} /></g>
        <path d="M8 60 34 30l18 18 20-26 40 38v8H8Z" fill="#7FA88A" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M58 36l14-14 12 12" fill={IVORY} stroke={INK} strokeWidth="1.5" />
        <path d="M8 68h104v16H8Z" fill="#4D6FA3" />
        <path className={a.lpBob} style={v({ y: '-1px', t: '2.6s' })} d="M70 72h22l-4 6H74Z" fill="#8A5A3A" />
      </g>
      <path d="M8 84h104v26H8Z" fill="#B4542A" stroke={INK} strokeWidth="3" />
      <path className={a.inPop} style={v({ i: 5 })} d="M40 112V74h20v20h10v18" fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
    </>
  ),
  // a rock with an ancient inscription, carved one letter at a time
  pillar: () => (
    <>
      <path className={a.inRise} d="M10 106c-4-30 4-66 22-82 18-14 52-16 70 4 14 16 14 50 10 78Z" fill="#B9A58C" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {[[30, 44], [44, 44], [58, 44], [72, 44], [86, 44], [26, 64], [40, 64], [54, 64], [68, 64], [82, 64], [96, 64], [24, 84], [38, 84], [52, 84], [66, 84], [80, 84], [94, 84]].map(([x, y], i) => {
        const g = ['M0 -6v12M-5 0h10', 'M-5 -6v12h10', 'M-5 6 0 -6 5 6', 'M0 0m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0', 'M-5 -6h10v12', 'M0 -6v12M-5 -6h10', 'M-5 -6 5 6M-5 6h10'][i % 7];
        return <g key={i} transform={`translate(${x} ${y})`}><path className={a.inFade} style={v({ i: 3 + i * 0.35 })} d={g} {...line} strokeWidth="2.2" stroke="#4A3B2C" /></g>;
      })}
    </>
  ),
  // a banknote and its panel of languages, fluttering
  note: () => (
    <g className={a.inSlide} style={v({ from: '0 -24px' })}>
      <g {...lit(a.lpFlutter, 60, 60, { t: '3.6s' })}>
        <rect x="6" y="30" width="108" height="60" rx="3" fill="#C6D9B8" stroke={INK} strokeWidth="3" />
        <circle cx="30" cy="60" r="16" fill="none" stroke={LEAF} strokeWidth="3" />
        <text x="30" y="66" textAnchor="middle" fontSize="16" fontWeight="800" fill={LEAF}>₹</text>
        <rect x="54" y="38" width="52" height="44" fill={IVORY} stroke={INK} strokeWidth="2" />
        {[44, 50, 56, 62, 68, 74].map((y, k) => <path key={y} {...lit(a.inOpen, 58, y, { i: 4 + k * 0.6 })} d={`M58 ${y}h${y % 12 ? 34 : 44}`} stroke={MAROON} strokeWidth="2.5" />)}
      </g>
    </g>
  ),
  // a baby's cradle, rocking
  cradle: () => (
    <>
      <path d="M30 10 60 30 90 10" {...line} />
      <path d="M36 84 28 106M84 84l8 22M20 106h80" {...line} />
      <g className={a.inDrop}>
        <g {...lit(a.lpSway, 60, 30, { a: '7deg', t: '3s' })}>
          <path d="M24 46c0 26 16 38 36 38s36-12 36-38Z" fill={SINDOOR} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M24 46h72" {...line} />
          <path d="M60 30v16" {...line} />
          {[38, 50, 62, 74].map((x, i) => <circle key={x} cx={x + 4} cy={60 + (i % 2) * 6} r="3.5" fill={HALDI} stroke={INK} strokeWidth="1.5" />)}
        </g>
      </g>
    </>
  ),
  // three diyas on a ledge under a moonless sky, lit one after another
  diyas: () => (
    <>
      <rect x="10" y="10" width="100" height="78" fill="#2A1736" stroke={INK} strokeWidth="3" />
      {[[24, 24], [46, 18], [70, 28], [100, 20], [34, 46], [82, 50], [58, 40]].map(([x, y], i) => <circle key={i} className={a.lpTwinkle} style={v({ j: i * 1.7, t: '2.8s', wait: '0s' })} cx={x} cy={y} r={i % 3 ? 1.3 : 1.9} fill={IVORY} />)}
      <circle cx="92" cy="36" r="8" fill="#2A1736" stroke="#7A6A8C" strokeWidth="1.5" />
      <path d="M8 86h104v24H8Z" fill={MAROON} stroke={INK} strokeWidth="3" />
      {[28, 60, 92].map((x, i) => (
        <g key={x}>
          <g className={a.inFade} style={v({ i: 3 + i * 3 })}><circle className={a.lpGlow} style={v({ j: i * 2, t: '2.2s' })} cx={x} cy="66" r="13" fill={HALDI} opacity=".28" /></g>
          <g {...lit(a.inPop, x, 69, { i: 2 + i * 3 })}>
            <path {...lit(a.lpFlicker, x, 69, { j: i * 2, t: '1.3s' })} d={`M${x} 56c-5 6-6 10-3 13 2 2 4 2 6 0 3-3 2-7-3-13Z`} fill={HALDI} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
          </g>
          <path d={`M${x - 13} 75h26c-2 8-7 11-13 11s-11-3-13-11Z`} fill="#B4542A" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      ))}
    </>
  ),
  // a deepastambha: a stone lamp tower, lit tier by tier from the bottom
  stambh: () => (
    <>
      <path d="M38 108h44v6H38Z" fill="#7A6A58" stroke={INK} strokeWidth="2.5" />
      <path d="M52 108V22h16v86Z" fill="#A8977F" stroke={INK} strokeWidth="3" />
      {[[80, 34], [64, 28], [48, 22], [32, 16]].map(([y, half], t) => (
        <g key={y}>
          <path d={`M${60 - half} ${y}h${half * 2}`} stroke={INK} strokeWidth="4" strokeLinecap="round" />
          {Array.from({ length: Math.round(half / 8) * 2 + 1 }, (_, i) => 60 - half + (i * half) / Math.round(half / 8)).map((x, k) => (
            <g key={x} {...lit(a.inPop, x, y - 3, { i: 1 + t * 2 + k * 0.2 })}>
              <path {...lit(a.lpFlicker, x, y - 3, { j: k + t, t: '1.2s' })} d={`M${x} ${y - 3}c-3 -4 -3 -7 0 -10 3 3 3 6 0 10Z`} fill={HALDI} stroke={INK} strokeWidth="1.2" />
            </g>
          ))}
        </g>
      ))}
      <g {...lit(a.inPop, 60, 18, { i: 10 })}>
        <path {...lit(a.lpFlicker, 60, 18, { t: '1.4s' })} d="M60 18c-5-5-5-10 0-14 5 4 5 9 0 14Z" fill={HALDI} stroke={INK} strokeWidth="2" />
      </g>
    </>
  ),
  // a phuljhadi fizzing: its burning head throwing sparks that fork into stars
  sparkler: () => (
    <>
      <path d="M16 110 62 54" stroke="#8C8C8C" strokeWidth="4" strokeLinecap="round" />
      <path d="M40 81 62 54" stroke="#4A3B2C" strokeWidth="8" strokeLinecap="round" />
      <circle className={a.lpGlow} style={v({ t: '.9s', wait: '0s' })} cx="64" cy="52" r="16" fill={HALDI} opacity=".3" />
      <g {...lit(a.inGrow, 64, 52, { i: 1 })}>
        <g {...lit(a.lpCrackle, 64, 52, { t: '.48s' })}>
          {Array.from({ length: 11 }, (_, k) => {
            const r = (k / 11) * Math.PI * 2 + 0.3, r0 = 9, r1 = 24 + (k % 3) * 6, x1 = 64 + Math.cos(r) * r1, y1 = 52 + Math.sin(r) * r1;
            return (
              <g key={k} stroke={k % 4 ? HALDI : '#E8761E'} strokeWidth="2.2" strokeLinecap="round">
                <path d={`M${(64 + Math.cos(r) * r0).toFixed(1)} ${(52 + Math.sin(r) * r0).toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`} />
                <path d={`M${x1.toFixed(1)} ${y1.toFixed(1)}l${(Math.cos(r + 0.6) * 7).toFixed(1)} ${(Math.sin(r + 0.6) * 7).toFixed(1)}M${x1.toFixed(1)} ${y1.toFixed(1)}l${(Math.cos(r - 0.6) * 7).toFixed(1)} ${(Math.sin(r - 0.6) * 7).toFixed(1)}`} strokeWidth="1.6" />
              </g>
            );
          })}
        </g>
      </g>
      <circle className={a.lpPulse} style={v({ s: 1.2, t: '.6s', wait: '0s' })} cx="64" cy="52" r="6.5" fill={IVORY} stroke={INK} strokeWidth="2" />
    </>
  ),
  // three jars of metal salts, each burning its own colour
  flask: () => (
    <>
      {([[28, '#E0302A', 'Sr'], [60, '#2FA35E', 'Ba'], [92, '#1E9FC0', 'Cu']] as const).map(([x, c, sym], i) => (
        <g key={sym}>
          <g {...lit(a.inRise, x, 70, { i: 2 + i * 2 })}>
            <g {...lit(a.lpFlicker, x, 70, { j: i * 2, t: '1.4s' })}>
              <path d={`M${x} 26c-12 14-15 30-8 40 4 5 12 5 16 0 7-10 4-26-8-40Z`} fill={c} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
              <path d={`M${x} 46c-5 6-6 12-3 16 2 2 4 2 6 0 3-4 2-10-3-16Z`} fill={IVORY} />
            </g>
          </g>
          <path d={`M${x - 13} 78h26v26H${x - 13}Z`} fill={IVORY} stroke={INK} strokeWidth="2.5" />
          <path d={`M${x - 15} 74h30v6H${x - 15}Z`} fill={INK} />
          <text x={x} y="96" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="Sarpanch, sans-serif" fill={INK}>{sym}</text>
        </g>
      ))}
    </>
  ),
  // a Sivakasi matchbox label: a rocket in a starry panel, taking off
  matchbox: () => (
    <>
      <g className={a.inPop}>
        <rect x="12" y="22" width="96" height="76" rx="3" fill={SINDOOR} stroke={INK} strokeWidth="3" />
        <rect x="20" y="30" width="80" height="60" fill={HALDI} stroke={INK} strokeWidth="2" />
      </g>
      <g className={a.lpLaunch} style={v({ t: '3.2s' })}>
        <path d="M60 36l7 12H53Z" fill={MAROON} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M54 48h12v20H54Z" fill={IVORY} stroke={INK} strokeWidth="1.8" />
        <path d="M60 50v16" stroke={SINDOOR} strokeWidth="3" />
        <path d="M56 68l-3 9 7-4 7 4-3-9Z" fill="#E8761E" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      </g>
      {[[32, 42], [88, 46], [36, 64], [84, 66]].map(([x, y], k) => <path key={x} {...lit(a.lpSparkle, x, y, { j: k * 2, t: '1.6s' })} d={`M${x} ${y - 5}l1.6 3.4 3.4 1.6-3.4 1.6-1.6 3.4-1.6-3.4-3.4-1.6 3.4-1.6Z`} fill={MAROON} />)}
      <text className={a.inFade} style={v({ i: 3 })} x="60" y="87" textAnchor="middle" fontSize="9" fontWeight="900" letterSpacing="1.5" fontFamily="Sarpanch, sans-serif" fill={INK}>SIVAKASI</text>
    </>
  ),
  // a torch drawing a looping line of light in the dark, shutter open
  torch: () => (
    <>
      <rect x="10" y="10" width="100" height="100" fill="#1A1030" stroke={INK} strokeWidth="3" />
      <path className={a.lpRedraw} style={v({ t: '4.6s', wait: '.2s' })} pathLength={1} d="M26 82c6-26 24-40 40-32s10 28-6 28-14-22 6-32 34-2 34 18c0 14-10 20-18 16" fill="none" stroke={HALDI} strokeWidth="9" strokeLinecap="round" strokeOpacity=".35" />
      <path className={a.lpRedraw} style={v({ t: '4.6s', wait: '.2s' })} pathLength={1} d="M26 82c6-26 24-40 40-32s10 28-6 28-14-22 6-32 34-2 34 18c0 14-10 20-18 16" fill="none" stroke={IVORY} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M76 84l14 14" stroke="#9AA3AD" strokeWidth="9" strokeLinecap="round" />
      <path d="M76 84l14 14" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity=".5" />
      <circle className={a.lpPulse} style={v({ s: 1.35, t: '.8s', wait: '0s' })} cx="76" cy="84" r="4" fill={IVORY} stroke={HALDI} strokeWidth="2" />
    </>
  ),
  // a kathputli on her strings: she swings from the control bar, an arm lifts, the skirt flares
  puppet: () => (
    <>
      <path d="M8 110h104" {...line} />
      <g {...lit(a.inDrop, 60, 12)}>
        <g {...lit(a.lpSway, 60, 12, { a: '7deg', t: '2.8s' })}>
          <path d="M60 12v20M36 12l-1 50M84 12l1 50" stroke={INK} strokeWidth="1" opacity=".55" />
          <path d="M34 12h52" stroke={INK} strokeWidth="7" strokeLinecap="round" />
          <path d="M34 12h52" stroke="#B97A3E" strokeWidth="3.5" strokeLinecap="round" />
          <g {...lit(a.lpFlare, 60, 66, { t: '1.4s', wait: '.6s' })}>
            <path d="M53 64 32 104q28 7 56 0L67 64Z" fill="#C93A82" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M38 92q22 6 44 0" fill="none" stroke={HALDI} strokeWidth="3.5" />
            <path d="M34 101q26 6 52 0" fill="none" stroke={LEAF} strokeWidth="3" />
          </g>
          <path d="M42 50 36 62M78 50l6 12" stroke={INK} strokeWidth="6" strokeLinecap="round" />
          <path d="M42 50 36 62" stroke={LEAF} strokeWidth="3.5" strokeLinecap="round" />
          <g {...lit(a.lpSway, 78, 50, { a: '12deg', t: '1.4s', wait: '.6s' })}>
            <path d="M78 50l6 12" stroke={LEAF} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="85" cy="63" r="3" fill="#EBB78C" stroke={INK} strokeWidth="1.5" />
          </g>
          <circle cx="35" cy="63" r="3" fill="#EBB78C" stroke={INK} strokeWidth="1.5" />
          <path d="M50 46h20l-3 20H53Z" fill={LEAF} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M54 48q6 6 12 0" fill="none" stroke={HALDI} strokeWidth="2" />
          <ellipse cx="60" cy="36" rx="8" ry="9.5" fill="#EBB78C" stroke={INK} strokeWidth="2.5" />
          <path d="M49 50q-2-24 11-23 13-1 11 23-1-16-11-16T49 50Z" fill="#C93A82" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          {[-1, 1].map((d) => <path key={d} d={`M${60 + d * 1.5} 36q${d * 3}-3 ${d * 6} 0q${d * -3} 2 ${d * -6} 0Z`} fill={IVORY} stroke={INK} strokeWidth="1.2" />)}
          <circle cx="60" cy="31.5" r="1.2" fill={SINDOOR} />
          <path d="M58 42h4" stroke={SINDOOR} strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    </>
  ),
  // a dholak: two hands take turns on its heads, and the beat ripples out
  dholak: () => (
    <>
      {[[16, 64, 0], [104, 64, 2]].map(([x, y, j]) => <circle key={x} className={a.lpRipple} style={v({ j, t: '1.15s', wait: '.4s' })} cx={x} cy={y} r="14" fill="none" stroke={HALDI} strokeWidth="3" />)}
      <g className={a.inPop}>
        <path d="M24 48q36-12 72 0v32q-36 12-72 0Z" fill={SINDOOR} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M30 47 40 82 50 44 60 84 70 44 80 82 90 47" fill="none" stroke={IVORY} strokeWidth="2" strokeLinejoin="round" />
        <path d="M30 60q30-8 60 0M30 68q30 8 60 0" fill="none" stroke={INK} strokeWidth="1.5" opacity=".4" />
        <ellipse cx="24" cy="64" rx="7" ry="16" fill={IVORY} stroke={INK} strokeWidth="3" />
        <ellipse cx="96" cy="64" rx="5.5" ry="15" fill={IVORY} stroke={INK} strokeWidth="3" />
        <ellipse cx="24" cy="64" rx="3" ry="7" fill={INK} opacity=".15" />
      </g>
      {[[24, 30, 0], [96, 30, 2.6]].map(([x, y, j]) => (
        <g key={x} className={a.lpPress} style={v({ j, t: '1.15s', wait: '.4s' })}>
          <path d={`M${x - 8} ${y}q0-10 8-10t8 10v10q0 6-8 6t-8-6Z`} fill="#C98A5A" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d={`M${x - 4} ${y - 6}v8M${x} ${y - 8}v10M${x + 4} ${y - 6}v8`} stroke={INK} strokeWidth="1.2" opacity=".5" />
        </g>
      ))}
    </>
  ),
  // the boli: a little reed whistle buzzing out a puppet's squeaky voice
  reed: () => (
    <>
      <g {...lit(a.inPop, 80, 40)}>
        <path d="M54 18h52a6 6 0 0 1 6 6v30a6 6 0 0 1-6 6H76l-12 12 2-12H54a6 6 0 0 1-6-6V24a6 6 0 0 1 6-6Z" fill={IVORY} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path className={a.lpRedraw} style={v({ t: '1.6s', wait: '.5s' })} pathLength={1} d="M58 40l5-9 5 16 5-18 5 20 5-17 5 14 5-11 5 7" fill="none" stroke={SINDOOR} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {[0, 1, 2].map((k) => <path key={k} className={a.lpFlash} style={v({ j: k * 1.5, t: '1.6s', wait: '.5s' })} d={`M${30 + k * 7} ${76 - k * 9}q5 -5 2 -10`} fill="none" stroke={HALDI} strokeWidth="3" strokeLinecap="round" />)}
      <g className={a.inSlide} style={v({ i: 2, from: '-30px 10px' })}>
        <g className={a.lpJitter} style={v({ t: '.12s', wait: '.5s' })}>
          <g transform="rotate(-35 26 90)">
            <rect x="8" y="84" width="36" height="12" rx="3" fill="#D9B26A" stroke={INK} strokeWidth="2.5" />
            <path d="M16 84v12M34 84v12" stroke={INK} strokeWidth="1.5" opacity=".5" />
            <ellipse cx="44" cy="90" rx="3" ry="6" fill="#E8C9A0" stroke={INK} strokeWidth="2" />
          </g>
        </g>
      </g>
    </>
  ),
  // Amar Singh's dhal and talwar: a glint runs down the blade, the shield's bosses shine
  sword: () => (
    <>
      <path className={a.inDraw} pathLength={1} d="M26 100Q66 78 98 18" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      <path className={a.inDraw} pathLength={1} d="M26 100Q66 78 98 18" fill="none" stroke="#DCE1E6" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M14 92l20 16" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <path d="M14 92l20 16" stroke={HALDI} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M22 102 12 112" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <circle cx="11" cy="113" r="4" fill={HALDI} stroke={INK} strokeWidth="2" />
      <g {...lit(a.inPop, 62, 58, { i: 3 })}>
        <circle cx="62" cy="58" r="26" fill={MAROON} stroke={INK} strokeWidth="3" />
        <circle cx="62" cy="58" r="20" fill="none" stroke={HALDI} strokeWidth="2" strokeDasharray="3 3" />
        {[[54, 50], [70, 50], [54, 66], [70, 66]].map(([x, y], k) => <circle key={k} {...lit(a.lpPulse, x, y, { j: k, s: 1.25, t: '2.4s' })} cx={x} cy={y} r="3.6" fill={HALDI} stroke={INK} strokeWidth="1.5" />)}
      </g>
      <path {...lit(a.lpSparkle, 92, 30, { t: '1.8s' })} d="M92 22l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill={IVORY} stroke={INK} strokeWidth="1" />
    </>
  ),
  // shadow theatre: a lamp flickers behind a cloth screen, and a painted leather puppet glows in colour on it
  shadow: () => (
    <>
      <path className={a.lpGlow} style={v({ t: '2s', wait: '0s' })} d="M18 98 34 18v84Z" fill={HALDI} />
      <rect className={a.inFade} x="34" y="14" width="78" height="86" fill="#FFF1C8" stroke={INK} strokeWidth="3" />
      <g className={a.lpDrift} style={v({ t: '5s' })}>
        <g className={a.inRise} style={v({ i: 2 })}>
          <path d="M62 102V80M80 102V62" stroke={INK} strokeWidth="1.5" opacity=".5" />
          <path d="M66 82 60 58q0-8 8-10l8-2q8 2 8 12l-2 24Z" fill={SINDOOR} fillOpacity=".75" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="72" cy="38" r="7" fill={LEAF} fillOpacity=".75" stroke={INK} strokeWidth="2" />
          <path d="M65 33 72 22 79 33Z" fill={HALDI} fillOpacity=".85" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
          {[[68, 64], [74, 64], [71, 72]].map(([x, y]) => <circle key={x + '' + y} cx={x} cy={y} r="1.6" fill="#FFF1C8" />)}
          <g {...lit(a.lpSway, 82, 52, { a: '16deg', t: '1.8s' })}>
            <path d="M82 52l12-8 6-12" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M82 52l12-8 6-12" fill="none" stroke={HALDI} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      </g>
      <path d="M8 104h22l-3 6H11Z" fill="#B4542A" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path {...lit(a.lpFlicker, 19, 102, { t: '1.1s', wait: '0s' })} d="M19 102c-5-5-5-11 0-15 5 4 5 10 0 15Z" fill={HALDI} stroke={INK} strokeWidth="2" />
    </>
  ),
  // a Warli home: its red-earth wall gets a white hut painted on it, stroke by stroke, with a chewed bamboo stick
  hut: () => (
    <>
      <rect x="10" y="12" width="100" height="96" fill={GERU} stroke={INK} strokeWidth="3" />
      <g fill="none" stroke={PASTE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path className={a.inDraw} pathLength={1} d="M30 92V62h40v30M24 62l26-22 26 22" />
        <path className={a.inDraw} style={v({ i: 3 })} pathLength={1} d="M32 58l8-12M40 52l8-12M50 50l6-10M58 54l6-9M66 58l4-6" />
        <path className={a.inDraw} style={v({ i: 5 })} pathLength={1} d="M45 92V78h10v14M18 92h84" />
      </g>
      <g className={a.inPop} style={v({ i: 6 })}>
        <g {...lit(a.lpSpin, 92, 32, { t: '16s' })}>
          <circle cx="92" cy="32" r="7" fill={PASTE} />
          {Array.from({ length: 10 }, (_, k) => <g key={k} transform={`rotate(${k * 36} 92 32)`}><path d="M92 21v-4" stroke={PASTE} strokeWidth="1.8" strokeLinecap="round" /></g>)}
        </g>
      </g>
      <g className={a.lpBob} style={v({ y: '-5px', t: '1.6s' })}>
        <path d="M100 98 84 74" stroke="#D9B26A" strokeWidth="4" strokeLinecap="round" />
        <path d="M100 98 84 74" stroke={INK} strokeWidth="1" strokeLinecap="round" opacity=".4" />
        <circle cx="83.5" cy="73" r="2.8" fill={PASTE} stroke={INK} strokeWidth="1" />
      </g>
    </>
  ),
  // three shapes: the sun's circle, the mountain's triangle and the square of the land, then a person made of them
  shapes: () => (
    <>
      <rect x="10" y="12" width="100" height="96" fill={GERU} stroke={INK} strokeWidth="3" />
      <g className={a.inSlide} style={v({ i: 1, from: '-20px 0' })}><g {...lit(a.lpPulse, 30, 36, { s: 1.15, t: '3s', j: 0 })}><circle cx="30" cy="36" r="10" fill={PASTE} /></g></g>
      <g className={a.inSlide} style={v({ i: 2, from: '0 -20px' })}><g {...lit(a.lpPulse, 60, 38, { s: 1.15, t: '3s', j: 4 })}><path d="M60 26l12 20H48Z" fill={PASTE} /></g></g>
      <g className={a.inSlide} style={v({ i: 3, from: '20px 0' })}><g {...lit(a.lpPulse, 90, 36, { s: 1.15, t: '3s', j: 8 })}><rect x="80" y="26" width="20" height="20" fill="none" stroke={PASTE} strokeWidth="3" /></g></g>
      <path className={a.inDraw} style={v({ i: 5 })} pathLength={1} d="M30 56v6M60 56v6M90 56v6" stroke={PASTE} strokeWidth="1.5" strokeDasharray="2 3" fill="none" />
      <g {...lit(a.inPop, 60, 88, { i: 7 })}><g {...lit(a.lpBob, 60, 88, { t: '1s', y: '-3px' })}>{warliMan(60, 86, 1.5, true)}</g></g>
    </>
  ),
  // the tarpa dance: the player blows his gourd horn and the dancers link arms and sway round him
  tarpa: () => (
    <>
      <rect x="10" y="12" width="100" height="96" fill={GERU} stroke={INK} strokeWidth="3" />
      {[0, 1].map((k) => <circle key={k} className={a.lpRipple} style={v({ j: k * 3, t: '1.8s', wait: '.6s' })} cx="84" cy="56" r="10" fill="none" stroke={PASTE} strokeWidth="1.5" />)}
      <g className={a.inPop}>
        {warliMan(54, 62, 1.6)}
        <path d="M56 46q12-2 20 6t4 4" fill="none" stroke={PASTE} strokeWidth="2.4" strokeLinecap="round" />
        <ellipse cx="82" cy="58" rx="6" ry="8" fill={PASTE} transform="rotate(-30 82 58)" />
      </g>
      {[[22, 92, 0], [38, 98, 1], [62, 100, 2], [86, 96, 3], [100, 88, 4]].map(([x, y, j]) => (
        <g key={x} {...lit(a.inRise, x, y, { i: 2 + j * 0.5 })}><g {...lit(a.lpBob, x, y, { j: j * 1.5, t: '.9s', y: '-3px', wait: '.3s' })}>{warliMan(x, y, 0.85)}</g></g>
      ))}
      <path className={a.inDraw} style={v({ i: 5 })} pathLength={1} d="M14 86q8 4 16 0t16 4 24 0 24-2 14-4" fill="none" stroke={PASTE} strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  // the wedding chauk: a square frame with a zigzag border, the mother goddess inside, the village dancing round
  chauk: () => (
    <>
      <rect x="10" y="12" width="100" height="96" fill={GERU} stroke={INK} strokeWidth="3" />
      <path className={a.inDraw} pathLength={1} d="M36 38h48v44H36Z" fill="none" stroke={PASTE} strokeWidth="2.4" />
      <path className={a.inDraw} style={v({ i: 2 })} pathLength={1} d="M40 42l4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4" fill="none" stroke={PASTE} strokeWidth="1.4" strokeLinejoin="round" />
      <g {...lit(a.inPop, 60, 66, { i: 4 })}><g {...lit(a.lpPulse, 60, 66, { s: 1.08, t: '2.6s' })}>{warliMan(60, 68, 1.2, true)}</g></g>
      {[[22, 32], [98, 32], [22, 96], [98, 96]].map(([x, y], j) => (
        <g key={x + '' + y} {...lit(a.inPop, x, y, { i: 6 + j * 0.5 })}><g {...lit(a.lpBob, x, y, { j: j * 2, t: '1.1s', y: '-2.5px' })}>{warliMan(x, y, 0.75, j % 2 === 0)}</g></g>
      ))}
    </>
  ),
  // from wall to paper: a Warli figure painting itself again and again on a pinned sheet
  paper: () => (
    <>
      <g {...lit(a.inSwing, 60, 18)}>
        <path d="M22 20h76v86H22Z" fill={IVORY} stroke={INK} strokeWidth="3" />
        <rect x="28" y="26" width="64" height="74" fill={GERU} />
        <g fill="none" stroke={PASTE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle className={a.lpRedraw} style={v({ t: '4s', wait: '.4s' })} pathLength={1} cx="60" cy="44" r="5" />
          <path className={a.lpRedraw} style={v({ t: '4s', wait: '.6s' })} pathLength={1} d="M50 52h20L60 64ZM60 64l8 10H52Z" />
          <path className={a.lpRedraw} style={v({ t: '4s', wait: '.8s' })} pathLength={1} d="M50 52l-8 6-4-4M70 52l8 6 4-4M54 74l-4 8 2 6M66 74l4 8-2 6" />
        </g>
        <circle cx="60" cy="20" r="4" fill={SINDOOR} stroke={INK} strokeWidth="2" />
      </g>
    </>
  ),
  // Uttarayan: a fighter kite rides the wind above the January sun, its tail waving
  kite: () => (
    <>
      <circle className={a.lpGlow} style={v({ t: '3s', wait: '0s' })} cx="90" cy="26" r="16" fill={HALDI} />
      <circle cx="90" cy="26" r="9" fill={HALDI} stroke={INK} strokeWidth="2" />
      <path d="M14 110Q40 96 58 64" fill="none" stroke={INK} strokeWidth="1.4" />
      <g {...lit(a.inRise, 58, 64, { i: 1 })}>
        <g {...lit(a.lpSway, 58, 64, { a: '9deg', t: '2.6s' })}>
          <path className={a.lpWave} style={v({ t: '1s' })} d="M58 62q-6 8 0 16t0 16" fill="none" stroke={SINDOOR} strokeWidth="3.5" strokeLinecap="round" />
          {kiteShape(58, 44, 1.4, HALDI, SINDOOR)}
        </g>
      </g>
      <path d="M0 110h120" {...line} />
    </>
  ),
  // a pech: two strings cross, sparks fly, and one kite is cut loose and drifts off spinning
  cut: () => (
    <>
      <path d="M10 110L46 44M110 110L62 36" fill="none" stroke={INK} strokeWidth="1.4" />
      <g className={a.inPop}>{kiteShape(42, 40, 1, HALDI, SINDOOR)}</g>
      {[0, 1, 2].map((k) => <path key={k} {...lit(a.lpSparkle, 49 + k * 3, 74 - k * 2, { j: k * 2, t: '.7s', wait: '.4s' })} d={`M${49 + k * 3} ${69 - k * 2}l1.4 3.6 3.6 1.4-3.6 1.4-1.4 3.6-1.4-3.6-3.6-1.4 3.6-1.4Z`} fill={HALDI} stroke={INK} strokeWidth=".8" />)}
      <g className={a.lpDrift} style={v({ t: '4s', wait: '.8s' })}>
        <g {...lit(a.lpSpin, 78, 30, { t: '4s', wait: '.8s' })}>{kiteShape(78, 30, 1, '#2D4C7C', LEAF)}</g>
      </g>
      <text className={a.inFade} style={v({ i: 4 })} x="60" y="104" textAnchor="middle" fontSize="10" fontWeight="900" letterSpacing="1" fontFamily="Sarpanch, sans-serif" fill={SINDOOR}>KAI PO CHE!</text>
    </>
  ),
  // the firki spins as the string runs off it to a kite's bare bamboo frame, with its kanna knot
  spool: () => (
    <>
      <g {...lit(a.inDrop, 80, 36)}>
        <path d="M80 12V62M58 32Q80 18 102 32" fill="none" stroke="#B97A3E" strokeWidth="3" strokeLinecap="round" />
        <path d="M80 26 74 40 80 50" fill="none" stroke={INK} strokeWidth="1.2" />
        <circle className={a.lpPulse} style={v({ s: 1.4, t: '1.6s' })} cx="74" cy="40" r="2.6" fill={SINDOOR} stroke={INK} strokeWidth="1" />
      </g>
      <path d="M74 40Q50 70 36 82" fill="none" stroke={MAROON} strokeWidth="1.4" />
      <g {...lit(a.inPop, 32, 86, { i: 2 })}>
        <g {...lit(a.lpSpin, 32, 86, { t: '2.4s' })}>
          <circle cx="32" cy="86" r="16" fill={IVORY} stroke={INK} strokeWidth="3" />
          <circle cx="32" cy="86" r="11" fill={MAROON} />
          <path d="M32 70v32M16 86h32" stroke={INK} strokeWidth="2" />
        </g>
      </g>
      <path d="M32 102v12M24 114h16" stroke="#B97A3E" strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  // a pigeon flies free over a cotton string; a vet's green cross pulses beside it
  bird: () => (
    <>
      <path d="M8 96Q60 80 112 96" fill="none" stroke={INK} strokeWidth="1.4" strokeDasharray="4 3" />
      <g className={a.lpBob} style={v({ y: '-6px', t: '2.2s' })}>
        <g className={a.inSlide} style={v({ from: '-30px 10px' })}>
          <ellipse cx="54" cy="56" rx="16" ry="9" fill="#9AA3AD" stroke={INK} strokeWidth="2.5" />
          <circle cx="70" cy="50" r="6" fill="#9AA3AD" stroke={INK} strokeWidth="2.5" />
          <path d="M75 50l6 2-6 2Z" fill={HALDI} stroke={INK} strokeWidth="1" />
          <circle cx="71" cy="49" r="1.2" fill={INK} />
          <path d="M38 56l-10-4 2 8Z" fill="#9AA3AD" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path {...lit(a.lpFlutter, 52, 52, { t: '.5s' })} d="M52 52Q46 30 30 28q10 14 12 24Z" fill="#C8CED4" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </g>
      </g>
      <g {...lit(a.lpPulse, 96, 30, { s: 1.15, t: '1.6s' })}>
        <rect x="84" y="18" width="24" height="24" rx="5" fill={IVORY} stroke={INK} strokeWidth="2.5" />
        <path d="M96 23v14M89 30h14" stroke={LEAF} strokeWidth="5" strokeLinecap="round" />
      </g>
    </>
  ),
  // Independence Day: kites in saffron, white and green over Old Delhi's rooftops
  flag: () => (
    <>
      <path d="M6 100h22V86h16v14h14V80h20v20h16V90h20v20H6Z" fill={MAROON} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      {[[28, 36, '#E8761E', 0], [60, 24, IVORY, 1], [92, 40, LEAF, 2]].map(([x, y, c, j]) => (
        <g key={x as number}>
          <path d={`M${x} ${(y as number) + 18}Q${(x as number) - 6} 70 ${(x as number) - 10} 86`} fill="none" stroke={INK} strokeWidth="1.2" />
          <g {...lit(a.inRise, x as number, y as number, { i: 1 + (j as number) })}>
            <g {...lit(a.lpSway, x as number, (y as number) + 30, { a: '7deg', t: '2.4s', j: (j as number) * 2 })}>{kiteShape(x as number, y as number, 1, c as string, c === IVORY ? '#2D4C7C' : c as string)}</g>
          </g>
        </g>
      ))}
    </>
  ),
};

export default function Art({ id, className, uid = '' }: { id: ArtId; className?: string; uid?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 120 120" className={className}>{ART[id](uid)}</svg>;
}
