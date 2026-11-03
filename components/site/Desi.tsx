// Hinglish poster lettering, like a hand-cut "Rangबाजी" sign: Latin letters one by one with a
// little jitter, Devanagari and Kannada words kept whole (their letters hang from one headline),
// a halftone print (a ::before copy of each piece, see data-c) and a hard extruded shadow.
// Styles are .desi* in globals.css.
const INDIC = /([\u0900-\u097F\u0C80-\u0CFF\u200C\u200D]+)/;
const TILT = [-3, 2, -1.5, 3, -2.5, 1.5, -1, 2.5, -2];
const LIFT = [0, -0.03, 0.02, -0.01, 0.03, -0.02, 0.01];

export type DesiTone = 'haldi' | 'sindoor' | 'ivory';

export default function Desi({ text, label, as: Tag = 'span', tone = 'haldi', pop = false, reveal = true, rough = true, className = '', style }: {
  text: string;
  // what a screen reader says (the English reading); defaults to the text itself
  label?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p';
  tone?: DesiTone;
  // letters spring in; on [data-reveal] elements they wait until scrolled into view
  pop?: boolean;
  // false for above-the-fold text: it springs in on load, without waiting for scripts to scroll-reveal it
  reveal?: boolean;
  // the hand-cut edge (skip it on small text, where it just looks blurry)
  rough?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  let k = 0;
  const bit = (ch: string, cls: string, lang?: string) => {
    const i = k++;
    return (
      <span key={i} lang={lang} className={cls} data-c={ch}
        style={{ rotate: `${TILT[i % TILT.length] * (cls === 'desi-in' ? 0.5 : 1)}deg`, translate: `0 ${LIFT[i % LIFT.length]}em`, ['--d' as string]: `${(i * 0.05).toFixed(2)}s` }}>{ch}</span>
    );
  };
  // aria-label is only allowed on headings and on roles such as img, so a span or p is an image of its label
  const name = Tag === 'span' || Tag === 'p' ? { role: 'img', 'aria-label': label ?? text } : { 'aria-label': label ?? text };
  return (
    <Tag {...name} data-reveal={pop && reveal ? '' : undefined}
      className={`desi desi--${tone} ${pop ? 'desi--pop' : ''} ${pop && !reveal ? 'desi--now' : ''} ${rough ? 'desi--rough' : ''} ${className}`} style={style}>
      {text.split(/\s+/).filter(Boolean).map((w, wi) => (
        <span key={wi} aria-hidden="true" className="desi-w">
          {w.split(INDIC).filter(Boolean).flatMap((run) =>
            INDIC.test(run) ? [bit(run, 'desi-in', /[ಀ-೿]/.test(run) ? 'kn' : 'hi')] : [...run].map((ch) => bit(ch, 'desi-l')),
          )}
        </span>
      ))}
    </Tag>
  );
}
