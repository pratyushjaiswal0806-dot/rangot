// A toy's page: the toy on the first screen, its story (Kahani) below, then the footer.
import Kahani, { hasKahani } from './Kahani';
import SiteFooter from '../site/SiteFooter';
import type { ToyId } from '../../lib/toys';

export default function ToyPage({ toy, children }: { toy: ToyId; children: React.ReactNode }) {
  return (
    <>
      <main>
        {children}
        <Kahani toy={toy} />
      </main>
      {hasKahani(toy) && <SiteFooter />}
    </>
  );
}
