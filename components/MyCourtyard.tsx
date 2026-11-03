'use client';
// My Courtyard: a festival passport (one stamp per art form tried), unlocks, badges, and links
// to everything you've shared. All of it lives in this browser.
import { useEffect, useState } from 'react';
import { STAMPS, UNLOCKS, badges, isUnlocked, load, onProgress } from '../lib/progress';
import ShareSheet, { type ShareRequest } from './ShareSheet';
import { drawCertificate } from '../lib/art/certificate';
import { savedName } from '../lib/share';
import { pulliStats } from '../lib/pulli';
import { LABEL } from '../lib/recipe';
import { CHALLENGES, challengesFor } from '../lib/challenges';
import { Stars } from './toys/Challenges';
import { TOYS } from '../lib/toys';

export default function MyCourtyard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [st, setSt] = useState(() => (typeof window === 'undefined' ? null : load()));
  const [cert, setCert] = useState<ShareRequest | null>(null);
  useEffect(() => { setSt(load()); return onProgress(() => setSt(load())); }, []);
  useEffect(() => { if (open) setSt(load()); }, [open]);
  const sheet = <ShareSheet req={cert} onClose={() => setCert(null)} />;
  if (!open || !st) return sheet;
  const shareCert = () => {
    const n = savedName();
    setCert({ recipe: null, art: drawCertificate(n), asIs: true, filename: 'kalakaar-certificate', heading: 'Your Kalakaar certificate', kicker: 'Festival passport', title: (m) => `${m || n || 'I'} tried every art form at Rangotsav`, cta: 'Get yours', prompt: `Collect all ${STAMPS.length} stamps 🪔 #Rangotsav` });
  };
  const streak = pulliStats().streak;
  const got = STAMPS.filter((s) => st.stamps[s.id]).length;
  return (
    <>
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
                <div key={s.id} role="img" className={'rg-stamp' + (st.stamps[s.id] ? ' is-got' : '')} aria-label={`${s.label}: ${st.stamps[s.id] ? 'done' : 'not yet'}`}>
                  <b aria-hidden="true">{s.glyph}</b>{s.label}
                </div>
              ))}
            </div>
          </section>
          <section>
            <span className="rg-label">Chunauti · ★ {st.challenges.length}/{CHALLENGES.length}</span>
            <div className="rg-row">
              {TOYS.map((t) => {
                const k = challengesFor(t.id).filter((c) => st.challenges.includes(c.id)).length;
                return <span key={t.id} className="rg-chip" style={{ cursor: 'default' }} aria-label={`${t.title}: ${k} of 3 challenges`}>{t.title} <b style={{ color: '#B0246A' }}><Stars got={k} of={3} /></b></span>;
              })}
            </div>
          </section>
          <section>
            <span className="rg-label">Unlocks</span>
            <div className="rg-badges">
              {UNLOCKS.map((u) => {
                const got = isUnlocked(u.id, st);
                return (
                  <div key={u.id} className={'rg-badge' + (got ? ' is-got' : '')}>
                    <span aria-hidden="true" style={{ fontSize: 20 }}>{got ? '★' : '🔒'}</span>
                    <span style={{ flex: 1 }}><b>{u.label}</b><br /><span className="rg-small">{got ? `Unlocked · in ${u.toy}` : u.how}</span></span>
                    {got && u.id === 'kalakaar' && <button className="rg-chip" onClick={shareCert}>Share certificate</button>}
                  </div>
                );
              })}
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
    {sheet}
    </>
  );
}
