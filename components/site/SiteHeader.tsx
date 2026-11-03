'use client';
// The site header. On the home page it slides in once the hero has scrolled away and highlights
// the section you're in; on other pages it sits at the top. The passport pill opens My Courtyard.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MyCourtyard from '../MyCourtyard';
import SoundToggle from './SoundToggle';
import Desi from './Desi';
import Count from './Count';
import { STAMPS, load, onProgress, stampCount } from '../../lib/progress';
import s from './SiteHeader.module.css';

const LINKS: { href: string; label: string; section?: string }[] = [
  { href: '/#toys', label: 'Toys', section: 'toys' },
  { href: '/naam', label: 'Naam Kolam' },
  { href: '/pulli', label: 'Pulli puzzle' },
  { href: '/#diya', label: 'Light a Diya', section: 'diya' },
  { href: '/about', label: 'About' },
];

export default function SiteHeader({ home = false }: { home?: boolean }) {
  const path = usePathname();
  const [on, setOn] = useState(!home);
  const [active, setActive] = useState('');
  const [me, setMe] = useState(0);
  const [open, setOpen] = useState(false);
  const row = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const count = () => setMe(stampCount(load()));
    count();
    return onProgress(count);
  }, []);

  useEffect(() => {
    if (!home || !('IntersectionObserver' in window)) return;
    const hero = document.getElementById('swagat');
    const ios: IntersectionObserver[] = [];
    if (hero) {
      const io = new IntersectionObserver(([en]) => setOn(en.intersectionRatio < 0.12), { threshold: [0, 0.12, 0.3] });
      io.observe(hero);
      ios.push(io);
    }
    const spy = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
    LINKS.forEach((l) => { const el = l.section && document.getElementById(l.section); if (el) spy.observe(el); });
    ios.push(spy);
    return () => ios.forEach((io) => io.disconnect());
  }, [home]);

  // on narrow screens the links scroll sideways: fade whichever edge has more to swipe to, so a link
  // cut off at the edge reads as "there's more", not as broken
  useEffect(() => {
    const r = row.current;
    if (!r) return;
    const mark = () => {
      r.toggleAttribute('data-more-l', r.scrollLeft > 4);
      r.toggleAttribute('data-more-r', r.scrollLeft + r.clientWidth < r.scrollWidth - 4);
    };
    mark();
    r.addEventListener('scroll', mark, { passive: true });
    const ro = 'ResizeObserver' in window ? new ResizeObserver(mark) : null;
    ro?.observe(r);
    return () => { r.removeEventListener('scroll', mark); ro?.disconnect(); };
  }, []);

  // keep the current pill in view on narrow screens
  useEffect(() => {
    const r = row.current, a = r?.querySelector<HTMLElement>('[aria-current="true"],[aria-current="page"]');
    if (r && a) r.scrollTo({ left: a.offsetLeft - r.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' });
  }, [active, path]);

  const current = (l: (typeof LINKS)[number]) => (l.section ? (home && active === l.section ? 'true' : undefined) : path === l.href ? 'page' : undefined);
  const go = (e: React.MouseEvent, l: (typeof LINKS)[number]) => {
    if (!home || !l.section) return;
    const el = document.getElementById(l.section);
    if (!el) return;
    e.preventDefault();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <>
      <nav aria-label="Site" className={`${s.nav} ${home ? s.home : ''} ${on ? s.on : ''}`}>
        <div className={s.inner}>
          <Link href="/" className={s.logo} aria-label="Rangotsav home" transitionTypes={['nav-back']}
            onClick={(e) => { if (home) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}>
            <span aria-hidden="true" className={s.badge}>P</span>
            <Desi className={s.word} tone="sindoor" rough={false} text="RANGउत्सव" label="Rangotsav" />
          </Link>
          <div ref={row} className={s.scroller}>
            <div className={s.links}>
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={s.link} aria-current={current(l)} onClick={(e) => go(e, l)}>{l.label}</Link>
              ))}
              <button type="button" className={`${s.link} ${s.me}`} onClick={() => setOpen(true)} aria-label={`My Courtyard, ${me} of ${STAMPS.length} stamps`}>
                My Courtyard <span><Count value={me} ms={700} />/{STAMPS.length}</span>
              </button>
            </div>
          </div>
          <SoundToggle className={s.sound} />
        </div>
      </nav>
      <MyCourtyard open={open} onClose={() => setOpen(false)} />
    </>
  );
}
