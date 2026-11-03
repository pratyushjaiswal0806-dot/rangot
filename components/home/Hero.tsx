'use client';
// The hero: layered temple arches that shift with the mouse or the phone's tilt, a swinging
// toran and lanterns, a ledge of diyas, and a kolam drawing itself around the title. On the
// night theme (Diwali, evenings) the sky behind the arches turns to night and fills with fireworks.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import FestivalBadge from './FestivalBadge';
import Desi from '../site/Desi';
import Mandala from '../site/Mandala';
import HeroFloor from './HeroFloor';
import HeroSky from './HeroSky';
import NaamRing from './NaamRing';
import { naamKolam, naamReading } from '../../lib/art/naam';
import { cleanText } from '../../lib/recipe';
import { saveName, savedName } from '../../lib/share';
import { wovenName } from '../../lib/progress';
import { chime } from '../../lib/sfx';
import { track } from '../../lib/track';
import { TOYS } from '../../lib/toys';
import { BloomIcon } from '../toys/icons';
import { useTilt } from '../../hooks/useTilt';
import { C } from '../../lib/art/palette';
import { kBez, kD, kLoop, ring } from '../../lib/art/kolam';
import { mkRng } from '../../lib/rng';
import s from './Hero.module.css';

// [English reading, Hindi, Kannada, the Hinglish poster line]
const GREET: Record<string, [string, string, string, string]> = {
  morning: ['Shubh Prabhat', 'शुभ प्रभात', 'ಶುಭೋದಯ', 'Shubh प्रभात'],
  day: ['Swagat!', 'स्वागत है', 'ಸುಸ್ವಾಗತ', 'Swagat है!'],
  evening: ['Shubh Sandhya', 'शुभ संध्या', 'ಶುಭ ಸಂಜೆ', 'Shubh संध्या'],
  night: ['Shubh Ratri', 'शुभ रात्रि', 'ಶುಭ ರಾತ್ರಿ', 'Shubh रात्रि'],
};
const part = (h: number) => (h >= 4 && h < 12 ? 'morning' : h >= 12 && h < 16 ? 'day' : h >= 16 && h < 21 ? 'evening' : 'night');

// Fixed-seed decorations, so the server and the browser draw the same toran.
const rnd = mkRng();
const TORAN = Array.from({ length: 17 }, (_, i) => ({ leaf: i % 2 === 0, color: i % 4 === 0 ? C.green : C.leaf, dur: (3.4 + rnd() * 2).toFixed(2) + 's', delay: (-rnd() * 6).toFixed(2) + 's' }));
const DIYAS = Array.from({ length: 5 }, () => (-rnd() * 3).toFixed(2) + 's');
const STRAND = Array.from({ length: 10 }, (_, i) => (i % 2 ? C.saffron : C.marigold));
const KOLAM = (() => {
  const o = ring(12, 40, -Math.PI / 2), inn = ring(6, 21, -Math.PI / 2 + Math.PI / 6);
  const dot = (p: { x: number; y: number }, r: number, c: string) => ({ x: p.x.toFixed(2), y: p.y.toFixed(2), r, c });
  return {
    outer: kD(kBez(kLoop(o, 6.4))) as string,
    inner: kD(kBez(kLoop(inn, 6))) as string,
    dots: [...o.map((p: { x: number; y: number }) => dot(p, 1.3, C.marigold)), ...inn.map((p: { x: number; y: number }) => dot(p, 1.2, C.ivory)), { x: '0', y: '0', r: 1.4, c: C.marigold }, ...ring(24, 49, -Math.PI / 2).map((p: { x: number; y: number }) => dot(p, 0.8, C.ivory))],
  };
})();

function Lantern({ cord, box, inner, tassel, fill, scale = 1, anim }: { cord: string; box: number; inner: string; tassel: string; fill: string; scale?: number; anim: string }) {
  return (
    <div className={s.lantern} style={{ animation: anim, scale: String(scale) }}>
      <div className={s.cord} style={{ height: cord }} />
      <div className={s.cap} />
      <div className={s.box} style={{ width: box, height: box, marginTop: 9, background: fill }}><i style={{ width: box * 0.36, height: box * 0.36, background: inner }} /></div>
      <div className={s.tassel} style={{ marginTop: 11 }}>{[0.75, 1, 0.75].map((k, i) => <i key={i} style={{ height: Math.round(box * 0.78 * k), background: tassel }} />)}</div>
    </div>
  );
}

function Strand({ anim }: { anim: string }) {
  return (
    <div className={s.strand} style={{ animation: anim }}>
      <div className={s.cord} />
      {STRAND.map((c, i) => <div key={i} className={s.bead} style={{ background: c }} />)}
      <div className={s.leaf} />
    </div>
  );
}

const ARCH = (d: string, fill: string, w: number, depth: string) => (
  <svg data-depth={depth} aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className={`${s.layer} ${s.arch}`}>
    <path fillRule="evenodd" fill={fill} stroke="#1B1410" strokeWidth={w} vectorEffect="non-scaling-stroke" d={`M-10 -10H110V110H-10Z ${d}`} />
  </svg>
);

export default function Hero({ ambient = true }: { ambient?: boolean }) {
  const hero = useRef<HTMLElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const { ask, askTilt } = useTilt(hero, ambient);
  const [g, setG] = useState(GREET.day);
  const [name, setName] = useState('');
  const [draft, setDraft] = useState('');
  const [back, setBack] = useState(false); // a returning visitor, greeted by name
  const [woven, setWoven] = useState(false);
  const [blooms, setBlooms] = useState(0);
  const [round, setRound] = useState(0);
  const fresh = useRef(false); // woven just now (play the chime), not restored on load
  useEffect(() => {
    setG(GREET[part(new Date().getHours())]);
    const n = savedName();
    if (n) { setName(n); setDraft(n); setBack(true); }
  }, []);

  const weave = (e: React.FormEvent) => {
    e.preventDefault();
    const v = cleanText(draft, 24);
    if (!v) return;
    fresh.current = true;
    setWoven(false);
    setName(v);
    setRound((r) => r + 1); // remounts the ring, so even the same name weaves again
    setBack(false);
    saveName(v);
    wovenName();
    track('hero_name');
  };
  const reading = name.trim() ? naamReading(naamKolam(name.trim())) : null;

  return (
    <>
      <header id="swagat" ref={hero} className={s.hero}>
        <div data-depth="-0.5" aria-hidden="true" className={`${s.layer} ${s.bands}`}>
          <i style={{ height: '40%', background: '#B92E22' }} /><i style={{ height: '28%', background: '#9E2219' }} /><i style={{ height: '18%', background: '#821913' }} />
        </div>
        <HeroSky hero={hero} />
        {ARCH('M15 100V47 Q15 27 50 15 Q85 27 85 47V100Z', '#E3A21E', 3, '0.3')}
        <div data-depth="0.8" aria-hidden="true" className={s.layer} style={{ top: 0, left: '70%', zIndex: 0 }}>
          <Lantern cord="24vh" box={40} fill={C.green} inner={C.marigold} tassel={C.marigold} scale={0.7} anim="swing 6.5s ease-in-out -3.2s infinite" />
        </div>
        {ARCH('M10 100V43 Q10 21 50 9 Q90 21 90 43V100Z', '#B8361F', 3, '0.9')}
        {ARCH('M6 100V39 Q6 16 50 4 Q94 16 94 39V100Z', '#4A0A26', 4, '1.5')}
        <div data-depth="1.5" aria-hidden="true" className={s.layer} style={{ top: 0, left: '1.5%', zIndex: 2 }}><Strand anim="sway 5.2s ease-in-out -1.7s infinite" /></div>
        <div data-depth="1.5" aria-hidden="true" className={s.layer} style={{ top: 0, right: '1.5%', zIndex: 2 }}><Strand anim="sway 5.8s ease-in-out -4.1s infinite" /></div>
        <div data-depth="2.2" aria-hidden="true" className={s.layer} style={{ top: 0, left: '11%', zIndex: 2 }}>
          <Lantern cord="15vh" box={42} fill={C.marigold} inner={C.vermilion} tassel={C.vermilion} anim="swing 5.4s ease-in-out -0.9s infinite" />
        </div>
        <div data-depth="2.2" aria-hidden="true" className={s.layer} style={{ top: 0, right: '12%', zIndex: 2 }}>
          <Lantern cord="9vh" box={36} fill={C.vermilion} inner={C.marigold} tassel={C.marigold} anim="swing 6.1s ease-in-out -2.6s infinite" />
        </div>
        <div aria-hidden="true" className={s.ledge}>
          {DIYAS.map((d, i) => (
            <div key={i} className={s.diya}>
              <div className={s.halo} style={{ animationDelay: d }} /><div className={s.flame} style={{ animationDelay: d }} /><div className={s.bowl} />
            </div>
          ))}
        </div>
        <div aria-hidden="true" className={s.toran}>
          <div className={s.rope} />
          <div className={s.row}>
            {TORAN.map((t, i) => (
              <div key={i} className={s.hang} style={{ animation: `sway ${t.dur} ease-in-out ${t.delay} infinite` }}>
                {t.leaf ? <div className={s.mango} style={{ background: t.color }} /> : <>
                  <div className={s.stem} />
                  <div className={s.bud} style={{ width: 20, height: 20, background: C.marigold }} />
                  <div className={s.bud} style={{ width: 17, height: 17, marginTop: -3, background: C.saffron }} />
                  <div className={s.bud} style={{ width: 14, height: 14, marginTop: -3, background: C.marigold }} />
                </>}
              </div>
            ))}
          </div>
        </div>

        <HeroFloor hero={hero} center={ring} onBloom={setBlooms} />
        <div className={s.content}>
          <div className={s.greet}>
            <Desi className={s.greetEn} rough={false} text={back && name ? `${g[3].replace(/!$/, '')}, ${name}!` : g[3]} label={back && name ? `${g[0].replace(/!$/, '')}, ${name}!` : g[0]} />
            <span className={s.greetSub}><span lang="hi">{g[1]}</span><span aria-hidden="true">·</span><span lang="kn">{g[2]}</span></span>
          </div>
          <div ref={ring} className={s.ring}>
            <Mandala className={s.mandala} />
            {name.trim() && <NaamRing key={round} name={name.trim()} className={s.naam} onWoven={() => { setWoven(true); if (fresh.current) { fresh.current = false; chime(5, 5); } }} />}
            <svg aria-hidden="true" viewBox="-50 -50 100 100" className={s.kolam} style={{ opacity: name.trim() ? 0 : 1 }}>
              <path d={KOLAM.outer} pathLength={1} stroke="#FBF3E4" style={{ animation: 'kolamDraw 6s cubic-bezier(.45,.1,.2,1) .4s both' }} />
              <path d={KOLAM.inner} pathLength={1} stroke="#FFC21A" style={{ animation: 'kolamDraw 4.5s cubic-bezier(.45,.1,.2,1) 1.6s both' }} />
              <path d="M6 0A6 6 0 1 1 -6 0A6 6 0 1 1 6 0Z" pathLength={1} stroke="#FBF3E4" style={{ animation: 'kolamDraw 2s cubic-bezier(.45,.1,.2,1) 2.8s both' }} />
              {KOLAM.dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} />)}
            </svg>
            <div className={s.title}>
              <Desi as="h1" text="RANGउत्सव" label="Rangotsav" pop reveal={false} />
              <span aria-hidden="true" className="desi-gloss">rang · utsav = a festival of colour</span>
            </div>
          </div>
          <div aria-live="polite" className={s.reading}>
            {reading && (woven || back) && <>
              <span className={s.readingT}>{name.trim()}, you&apos;re {reading.title}</span>
              <span>{reading.traits} <a href={`/naam?n=${encodeURIComponent(name.trim())}`}>Share your card →</a></span>
            </>}
          </div>
          <form className={s.form} onSubmit={weave}>
            <label htmlFor="hero-name" className={s.formLabel}>{name.trim() ? 'Weave another name' : 'What does your name look like as a kolam?'}</label>
            <input id="hero-name" className={s.input} value={draft} maxLength={24} placeholder="Type your name" autoComplete="given-name" onChange={(e) => setDraft(e.target.value)} />
            <button className={`${s.cta} rg-bloom`} type="submit"><BloomIcon size={24} />Weave <span lang="hi">करो</span></button>
          </form>
          <FestivalBadge />
          <p className={s.tagline}>{blooms > 0 ? 'Keep going. Every move blooms eight ways.' : 'Indian art forms, come alive in code. Tap anywhere to play.'}</p>
          <p className={s.club}><b aria-hidden="true">P</b><span>a Pegasus · RVITM project</span></p>
          <div className={s.ctas}>
            <Link href="/rangoli" className={`${s.cta} ${s.alt} rg-bloom ${blooms >= 6 ? s.glow : ''}`} transitionTypes={['nav-forward']}><BloomIcon size={24} petal="#B0246A" center="#FFC21A" />{blooms >= 6 ? 'Like that? Open the full floor' : <>Rangoli <span lang="hi">बनाओ</span></>}</Link>
            <a href="#toys" className={`${s.cta} ${s.ghostBtn}`}>All {TOYS.length} toys ↓</a>
          </div>
          {ask && <button className={s.tilt} onClick={askTilt}>Tilt your phone to look around</button>}
        </div>
      </header>
      <div aria-hidden="true" className={s.bunting}>
        <svg width="100%" height="46" style={{ display: 'block' }}>
          <defs>
            <pattern id="bt1" width="96" height="46" patternUnits="userSpaceOnUse">
              <path d="M4 4 L44 4 L24 38 Z" fill="#CC3B22" stroke="#1B1410" strokeWidth="2.5" strokeLinejoin="round" /><circle cx="24" cy="15" r="3.5" fill="#FFC21A" stroke="#1B1410" strokeWidth="1.5" />
              <path d="M52 4 L92 4 L72 38 Z" fill="#2F6B3B" stroke="#1B1410" strokeWidth="2.5" strokeLinejoin="round" /><circle cx="72" cy="15" r="3.5" fill="#FBF3E4" stroke="#1B1410" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="46" fill="url(#bt1)" /><rect width="100%" height="5" fill="#1B1410" />
        </svg>
      </div>
    </>
  );
}
