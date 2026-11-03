import type { Metadata } from 'next';
import ToyPage from '../../components/kahani/ToyPage';
import KolamToy from '../../components/toys/KolamToy';

export const metadata: Metadata = {
  title: 'Kolam Weaver · Rangotsav',
  description: 'Tap to place dots and one unbroken line weaves around every one of them, like a pulli kolam at dawn.',
};

export default function Page() {
  return <ToyPage toy="kolam"><KolamToy /></ToyPage>;
}
