import { Metadata } from "next";
import { DestinationsGrid } from "@/components/destinations/DestinationsGrid";

export const metadata: Metadata = {
    title: "All Destinations | NexTep Edu",
    description: "Explore our wide range of study destinations across the globe.",
};

export default function DestinationsIndex() {
    return (
        <div className="min-h-screen bg-background">
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 text-primary">Explore Destinations</h1>
                        <p className="text-xl text-muted-foreground">
                            We guide students to the best universities around the world. Choose your dream destination.
                        </p>
                    </div>

                    <div className="grid grid-cols-1">
                        <DestinationsGrid />
                    </div>
                </div>
            </section>
        </div>
    );
}
