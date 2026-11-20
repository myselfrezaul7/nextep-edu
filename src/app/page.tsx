import { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { AboutSection } from "@/components/home/AboutSection";
import { TestimonialCarousel } from "@/components/home/TestimonialCarousel";
import { HomeDestinationsSection } from "@/components/home/HomeDestinationsSection";

export const metadata: Metadata = {
    title: "NexTep Edu | Study Abroad Consultancy Bangladesh | Expert Guidance for Bangladeshi Students",
    description:
        "NexTep Edu is Bangladesh's trusted study abroad consultancy. We help Bangladeshi students study in Germany, UK, USA, Canada, Australia with expert visa assistance, scholarship guidance & university admission support. Free consultation in Dhaka.",
    alternates: {
        canonical: "https://www.nextepedu.com",
    },
};

export default function Home() {
    return (
        <div className="flex flex-col">
            <HeroSection />
            <ServicesSection />
            <div className="cv-auto">
                <HowItWorksSection />
            </div>
            <HomeDestinationsSection />
            <div className="cv-auto">
                <AboutSection />
            </div>
            <TestimonialCarousel />
        </div>
    );
}
