// The design's button glyphs. BloomIcon's petals fan open when its button (class rg-bloom) is
// hovered or focused, via the --b custom property.
export function BloomIcon({ petal = '#CC3B22', center = '#FBF3E4', size = 22 }: { petal?: string; center?: string; size?: number }) {
  const p = <ellipse cx="12" cy="5.6" rx="3.4" ry="5.4" fill={petal} stroke="#1B1410" strokeWidth="1.5" />;
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" style={{ width: size, height: size, flex: 'none', overflow: 'visible' }}>
      {[-144, -72, 144, 72].map((a) => (
        <g key={a} style={{ transformOrigin: '12px 12px', transform: `rotate(calc((.22 + var(--b, 0) * .78) * ${a}deg))`, transition: 'transform .35s cubic-bezier(.3,1.5,.5,1)' }}>{p}</g>
      ))}
      {p}
      <circle cx="12" cy="12" r="3.2" fill={center} stroke="#1B1410" strokeWidth="1.5" />
    </svg>
  );
}

export function UndoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
      <path d="M9 5 4.5 9.5 9 14" fill="none" stroke="#1B1410" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5h9.5a5 5 0 0 1 0 10H11" fill="none" stroke="#1B1410" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function SweepIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
      <path d="M15.5 3.5 11 10" fill="none" stroke="#1B1410" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M8.2 9.2c2-1 4.6-.4 5.8 1.4l-1.2 1.2c-.6 2.6-2.6 6-6.3 8.7l-3.3-.6c1.6-2 2.6-4.3 2.9-6.6z" fill="#FFC21A" stroke="#1B1410" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 15.5l2.4 1.6M6.6 17.6l2.2 1.4" stroke="#1B1410" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
