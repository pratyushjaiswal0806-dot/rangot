import type { Metadata } from 'next';
import ToyPage from '../../components/kahani/ToyPage';
import BlockToy from '../../components/toys/BlockToy';

export const metadata: Metadata = {
  title: 'Block Print · Rangotsav',
  description: 'Ink a carved paisley, lotus or haathi block and press it onto cotton. No two prints come out the same.',
};

export default function Page() {
  return <ToyPage toy="block"><BlockToy /></ToyPage>;
}
