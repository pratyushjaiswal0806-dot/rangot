import type { Metadata, Viewport } from 'next';
import './globals.css';
import './design.generated.css';

export const metadata: Metadata = {
  title: 'Rangotsav — a Pegasus · RVITM project',
  description: 'An interactive Indian-art playground: draw rangoli, weave kolam, block-print cloth, paint a truck-art name plate and light a diya.',
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
      <body>{children}</body>
    </html>
  );
}
