import type { Metadata } from 'next';
import ToyPage from '../../components/kahani/ToyPage';
import RangoliToy from '../../components/toys/RangoliToy';

export const metadata: Metadata = {
  title: 'Draw Rangoli · Rangotsav',
  description: 'Scribble anything and symmetry turns it into a festive rangoli. Share it as a story, a reel or a replay link.',
};

export default function Page() {
  return <ToyPage toy="rangoli"><RangoliToy /></ToyPage>;
}
