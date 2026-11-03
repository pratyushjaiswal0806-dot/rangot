'use client';
// A toy's three Chunauti (challenges), at the top of its tray: a star for each one met. They fill
// in live as stars are earned (lib/challenges.ts calls lib/progress.ts earn()).
import { useEffect, useState } from 'react';
import { challengesFor } from '../../lib/challenges';
import { load, onProgress } from '../../lib/progress';
import type { ToyId } from '../../lib/toys';
import s from './ToyShell.module.css';

// Stars earned out of all of them: unearned ones are the same star, dimmed (a hollow ☆ falls back to
// a filled glyph in some fonts, so it looked earned).
export function Stars({ got, of, className }: { got: number; of: number; className?: string }) {
  return <span aria-hidden="true" className={className}>{Array.from({ length: of }, (_, i) => <span key={i} className={i < got ? undefined : s.dim}>★</span>)}</span>;
}

export default function Challenges({ toy }: { toy: ToyId }) {
  const list = challengesFor(toy);
  const [got, setGot] = useState<string[]>([]);
  useEffect(() => {
    const read = () => setGot(load().challenges);
    read();
    return onProgress(read);
  }, []);
  if (!list.length) return null;
  const n = list.filter((c) => got.includes(c.id)).length;
  return (
    <div className={s.field}>
      <span className={s.label}>Chunauti · <Stars got={n} of={list.length} /><span className="sr-only">{`${n} of ${list.length} done`}</span></span>
      {/* on phones the list scrolls sideways, so it takes focus to be scrolled from the keyboard */}
      <ul className={s.chunauti} aria-label="Challenges" tabIndex={0}>
        {list.map((c) => {
          const ok = got.includes(c.id);
          return (
            <li key={c.id} className={ok ? s.met : undefined}>
              <span aria-hidden="true" className={ok ? undefined : s.dim}>★</span>{c.label}<span className="sr-only">{ok ? ' (done)' : ' (not yet)'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
