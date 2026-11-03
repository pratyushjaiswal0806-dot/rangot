import SiteHeader from '../components/site/SiteHeader';
import SiteFooter from '../components/site/SiteFooter';
import Petals from '../components/home/Petals';
import Hero from '../components/home/Hero';
import ToyShelf from '../components/home/ToyShelf';
import TodayStrip from '../components/home/TodayStrip';
import MelaWall from '../components/home/MelaWall';
import DiyaSection from '../components/home/DiyaSection';

export default function Page() {
  return (
    <>
      <Petals />
      <SiteHeader home />
      <main>
        <Hero />
        <TodayStrip />
        <ToyShelf />
        <MelaWall />
        <DiyaSection />
      </main>
      <SiteFooter />
    </>
  );
}
