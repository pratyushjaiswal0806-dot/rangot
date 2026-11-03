'use client';
// The toy shelf: every toy as a big tile whose preview keeps drawing itself. One tap opens the
// toy, and the preview morphs into its drawing surface. Today's festival's toy goes first. Tiles
// deal in like cards as the shelf scrolls into view; "Koi bhi!" spins a highlight round the shelf
// like a mela wheel and opens wherever it stops.
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Replay from '../Replay';
import SectionHead from '../SectionHead';
import Morph from '../toys/Morph';
import SelfiePreview from '../toys/SelfiePreview';
import Desi from '../site/Desi';
import { TOYS, toyById, type Toy, type ToyId } from '../../lib/toys';
import { sampleFor } from '../../lib/art/samples';
import { currentFestival } from '../../lib/festivals';
import { load, onProgress } from '../../lib/progress';
import { challengesFor } from '../../lib/challenges';
import { savedName } from '../../lib/share';
import { puzzleNumber } from '../../lib/pulli';
import { boing, calm } from '../../lib/motion';
import { chime, pluck } from '../../lib/sfx';
import { track } from '../../lib/track';
import type { Recipe } from '../../lib/recipe';
import s from './ToyShelf.module.css';

// a festival's suggested tool (data/festivals.json) → the toy to put first
const FEST_TOY: Record<string, ToyId> = { rangoli: 'rangoli', kolam: 'kolam', poster: 'poster', pookalam: 'pookalam', bandhani: 'bandhani', block: 'block' };
const TILTS = [-1, 0.8, -0.6, 1.1, -1.2, 0.6, -0.8, 1, -0.5];

function Tile({ toy, recipe, got, stars, big, i, hot }: { toy: Toy; recipe: Recipe | null; got: boolean; stars: number; big: boolean; i: number; hot: boolean }) {
  return (
    <Link href={toy.href} data-tile="" data-reveal="" data-hot={hot ? '' : undefined} className={`${s.tile} ${big ? s.big : ''}`} style={{ ['--tilt' as string]: `${TILTS[i % 9]}deg`, ['--deal' as string]: `${(i % 4) * 70}ms` }} transitionTypes={['nav-forward']}>
      <Morph id={toy.id}>
        <div className={s.art} style={{ background: toy.floor }}>
          {recipe && <Replay recipe={recipe} px={big ? 720 : 480} lazy loop={2600} label={`${toy.title}: a sample`} className={s.cv} />}
        </div>
      </Morph>
      <span className={s.tag}>{toy.tag}</span>
      {got && <span className={s.got} role="img" aria-label="You've tried this">✓</span>}
      {stars > 0 && <span className={s.stars} role="img" aria-label={`${stars} of 3 challenges done`}>{'★'.repeat(stars)}</span>}
      <span className={s.meta}>
        <Desi className={s.title} tone="sindoor" rough={big} text={toy.mix} label={toy.title} />
        <span className={s.names}><span>{toy.title}</span><span aria-hidden="true">·</span><span lang="kn">{toy.kn}</span></span>
        <span className={s.blurb}>{toy.blurb}</span>
        {big && <span className={`${s.go} rg-bloom`}>{toy.cta} →</span>}
      </span>
    </Link>
  );
}

export default function ToyShelf() {
  const [name, setName] = useState('');
  const [stamps, setStamps] = useState<Record<string, number>>({});
  const [met, setMet] = useState<string[]>([]);
  const [day, setDay] = useState<string | undefined>(undefined);
  const [first, setFirst] = useState<ToyId | undefined>(undefined);
  const [hot, setHot] = useState(-1);
  const grid = useRef<HTMLDivElement>(null);
  const spin = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    setName(savedName());
    const cur = currentFestival();
    // Diwali's toy is the sparkler (its greeting tool stays rangoli in data/festivals.json)
    if (cur) setFirst(cur.key === 'diwali' ? 'phuljhadi' : FEST_TOY[cur.tool]);
    setDay(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()));
    const read = () => { const st = load(); setStamps(st.stamps as Record<string, number>); setMet(st.challenges); };
    read();
    const off = onProgress(read);
    return () => { off(); clearTimeout(spin.current); };
  }, []);

  // Naam Kolam stays the big first tile; the festival's toy comes right after it.
  const order = useMemo(() => (first && first !== 'naam' ? [TOYS[0], toyById(first), ...TOYS.slice(1).filter((t) => t.id !== first)] : TOYS), [first]);
  const main = order.filter((t) => t.id !== 'selfie'), booth = toyById('selfie');
  const recipes = useMemo(() => Object.fromEntries(TOYS.map((t) => [t.id, sampleFor(t.id, name || 'Rangotsav', day)])) as Record<ToyId, Recipe | null>, [name, day]);

  // Koi bhi (any one!): the highlight runs round the shelf twice, slowing like a mela wheel, with a
  // rising note per tile; where it stops bounces, then opens.
  const koiBhi = () => {
    const tiles = [...(grid.current?.querySelectorAll<HTMLAnchorElement>('a[data-tile]') ?? [])];
    if (!tiles.length || spin.current) return;
    const pick = Math.floor(Math.random() * tiles.length), steps = calm() ? 0 : tiles.length * 2 + pick;
    track('surprise', { tool: 'koi-bhi' });
    let i = 0;
    const tick = () => {
      const idx = i % tiles.length;
      setHot(idx);
      pluck(2 + (i % 10), 0.45);
      if (i < steps) { i++; spin.current = setTimeout(tick, 45 + (i / steps) ** 2.4 * 300); return; }
      const el = tiles[idx];
      el.scrollIntoView({ block: 'center', behavior: calm() ? 'auto' : 'smooth' });
      spin.current = setTimeout(() => { boing(el, 1.2); chime(5, 4); }, 350);
      spin.current = setTimeout(() => { spin.current = undefined; setHot(-1); router.push(el.getAttribute('href')!, { transitionTypes: ['nav-forward'] }); }, 1050);
    };
    tick();
  };

  return (
    <section id="toys" className={s.shelf}>
      <SectionHead title="Come खेलो" label="Come play" gloss="come play" kicker="Toys" kn="ಆಟಿಕೆಗಳು" hi="खिलौने">
        {TOYS.length} little toys, each one an Indian art form. Tap one and start making. {day ? `Today's Pulli is puzzle #${puzzleNumber(day)}.` : ''}
      </SectionHead>
      <button type="button" className={`${s.koi} rg-bloom`} onClick={koiBhi}>
        <span aria-hidden="true" className={s.dice}>🎲</span><b>Koi bhi!</b><small>pick a toy for me</small>
      </button>
      <div ref={grid} className={s.grid}>
        {main.map((t, i) => (
          <Tile key={t.id} toy={t} recipe={recipes[t.id]} got={!!stamps[t.stamp]} stars={challengesFor(t.id).filter((c) => met.includes(c.id)).length} big={i === 0} i={i} hot={hot === i} />
        ))}
        <Link href={booth.href} data-tile="" data-reveal="" data-hot={hot === main.length ? '' : undefined} className={`${s.tile} ${s.banner}`} style={{ ['--deal' as string]: '140ms' }} transitionTypes={['nav-forward']}>
          <Morph id="selfie"><div className={s.art} style={{ background: booth.floor, aspectRatio: '4 / 5' }}><SelfiePreview name={name || 'Apna Naam'} className={s.cv} /></div></Morph>
          <span className={s.tag}>{booth.tag}</span>
          {stamps[booth.stamp] && <span className={s.got} role="img" aria-label="You've tried this">✓</span>}
          <span className={s.meta}>
            <Desi className={s.title} tone="sindoor" text={booth.mix} label={booth.title} />
            <span className={s.names}><span>{booth.title}</span>{' '}<span aria-hidden="true">·</span>{' '}<span lang="kn">{booth.kn}</span></span>
            <span className={s.blurb}>{booth.blurb} Pick a frame, add your name and some nazar-battu eyes. Your photo never leaves your phone.</span>
            <span className={`${s.go} rg-bloom`}>{booth.cta} →</span>
          </span>
        </Link>
      </div>
    </section>
  );
}
