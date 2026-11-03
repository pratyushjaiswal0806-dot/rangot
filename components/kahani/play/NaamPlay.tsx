'use client';
// "One word, many scripts": "rangoli" written in ten Indian scripts. Tap one to see it big, who
// writes it and one thing to notice. Then type your own name and see it in Devanagari (by ear,
// with the same rules the truck toy uses).
import { useLayoutEffect, useRef, useState } from 'react';
import { toDevanagari } from '../../../lib/translit';
import s from './Play.module.css';

const SCRIPTS: { name: string; word: string; lang: string; who: string; note: string; dir?: 'rtl' }[] = [
  { name: 'Devanagari', word: 'रंगोली', lang: 'hi', who: 'Hindi, Marathi, Nepali, Sanskrit and more', note: 'Letters hang from a line along the top, the shirorekha. Marathi spells this word रांगोळी.' },
  { name: 'Bengali–Assamese', word: 'রঙ্গোলি', lang: 'bn', who: 'Bengali, Assamese, Manipuri (older books)', note: 'Another script with a top line, but with sharper corners. Assamese uses it with a couple of letters of its own.' },
  { name: 'Gurmukhi', word: 'ਰੰਗੋਲੀ', lang: 'pa', who: 'Punjabi', note: 'The name is often explained as “from the mouth of the Guru”. It was shaped by the Sikh Gurus.' },
  { name: 'Gujarati', word: 'રંગોળી', lang: 'gu', who: 'Gujarati, Kutchi', note: 'Looks like Devanagari with the top line taken off.' },
  { name: 'Odia', word: 'ରଙ୍ଗୋଲି', lang: 'or', who: 'Odia', note: 'Most letters wear a round umbrella on top, said to come from writing on palm leaves.' },
  { name: 'Tamil', word: 'ரங்கோலி', lang: 'ta', who: 'Tamil', note: 'Fewer letters than most: 12 vowels and 18 consonants, so one letter can stand for several sounds.' },
  { name: 'Telugu', word: 'రంగోలి', lang: 'te', who: 'Telugu', note: 'Round letters, many with a little tick on top called the talakattu.' },
  { name: 'Kannada', word: 'ರಂಗೋಲಿ', lang: 'kn', who: 'Kannada, Tulu, Konkani (in Karnataka)', note: 'A close sister of Telugu’s script: read one and the other looks familiar.' },
  { name: 'Malayalam', word: 'രംഗോലി', lang: 'ml', who: 'Malayalam', note: 'The roundest of all, with letters that join into tall clusters.' },
  { name: 'Perso-Arabic', word: 'رنگولی', lang: 'ur', who: 'Urdu, Kashmiri, Sindhi', note: 'The odd one out: not from Brahmi, written right to left, in the slanting Nastaliq style.', dir: 'rtl' },
];

export default function NaamPlay() {
  const [i, setI] = useState(0);
  const [name, setName] = useState('');
  const sc = SCRIPTS[i];
  const dev = toDevanagari(name.trim().slice(0, 24));
  // the big word: as large as fits, since some scripts run twice as wide as others
  const big = useRef<HTMLParagraphElement>(null);
  const [fs, setFs] = useState(92);
  useLayoutEffect(() => {
    const el = big.current;
    if (!el) return;
    const fit = () => {
      const was = el.style.fontSize;
      el.style.fontSize = '92px';
      const room = el.parentElement!.clientWidth - 40, wide = el.scrollWidth;
      el.style.fontSize = was;
      setFs(Math.max(28, Math.floor(92 * Math.min(1, room / wide))));
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement!);
    return () => ro.disconnect();
  }, [i]);

  return (
    <div className={s.play}>
      <div className={s.chips} role="group" aria-label="Pick a script">
        {SCRIPTS.map((x, k) => (
          <button key={x.name} type="button" className={s.chip} aria-pressed={k === i} onClick={() => setI(k)}>
            <b lang={x.lang} dir={x.dir} style={{ fontFamily: 'inherit' }}>{x.word}</b><span>{x.name}</span>
          </button>
        ))}
      </div>
      <div className={s.body}>
        <div className={s.stage} style={{ background: 'var(--halftone), #7A0E3A', display: 'grid', placeItems: 'center' }}>
          <p key={i} ref={big} lang={sc.lang} dir={sc.dir} className={s.pop} style={{ margin: 0, padding: '0 4px', width: 'max-content', whiteSpace: 'nowrap', textAlign: 'center', color: '#FFC21A', fontSize: fs, lineHeight: 1.3, fontWeight: 700, textShadow: '4px 4px 0 #1B1410' }}>{sc.word}</p>
          <span className={s.where} style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', color: '#FBF3E4' }}>“Rangoli” in {sc.name}</span>
        </div>
        <div className={s.info}>
          <div aria-live="polite" className={s.info}>
            <p className={s.name}><b>{sc.name}</b></p>
            <p className={s.where}>Used for {sc.who}</p>
            <p className={s.note}>{sc.note}</p>
            <p className={s.note} style={{ opacity: 0.85 }}>{sc.dir ? 'Family: Arabic script, via Persian.' : 'Family: grown from Brahmi, Ashoka’s script.'}</p>
          </div>
          <label className={s.label} htmlFor="np-name" style={{ marginTop: 8 }}>Your name in Devanagari</label>
          <input id="np-name" className={s.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Type your name" autoComplete="off" maxLength={24} />
          <p lang="hi" aria-live="polite" style={{ margin: 0, minHeight: '1.4em', fontSize: 40, lineHeight: 1.4, fontWeight: 700, color: '#FFC21A' }}>{dev}</p>
          {dev && <p className={s.note} style={{ fontSize: 15, opacity: 0.85 }}>Spelled by ear, the way a sign painter would. Not quite right? Every family spells names their own way.</p>}
        </div>
      </div>
    </div>
  );
}
