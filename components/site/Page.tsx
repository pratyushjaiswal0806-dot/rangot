// Frame for the regular (scrolling) pages: header, a centred column, footer.
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function Page({ children, width = 1160 }: { children: React.ReactNode; width?: number }) {
  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: width, margin: '0 auto', padding: 'clamp(20px, 5vw, 40px) 16px 80px' }}>{children}</main>
      <SiteFooter />
    </>
  );
}
