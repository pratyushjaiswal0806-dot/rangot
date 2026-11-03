'use client';
// /naam: the Naam Kolam maker with its share sheet. /naam?n=Ananya opens with that name woven
// (old /?naam= links redirect here with ?naam=).
import { useEffect, useState } from 'react';
import NaamKolam from '../NaamKolam';
import ShareSheet, { type ShareRequest } from '../ShareSheet';
import { queryParam } from '../../lib/remix';
import { track } from '../../lib/track';

export default function NaamToy() {
  const [initial, setInitial] = useState('');
  const [share, setShare] = useState<ShareRequest | null>(null);
  useEffect(() => { setInitial((queryParam('n') ?? queryParam('naam') ?? '').slice(0, 24)); track('tool_open', { tool: 'naam' }); }, []);
  return (
    <>
      <NaamKolam initial={initial} share={setShare} />
      <ShareSheet req={share} onClose={() => setShare(null)} />
    </>
  );
}
