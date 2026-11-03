'use client';
// "Aaj" (today): the reasons to come back. Today's Pulli and your streak, your festival
// passport and the next unlock, and the next festival. Filled in after mount (it's all local
// state and today's date in IST).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import MyCourtyard from '../MyCourtyard';
import { STAMPS, load, nextUnlock, onProgress, stampCount } from '../../lib/progress';
import { loadToday, msToNext, puzzleNumber, pulliStats, TRIES } from '../../lib/pulli';
import { countdown, currentFestival, istDay, upcoming } from '../../lib/festivals';
import s from './TodayStrip.module.css';

type View = {
  day: string; pulli: { n: number; done: boolean; won: boolean; tries: number; streak: number; left: string };
  stamps: number; next: { label: string; how: string } | null; fest: { label: string; on: boolean; accent: string } | null;
};

function read(): View {
  const day = istDay(), t = loadToday(day), st = pulliStats(), ms = msToNext();
  const p = load(), nu = nextUnlock(p);
  const cur = currentFestival(), f = cur ?? upcoming(day, 1)[0];
  const c = f ? countdown(f, day) : null;
  return {
    day,
    pulli: { n: puzzleNumber(day), done: t.done, won: t.won, tries: t.guesses.length, streak: st.streak, left: `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m` },
    stamps: stampCount(p),
    next: nu ? { label: nu.label, how: nu.how } : null,
    fest: f && c && (cur || c.days <= 60) ? { label: cur ? `${f.greet.en}!` : c.label, on: !!cur, accent: f.accent } : null,
  };
}

export default function TodayStrip() {
  const [v, setV] = useState<View | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { setV(read()); return onProgress(() => setV(read())); }, []);

  return (
    <section aria-label="Today" className={s.strip}>
      {v && <>
        <Link href="/pulli" className={s.card}>
          <span className={s.k}>Pulli #{v.pulli.n}{v.pulli.streak > 0 ? ` · 🔥 ${v.pulli.streak}` : ''}</span>
          <b className={s.h}>{v.pulli.done ? (v.pulli.won ? `Solved in ${v.pulli.tries} ✓` : 'Back tomorrow') : "Today's puzzle"}</b>
          <span className={s.p}>{v.pulli.done ? `Next one in ${v.pulli.left}` : `Find the hidden dots. ${TRIES} tries →`}</span>
        </Link>
        <button type="button" className={s.card} onClick={() => setOpen(true)}>
          <span className={s.k}>Festival passport</span>
          <span className={s.stamps} role="img" aria-label={`${v.stamps} of ${STAMPS.length} stamps`}>
            {STAMPS.map((x, i) => <i key={x.id} className={i < v.stamps ? s.on : ''} />)}
          </span>
          <span className={s.p}>{v.next ? `${v.next.how} to unlock ${v.next.label}` : 'Every unlock earned. Kalakaar!'}</span>
        </button>
        {v.fest && (
          <Link href="/#diya" className={`${s.card} ${s.fest}`} style={{ ['--accent' as string]: v.fest.accent }}>
            <span className={s.k}>{v.fest.on ? 'Today' : 'Coming up'}</span>
            <b className={s.h}>{v.fest.label}</b>
            <span className={s.p}>{v.fest.on ? 'Send the family a diya →' : 'Light a diya for the family →'}</span>
          </Link>
        )}
      </>}
      <MyCourtyard open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
