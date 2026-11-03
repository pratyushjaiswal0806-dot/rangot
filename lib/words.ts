// The glossary (data/words.json): craft and festival words with their script, language and meaning.
import words from '../data/words.json';

export type WordEntry = (typeof words.words)[number] & { toy?: string };
export const WORDS = words.words as WordEntry[];
export const wordById = (id: string) => WORDS.find((w) => w.id === id);
