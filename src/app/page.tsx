import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { AboutSection } from "@/components/home/AboutSection";
import { TestimonialCarousel } from "@/components/home/TestimonialCarousel";

export default function Home() {
  console.log("NextEp Edu Deployment: v2.1 - Post-Reconnect"); // Verification log
  return (
    <div className="flex flex-col">
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <TestimonialCarousel />
    </div>
  );
}
