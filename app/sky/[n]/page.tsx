import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '../../../components/site/SiteHeader';
import SiteFooter from '../../../components/site/SiteFooter';
import DiyaSection from '../../../components/home/DiyaSection';

// /sky/4812: "someone lit diya #4,812". The link people share after lighting a diya; it opens on
// the shared night sky so the friend can light one too. Anything but a whole number is a 404.
const diyaNo = (raw: string) => (/^\d{1,8}$/.test(raw) && Number(raw) >= 1 ? Number(raw) : null);

export async function generateMetadata({ params }: PageProps<'/sky/[n]'>): Promise<Metadata> {
  const n = diyaNo((await params).n);
  if (!n) return { title: 'Rangotsav' };
  const title = `Diya #${n.toLocaleString('en-IN')} is lit in Rangotsav's sky`;
  return { title, description: 'Every light in the sky is a diya someone lit. Light yours.', openGraph: { title, description: 'Light yours, it floats up to join them.' }, twitter: { card: 'summary_large_image', title } };
}

export default async function SkyPage({ params }: PageProps<'/sky/[n]'>) {
  const n = diyaNo((await params).n);
  if (!n) notFound();
  return (
    <>
      <SiteHeader />
      <main>
        <div style={{ background: '#160A24', color: '#FBF3E4', textAlign: 'center', padding: '28px 16px 0' }}>
          <h1 style={{ margin: 0, font: "800 14px/1.3 Sarpanch, sans-serif", letterSpacing: '.14em', textTransform: 'uppercase', color: '#FFC21A' }}>A friend lit diya #{n.toLocaleString('en-IN')}</h1>
          <p style={{ margin: '6px 0 0', fontSize: 18 }}>It&apos;s glowing in the sky below. Light yours, or <Link href="/" style={{ color: '#FFC21A' }}>come play at Rangotsav</Link>.</p>
        </div>
        <DiyaSection />
      </main>
      <SiteFooter />
    </>
  );
}
