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
    ];

    // Dynamic destination pages
    const destinationPages: MetadataRoute.Sitemap = Object.keys(destinations).map(
        (country) => ({
            url: `${baseUrl}/destinations/${country}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.8,
        })
    );

    return [...staticPages, ...destinationPages];
}
