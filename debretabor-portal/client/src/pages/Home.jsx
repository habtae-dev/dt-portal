import Hero from '../components/Hero';
import CityFacts from '../components/CityFacts';
import LatestNews from '../components/LatestNews';
import AnnouncementsPanel from '../components/AnnouncementsPanel';
import { SubscribeBand } from '../components/SubscribeForm';

export default function Home() {
  return (
    <div>
      <Hero />
      <AnnouncementsPanel />
      <CityFacts />
      <LatestNews />
      <SubscribeBand />
    </div>
  );
}
