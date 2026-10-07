import EnterNestoraSection from '../components/EnterNestoraSection';
import FeatureHighlights from '../components/FeatureHighlights';
import PropertyCarouselSection from '../components/PropertyCarouselSection';

export default function Home() {
  return (
    <div className="-mt-16">
      <EnterNestoraSection />
      <FeatureHighlights />
      <PropertyCarouselSection />
    </div>
  );
}
