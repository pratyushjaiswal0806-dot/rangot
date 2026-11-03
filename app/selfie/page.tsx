import type { Metadata } from 'next';
import ToyPage from '../../components/kahani/ToyPage';
import SelfieToy from '../../components/toys/SelfieToy';

export const metadata: Metadata = {
  title: 'Truck-art Selfie · Rangotsav',
  description: 'Your face, framed like the back of an Indian lorry, with your name in truck lettering. Nothing is uploaded.',
};

export default function Page() {
  return <ToyPage toy="selfie"><SelfieToy /></ToyPage>;
}
