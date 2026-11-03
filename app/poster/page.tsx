import type { Metadata } from 'next';
import ToyPage from '../../components/kahani/ToyPage';
import PosterToy from '../../components/toys/PosterToy';

export const metadata: Metadata = {
  title: 'Type Distorter · Rangotsav',
  description: 'Bend a word like a bazaar banner and share it as a mela poster. English, Hindi or Kannada.',
};

export default function PosterPage() {
  return <ToyPage toy="poster"><PosterToy /></ToyPage>;
}
