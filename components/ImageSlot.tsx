import type { CSSProperties } from 'react';
import makers from '../data/makers.json';
import Mandala from './site/Mandala';

// A maker's photo from data/makers.json. Until a photo is set there, a finished stand-in shows instead:
// the maker's initial over a mandala in their colour. The caption under it already names the maker,
// so the stand-in is hidden from screen readers.
export default function ImageSlot({ id, placeholder, style }: { id: string; placeholder?: string; style?: CSSProperties }) {
  const m = makers[Number(id.replace('maker-', '')) - 1];
  if (m?.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={m.photo} alt={placeholder ?? m.name} loading="lazy" decoding="async" style={{ ...style, objectFit: 'cover' }} />;
  }
  return (
    <div aria-hidden="true" style={{ ...style, display: 'grid', placeItems: 'center', overflow: 'hidden', background: m?.color ?? '#F6E7C8', color: '#FBF3E4' }}>
      <Mandala style={{ position: 'absolute', inset: '-6%', width: '112%', height: '112%', opacity: 0.35 }} />
      <span style={{ position: 'relative', font: '700 64px/1 var(--display)', color: '#FFC21A', textShadow: '3px 3px 0 #1B1410', WebkitTextStroke: '1.5px #1B1410' }}>{m?.name?.trim()[0] ?? ''}</span>
    </div>
  );
}
