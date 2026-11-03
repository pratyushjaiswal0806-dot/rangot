import type { Metadata } from 'next';
import ToyPage from '../../components/kahani/ToyPage';
import PatangToy from '../../components/toys/PatangToy';

export const metadata: Metadata = {
  title: 'Patang: fly a kite on Uttarayan · Rangotsav',
  description: 'Design a fighter kite and fly it over the rooftops of Ahmedabad. Cross a neighbour’s string, pull hard and shout Kai po che!',
};

export default function Page() {
  return <ToyPage toy="patang"><PatangToy /></ToyPage>;
}
