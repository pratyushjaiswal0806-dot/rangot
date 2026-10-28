'use client';
// The share flow for every creation: pick a story look, add your name, then share the story,
// save a reel, copy the short link or send it on WhatsApp. Afterwards it shows how to post on
// Instagram with the Link and "Add Yours" stickers, so viewers can make their own.
import { useEffect, useRef, useState } from 'react';
import { storyCard, TEMPLATES, type StoryTemplate } from '../lib/art/story';
import { CAPTION } from '../lib/art/story';
import { copy, makeLink, prettyUrl, saveName, savedName, shareFile, siteUrl, toBlob, whatsapp, download } from '../lib/share';
import { reelType, recordReel } from '../lib/reel';
import { track } from '../lib/track';
import { shared } from '../lib/progress';
import type { Recipe } from '../lib/recipe';

export type ShareRequest = {
  recipe: Recipe | null;
  art: HTMLCanvasElement;
  asIs?: boolean; // the art is already a finished poster/wallpaper: share it without a story card
  filename: string;
  kicker: string;
  title: (name: string) => string;
  body?: string;
  cta: string;
  prompt: string; // for the Instagram "Add Yours" sticker
  heading?: string;
};

type Reel = { state: 'idle' } | { state: 'rec'; p: number } | { state: 'ready'; blob: Blob; ext: string; url: string };

export default function ShareSheet({ req, onClose }: { req: ShareRequest | null; onClose: () => void }) {
  const [name, setName] = useState('');
  const [tpl, setTpl] = useState<StoryTemplate>('ruby');
  const [link, setLink] = useState<string | null | undefined>(undefined); // undefined = making
  const [after, setAfter] = useState(false);
  const [status, setStatus] = useState('');
  const [reel, setReel] = useState<Reel>({ state: 'idle' });
  const blob = useRef<Blob | null>(null);
  const preview = useRef<HTMLCanvasElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const canReel = typeof window !== 'undefined' && !!req?.recipe && !!reelType();

  // reset on open
  useEffect(() => {
    if (!req) return;
    const back = document.activeElement as HTMLElement | null;
    setName(savedName());
    setAfter(false);
    setStatus('');
    setReel({ state: 'idle' });
    setTimeout(() => closeRef.current?.focus(), 30);
    return () => back?.focus?.();
  }, [req]);

  // short link, refreshed (debounced) as the name changes; same content = same id
  useEffect(() => {
    if (!req?.recipe) { setLink(null); return; }
    setLink(undefined);
    let live = true;
    const t = setTimeout(() => {
      const n = name.trim();
      makeLink({ ...req.recipe!, ...(n ? { by: n } : {}) } as Recipe).then((u) => { if (live) setLink(u); });
    }, 450);
    return () => { live = false; clearTimeout(t); };
  }, [req, name]);

  // compose the card and keep a ready-to-share PNG
  useEffect(() => {
    if (!req) return;
    const n = name.trim();
    const shown = link ? prettyUrl(link) : prettyUrl(siteUrl());
    const card = req.asIs ? req.art : storyCard(req.art, tpl, { title: req.title(n), kicker: req.kicker, body: req.body, cta: req.cta, link: shown });
    const pv = preview.current;
    if (pv) {
      const k = Math.min(1, 720 / card.height);
      pv.width = Math.round(card.width * k); pv.height = Math.round(card.height * k);
      pv.getContext('2d')!.drawImage(card, 0, 0, pv.width, pv.height);
    }
    blob.current = null;
    let live = true;
    toBlob(card).then((b) => { if (live) blob.current = b; });
    return () => { live = false; };
  }, [req, tpl, name, link]);

  useEffect(() => () => { if (reel.state === 'ready') URL.revokeObjectURL(reel.url); }, [reel]);

  if (!req) return null;
  const n = name.trim();
  const url = link || siteUrl();
  const shareText = `${req.title(n)}. Make yours at Rangotsav: ${url}`;
  const fail = !req.recipe ? '' : link === null ? 'Short links are off right now, so this shares the site link instead.' : '';

  // counts the share and files it under My Courtyard (with its link, when there is one)
  const record = () => shared(link && req.recipe ? { url: link, type: req.recipe.type, title: req.title(n) } : null);
  const shareImage = async () => {
    if (!blob.current) { setStatus('One second, still painting your card…'); return; }
    copy(`${CAPTION} ${url}`);
    const r = await shareFile(blob.current, req.filename + '.png', shareText, req.title(n));
    if (r === 'cancelled') return;
    track('share', { kind: req.recipe?.type ?? 'image', via: r, tpl });
    record();
    setStatus(r === 'shared' ? 'Shared! Caption and link copied too.' : 'Saved to your device. Caption and link copied.');
    setAfter(true);
  };
  const makeReel = async () => {
    if (!req.recipe) return;
    setReel({ state: 'rec', p: 0 });
    setStatus('Recording your reel. Keep this tab open, it takes about 8 seconds.');
    const r = await recordReel({ ...req.recipe, ...(n ? { by: n } : {}) } as Recipe, tpl, { title: req.title(n), kicker: req.kicker, body: req.body, cta: req.cta, link: prettyUrl(url) }, (p) => setReel({ state: 'rec', p }));
    if (!r) { setReel({ state: 'idle' }); setStatus('This browser cannot record video. Share the story image instead.'); return; }
    setReel({ state: 'ready', ...r, url: URL.createObjectURL(r.blob) });
    setStatus(r.ext === 'mp4' ? 'Reel ready!' : 'Reel ready (WebM). If Instagram refuses it, share the story image instead.');
    track('reel_saved', { kind: req.recipe.type, ext: r.ext });
  };
  const shareReel = async () => {
    if (reel.state !== 'ready') return;
    copy(`${CAPTION} ${url}`);
    const r = await shareFile(reel.blob, `${req.filename}.${reel.ext}`, shareText, req.title(n));
    if (r !== 'cancelled') { record(); setAfter(true); setStatus(r === 'shared' ? 'Shared! Caption and link copied.' : 'Reel saved. Caption and link copied.'); }
  };
  const copyLink = async () => {
    const ok = await copy(shareText);
    setStatus(ok ? 'Link copied. Paste it anywhere!' : url);
    record();
    track('share', { kind: req.recipe?.type ?? 'image', via: 'link' });
  };
  const wa = () => { whatsapp(shareText); record(); track('share', { kind: req.recipe?.type ?? 'image', via: 'whatsapp' }); };

  const onKey = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // keep the page's tool shortcuts (Escape, Ctrl+Z) out of the sheet
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Tab' && root.current) {
      const f = [...root.current.querySelectorAll<HTMLElement>('button:not([disabled]),input,a[href],video')].filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const a = f[0], b = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
    }
  };

  return (
    <div className="rg-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={onKey}>
      <div ref={root} className="rg-sheet" role="dialog" aria-modal="true" aria-label={req.heading ?? 'Share'}>
        <div className="rg-sheet__head">
          <h2 className="rg-h">{req.heading ?? 'Share it'}</h2>
          <button ref={closeRef} className="rg-x" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="rg-sheet__grid">
          <div className="rg-preview" style={req.asIs ? { aspectRatio: `${req.art.width} / ${req.art.height}`, background: 'transparent' } : undefined}>
            {reel.state === 'ready'
              ? <video src={reel.url} autoPlay loop muted playsInline controls aria-label="Your reel" />
              : <canvas ref={preview} role="img" aria-label="Preview of your story card" />}
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            {!req.asIs && (
              <div>
                <span className="rg-label">Card style</span>
                <div className="rg-row" role="group" aria-label="Card style">
                  {TEMPLATES.map((t) => (
                    <button key={t.id} className="rg-chip" aria-pressed={tpl === t.id} onClick={() => { setTpl(t.id); if (reel.state === 'ready') setReel({ state: 'idle' }); }}>
                      <span className="rg-sw" style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)` }} />{t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="rg-label" htmlFor="rg-share-name">Your name {req.asIs ? '(for the link)' : '(goes on the card)'}</label>
              <input id="rg-share-name" className="rg-input" value={name} maxLength={24} placeholder="e.g. Pratyush" autoComplete="given-name"
                onChange={(e) => setName(e.target.value)} onBlur={() => saveName(name.trim())} />
            </div>
            <div className="rg-actions">
              <button className="rg-btn rg-btn--primary rg-btn--block" style={{ gridColumn: '1 / -1' }} onClick={shareImage}>
                {req.asIs ? 'Share image' : 'Share to story'}
              </button>
              {canReel && (reel.state === 'ready'
                ? <button className="rg-btn rg-btn--dark rg-btn--block" style={{ gridColumn: '1 / -1' }} onClick={shareReel}>Share reel</button>
                : <button className="rg-btn rg-btn--dark rg-btn--block" style={{ gridColumn: '1 / -1' }} onClick={makeReel} disabled={reel.state === 'rec'}>
                    {reel.state === 'rec' ? `Recording… ${Math.round(reel.p * 100)}%` : 'Make a reel'}
                  </button>)}
              {reel.state === 'ready' && <button className="rg-btn" onClick={() => download(reel.blob, `${req.filename}.${reel.ext}`)}>Download reel</button>}
              <button className="rg-btn" onClick={copyLink} disabled={link === undefined && !!req.recipe}>{link === undefined && req.recipe ? 'Making link…' : 'Copy link'}</button>
              <button className="rg-btn rg-btn--wa" onClick={wa}>WhatsApp</button>
            </div>
            <p className="rg-status" role="status" aria-live="polite">{status || fail}</p>
            {after && (
              <div>
                <span className="rg-label">Post it so friends join in</span>
                <ol className="rg-steps">
                  <li><span>Post the {reel.state === 'ready' ? 'reel' : 'image'} to your Instagram story.</span></li>
                  <li><span>Add a <b>Link</b> sticker with your link:
                    <span className="rg-copy"><code>{prettyUrl(url)}</code><button className="rg-chip" onClick={() => copy(url)}>Copy</button></span></span></li>
                  <li><span>Add an <b>Add Yours</b> sticker with this prompt:
                    <span className="rg-copy"><code>{req.prompt}</code><button className="rg-chip" onClick={() => copy(req.prompt)}>Copy</button></span></span></li>
                </ol>
                <p className="rg-small" style={{ marginTop: 8 }}>Friends tap your sticker, make their own, and it chains back to you.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
