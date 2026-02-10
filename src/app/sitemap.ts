import { MetadataRoute } from "next";
import { destinations } from "@/data/destinations";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://nextepedu.com";

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/destinations`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
    ];

    // Dynamic destination pages — all 13 countries
    const destinationPages: MetadataRoute.Sitemap = Object.values(destinations).map(
        (destination) => ({
            url: `${baseUrl}/destinations/${destination.slug}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.8,
        })
    );

    return [...staticPages, ...destinationPages];
}
