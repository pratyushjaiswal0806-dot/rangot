'use client';
// In the diya section: light one *for someone* and send it to them.
import { useState } from 'react';
import LinkActions from '../LinkActions';
import { cleanText } from '../../lib/recipe';
import { makeLink, saveName, savedName } from '../../lib/share';
import { stamp } from '../../lib/progress';
import { track } from '../../lib/track';

export default function DiyaFor() {
  const [to, setTo] = useState('');
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState(false);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = cleanText(to, 32);
    if (!t) return;
    setBusy(true); setFail(false);
    const by = savedName();
    const u = await makeLink({ v: 1, type: 'greeting', ...(by ? { by } : {}), data: { f: 'anyday', to: t, m: 5, l: 'en', art: { v: 1, type: 'naam', data: { n: t } } } });
    setBusy(false);
    if (!u) { setFail(true); return; }
    setUrl(u); stamp('diya'); track('greeting_sent', { fest: 'diya-for' });
    if (by) saveName(by);
  };
  return (
    <div className="rg-diyafor">
      {url ? (
        <LinkActions url={url} type="greeting" title={`A diya for ${cleanText(to, 32)}`} text={`I lit a diya for you, ${cleanText(to, 32)} 🪔`} />
      ) : (
        <form onSubmit={send} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'end' }}>
          <label className="rg-label" htmlFor="rg-diyafor" style={{ width: '100%', margin: 0, color: 'var(--marigold)' }}>Light one for someone</label>
          <input id="rg-diyafor" className="rg-input" style={{ flex: '1 1 180px' }} value={to} maxLength={32} placeholder="Their name" onChange={(e) => { setTo(e.target.value); setUrl(null); }} />
          <button className="rg-btn rg-btn--primary" disabled={busy || !to.trim()}>{busy ? 'Lighting…' : 'Send them a diya'}</button>
          {fail && <p className="rg-status" role="alert" style={{ width: '100%', color: 'var(--marigold)' }}>Couldn&apos;t make a link right now. Try again in a minute.</p>}
        </form>
      )}
    </div>
  );
}
