import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { AboutSection } from "@/components/home/AboutSection";
import { TestimonialCarousel } from "@/components/home/TestimonialCarousel";

export default function Home() {
    return (
        <div className="flex flex-col">
            <HeroSection />
            <ServicesSection />
            <AboutSection />
            <TestimonialCarousel />
        </div>
    );
}
