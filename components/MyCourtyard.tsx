'use client';
// My Courtyard: a festival passport (one stamp per art form tried), badges, and links to
// everything you've shared. All of it lives in this browser.
import { useEffect, useState } from 'react';
import { STAMPS, badges, load, onProgress } from '../lib/progress';
import { pulliStats } from '../lib/pulli';
import { LABEL } from '../lib/recipe';

export default function MyCourtyard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [st, setSt] = useState(() => (typeof window === 'undefined' ? null : load()));
  useEffect(() => { setSt(load()); return onProgress(() => setSt(load())); }, []);
  useEffect(() => { if (open) setSt(load()); }, [open]);
  if (!open || !st) return null;
  const streak = pulliStats().streak;
  const got = STAMPS.filter((s) => st.stamps[s.id]).length;
  return (
    <div className="rg-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Escape') onClose(); }}>
      <div className="rg-sheet" role="dialog" aria-modal="true" aria-label="My Courtyard">
        <div className="rg-sheet__head">
          <h2 className="rg-h">My Courtyard</h2>
          <button className="rg-x" onClick={onClose} aria-label="Close" autoFocus>×</button>
        </div>
        <div className="rg-me">
          <section>
            <span className="rg-label">Festival passport · {got}/{STAMPS.length} stamps</span>
            <div className="rg-stamps">
              {STAMPS.map((s) => (
                <div key={s.id} className={'rg-stamp' + (st.stamps[s.id] ? ' is-got' : '')} aria-label={`${s.label}: ${st.stamps[s.id] ? 'done' : 'not yet'}`}>
                  <b aria-hidden="true">{s.glyph}</b>{s.label}
                </div>
              ))}
            </div>
          </section>
          <section>
            <span className="rg-label">Badges</span>
            <div className="rg-badges">
              {badges(st, streak).map((b) => (
                <div key={b.id} className={'rg-badge' + (b.got ? ' is-got' : '')}>
                  <span aria-hidden="true" className={'rg-mini-diya' + (b.got ? ' is-lit' : '')} />
                  <span><b>{b.label}</b><br /><span className="rg-small">{b.desc}{b.got ? '' : ' (not yet)'}</span></span>
                </div>
              ))}
            </div>
          </section>
          <section>
            <span className="rg-label">Things you shared</span>
            {st.made.length ? (
              <ul className="rg-made">
                {st.made.map((m) => <li key={m.url}><a href={m.url} target="_blank" rel="noopener"><span>{m.title}</span><span className="rg-small">{LABEL[m.type]}</span></a></li>)}
              </ul>
            ) : <p className="rg-p">Nothing yet. Share a creation and it will live here.</p>}
          </section>
          <p className="rg-small">Saved in this browser only, nothing is uploaded.</p>
        </div>
      </div>
    </div>
  );
}
