import type { Metadata } from 'next';
import Pulli from '../../components/Pulli';

export const metadata: Metadata = {
  title: 'Pulli · the daily kolam puzzle · Rangotsav',
  description: "Find the dots behind today's kolam. One puzzle a day, six tries. Share your score.",
  openGraph: { title: 'Pulli: the daily kolam puzzle', description: "Find the dots behind today's kolam. Six tries. Can you keep your streak?" },
};

export default function Page() {
  return <Pulli />;
}
