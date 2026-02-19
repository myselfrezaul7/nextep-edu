import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StructuredData } from "@/components/common/structured-data";
import { BookingModal } from "@/components/common/BookingModal";
import { WhatsAppFAB } from "@/components/common/WhatsAppFAB";
import { ScrollProgress } from "@/components/common/ScrollProgress";
import { BackToTop } from "@/components/common/BackToTop";
import { PageTransition } from "@/components/common/PageTransition";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";


const ibmPlexSans = IBM_Plex_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-ibm-plex-sans",
});

// SEO Metadata targeting Bangladeshi students
export const metadata: Metadata = {
    title: {
        default: "NexTep Edu | Study Abroad Consultancy Bangladesh | বিদেশে পড়াশোনা",
        template: "%s | NexTep Edu",
    },
    description:
        "Leading study abroad consultancy in Bangladesh. Expert guidance for Bangladeshi students to study in Germany, UK, USA, Canada, Australia & more. Free consultation in Dhaka. বাংলাদেশ থেকে বিদেশে উচ্চশিক্ষা।",
    keywords: [
        // Primary Bangladesh-focused keywords
        "study abroad from Bangladesh",
        "study abroad consultancy Dhaka",
        "overseas education Bangladesh",
        "বিদেশে পড়াশোনা",
        "বাংলাদেশ থেকে বিদেশে উচ্চশিক্ষা",
        // Country-specific from Bangladesh
        "study in Germany from Bangladesh",
        "study in UK from Bangladesh",
        "study in USA from Bangladesh",
        "study in Canada from Bangladesh",
        "study in Australia from Bangladesh",
        // Service keywords
        "student visa Bangladesh",
        "scholarship for Bangladeshi students",
        "IELTS preparation Dhaka",
        "university admission help Bangladesh",
        "education consultancy Dhaka",
        "best study abroad agency Bangladesh",
        // Long-tail keywords
        "how to study abroad from Bangladesh",
        "study abroad without IELTS Bangladesh",
        "tuition free universities for Bangladeshi students",
        "Germany student visa from Bangladesh",
    ],
    authors: [{ name: "NexTep Edu", url: "https://www.nextepedu.com" }],
    creator: "NexTep Edu",
    publisher: "NexTep Edu",
    formatDetection: {
        email: true,
        address: true,
        telephone: true,
    },
    metadataBase: new URL("https://www.nextepedu.com"),
    alternates: {
        canonical: "./",
        languages: {
            "en-BD": "./",
        },
    },
    // Open Graph for Facebook/LinkedIn (popular in Bangladesh)
    openGraph: {
        type: "website",
        locale: "en_BD",
        url: "https://www.nextepedu.com",
        siteName: "NexTep Edu",
        title: "NexTep Edu | Study Abroad Consultancy Bangladesh",
        description:
            "Expert guidance for Bangladeshi students to study abroad. We help you achieve your dream of international education in Germany, UK, USA, Canada & more.",

    },
    // Twitter Card
    twitter: {
        card: "summary_large_image",
        title: "NexTep Edu | Study Abroad from Bangladesh",
        description:
            "Leading study abroad consultancy helping Bangladeshi students achieve their dreams of international education.",
        creator: "@nextepedu",
    },
    // Robots
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    // Verification (add your IDs after setting up)
    verification: {
        google: "-rite_oeT3HO65k-rhGykyzD6x-V05loAJ27NfqRteM",
        // yandex: 'your-yandex-verification-code',
    },
    // Category
    category: "Education",
    // Icons
    icons: {
        icon: "/assets/favicon.ico",
        shortcut: "/assets/favicon-16x16.png",
        apple: "/assets/apple-touch-icon.png",
    },
    // Additional geo-targeting
    other: {
        "geo.region": "BD",
        "geo.placename": "Dhaka, Bangladesh",
        "geo.position": "23.8103;90.4125",
        ICBM: "23.8103, 90.4125",
        "content-language": "en-BD",
    },
};

// Viewport configuration
export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#F8F9FA" },
        { media: "(prefers-color-scheme: dark)", color: "#0B1120" },
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <StructuredData />
            </head>
            <body className={ibmPlexSans.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <ScrollProgress />
                    <div className="flex flex-col min-h-screen">
                        <Header />
                        <main className="flex-grow pt-20">
                            <ErrorBoundary>
                                <PageTransition>{children}</PageTransition>
                            </ErrorBoundary>
                        </main>
                        <Footer />
                    </div>
                    <BookingModal />
                    <WhatsAppFAB />
                    <BackToTop />
                    <SpeedInsights />
                </ThemeProvider>
            </body>
        </html>
    );
}
