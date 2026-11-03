'use client';
// Light a Diya: one tap, one flame, added to a counter shared by every visitor (Upstash Redis via
// /api/diyas; without a store it counts this browser's diyas on top of the prototype's 428).
import { useEffect, useRef, useState } from 'react';
import SectionHead from '../SectionHead';
import DiyaFor from './DiyaFor';
import DiyaSky, { addMyLight } from './DiyaSky';
import { stamp } from '../../lib/progress';
import { buzz, ting } from '../../lib/sfx';
import { copy } from '../../lib/share';
import { flash } from '../../lib/toast';
import { track } from '../../lib/track';
import s from './DiyaSection.module.css';

const LS = 'rangotsav:diyas-mine';
const SPARKS: [number, number, number, string][] = [[0, -80, 9, '#FFC21A'], [58, -58, 7, '#E8761E'], [82, 0, 8, '#FBF3E4'], [-58, -58, 7, '#FFC21A'], [-82, 0, 8, '#E8761E'], [30, -96, 6, '#FBF3E4'], [-30, -96, 6, '#FBF3E4']];

export default function DiyaSection({ api = '/api/diyas' }: { api?: string }) {
  const [mine, setMine] = useState(0);
  const [server, setServer] = useState<number | null>(null);
  const [pending, setPending] = useState(0);
  const [lit, setLit] = useState(false);
  const [spark, setSpark] = useState(0);
  const [shown, setShown] = useState<number | null>(null); // count-up animation value
  const sec = useRef<HTMLElement>(null);
  const countEl = useRef<HTMLSpanElement>(null);
  const bigRef = useRef<HTMLButtonElement>(null);
  const visible = useRef(false);
  const lastLit = useRef(0);
  const counting = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const live = useRef({ server, pending, mine });
  live.current = { server, pending, mine };
  const total = (v = live.current) => (v.server != null ? v.server + v.pending : 428 + v.mine);

  useEffect(() => {
    try { setMine(parseInt(localStorage.getItem(LS) || '0', 10) || 0); } catch {}
    const get = () => fetch(api).then((r) => r.json()).then((d) => { if (typeof d.count === 'number' && !live.current.pending) setServer(d.count); }).catch(() => {});
    get();
    const poll = setInterval(() => { if (visible.current && !document.hidden) get(); }, 20000);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let counted = false;
    if (!reduced) setShown(0);
    const io = new IntersectionObserver(([en]) => {
      visible.current = en.isIntersecting;
      if (!en.isIntersecting || counted || reduced) return;
      counted = true;
      let i = 0;
      const N = 26;
      const step = () => {
        i++;
        if (i >= N) { setShown(null); return; }
        setShown(Math.round(total() * (1 - Math.pow(1 - i / N, 3))));
        counting.current = setTimeout(step, 55);
      };
      counting.current = setTimeout(step, 55);
    }, { threshold: 0.25 });
    if (sec.current) io.observe(sec.current);
    return () => { clearInterval(poll); io.disconnect(); clearTimeout(counting.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const light = () => {
    const now = Date.now();
    if (now - lastLit.current < 450) return;
    lastLit.current = now;
    const m = mine + 1;
    try { localStorage.setItem(LS, String(m)); } catch {}
    setMine(m);
    setPending((p) => p + 1);
    setLit(true);
    setSpark((k) => k + 1);
    clearTimeout(counting.current);
    setShown(null);
    buzz([12, 50, 22]);
    ting();
    stamp('diya');
    const ce = countEl.current;
    if (ce?.animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) ce.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.16) rotate(-2deg)' }, { transform: 'scale(1)' }], { duration: 450, easing: 'cubic-bezier(.3,1.5,.5,1)' });
    fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta: 1 }) })
      .then((r) => r.json()).then((d) => { if (typeof d.count === 'number') { setServer(d.count); setPending(0); addMyLight(d.count - 1); } }).catch(() => {});
  };

  const count = shown ?? total({ server, pending, mine });
  // "I lit diya #4,812": a link that opens on this sky, with its own preview card
  const shareMine = async () => {
    const n = total(), url = `${location.origin}/sky/${n}`, text = `I lit diya #${n.toLocaleString('en-IN')} in Rangotsav's night sky 🪔 Light yours:`;
    track('share', { kind: 'diya', via: 'link' });
    try { if (navigator.share) { await navigator.share({ title: 'Rangotsav', text, url }); return; } } catch (e) { if (e instanceof Error && e.name === 'AbortError') return; }
    flash((await copy(text + ' ' + url)) ? 'Link copied. Send it to someone you miss!' : url);
  };
  const msg = !lit ? 'Tap the diya. One second of your time, and the courtyard gets a little brighter.'
    : pending >= 4 || mine >= 4 ? 'Arre wah, you are lighting up the whole street!' : 'Yours is glowing. Light one more for someone you miss?';

  return (
    <section id="diya" ref={sec} className={s.diya}>
      <DiyaSky count={total({ server, pending, mine })} lit={spark} from={bigRef} host={sec} />
      <div aria-hidden="true" style={{ lineHeight: 0 }}>
        <svg width="100%" height="52" style={{ display: 'block' }}>
          <defs>
            <pattern id="gs2" width="140" height="52" patternUnits="userSpaceOnUse">
              <rect width="140" height="4" fill="#1B1410" />
              <path d="M0 6 Q70 50 140 6" fill="none" stroke="#4F8A3C" strokeWidth="2.5" />
              {[14, 28, 42, 56, 70, 84, 98, 112, 126].map((cx, i) => <circle key={cx} cx={cx} cy={(6 + 22 * (1 - ((cx - 70) / 70) ** 2)).toFixed(1)} r="7" fill={i % 2 ? '#E8761E' : '#FFC21A'} stroke="#1B1410" strokeWidth="2" />)}
              <path d="M70 36 C76 42 75 48 70 52 C65 48 64 42 70 36 Z" fill="#4F8A3C" stroke="#1B1410" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="52" fill="url(#gs2)" />
        </svg>
      </div>
      <div className={s.inner}>
        <SectionHead title="Light a दीया" label="Light a diya" gloss="light a lamp" panel="#7A0E3A" center kicker="Deepam" kn="ದೀಪ" hi="दीया" />
        <p className={s.lead}>One tap, one small flame. Every light in this sky is a diya someone lit here. Yours floats up to join them.</p>
        <button ref={bigRef} className={s.big} onClick={light} aria-label={lit ? 'Light another diya' : 'Tap to light a diya'}>
          {lit ? <>
            <div aria-hidden="true" className={s.halo} style={{ top: '6%', width: '100%', marginLeft: '-50%', background: 'rgba(255,194,26,.08)', animationDuration: '3s', animationDelay: '-1s' }} />
            <div aria-hidden="true" className={s.halo} style={{ top: '18%', width: '70%', marginLeft: '-35%', background: 'rgba(255,194,26,.12)', animationDuration: '2.4s', animationDelay: '-.4s' }} />
            <div aria-hidden="true" className={s.halo} style={{ top: '28%', width: '44%', marginLeft: '-22%', background: 'rgba(255,194,26,.2)', animationDuration: '2s' }} />
            <div aria-hidden="true" className={s.flameWrap}><div className={s.flicker}><div className={s.flame}><div /></div></div></div>
          </> : <div aria-hidden="true" className={s.tap}>TAP TO LIGHT</div>}
          {spark > 0 && (
            <div key={spark} aria-hidden="true" className={s.sparks}>
              {SPARKS.map(([x, y, r, c], i) => <div key={i} style={{ width: r, height: r, background: c, ['--sx' as string]: `${x}px`, ['--sy' as string]: `${y}px` }} />)}
            </div>
          )}
          <div aria-hidden="true" className={s.wick} />
          <div aria-hidden="true" className={s.rim} />
          <div aria-hidden="true" className={s.bowl}>{[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ background: i % 2 ? '#FBF3E4' : '#FFC21A' }} />)}</div>
          <div aria-hidden="true" className={s.foot} />
        </button>
        <div aria-live="polite" className={s.counter}>
          <span ref={countEl} className={s.count}>{count.toLocaleString('en-IN')}</span>
          <span className={s.countLabel}>diyas lit so far</span>
        </div>
        <p className={s.msg}>{msg}</p>
        {lit && <button type="button" className={s.shareMine} onClick={shareMine}>Share your diya #{count.toLocaleString('en-IN')} →</button>}
        <DiyaFor />
        <p className={s.fw}>✨ Tap the night sky for fireworks. Green patakhe: no smoke, and no noise for the dogs.</p>
      </div>
      <div aria-hidden="true" className={s.skyline} />
    </section>
  );
}
