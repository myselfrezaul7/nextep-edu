import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "NexTep Edu - Study Abroad Consultancy Bangladesh",
        short_name: "NexTep Edu",
        description:
            "Trusted study abroad guidance for Bangladeshi students across 17+ countries. Explore universities, track applications live, and book free consultations.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#0B1120",
        theme_color: "#0B1120",
        categories: ["education", "lifestyle"],
        icons: [
            {
                src: "/assets/android-chrome-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/assets/android-chrome-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/assets/android-chrome-maskable-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
        shortcuts: [
            {
                name: "Track Application",
                short_name: "Track",
                description: "Check live application and document verification status",
                url: "/track",
                icons: [{ src: "/assets/android-chrome-192x192.png", sizes: "192x192", type: "image/png" }],
            },
            {
                name: "Study Destinations",
                short_name: "Destinations",
                description: "Compare 17+ study abroad destinations",
                url: "/destinations",
                icons: [{ src: "/assets/android-chrome-192x192.png", sizes: "192x192", type: "image/png" }],
            },
            {
                name: "Book Consultation",
                short_name: "Book",
                description: "Schedule a free 1-on-1 study abroad consultation",
                url: "/?book=1",
                icons: [{ src: "/assets/android-chrome-192x192.png", sizes: "192x192", type: "image/png" }],
            },
        ],
    };
}
