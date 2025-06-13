import HeroSection from "../components/Hero";
import ServicesSection from "../components/Services";
import FeaturesGrid from "../components/Features";
import CTASection from "../components/CTA";


export default function LandingPage() {
  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#003135" }}
    >
      <HeroSection />
      <ServicesSection />
      <FeaturesGrid />
      <CTASection />
      
    </div>
  );
}
