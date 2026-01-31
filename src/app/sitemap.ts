import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.nextepedu.com';

    // Core pages
    const routes = [
        '',
        '/destinations',
        // add other static routes here if they exist like /about, /services
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Destination pages
    const countries = ['uk', 'usa', 'canada', 'australia', 'germany', 'france', 'china', 'netherlands', 'norway', 'portugal', 'austria', 'belgium', 'south-korea'];

    const destinationRoutes = countries.map((country) => ({
        url: `${baseUrl}/destinations/${country}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.9,
    }));

    return [...routes, ...destinationRoutes];
}
