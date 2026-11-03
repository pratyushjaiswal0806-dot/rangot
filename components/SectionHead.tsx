// Section heading as a little sindoor-red poster: Hinglish lettering (Desi) over a turning
// mandala, a tiny lowercase gloss, then the kicker line in English, Kannada and Hindi. The
// letters pop in when the section scrolls into view (data-reveal, see RevealObserver).
import Desi from './site/Desi';
import Mandala from './site/Mandala';

export default function SectionHead({ title, label, gloss, panel, center, kicker, kn, hi, size = 'clamp(44px,12vw,96px)', as = 'h2', children }: {
  // the poster title, English and Devanagari mixed: 'Come खेलो'
  title: string;
  // the plain English reading, for screen readers
  label: string;
  // the tiny translation in the poster's corner
  gloss?: string;
  // poster colour (defaults to sindoor red)
  panel?: string;
  center?: boolean; kicker: string; kn?: string; hi?: string; size?: string;
  // h1 when the poster is the page's own title (a page of its own, like /words)
  as?: 'h1' | 'h2';
  children?: React.ReactNode;
}) {
  const align = center ? 'center' : undefined;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: center ? 'center' : 'flex-start', textAlign: align }}>
      <div className="desi-panel" style={panel ? { ['--panel' as string]: panel } : undefined}>
        <Mandala />
        <Desi as={as} text={title} label={label} pop style={{ fontSize: size, justifyContent: align }} />
        {gloss && <span aria-hidden="true" className="desi-gloss">{gloss}</span>}
      </div>
      <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', justifyContent: align, alignItems: 'center', gap: '6px 10px', fontWeight: 800, fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase' }}>
        {kicker}
        {kn && <><span aria-hidden="true">──</span><span lang="kn" style={{ fontFamily: "'Baloo Tamma 2',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '.02em', textTransform: 'none' }}>{kn}</span></>}
        {hi && <><span aria-hidden="true">──</span><span lang="hi" style={{ fontSize: 15, letterSpacing: '.02em', textTransform: 'none' }}>{hi}</span></>}
      </p>
      {children && <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, maxWidth: '56ch', textWrap: 'pretty' }}>{children}</p>}
    </div>
  );
}
