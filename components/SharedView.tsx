'use client';
// The page a friend lands on from a share link: the creation replays itself, then "make your
// own" and "remix this" pull them into the same tool.
import { useEffect, useRef, useState } from 'react';
import Replay, { type ReplayHandle } from './Replay';
import DiyaBack from './DiyaBack';
import culture from '../data/culture.json';
import { LABEL, type Recipe } from '../lib/recipe';
import { naamKolam, naamReading } from '../lib/art/naam';
import { track } from '../lib/track';

const REMIX = new Set(['rangoli', 'kolam', 'block', 'poster', 'mehendi']);

export default function SharedView({ recipe, id }: { recipe: Recipe; id: string }) {
  const rp = useRef<ReplayHandle>(null);
  const [done, setDone] = useState(false);
  const by = recipe.by;
  const label = LABEL[recipe.type];
  const naam = recipe.type === 'naam' ? naamReading(naamKolam(recipe.data.n)) : null;
  const facts = (culture as Record<string, { title: string; facts: string[] }>)[recipe.type];

  useEffect(() => { track('link_open', { kind: recipe.type }); }, [recipe.type]);

  const title = naam && recipe.type === 'naam'
    ? `${recipe.data.n}, woven`
    : by ? `${by}'s ${label}` : `A ${label} from Rangotsav`;
  const kicker = naam ? `${naam.stats} · ${naam.title}` : by ? `${by} made this at Rangotsav` : 'Made at Rangotsav';
  const forLine = recipe.type === 'naam' && recipe.data.for ? `${by ?? 'Someone'} wove this for ${recipe.data.for}` : null;
  const make = recipe.type === 'naam' ? 'Weave your name' : `Make your own ${label}`;

  return (
    <main className="rg-page">
      <header className="rg-top">
        <a href="/" className="rg-logo">Rangotsav</a>
        <a href="/" className="rg-chip">Explore all</a>
      </header>
      <section className="rg-shared">
        <div className="rg-shared__art">
          <div className={'rg-frame' + (recipe.type === 'plate' && recipe.data.f === 'wallpaper' ? ' rg-frame--tall' : '')}>
            <Replay ref={rp} recipe={recipe} label={`${title}, replaying`} onDone={() => setDone(true)} />
          </div>
          <button className="rg-chip" style={{ marginTop: 14 }} onClick={() => { setDone(false); rp.current?.replay(); }}>↻ Watch again</button>
        </div>
        <div className="rg-shared__copy">
          <p className="rg-kicker">{kicker}</p>
          <h1 className="rg-title">{title}</h1>
          {forLine && <p className="rg-p" style={{ fontWeight: 700 }}>{forLine}</p>}
          {naam && <p className="rg-p rg-reading">{naam.traits}</p>}
          <div className="rg-ctas" data-done={done}>
            <a className="rg-btn rg-btn--primary rg-btn--block" href={`/?tool=${recipe.type}`} onClick={() => track('make_own', { tool: recipe.type, from: 'link' })}>{make} →</a>
            {REMIX.has(recipe.type) && <a className="rg-btn rg-btn--block" href={`/?remix=${id}`}>Remix this one</a>}
          </div>
          <DiyaBack id={id} by={by} dark />
          {facts && (
            <aside className="rg-fact">
              <span className="rg-label">Did you know · {facts.title}</span>
              <ul>{facts.facts.map((f) => <li key={f}>{f}</li>)}</ul>
            </aside>
          )}
          {recipe.type !== 'naam' && (
            <a className="rg-promo" href="/?tool=naam">
              <b>What does your name look like as a kolam?</b>
              <span>Weave it in 5 seconds →</span>
            </a>
          )}
        </div>
      </section>
      <footer className="rg-foot">A Pegasus · RVITM project · <a href="/">rangotsav</a></footer>
    </main>
  );
}
