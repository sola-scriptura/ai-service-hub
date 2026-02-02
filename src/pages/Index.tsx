import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import LogosSection from '@/components/landing/LogosSection';
import StatsSection from '@/components/landing/StatsSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import ExpertsSection from '@/components/landing/ExpertsSection';
import UseCasesSection from '@/components/landing/UseCasesSection';
import FeaturedTestimonial from '@/components/landing/FeaturedTestimonial';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TestimonialsGrid from '@/components/landing/TestimonialsGrid';
import CTASection from '@/components/landing/CTASection';
import FooterSection from '@/components/landing/FooterSection';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const Index = () => {
  useScrollReveal();

  return (
    <div className="landing-page">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <LogosSection />
        <StatsSection />
        <HowItWorksSection />
        <ExpertsSection />
        <UseCasesSection />
        <FeaturedTestimonial />
        <FeaturesSection />
        <TestimonialsGrid />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
};

export default Index;
