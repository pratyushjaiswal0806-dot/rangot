// Story text with a little markup: *word* is emphasis and [[id]] or [[id|shown text]] is a glossary
// word (data/words.json) you can tap for its meaning. No hooks, so it renders on the server
// and inside client islands alike.
import { Fragment } from 'react';
import Word from './Word';

const TOKEN = /(\[\[[^\]]+\]\]|\*[^*]+\*)/;

export default function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(TOKEN).filter(Boolean).map((part, i) => {
        if (part.startsWith('[[')) {
          const [id, shown] = part.slice(2, -2).split('|');
          return <Word key={i} id={id}>{shown ?? id}</Word>;
        }
        if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
