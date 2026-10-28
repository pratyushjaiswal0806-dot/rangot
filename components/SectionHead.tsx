// Section heading in the design's lettering style: one span per letter with a little tilt,
// popping in when the section scrolls into view (data-reveal + --rv, set by Rangotsav).
const TILT = [-1.5, 1.5, -1, 2, -2, 1, -1.2, 1.8];

export default function SectionHead({ words, color, accent, kicker, kn, hi, children }: {
  words: string[]; color: string; accent?: number; kicker: string; kn?: string; hi?: string; children?: React.ReactNode;
}) {
  let k = 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h2 data-reveal aria-label={words.join(' ')} style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: '0 .28em', fontFamily: "'Yatra One', serif", fontWeight: 400, fontSize: 'clamp(44px,12.5vw,104px)', lineHeight: 1.05, color, WebkitTextStroke: '1.5px #1B1410', textShadow: '4px 4px 0 #1B1410', filter: 'url(#rough)' }}>
        {words.map((w, wi) => (
          <span key={wi} style={{ display: 'inline-flex' }}>
            {[...w].map((ch, ci) => {
              const i = k++;
              return (
                <span key={ci} aria-hidden="true" style={{ display: 'inline-block', transform: `rotate(${TILT[i % TILT.length]}deg)`, color: wi === accent ? '#FFC21A' : undefined, animation: `letterIn .8s cubic-bezier(.3,1.5,.5,1) ${(i * 0.05).toFixed(2)}s both`, animationPlayState: 'var(--rv,paused)' as string }}>{ch}</span>
              );
            })}
          </span>
        ))}
      </h2>
      <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 10px', fontWeight: 800, fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase' }}>
        {kicker}
        {kn && <><span aria-hidden="true">──</span><span lang="kn" style={{ fontFamily: "'Baloo Tamma 2',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '.02em', textTransform: 'none' }}>{kn}</span></>}
        {hi && <><span aria-hidden="true">·</span><span lang="hi" style={{ fontSize: 15, letterSpacing: '.02em', textTransform: 'none' }}>{hi}</span></>}
      </p>
      {children && <p style={{ margin: '6px 0 0', fontSize: 18, lineHeight: 1.6, maxWidth: '56ch', textWrap: 'pretty' }}>{children}</p>}
    </div>
  );
}
