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
  title: "NexTep Edu | Build Your Future Abroad",
  description: "Premier higher study consultancy in Bangladesh helping students achieve their dreams of studying in UK, USA, Canada, Australia, Germany and 20+ countries.",
  icons: {
    icon: '/assets/logo.png', // Fallback to logo if favicon.ico is missing or cached
    shortcut: '/assets/logo.png',
    apple: '/assets/apple-touch-icon.png',
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
