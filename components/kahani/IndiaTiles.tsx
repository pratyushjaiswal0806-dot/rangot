'use client';
// India as tiles (lib/india.ts). The places in `lit` glow and can be tapped; the card beside
// the map tells what's there. Used under each toy ("across India") and on the home page. When the
// map scrolls into view its lit tiles light up one after another like a row of diyas, the chosen
// tile flickers, and the card flips over to each new place.
import { useState, type ReactNode } from 'react';
import { INDIA_COLS, INDIA_ROWS, STATES, stateById, type StateId } from '../../lib/india';
import s from './IndiaTiles.module.css';

export type Lit = { state: StateId; title: string; script?: string; lang?: string; body: ReactNode; extra?: ReactNode };

export default function IndiaTiles({ lit, label, accent = '#FFC21A' }: { lit: Lit[]; label: string; accent?: string }) {
  const [sel, setSel] = useState<StateId>(lit[0]?.state);
  const byState = new Map(lit.map((l) => [l.state, l]));
  // light them south to north, the way a diya row is lit from one end
  const order = new Map([...byState.keys()].sort((a, b) => stateById(b).r - stateById(a).r || stateById(a).c - stateById(b).c).map((id, i) => [id, i]));
  const cur = byState.get(sel);
  return (
    <div className={s.wrap} style={{ ['--accent' as string]: accent }}>
      <div role="group" aria-label={label} data-reveal="" className={s.map} style={{ gridTemplateColumns: `repeat(${INDIA_COLS}, 1fr)`, gridTemplateRows: `repeat(${INDIA_ROWS}, 1fr)` }}>
        {STATES.map((st) => {
          const on = byState.get(st.id);
          const pos = { gridRow: st.r + 1, gridColumn: st.c + 1 };
          return on
            ? <button key={st.id} type="button" className={`${s.tile} ${s.on}`} style={{ ...pos, ['--li' as string]: order.get(st.id) }} aria-pressed={sel === st.id} aria-label={`${st.name}: ${on.title}`} title={st.name} onClick={() => setSel(st.id)}>{st.id}</button>
            : <span key={st.id} className={s.tile} style={pos} title={st.name} aria-hidden="true">{st.id}</span>;
        })}
      </div>
      {cur && (
        <div className={s.card} aria-live="polite">
          <div key={cur.state} className={s.flip}>
            <span className={s.where}>{stateById(cur.state).name}</span>
            <b className={s.title}>{cur.title}</b>
            {cur.script && <span className={s.script}>{cur.script}{cur.lang && <small>{cur.lang}</small>}</span>}
            <p className={s.body}>{cur.body}</p>
            {cur.extra}
          </div>
        </div>
      )}
    </div>
  );
}
