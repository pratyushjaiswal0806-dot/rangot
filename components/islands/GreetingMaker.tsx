'use client';
// Festival greeting maker: pick a festival, who it's for, a language and a message, and get a
// link that opens as an animated greeting. Built for family WhatsApp groups.
import { useEffect, useMemo, useState } from 'react';
import SectionHead from '../SectionHead';
import LinkActions from '../LinkActions';
import { ANYDAY, LANGS, MESSAGES, currentFestival, greetingText, messageText, upcoming, type Festival } from '../../lib/festivals';
import { cleanText, type Art, type Lang, type Recipe } from '../../lib/recipe';
import { makeLink, saveName, savedName } from '../../lib/share';
import { stamp } from '../../lib/progress';
import { track } from '../../lib/track';

const WHO = ['Maa', 'Papa', 'Dadi', 'Nani', 'Bhaiya', 'Didi', 'Bestie'];
const ink = '#1B1410';

export default function GreetingMaker({ lastArt, preset }: { lastArt?: () => Art | null; preset?: { to?: string; anyday?: boolean } }) {
  const [fests, setFests] = useState<Festival[]>([ANYDAY]);
  const [f, setF] = useState<Festival>(ANYDAY);
  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [l, setL] = useState<Lang>('en');
  const [m, setM] = useState(0);
  const [x, setX] = useState('');
  const [artMode, setArtMode] = useState<'naam' | 'mine'>('naam');
  const [mine, setMine] = useState<Art | null>(null);
  const [state, setState] = useState<{ s: 'idle' | 'busy' | 'fail' } | { s: 'ok'; url: string }>({ s: 'idle' });

  useEffect(() => {
    const cur = currentFestival();
    const list = [...(cur ? [cur] : []), ...upcoming(undefined, 3).filter((u) => u.id !== cur?.id)].slice(0, 3);
    setFests([...list, ANYDAY]);
    setF(list[0] ?? ANYDAY);
    setFrom(savedName());
  }, []);
  useEffect(() => {
    if (preset?.to) setTo(preset.to);
    if (preset?.anyday) { setF(ANYDAY); setM(5); }
  }, [preset]);
  // re-check for a fresh rangoli/kolam whenever the section is used
  const refreshMine = () => setMine(lastArt?.() ?? null);

  const recipe = useMemo<Recipe>(() => {
    const t = cleanText(to, 32), fr = cleanText(from, 24);
    const art: Art = artMode === 'mine' && mine ? mine : { v: 1, type: 'naam', data: { n: t || fr || 'Rangotsav' } };
    const extra = cleanText(x, 60);
    return { v: 1, type: 'greeting', ...(fr ? { by: fr } : {}), data: { f: f.id, to: t, m, l, ...(extra ? { x: extra } : {}), art } };
  }, [to, from, x, artMode, mine, f, m, l]);

  // any edit invalidates the link that was made
  useEffect(() => { setState((s) => (s.s === 'ok' || s.s === 'fail' ? { s: 'idle' } : s)); }, [recipe]);

  const make = async () => {
    setState({ s: 'busy' });
    if (from.trim()) saveName(from.trim());
    const url = await makeLink(recipe);
    if (!url) { setState({ s: 'fail' }); return; }
    setState({ s: 'ok', url });
    stamp('greeting');
    track('greeting_sent', { fest: f.key, lang: l, art: artMode });
  };

  const toName = cleanText(to, 32);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }} onFocus={refreshMine} onPointerEnter={refreshMine}>
      <SectionHead words={['Shubh', 'Sandesh']} accent={1} color="#CC3B22" kicker="Greetings for family" kn="ಶುಭಾಶಯ" hi="शुभकामनाएँ">
        Make a greeting that opens like a little festival: diyas light up, a kolam weaves their name, and they can light a diya back for you.
      </SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,360px),1fr))', gap: '28px 40px', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 18, padding: 20, background: '#F6E7C8', border: `3px solid ${ink}`, boxShadow: `8px 8px 0 ${ink}` }}>
          <fieldset className="rg-fs">
            <legend className="rg-label">Occasion</legend>
            <div className="rg-row">{fests.map((o) => <button key={o.id} type="button" className="rg-chip" aria-pressed={f.id === o.id} onClick={() => setF(o)}>{o.name}</button>)}</div>
          </fieldset>
          <div>
            <label className="rg-label" htmlFor="rg-g-to">For</label>
            <input id="rg-g-to" className="rg-input" value={to} maxLength={32} placeholder="Maa, Sharma family, Riya…" onChange={(e) => setTo(e.target.value)} />
            <div className="rg-row" style={{ marginTop: 8 }}>{WHO.map((w) => <button key={w} type="button" className="rg-chip" aria-pressed={to === w} onClick={() => setTo(w)}>{w}</button>)}</div>
          </div>
          <fieldset className="rg-fs">
            <legend className="rg-label">Language</legend>
            <div className="rg-row">{LANGS.map((o) => <button key={o.id} type="button" className="rg-chip" aria-pressed={l === o.id} lang={o.id} onClick={() => setL(o.id)}>{o.label}</button>)}</div>
          </fieldset>
          <fieldset className="rg-fs">
            <legend className="rg-label">Message</legend>
            <div style={{ display: 'grid', gap: 8 }}>
              {MESSAGES.map((_, i) => (
                <button key={i} type="button" className="rg-chip rg-chip--wide" aria-pressed={m === i} lang={l} onClick={() => setM(i)}>{messageText(i, l)}</button>
              ))}
            </div>
            <input className="rg-input" style={{ marginTop: 10 }} value={x} maxLength={60} placeholder="Add your own line (optional)" aria-label="Your own line" onChange={(e) => setX(e.target.value)} />
          </fieldset>
          <fieldset className="rg-fs">
            <legend className="rg-label">Picture</legend>
            <div className="rg-row">
              <button type="button" className="rg-chip" aria-pressed={artMode === 'naam'} onClick={() => setArtMode('naam')}>A kolam of {toName ? `${toName}'s` : 'their'} name</button>
              {mine && <button type="button" className="rg-chip" aria-pressed={artMode === 'mine'} onClick={() => setArtMode('mine')}>My {mine.type} from today</button>}
            </div>
          </fieldset>
          <div>
            <label className="rg-label" htmlFor="rg-g-from">From</label>
            <input id="rg-g-from" className="rg-input" value={from} maxLength={24} placeholder="Your name" autoComplete="given-name" onChange={(e) => setFrom(e.target.value)} />
          </div>
          {state.s === 'ok'
            ? <LinkActions url={state.url} type="greeting" title={`${f.name} greeting${toName ? ' for ' + toName : ''}`} text={`${greetingText(f, l)}${toName ? ', ' + toName : ''}! I made you something 🪔`} />
            : <button className="rg-btn rg-btn--primary rg-btn--block" onClick={make} disabled={state.s === 'busy'} style={{ minHeight: 56, fontSize: 18 }}>{state.s === 'busy' ? 'Lighting the diyas…' : 'Make my greeting'}</button>}
          {state.s === 'fail' && <p className="rg-status" role="alert">Couldn&apos;t make a link right now. Please try again in a minute.</p>}
        </div>
        <div className="rg-gprev" style={{ ['--accent' as string]: f.accent }} aria-label="Preview">
          <span className="rg-kicker">{toName ? `For ${toName}` : 'For you'}</span>
          <span className="rg-gprev__h" lang={l}>{greetingText(f, l)}</span>
          <span className="rg-gprev__m" lang={l}>{messageText(m, l)}</span>
          {cleanText(x, 60) && <span className="rg-gprev__m" style={{ fontSize: 16 }}>{cleanText(x, 60)}</span>}
          <span className="rg-gprev__from">— {cleanText(from, 24) || 'you'}</span>
          <span className="rg-gprev__diyas" aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <span key={i} className="rg-mini-diya is-lit" />)}</span>
          {f.id !== 'anyday' && <span className="rg-small" style={{ color: 'var(--parch)' }}>{f.story}</span>}
        </div>
      </div>
    </div>
  );
}
