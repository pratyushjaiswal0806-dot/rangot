import type { Metadata } from 'next';
import ToyPage from '../../components/kahani/ToyPage';
import PookalamToy from '../../components/toys/PookalamToy';

export const metadata: Metadata = {
  title: 'Pookalam · Rangotsav',
  description: "Lay an Onam flower carpet, Kerala's pookalam: pick a flower, tap a ring and the petals fall into place. Share it as a story, a reel or a replay link.",
};

export default function Page() {
  return <ToyPage toy="pookalam"><PookalamToy /></ToyPage>;
}
