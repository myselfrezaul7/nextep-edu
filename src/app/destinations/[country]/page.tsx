import { Metadata } from "next";
import { notFound } from "next/navigation";
import { destinations } from "@/data/destinations";
import { DestinationPageClient } from "@/components/destinations/DestinationPageClient";

interface Props {
    params: Promise<{ country: string }>;
}

// Generate static params for all destinations
export async function generateStaticParams() {
    return Object.keys(destinations).map((country) => ({
        country,
    }));
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { country } = await params;
    const destination = destinations[country];

    if (!destination) {
        return {
            title: "Destination Not Found",
        };
    }

    const countryName = destination.name;

    return {
        title: `Study in ${countryName} from Bangladesh | NexTep Edu`,
        description: `Complete guide for Bangladeshi students to study in ${countryName}. ${destination.hero.description} Expert visa assistance, university admission help, and scholarship guidance.`,
        keywords: [
            `study in ${countryName} from Bangladesh`,
            `${countryName} student visa Bangladesh`,
            `${countryName} universities for Bangladeshi students`,
            `study abroad ${countryName}`,
            `${countryName} scholarship Bangladesh`,
            `${countryName} education consultancy Dhaka`,
            `how to study in ${countryName} from Bangladesh`,
            `${countryName} tuition fees for Bangladeshi`,
        ],
        openGraph: {
            title: `Study in ${countryName} from Bangladesh | NexTep Edu`,
            description: `${destination.hero.description} Expert guidance for Bangladeshi students.`,
            url: `https://nextepedu.com/destinations/${country}`,
            siteName: "NexTep Edu",
            images: [
                {
                    url: destination.heroImage,
                    width: 1200,
                    height: 630,
                    alt: `Study in ${countryName}`,
                },
            ],
            locale: "en_BD",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `Study in ${countryName} from Bangladesh`,
            description: `Guide for Bangladeshi students: ${destination.hero.description}`,
            images: [destination.heroImage],
        },
        alternates: {
            canonical: `/destinations/${country}`,
        },
    };
}

export default async function DestinationCountryPage({ params }: Props) {
    const { country } = await params;
    const destination = destinations[country];

    if (!destination) {
        notFound();
    }

    // Serialize data for client component (remove icon functions)
    const serializedData = {
        slug: destination.slug,
        name: destination.name,
        heroImage: destination.heroImage,
        heroTitle: destination.hero.title,
        heroDescription: destination.hero.description,
        benefits: destination.benefits.map((b) => ({
            title: b.title,
            description: b.description,
        })),
        universities: destination.universities,
    };

    // Structured data for this specific destination
    const destinationSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: `Study in ${destination.name} from Bangladesh`,
        description: destination.hero.description,
        image: `https://nextepedu.com${destination.heroImage}`,
        author: {
            "@type": "Organization",
            name: "NexTep Edu",
        },
        publisher: {
            "@type": "Organization",
            name: "NexTep Edu",
            logo: {
                "@type": "ImageObject",
                url: "https://nextepedu.com/assets/logo.png",
            },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://nextepedu.com/destinations/${country}`,
        },
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://nextepedu.com",
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Destinations",
                item: "https://nextepedu.com/#destinations",
            },
            {
                "@type": "ListItem",
                position: 3,
                name: destination.name,
                item: `https://nextepedu.com/destinations/${country}`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(destinationSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema),
                }}
            />
            <DestinationPageClient destination={serializedData} />
        </>
    );
}
