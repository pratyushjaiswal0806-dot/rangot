'use client';
// "Sach ya Gappa?" (fact or tall tale?): a few statements about the craft. Tap an answer and the
// card turns over to the truth, with a SACH or GAPPA stamp slammed on it: petals for a right
// answer, a shake for a wrong one. Answer them all to see your score; full marks gets a cheer.
// With reduced motion the card simply shows its other side.
import { useRef, useState } from 'react';
import Rich from './Rich';
import Count from '../site/Count';
import type { Claim } from '../../content/kahani/types';
import { gulal, petalBurst } from '../../lib/fx';
import { shake } from '../../lib/motion';
import { cheer } from '../../lib/toast';
import { buzz, pluck } from '../../lib/sfx';
import s from './SachGappa.module.css';

export default function SachGappa({ claims }: { claims: Claim[] }) {
  const [picks, setPicks] = useState<(boolean | null)[]>(() => claims.map(() => null));
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const backs = useRef<(HTMLParagraphElement | null)[]>([]);
  const done = picks.every((p) => p !== null);
  const right = picks.filter((p, i) => p === claims[i].sach).length;

  const pick = (i: number, v: boolean) => {
    if (picks[i] !== null) return;
    const next = picks.map((p, k) => (k === i ? v : p)), ok = v === claims[i].sach;
    setPicks(next);
    // the answered side goes inert, so hand focus to the truth on the back
    setTimeout(() => backs.current[i]?.focus({ preventScroll: true }), 60);
    // once the card has turned over: petals or a shake
    setTimeout(() => {
      const el = cards.current[i], r = el?.getBoundingClientRect();
      if (ok && r) { petalBurst(r.left + r.width / 2, r.top + r.height / 2, 22); pluck(8, 0.7); }
      else { shake(el, 5, 320); buzz([20, 40, 20]); pluck(1, 0.6); }
      if (next.every((p) => p !== null) && next.every((p, k) => p === claims[k].sach)) setTimeout(() => { cheer('पूरे नंबर!', 'Poore number! Full marks!'); gulal(); }, 500);
    }, 480);
  };

  return (
    <div className={s.quiz}>
      <ol className={s.cards}>
        {claims.map((c, i) => {
          const p = picks[i], ok = p === c.sach;
          return (
            <li key={i} ref={(el) => { cards.current[i] = el; }} className={`${s.card} ${p === null ? '' : s.turned}`}>
              <div className={s.inner}>
                <div className={s.front} inert={p !== null}>
                  <p className={s.text}><Rich text={c.text} /></p>
                  <div className={s.btns} role="group" aria-label="Your answer">
                    <button type="button" className={s.sach} onClick={() => pick(i, true)}>Sach <small>fact</small></button>
                    <button type="button" className={s.gappa} onClick={() => pick(i, false)}>Gappa <small>tall tale</small></button>
                  </div>
                </div>
                <div className={`${s.back} ${ok ? s.right : s.wrong}`} inert={p === null}>
                  <p className={s.small}><Rich text={c.text} /></p>
                  <p ref={(el) => { backs.current[i] = el; }} tabIndex={-1} className={s.why}>
                    <b>{ok ? 'Sahi!' : 'Arre, nahi!'} It’s {c.sach ? 'sach' : 'gappa'}.</b> <Rich text={c.why} />
                  </p>
                  {p !== null && <span aria-hidden="true" className={`${s.stamp} ${c.sach ? s.isSach : s.isGappa}`}>{c.sach ? 'Sach ✓' : 'Gappa ✗'}</span>}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className={s.score} aria-live="polite">
        {done
          ? <><b><Count value={right} ms={600} /> / {claims.length}</b> {right === claims.length ? 'Poore number! Full marks.' : right >= claims.length / 2 ? 'Shabash! Nearly there.' : 'Now you know. Try the toy again?'}</>
          : `${picks.filter((p) => p !== null).length} of ${claims.length} answered`}
        {done && <button type="button" className={s.again} onClick={() => setPicks(claims.map(() => null))}>Play again</button>}
      </p>
    </div>
  );
}
