import type { Metadata } from 'next';
import ToyPage from '../../components/kahani/ToyPage';
import WarliToy from '../../components/toys/WarliToy';

export const metadata: Metadata = {
  title: 'Warli: paint the tarpa dance · Rangotsav',
  description: 'Paint a Warli village in rice-paste white on red earth: tap, and dancers join hands in a spiral round the tarpa player. Share it as a picture or a reel.',
};

export default function Page() {
  return <ToyPage toy="warli"><WarliToy /></ToyPage>;
}
