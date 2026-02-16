import { Metadata } from "next";
import { DestinationsGrid } from "@/components/destinations/DestinationsGrid";

export const metadata: Metadata = {
    title: "Study Abroad Destinations | NexTep Edu",
    description: "Explore our study abroad destinations including UK, USA, Canada, Australia, Germany, France, Netherlands, and more. Find the perfect country for your international education journey from Bangladesh.",
    keywords: ["study abroad destinations", "study in UK from Bangladesh", "study in USA from Bangladesh", "study in Canada from Bangladesh", "study in Australia from Bangladesh", "study in Germany from Bangladesh"],
    openGraph: {
        title: "Study Abroad Destinations | NexTep Edu",
        description: "Explore 13+ countries where you can pursue your higher education with NexTep Edu's guidance.",
        type: "website",
    },
};

export default function DestinationsPage() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="py-16 md:py-24 bg-gradient-to-b from-accent/5 to-transparent">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Study Abroad Destinations
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground">
                            Discover world-class universities across 13+ countries. From the historic halls of UK to the innovative campuses of Germany – find your perfect study destination.
                        </p>
                    </div>
                </div>
            </section>

            {/* Destinations Grid */}
            <section className="py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <DestinationsGrid />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-accent/5">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                        Not Sure Which Country Is Right For You?
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Our expert counselors will help you choose the perfect destination based on your academic goals, budget, and career aspirations.
                    </p>
                    <a
                        href="https://wa.me/4915773855748?text=Hi%2C%20I%20need%20help%20choosing%20a%20study%20destination"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-full font-semibold hover:bg-accent/90 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Get Free Counseling
                    </a>
                </div>
            </section>
        </main>
    );
}
