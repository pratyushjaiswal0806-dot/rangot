'use client';
// A festival greeting someone sent you: tap to open, diyas light one by one, their art replays,
// then "light a diya back" and "send your own".
import { useEffect, useState } from 'react';
import Replay from './Replay';
import DiyaBack from './DiyaBack';
import { festivalById, greetingText, messageText } from '../lib/festivals';
import type { Recipe, GreetingData } from '../lib/recipe';
import { track } from '../lib/track';

function ting() {
  try {
    const A = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const a = new A(), t = a.currentTime;
    for (const [f, v] of [[880, 0.1], [1320, 0.06], [2640, 0.02]]) {
      const o = a.createOscillator(), g = a.createGain();
      o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 1.9);
    }
    setTimeout(() => a.close().catch(() => {}), 2200);
  } catch {}
}

export default function Greeting({ recipe, id }: { recipe: Recipe & { type: 'greeting' }; id: string }) {
  const d: GreetingData = recipe.data;
  const f = festivalById(d.f);
  const [open, setOpen] = useState(false);
  const by = recipe.by;
  const art: Recipe = d.art ?? { v: 1, type: 'naam', data: { n: by || d.to || 'Rangotsav' } };

  useEffect(() => { track('link_open', { kind: 'greeting', fest: f.key }); }, [f.key]);

  return (
    <main className="rg-greet" style={{ ['--accent' as string]: f.accent }} data-open={open}>
      <div className="rg-greet__petals" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${-i * 1.7}s`, animationDuration: `${11 + (i % 5) * 2}s` }} />)}</div>
      {!open ? (
        <div className="rg-envelope">
          <p className="rg-kicker">{d.to ? `For ${d.to}` : 'For you'}</p>
          <h1 className="rg-title" style={{ color: 'var(--marigold)' }}>{by ? `${by} sent you a ${f.key === 'anyday' ? 'diya' : f.name} greeting` : `You have a ${f.key === 'anyday' ? 'diya' : f.name} greeting`}</h1>
          <button className="rg-btn rg-btn--primary rg-envelope__btn" onClick={() => { setOpen(true); ting(); try { navigator.vibrate?.(20); } catch {} }} autoFocus>
            <span aria-hidden="true" className="rg-mini-diya is-lit" /> Open it
          </button>
        </div>
      ) : (
        <div className="rg-greet__inner">
          <p className="rg-kicker">{d.to ? `For ${d.to}` : 'For you'}</p>
          <h1 className="rg-greet__h" lang={d.l}>{greetingText(f, d.l)}</h1>
          <div className="rg-greet__art">
            <Replay recipe={art} px={900} label={art.type === 'naam' ? `A kolam woven from ${art.data.n}` : `A ${art.type} made for you`} />
          </div>
          <p className="rg-greet__msg" lang={d.l}>{messageText(d.m, d.l)}</p>
          {d.x && <p className="rg-greet__msg" style={{ fontSize: '18px' }}>{d.x}</p>}
          <p className="rg-greet__from">— {by || 'someone who thought of you'}</p>
          <DiyaBack id={id} by={by} dark />
          <div className="rg-ctas">
            <a className="rg-btn rg-btn--primary rg-btn--block" href="/?tool=greeting" onClick={() => track('make_own', { tool: 'greeting', from: 'link' })}>Send your own greeting →</a>
            <a className="rg-btn rg-btn--dark rg-btn--block" href="/">Play at Rangotsav</a>
          </div>
          {f.key !== 'anyday' && <p className="rg-small" style={{ color: 'var(--parch)', textAlign: 'center' }}>{f.story}</p>}
        </div>
      )}
      <div className="rg-greet__diyas" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <span key={i} className="rg-mini-diya" style={{ animationDelay: `${0.3 + Math.abs(4 - i) * 0.35}s` }} />)}</div>
    </main>
  );
}
