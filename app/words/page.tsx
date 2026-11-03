import type { Metadata } from 'next';
import Link from 'next/link';
import Page from '../../components/site/Page';
import SectionHead from '../../components/SectionHead';
import { WORDS } from '../../lib/words';
import { TOYS } from '../../lib/toys';
import s from '../../components/words/Words.module.css';

export const metadata: Metadata = {
  title: 'Shabd kosh: words to take home · Rangotsav',
  description: 'Every craft and festival word from the stories under the toys, in its own script, with what it means.',
};

// language names in data/words.json → lang codes, so each script gets its own font and is read
// out in the right voice. Words from two languages ("Tamil · Hindi") are left untagged.
const LANG: Record<string, string> = {
  Tamil: 'ta', Telugu: 'te', Kannada: 'kn', Malayalam: 'ml', Hindi: 'hi', Marathi: 'mr', Bengali: 'bn', Gujarati: 'gu', Odia: 'or',
  Rajasthani: 'raj', Maithili: 'mai', Sanskrit: 'sa', Urdu: 'ur', Punjabi: 'pa', Konkani: 'kok',
};
const initial = (term: string) => term.normalize('NFD').replace(/[^A-Za-z]/g, '').charAt(0).toUpperCase();

// The glossary: every [[word]] from the Kahani stories, A to Z. Each card has the word's id as its
// anchor, so a word's popover can link straight to it (/words#kolam) and the card flashes there.
export default function WordsPage() {
  const sorted = [...WORDS].sort((a, b) => a.term.localeCompare(b.term, 'en'));
  const groups = new Map<string, typeof sorted>();
  for (const w of sorted) groups.set(initial(w.term), [...(groups.get(initial(w.term)) ?? []), w]);
  let n = 0;
  return (
    <Page width={1080}>
      <SectionHead as="h1" title="Shabd कोश" label="Shabd kosh: words to take home" gloss="a box of words" kicker="Glossary" kn="ಪದಕೋಶ" hi="शब्दकोश">
        Every craft has its own words. Here are all {WORDS.length} from the stories under the toys, each in its own script. Tap a toy to try the craft.
      </SectionHead>
      <nav aria-label="Jump to a letter" className={s.letters}>
        {[...groups.keys()].map((l) => <a key={l} href={`#letter-${l}`}>{l}</a>)}
      </nav>
      <div className={s.groups}>
        {[...groups].map(([l, ws]) => (
          <section key={l} id={`letter-${l}`} aria-labelledby={`h-${l}`} className={s.group}>
            <h2 id={`h-${l}`} className={s.letter}>{l}</h2>
            <ul className={s.cards}>
              {ws.map((w) => {
                const toy = w.toy ? TOYS.find((t) => t.id === w.toy) : undefined, lang = LANG[w.lang];
                return (
                  <li key={w.id} id={w.id} data-reveal className={s.card} style={{ ['--tilt' as string]: `${(n++ % 3) - 1}deg` }}>
                    <span className={s.term}>{w.term}</span>
                    <span className={s.script} lang={lang}>{w.script}</span>
                    <span className={s.lang}>{w.lang}</span>
                    <p className={s.meaning}>{w.meaning}</p>
                    {toy && <Link href={toy.href} className={s.toy} style={{ ['--floor' as string]: toy.floor }}>Try {toy.title} →</Link>}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </Page>
  );
}
