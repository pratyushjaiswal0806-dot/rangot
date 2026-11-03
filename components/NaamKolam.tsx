'use client';
// Naam Kolam: type a name, watch it weave into its own kolam (a glowing fingertip of rice flour
// leads the line, see lib/art/player.ts), read its (playful) reading, which flips in for every new
// name, and share the card. "For a friend" mode makes one for someone else, which is how new
// people arrive.
import { useEffect, useMemo, useRef, useState } from 'react';
import Replay, { type ReplayHandle } from './Replay';
import ToyShell, { ToolBtn } from './toys/ToyShell';
import Morph from './toys/Morph';
import CultureStrip from './toys/CultureStrip';
import { BloomIcon } from './toys/icons';
import { useElementSize } from '../hooks/useElementSize';
import { naamKolam, naamReading } from '../lib/art/naam';
import { createPlayer } from '../lib/art/player';
import { cleanText, type Recipe } from '../lib/recipe';
import { saveName, savedName } from '../lib/share';
import { load, wovenName } from '../lib/progress';
import { done } from '../lib/challenges';
import { track } from '../lib/track';
import { chime } from '../lib/sfx';
import type { ShareRequest } from './ShareSheet';
import s from './toys/ToyShell.module.css';

export default function NaamKolam({ initial, share }: { initial?: string; share: (r: ShareRequest) => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const { w, h } = useElementSize(stage);
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
    input.current?.blur();
    setName(v);
    if (v === name) rp.current?.replay();
    if (!forMode) { saveName(v); setMine(v); }
    wovenName();
    if (load().names >= 3) done('naam-three');
    if (forMode) done('naam-for');
    chime(4, 5);
    track('naam_made', { forFriend: forMode });
  };
  const friend = () => { setForMode(true); setDraft(''); setTimeout(() => input.current?.focus(), 0); };

  const onShare = () => {
    if (!name) { input.current?.focus(); return; }
    done('naam-share');
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

  const S = Math.max(200, Math.floor(Math.min(w - 28, h - 28 - 26)));

  return (
    <ToyShell
      toy="naam" label="Naam Kolam" title="Naam Kolam" sub={<span lang="kn">ಹೆಸರಿನ ರಂಗೋಲಿ</span>} stageRef={stage}
      caption={name ? `${shown}: ${rd.title}` : 'Every name hides a kolam'}
      stage={
        <Morph id="naam">
          <div className={s.canvas} style={{ width: S, height: S, background: n.color.bg, lineHeight: 0 }}>
            <Replay ref={rp} recipe={recipe} px={900} label={`Kolam woven from the name ${shown}`} className="rg-naam-canvas" />
          </div>
        </Morph>
      }
      actions={<>
        <ToolBtn icon="↻" label="Weave again" onClick={() => rp.current?.replay()} />
        <ToolBtn icon="👫" label="For a friend" onClick={friend} />
        <ToolBtn icon={<BloomIcon />} label="Share" onClick={onShare} go disabled={!name} className="rg-bloom" />
      </>}
    >
      <div className={s.seg} role="group" aria-label="Whose name">
        <button aria-pressed={!forMode} onClick={() => { setForMode(false); if (mine) { setDraft(mine); setName(mine); } }}>My name</button>
        <button aria-pressed={forMode} onClick={friend}>For a friend</button>
      </div>
      <form onSubmit={weave} style={{ display: 'flex', gap: 10, flex: 'none' }}>
        <label className="sr-only" htmlFor="rg-naam">{forMode ? "Your friend's name" : 'Your name'}</label>
        <input id="rg-naam" ref={input} className="rg-input" style={{ flex: 1, minWidth: 0, fontSize: 20 }} value={draft} maxLength={24} enterKeyHint="go"
          placeholder={forMode ? "Friend's name, e.g. Dadi" : 'Your name, e.g. Ananya'} autoComplete={forMode ? 'off' : 'given-name'} onChange={(e) => setDraft(e.target.value)} />
        <button className={`${s.btn} ${s.primary}`} type="submit" style={{ flex: 'none' }}>Weave</button>
      </form>
      <div aria-live="polite" style={{ padding: '12px 14px', color: '#1B1410', background: '#FBF3E4', border: '3px solid #1B1410', boxShadow: '4px 4px 0 #1B1410', flex: 'none', perspective: 800 }}>
        <div key={name} className={s.flipIn} style={{ display: 'grid', gap: 4 }}>
          <span className={s.label} style={{ color: '#B0246A' }}>{name ? rd.stats : 'Your reading appears here'}</span>
          <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 'clamp(24px,6.5vw,34px)', lineHeight: 1.05 }}>{name ? `${forMode ? name : 'You'}: ${rd.title}` : 'Type a name above'}</span>
          {name && <span style={{ fontSize: 15, fontStyle: 'italic', opacity: 0.8 }}>{n.weave.line}</span>}
          {name && <span style={{ fontSize: 17, fontWeight: 700 }}>{rd.traits}</span>}
        </div>
      </div>
      <p className="rg-small" style={{ margin: 0 }}>Same name, same kolam, every time. Compare with your friends!</p>
      <CultureStrip art="naam" />
    </ToyShell>
  );
}
