import type { Metadata } from 'next';
import Link from 'next/link';
import Page from '../components/site/Page';
import Cheenti from '../components/site/Cheenti';
import { TOYS } from '../lib/toys';

export const metadata: Metadata = {
  title: 'Page not found · Rangotsav',
  description: 'Cheenti ate this page. Pick a toy and draw something new.',
};

// Unmatched URLs and notFound() calls land here, inside the site frame, so a broken link still
// leads somewhere playful: Cheenti is munching what's left of the page.
export default function NotFound() {
  return (
    <Page width={760}>
      <section className="rg-notfound">
        <div className="rg-notfound__ant" aria-hidden="true">
          <Cheenti pose="eat" />
          {[[-34, 92], [-18, 104], [40, 98], [56, 86], [24, 110], [-48, 108]].map(([x, y], i) => <i key={i} style={{ left: `calc(50% + ${x}px)`, top: y, animationDelay: `${i * 0.23}s` }} />)}
        </div>
        <p className="rg-kicker">Error 404</p>
        <h1 className="rg-h">Cheenti ate this page</h1>
        <p className="rg-p" style={{ maxWidth: 520 }}>It was drawn in rice flour, and she was hungry. The link may be old or mistyped. Here is a fresh floor to start again.</p>
        <div className="rg-actions" style={{ justifyContent: 'center' }}>
          <Link className="rg-btn rg-btn--primary" href="/">Back to the courtyard</Link>
          <Link className="rg-btn" href={TOYS[0].href}>{TOYS[0].cta} →</Link>
        </div>
      </section>
    </Page>
  );
}
