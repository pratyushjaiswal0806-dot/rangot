import type { Metadata } from 'next';
import ToyPage from '../../components/kahani/ToyPage';
import NaamToy from '../../components/toys/NaamToy';

export const metadata: Metadata = {
  title: 'Naam Kolam · Rangotsav',
  description: 'Every name hides a kolam. Type yours and watch it weave into one unbroken line, then find out what kind of weave you are.',
};

export default function NaamPage() {
  return <ToyPage toy="naam"><NaamToy /></ToyPage>;
}
