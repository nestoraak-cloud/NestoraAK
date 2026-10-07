import EnterNestoraSection from '../components/EnterNestoraSection';
import SkylineSection from '../components/SkylineSection';
import FeatureHighlights from '../components/FeatureHighlights';
import PropertyCarouselSection from '../components/PropertyCarouselSection';

export default function Home() {
  return (
    <div className="-mt-16">
      <EnterNestoraSection />
      <SkylineSection />
      <FeatureHighlights />
      <PropertyCarouselSection />
    </div>
  );
}
