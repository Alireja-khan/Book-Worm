import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';

export default function HomePage() {
  return (
      <div className='max-w-7xl mx-auto'>
        <HeroSection></HeroSection>
        <FeaturesSection></FeaturesSection>
      </div>
  );
}