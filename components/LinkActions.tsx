'use client';
// After a greeting or dedication is created: send it on WhatsApp, copy, share or preview it.
import { useState } from 'react';
import { copy, prettyUrl, whatsapp } from '../lib/share';
import { shared } from '../lib/progress';
import { track } from '../lib/track';
import type { RecipeType } from '../lib/recipe';

export default function LinkActions({ url, text, type, title }: { url: string; text: string; type: RecipeType; title: string }) {
  const [msg, setMsg] = useState('');
  const full = `${text} ${url}`;
  const done = (via: string) => { shared({ url, type, title }); track('share', { kind: type, via }); };
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div className="rg-copy" style={{ marginTop: 0 }}><code>{prettyUrl(url)}</code></div>
      <div className="rg-actions">
        <button className="rg-btn rg-btn--wa rg-btn--block" style={{ gridColumn: '1 / -1' }} onClick={() => { whatsapp(full); done('whatsapp'); }}>Send on WhatsApp</button>
        <button className="rg-btn" onClick={async () => { setMsg((await copy(full)) ? 'Copied! Paste it anywhere.' : url); done('link'); }}>Copy link</button>
        {typeof navigator !== 'undefined' && 'share' in navigator
          ? <button className="rg-btn" onClick={() => navigator.share({ text, url }).then(() => done('native')).catch(() => {})}>More apps</button>
          : <a className="rg-btn" href={url} target="_blank" rel="noopener">Preview</a>}
      </div>
      <p className="rg-status" role="status" aria-live="polite">{msg}</p>
    </div>
  );
}
