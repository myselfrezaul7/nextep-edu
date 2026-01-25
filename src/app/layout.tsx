import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookingModal } from "@/components/common/BookingModal";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexTep Edu | Build Your Future Abroad",
  description: "Premier higher study consultancy in Bangladesh helping students achieve their dreams of studying in UK, USA, Canada, Australia, Germany and 20+ countries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
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
