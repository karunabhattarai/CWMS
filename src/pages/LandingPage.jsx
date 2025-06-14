import HeroSection from "../components/Hero";
import ServicesSection from "../components/Services";
import FeaturesGrid from "../components/Features";
import CTASection from "../components/CTA";

export default function LandingPage() {
  return (
    <div  className="bg-cyan-50">
      <HeroSection />
      <ServicesSection />
      <FeaturesGrid />
      <CTASection />
    </div>
  );
}
