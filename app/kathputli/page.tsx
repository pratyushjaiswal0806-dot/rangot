import type { Metadata } from 'next';
import ToyPage from '../../components/kahani/ToyPage';
import KathputliToy from '../../components/toys/KathputliToy';

export const metadata: Metadata = {
  title: 'Kathputli: work a string puppet · Rangotsav',
  description: 'Work a Rajasthani string puppet on its little stage: swing the strings, make it dance to the dholak, record a ten-second show and share it.',
};

export default function Page() {
  return <ToyPage toy="kathputli"><KathputliToy /></ToyPage>;
}
