// A line-art mandala, drawn once from rings of petals, scallops and dots. It sits behind the
// poster lettering in a darker shade of whatever it is on (it paints in currentColor).
import { DOTS, LINES, SOLID } from '../../lib/art/mandala';

export default function Mandala({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg aria-hidden="true" viewBox="-100 -100 200 200" className={className} style={style}>
      <path d={SOLID} fill="currentColor" fillOpacity={0.45} />
      <path d={LINES} fill="none" stroke="currentColor" strokeWidth={0.9} strokeLinecap="round" strokeLinejoin="round" />
      {DOTS.map(([x, y], i) => <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r={1.3} fill="currentColor" />)}
    </svg>
  );
}
