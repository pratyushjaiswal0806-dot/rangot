import type { CSSProperties } from 'react';
import makers from '../data/makers.json';

// Production stand-in for the prototype's <image-slot>: a real <img> once a photo is set in
// data/makers.json, otherwise a labelled placeholder.
export default function ImageSlot({ id, placeholder, style }: { id: string; placeholder?: string; style?: CSSProperties }) {
  const m = makers[Number(id.replace('maker-', '')) - 1];
  if (m?.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={m.photo} alt={placeholder ?? m.name} loading="lazy" decoding="async" style={{ ...style, objectFit: 'cover' }} />;
  }
  return (
    <div
      role="img"
      aria-label={placeholder}
      style={{ ...style, display: 'grid', placeItems: 'center', textAlign: 'center', padding: 8, fontWeight: 700, fontSize: 13, color: '#1B1410', background: 'repeating-linear-gradient(45deg,rgba(27,20,16,.06) 0 6px,transparent 6px 12px)' }}
    >
      {placeholder}
    </div>
  );
}
