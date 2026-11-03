import type { Metadata } from 'next';
import ToyPage from '../../components/kahani/ToyPage';
import TruckToy from '../../components/toys/TruckToy';

export const metadata: Metadata = {
  title: 'Truck Art Name Plate · Rangotsav',
  description: 'Paint your name like the back of an Indian lorry, with a painted saying, as a phone wallpaper or a WhatsApp sticker.',
};

export default function TruckPage() {
  return <ToyPage toy="truck"><TruckToy /></ToyPage>;
}
