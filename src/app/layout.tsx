import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookingModal } from "@/components/common/BookingModal";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nextepedu.com'),
  alternates: {
    canonical: './',
  },
  title: {
    default: "NexTep Edu | Build Your Future Abroad",
    template: "%s | NexTep Edu"
  },
  description: "Premier higher study consultancy in Bangladesh. Expert guidance for UK, USA, Canada, Australia, Germany & 20+ countries. 98% visa success rate.",
  keywords: ["study abroad", "higher education", "consultancy", "Bangladesh", "student visa", "scholarships", "university admission", "UK", "USA", "Canada", "Australia", "Germany"],
  authors: [{ name: "NexTep Edu Team" }],
  creator: "NexTep Edu",
  publisher: "NexTep Edu",
  openGraph: {
    title: "NexTep Edu | Build Your Future Abroad",
    description: "Start your international education journey today. Expert counseling, visa processing, and university admissions for students in Bangladesh.",
    url: 'https://www.nextepedu.com',
    siteName: 'NexTep Edu',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/assets/logo.png', // Ideally a larger OG image, but logo serves for now
        width: 800,
        height: 600,
        alt: 'NexTep Edu Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "NexTep Edu | Study Abroad Consultants",
    description: "Join hundreds of students who achieved their dreams with NexTep Edu. 98% Visa Success Rate.",
    images: ['/assets/logo.png'],
  },
  icons: {
    icon: '/assets/logo.png',
    shortcut: '/assets/logo.png',
    apple: '/assets/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${ibmPlexSans.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "NexTep Edu",
              "url": "https://www.nextepedu.com",
              "logo": "https://www.nextepedu.com/assets/logo.png",
              "sameAs": [
                "https://facebook.com/nextepbd",
                "https://instagram.com/nextepedu"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+49 157 73855748",
                "contactType": "customer service"
              },
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Dhaka",
                "addressCountry": "BD"
              }
            })
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="pt-24 min-h-screen">
            {children}
          </main>
          <Footer />
          <BookingModal />
          <Toaster position="bottom-right" toastOptions={{
            className: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white',
            duration: 5000,
            style: {
              background: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            }
          }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
