'use client';
// Footer: the marigold garland (tap it three times for a gulal burst), share the site, the club.
import { useRef } from 'react';
import Link from 'next/link';
import { gulal } from '../../lib/fx';
import { flash } from '../../lib/toast';
import ThemeToggle from './ThemeToggle';
import CheentiToggle from './CheentiToggle';
import makers from '../../data/makers.json';
import s from './SiteFooter.module.css';

function Garland() {
  const beads = [14, 28, 42, 56, 70, 84, 98, 112, 126];
  const y = (cx: number) => 6 + 22 * (1 - ((cx - 70) / 70) ** 2);
  const cols = ['#E8761E', '#FFC21A', '#C93A82', '#FFC21A', '#E8761E', '#FFC21A', '#C93A82', '#FFC21A', '#E8761E'];
  return (
    <svg aria-hidden="true" width="100%" height="52" style={{ display: 'block' }}>
      <defs>
        <pattern id="gsF" width="140" height="52" patternUnits="userSpaceOnUse">
          <path d="M0 6 Q70 50 140 6" fill="none" stroke="#4F8A3C" strokeWidth="2.5" />
          {beads.map((cx, i) => <circle key={cx} cx={cx} cy={y(cx).toFixed(1)} r="7" fill={cols[i]} stroke="#1B1410" strokeWidth="2" />)}
        </pattern>
      </defs>
      <rect width="100%" height="52" fill="url(#gsF)" />
    </svg>
  );
}

// The Pegasus club link is set with NEXT_PUBLIC_CLUB_URL (see .env.example). Until it is, the button is left out
// rather than shipping a link that goes nowhere.
const CLUB_URL = process.env.NEXT_PUBLIC_CLUB_URL;

export default function SiteFooter({ clubUrl = CLUB_URL }: { clubUrl?: string }) {
  const taps = useRef<number[]>([]);
  const tickle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const now = Date.now();
    taps.current = taps.current.filter((t) => now - t < 1600);
    taps.current.push(now);
    const el = e.currentTarget;
    if (el.animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) el.animate([{ rotate: '0deg' }, { rotate: '-2deg' }, { rotate: '2deg' }, { rotate: '0deg' }], { duration: 380 });
    if (taps.current.length >= 3) { taps.current = []; gulal(); flash('Holi hai! Bura na mano.'); }
  };
  const shareSite = async () => {
    const url = location.origin, text = 'Come play at Rangotsav: weave your name into a kolam, draw rangoli, block-print cloth and paint truck art.';
    try { if (navigator.share) { await navigator.share({ title: 'Rangotsav', text, url }); return; } } catch (e) { if (e instanceof Error && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(text + ' ' + url); flash('Link copied. Send it to a friend!'); }
    catch { window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank', 'noopener'); }
  };
  return (
    <footer className={s.foot}>
      <button className={s.garland} onClick={tickle} aria-label="Marigold garland"><Garland /></button>
      <p className={s.made}>Crafted with ❤️ by Pegasus, the web-dev club of RVITM</p>
      <div className={s.row}>
        <button className={s.btn} onClick={shareSite}>Share Rangotsav with a friend</button>
        {clubUrl && <a className={`${s.btn} ${s.gold}`} href={clubUrl}>Visit the Pegasus site →</a>}
      </div>
      <Link href="/about" className={s.about}>{makers.some((m) => m.shown) ? 'How it works · Meet the makers' : 'How it works'}</Link>
      <Link href="/words" className={s.about}>Shabd kosh: all the words</Link>
      <div className={s.toggles}><ThemeToggle className={s.theme} /><CheentiToggle className={s.theme} /></div>
      <p className={s.small}>RV Institute of Technology &amp; Management · Bengaluru</p>
      <p className={s.psst}>psst… the garland is ticklish.</p>
    </footer>
  );
}
