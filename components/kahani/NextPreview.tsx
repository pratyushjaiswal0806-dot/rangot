'use client';
// The "next toy" card's picture: that toy's sample drawing itself, named for a view transition so
// it grows into the next toy's floor when you follow the link (the same morph as the shelf tiles).
import { useMemo } from 'react';
import Replay from '../Replay';
import Morph from '../toys/Morph';
import SelfiePreview from '../toys/SelfiePreview';
import { sampleFor } from '../../lib/art/samples';
import { toyById, type ToyId } from '../../lib/toys';
import s from './Kahani.module.css';

export default function NextPreview({ toy }: { toy: ToyId }) {
  const t = toyById(toy), recipe = useMemo(() => sampleFor(toy), [toy]);
  return (
    <Morph id={toy}>
      <span aria-hidden="true" className={s.nextArt} style={{ background: t.floor }}>
        {recipe ? <Replay recipe={recipe} px={360} lazy loop={2600} label={`${t.title}: a sample`} /> : <SelfiePreview name="Apna Naam" />}
      </span>
    </Morph>
  );
}
