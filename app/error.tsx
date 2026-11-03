'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Page from '../components/site/Page';
import Cheenti from '../components/site/Cheenti';

// A route threw while rendering or loading data (share, wall, remix). Stay inside the site frame and
// offer a retry, in the same voice as the 404.
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <Page width={760}>
      <section className="rg-notfound">
        <div className="rg-notfound__ant" aria-hidden="true"><Cheenti pose="eat" /></div>
        <p className="rg-kicker">Oops</p>
        <h1 className="rg-h">Rangoli ka rang bigad gaya</h1>
        <p className="rg-p" style={{ maxWidth: 520 }}>Something spilled on the floor while we were loading this. It is not your fault. Try again, or start fresh in the courtyard.</p>
        <div className="rg-actions" style={{ justifyContent: 'center' }}>
          <button type="button" className="rg-btn rg-btn--primary" onClick={() => retry()}>Try again</button>
          <Link className="rg-btn" href="/">Back to the courtyard</Link>
        </div>
      </section>
    </Page>
  );
}
