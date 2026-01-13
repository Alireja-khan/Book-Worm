import CTASection from "@/components/home/CTASection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";


export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}