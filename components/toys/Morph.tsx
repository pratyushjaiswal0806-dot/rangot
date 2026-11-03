// Names the toy's drawing surface for a view transition, so the shelf tile's preview morphs into
// it when the toy opens (and back when it closes). Wraps exactly one element.
import { ViewTransition } from 'react';
import type { ToyId } from '../../lib/toys';

export default function Morph({ id, children }: { id: ToyId; children: React.ReactNode }) {
  return <ViewTransition name={`toy-${id}`} share="morph" default="none">{children}</ViewTransition>;
}
