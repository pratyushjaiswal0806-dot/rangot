import type { Metadata } from 'next';
import ToyPage from '../../components/kahani/ToyPage';
import PhuljhadiToy from '../../components/toys/PhuljhadiToy';

export const metadata: Metadata = {
  title: 'Phuljhadi: paint with a sparkler · Rangotsav',
  description: 'Draw with a Diwali sparkler on a night sky: write your name in light, spin a chakri of sparks, and share it as a long-exposure photo or a reel.',
};

export default function Page() {
  return <ToyPage toy="phuljhadi"><PhuljhadiToy /></ToyPage>;
}
