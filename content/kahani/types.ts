// The shape of a toy's story (its "Kahani"): the page under each toy reads one of these.
// Text fields are rich strings (see components/kahani/Rich.tsx): *word* is emphasis and
// [[term]] links a glossary word.
import type { ToyId } from '../../lib/toys';
import type { StateId } from '../../lib/india';
import type { ArtId } from '../../components/kahani/Art';

export type Chapter = { kicker: string; title: string; body: string; art: ArtId };
// one dated (or roughly dated) card on the timeline
export type Moment = { when: string; title: string; body: string };
// where the craft lives and what it's called there
export type Place = { state: StateId; name: string; script?: string; lang?: string; note: string };
// a "Sach ya Gappa?" (fact or tall tale) card: sach is true when the statement is a fact
export type Claim = { text: string; sach: boolean; why: string };
export type Source = { label: string; href: string };

export type Kahani = {
  toy: ToyId;
  // poster heading, Hinglish, with its English reading and lowercase gloss
  title: string; label: string; gloss: string;
  lead: string;
  chapters: Chapter[];
  // heading and intro for the toy's own interactive
  play: { title: string; label: string; intro: string };
  timeline: Moment[];
  places: { intro: string; list: Place[] };
  quiz: Claim[];
  // glossary ids (data/words.json)
  words: string[];
  sources: Source[];
  next: ToyId;
};
