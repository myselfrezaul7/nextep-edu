import { Metadata } from "next";
import { DestinationsPageContent } from "@/components/destinations/DestinationsPageContent";

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
    return <DestinationsPageContent />;
}
