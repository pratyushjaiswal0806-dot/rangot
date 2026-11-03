'use client';
// Aaj ka Mela: what other visitors just made, each tile replaying itself. New ones drop in while
// you watch; tap one to see it, remix it, or report it. Hidden when there's no store.
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Replay from '../Replay';
import SectionHead from '../SectionHead';
import { canRemix, hrefFor } from '../../lib/toys';
import { LABEL, validateRecipe, type Recipe } from '../../lib/recipe';
import { track } from '../../lib/track';
import { flash } from '../../lib/toast';
import s from './MelaWall.module.css';

type Item = { id: string; recipe: Recipe; fresh?: boolean };
type Wall = { items: Item[]; today: Record<string, number>; more: boolean };
const SHOW = 12;
const PLURAL: Record<string, string> = { rangoli: 'rangolis', kolam: 'kolams', block: 'block prints', mehendi: 'mehendis', kathputli: 'puppet shows', warli: 'Warli walls', patang: 'kites' };

async function fetchWall(offset = 0): Promise<Wall | null> {
  const r = await fetch('/api/wall?offset=' + offset).catch(() => null);
  if (!r || !r.ok) return null;
  const d = await r.json().catch(() => null);
  if (!d || !Array.isArray(d.items)) return null;
  const items = d.items.flatMap((x: { id: unknown; recipe: unknown }) => { const recipe = validateRecipe(x.recipe); return typeof x.id === 'string' && recipe ? [{ id: x.id, recipe }] : []; });
  return { items, today: d.today ?? {}, more: !!d.more };
}

export default function MelaWall() {
  const [wall, setWall] = useState<Wall | null>(null);
  const [off, setOff] = useState(false); // no store: hide the section
  const [shown, setShown] = useState(SHOW);
  const [gone, setGone] = useState<Set<string>>(new Set());
  const sec = useRef<HTMLElement>(null);
  const seen = useRef(false);

  const refresh = useCallback(async () => {
    const w = await fetchWall();
    if (!w) { setOff((o) => o || !wall); return; }
    setWall((prev) => {
      if (!prev) return w;
      const old = new Set(prev.items.map((i) => i.id));
      const fresh = w.items.filter((i) => !old.has(i.id)).map((i) => ({ ...i, fresh: true }));
      return { ...w, items: [...fresh, ...prev.items.filter((i) => !fresh.some((f) => f.id === i.id))] };
    });
  }, [wall]);

  useEffect(() => {
    let live = true;
    fetchWall().then((w) => { if (!live) return; if (w) setWall(w); else setOff(true); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    const el = sec.current;
    if (!el || off) return;
    let visible = false;
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && !seen.current) { seen.current = true; track('wall_open'); }
    }, { threshold: 0.1 });
    io.observe(el);
    const t = setInterval(() => { if (visible && !document.hidden) refresh(); }, 20000);
    return () => { io.disconnect(); clearInterval(t); };
  }, [off, refresh]);

  const report = async (id: string) => {
    setGone((g) => new Set(g).add(id));
    await fetch('/api/wall/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {});
    flash("Thanks. It's hidden for you, and we'll take a look.");
  };
  const more = async () => {
    if (!wall) return;
    if (shown < wall.items.length) { setShown((n) => n + SHOW); return; }
    const w = await fetchWall(wall.items.length);
    if (w) setWall({ ...wall, items: [...wall.items, ...w.items.filter((i) => !wall.items.some((x) => x.id === i.id))], more: w.more });
    setShown((n) => n + SHOW);
  };

  if (off) return null;
  const items = (wall?.items ?? []).filter((i) => !gone.has(i.id));
  const counts = Object.entries(wall?.today ?? {}).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);

  return (
    <section id="mela" ref={sec} className={s.wall}>
      <div className={s.head}>
        <SectionHead title="आज का MELA" label="Aaj ka Mela" gloss="today's fair" panel="#2F6B3B" kicker="Made today" kn="ಇಂದಿನ ಜಾತ್ರೆ" hi="आज का मेला">
          Everything here was just made by someone like you. Tap one to watch it, or remix it and make it yours.
        </SectionHead>
        <p className={s.live} aria-live="polite">
          <span className={s.dot} aria-hidden="true" /> Live
          {counts.length > 0 && <> · {counts.map(([t, n]) => `${n.toLocaleString('en-IN')} ${n === 1 ? LABEL[t as keyof typeof LABEL] : PLURAL[t] ?? t}`).join(' · ')} today</>}
        </p>
      </div>
      {wall && !items.length ? (
        <div className={s.empty}>
          <p>The wall is waiting for its first creation today.</p>
          <Link href="/rangoli" className={s.emptyBtn}>Draw the first one →</Link>
        </div>
      ) : (
        <ul className={s.grid}>
          {(wall ? items.slice(0, shown) : Array.from({ length: 8 }, () => null)).map((it, i) => it ? (
            <li key={it.id} className={`${s.tile} ${it.fresh ? s.fresh : ''}`} style={{ ['--tilt' as string]: `${[-1.2, 0.8, -0.5, 1.1, -0.9, 0.6][i % 6]}deg` }}>
              <Link href={`/r/${it.id}`} className={s.art} aria-label={`A ${LABEL[it.recipe.type]} from the wall`}>
                <Replay recipe={it.recipe} px={360} lazy loop={4200} label={`A ${LABEL[it.recipe.type]} replaying`} className={s.cv} />
              </Link>
              <div className={s.bar}>
                <span className={s.kind}>{LABEL[it.recipe.type]}</span>
                {canRemix(it.recipe.type) && <Link href={`${hrefFor(it.recipe.type)}?remix=${it.id}`} className={s.remix} onClick={() => track('wall_remix', { kind: it.recipe.type })}>Remix</Link>}
                <button className={s.flag} onClick={() => report(it.id)} aria-label="Report this creation" title="Report">⚑</button>
              </div>
            </li>
          ) : <li key={i} className={`${s.tile} ${s.ghost}`} aria-hidden="true" />)}
        </ul>
      )}
      {wall && (shown < items.length || wall.more) && <button className={s.more} onClick={more}>Show more from the mela</button>}
    </section>
  );
}
