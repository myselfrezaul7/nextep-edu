import { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { AboutSection } from "@/components/home/AboutSection";
import { TestimonialCarousel } from "@/components/home/TestimonialCarousel";
import { DestinationsGrid } from "@/components/destinations/DestinationsGrid";

// Homepage-specific metadata (overrides layout defaults)
export const metadata: Metadata = {
    title: "NexTep Edu | Study Abroad Consultancy Bangladesh | Expert Guidance for Bangladeshi Students",
    description:
        "NexTep Edu is Bangladesh's trusted study abroad consultancy. We help Bangladeshi students study in Germany, UK, USA, Canada, Australia with expert visa assistance, scholarship guidance & university admission support. Free consultation in Dhaka.",
    alternates: {
        canonical: "https://nextepedu.com",
    },
};

export default function Home() {
    return (
        <div className="flex flex-col">
            <HeroSection />

            {/* Destinations Section with SEO heading */}
            <section id="destinations" className="py-16 md:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-4">
                            Study Abroad Destinations
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold font-heading text-primary mb-4">
                            Where Do You Want to Study?
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Explore top study destinations for Bangladeshi students. Each country offers unique opportunities for your academic journey.
                        </p>
                    </div>
                    <DestinationsGrid featuredOnly={true} />
                </div>
            </section>

            <ServicesSection />
            <AboutSection />
            <TestimonialCarousel />
        </div>
    );
}
