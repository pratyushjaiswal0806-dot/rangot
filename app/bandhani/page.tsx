import type { Metadata } from 'next';
import ToyPage from '../../components/kahani/ToyPage';
import BandhaniToy from '../../components/toys/BandhaniToy';

export const metadata: Metadata = {
  title: 'Bandhani · Rangotsav',
  description: 'Tie knots into the cloth, dip it in dye, then untie it to find the dots: bandhani tie-and-dye from Gujarat and Rajasthan.',
};

export default function Page() {
  return <ToyPage toy="bandhani"><BandhaniToy /></ToyPage>;
}
