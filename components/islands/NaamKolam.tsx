'use client';
// Naam Kolam: type a name, watch it weave into its own kolam, read its (playful) reading, share
// the card. "For a friend" mode makes one for someone else, which is how new people arrive.
import { useEffect, useMemo, useRef, useState } from 'react';
import Replay, { type ReplayHandle } from '../Replay';
import SectionHead from '../SectionHead';
import { naamKolam, naamReading } from '../../lib/art/naam';
import { createPlayer } from '../../lib/art/player';
import { cleanText, type Recipe } from '../../lib/recipe';
import { saveName, savedName } from '../../lib/share';
import { wovenName } from '../../lib/progress';
import { track } from '../../lib/track';
import type { ShareRequest } from '../ShareSheet';

const ink = '#1B1410';

export default function NaamKolam({ initial, share }: { initial?: string; share: (r: ShareRequest) => void }) {
  const [draft, setDraft] = useState('');
  const [name, setName] = useState('');
  const [forMode, setForMode] = useState(false);
  const [mine, setMine] = useState('');
  const rp = useRef<ReplayHandle>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const n = cleanText(initial, 24) || savedName();
    if (n) { setDraft(n); setName(n); }
    setMine(savedName());
  }, [initial]);

  const shown = name || 'Rangotsav';
  const recipe = useMemo<Recipe>(() => ({ v: 1, type: 'naam', data: { n: shown } }), [shown]);
  const n = useMemo(() => naamKolam(shown), [shown]);
  const rd = naamReading(n);

  const weave = (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = cleanText(draft, 24);
    if (!v) { input.current?.focus(); return; }
    setName(v);
    if (v === name) rp.current?.replay();
    if (!forMode) { saveName(v); setMine(v); }
    wovenName();
    track('naam_made', { forFriend: forMode });
  };

  const onShare = () => {
    if (!name) { input.current?.focus(); return; }
    const p = createPlayer(recipe, 1080);
    p.seek(1);
    share({
      // "for" marks a card made for someone else; the share page then says who made it for whom
      recipe: { v: 1, type: 'naam', data: { n: name, ...(forMode ? { for: name } : {}) } },
      art: p.canvas,
      filename: 'naam-kolam-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      heading: forMode ? `Share ${name}'s kolam` : 'Share your Naam Kolam',
      kicker: `${rd.stats} · ${rd.title}`,
      title: () => (forMode ? `For ${name}` : name),
      body: rd.traits,
      cta: 'Weave your name',
      prompt: 'Weave your name into a kolam 🪔 #MyNaamKolam',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <SectionHead words={['Naam', 'Kolam']} accent={1} color="#2D4C7C" kicker="Your name, woven" kn="ಹೆಸರಿನ ರಂಗೋಲಿ" hi="नाम कोलम">
        Every name hides a kolam. Type yours and watch it weave into one unbroken line, then find out what kind of weave you are.
      </SectionHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: '28px 40px', alignItems: 'center' }}>
        <div style={{ background: n.color.bg, border: `4px solid ${ink}`, boxShadow: `10px 10px 0 ${ink}`, padding: 10, transform: 'rotate(-1deg)', maxWidth: 520, width: '100%', justifySelf: 'center' }}>
          <Replay ref={rp} recipe={recipe} px={900} label={`Kolam woven from the name ${shown}`} className="rg-naam-canvas" />
        </div>
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="rg-row" role="group" aria-label="Whose name">
            <button type="button" className="rg-chip" aria-pressed={!forMode} onClick={() => { setForMode(false); if (mine) { setDraft(mine); setName(mine); } }}>My name</button>
            <button type="button" className="rg-chip" aria-pressed={forMode} onClick={() => { setForMode(true); setDraft(''); setTimeout(() => input.current?.focus(), 0); }}>For a friend</button>
          </div>
          <form onSubmit={weave} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <label className="rg-label" htmlFor="rg-naam" style={{ width: '100%', margin: 0 }}>{forMode ? "Your friend's name" : 'Your name'}</label>
            <input id="rg-naam" ref={input} className="rg-input" style={{ flex: '1 1 200px', fontSize: 22 }} value={draft} maxLength={24}
              placeholder={forMode ? 'e.g. Dadi' : 'e.g. Ananya'} autoComplete={forMode ? 'off' : 'given-name'} onChange={(e) => setDraft(e.target.value)} />
            <button className="rg-btn rg-btn--primary" type="submit" style={{ minHeight: 54 }}>Weave it</button>
          </form>
          <div aria-live="polite" style={{ display: 'grid', gap: 6, padding: '16px 18px', background: '#FBF3E4', border: `3px solid ${ink}`, boxShadow: `5px 5px 0 ${ink}` }}>
            <span className="rg-label" style={{ margin: 0, color: '#B0246A' }}>{name ? rd.stats : 'Your reading appears here'}</span>
            <span style={{ fontFamily: "'Yatra One',serif", fontSize: 'clamp(28px,7vw,40px)', lineHeight: 1.05 }}>{name ? `${forMode ? name : 'You'}: ${rd.title}` : 'Type a name above'}</span>
            {name && <span style={{ fontSize: 15, fontStyle: 'italic', opacity: 0.8 }}>{n.weave.line}</span>}
            {name && <span style={{ fontSize: 18, fontWeight: 700 }}>{rd.traits}</span>}
          </div>
          <div className="rg-row">
            <button className="rg-btn rg-btn--primary" onClick={onShare} disabled={!name}>Share my card</button>
            <button className="rg-btn" onClick={() => { setForMode(true); setDraft(''); setTimeout(() => input.current?.focus(), 0); }}>Weave a friend&apos;s name</button>
          </div>
          <p className="rg-small" style={{ margin: 0 }}>Same name, same kolam, every time. Compare with your friends!</p>
        </div>
      </div>
    </div>
  );
}
