import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import './design.generated.css';
import './ui.css';

// Absolute base for OG image URLs. Set NEXT_PUBLIC_SITE_URL to the custom domain in production.
const site =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: 'Rangotsav — a Pegasus · RVITM project',
  description: 'Weave your name into a kolam, draw rangoli, block-print cloth, paint truck art, send festival greetings and light a diya.',
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Yatra+One&family=Sarpanch:wght@600;700;800;900&family=Mukta:wght@400;500;600;700;800&family=Baloo+Tamma+2:wght@500;600;700;800&display=swap"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
