import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
// Self-hosted fonts. They keep their real family names ('Yatra One', Sarpanch, Mukta,
// 'Baloo Tamma 2'), which the canvas code in lib/art names directly. Palanquin Dark is the
// display face for Hinglish headings (var(--display)). Only the weights the pages and canvas art
// ask for are shipped: a weight with no file of its own is matched to the nearest one that exists
// (Mukta 500 → 400, 600 and 800 → 700; Baloo 500/600 → 700; Sarpanch 600 → 700). Each dropped
// Devanagari file was about 100 KB of first-load mobile data.
import '@fontsource/palanquin-dark/700.css';
import '@fontsource/yatra-one/400.css';
import '@fontsource/sarpanch/700.css';
import '@fontsource/sarpanch/800.css';
import '@fontsource/sarpanch/900.css';
import '@fontsource/mukta/400.css';
import '@fontsource/mukta/700.css';
import '@fontsource/baloo-tamma-2/700.css';
import '@fontsource/baloo-tamma-2/800.css';
import './globals.css';
import './ui.css';
import RoughFilters from '../components/site/RoughFilters';
import Toaster from '../components/site/Toaster';
import RevealObserver from '../components/site/RevealObserver';
import NavTracker from '../components/site/NavTracker';
import StampToast from '../components/site/StampToast';
import Cheer from '../components/site/Cheer';
import CheentiHost from '../components/site/CheentiHost';
import { THEME_SCRIPT } from '../lib/theme';
import { SITE_URL } from '../lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL), // absolute base for OG image URLs
  title: 'Rangotsav — a Pegasus · RVITM project',
  description: 'Weave your name into a kolam, draw rangoli, block-print cloth, paint truck art and light a diya.',
  openGraph: { siteName: 'Rangotsav', type: 'website' },
  twitter: { card: 'summary_large_image' },
  appleWebApp: { title: 'Rangotsav', capable: true, statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#7A0E3A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* marks the page as scripted before first paint (see the reveal rules in globals.css) */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {/* sets data-theme="night" before first paint (Diwali, and evenings) */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <RoughFilters />
        {children}
        <Toaster />
        <StampToast />
        <Cheer />
        <CheentiHost />
        <RevealObserver />
        <NavTracker />
        {/* Vercel Web Analytics only exists on Vercel; elsewhere its script would 404 on every page */}
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
