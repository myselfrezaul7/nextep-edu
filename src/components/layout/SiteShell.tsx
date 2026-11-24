"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { ScrollProgress } from "@/components/common/ScrollProgress";
import { PageTransition } from "@/components/common/PageTransition";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { PortfolioNoticeModal } from "@/components/common/PortfolioNoticeModal";
import { BackToTop } from "@/components/common/BackToTop";
import { ServiceWorkerRegistrar } from "@/components/common/ServiceWorkerRegistrar";
import { ShortlistCompareDrawer } from "@/components/destinations/ShortlistCompareDrawer";
import { useBookingModal } from "@/context/BookingModalContext";

const BookingModal = dynamic(
    () => import("@/components/common/BookingModal").then((mod) => mod.BookingModal),
    { ssr: false }
);

function BookingModalHost() {
    const { isOpen } = useBookingModal();
    const [hasOpened, setHasOpened] = useState(false);

    useEffect(() => {
        if (isOpen && !hasOpened) {
            const frame = requestAnimationFrame(() => setHasOpened(true));
            return () => cancelAnimationFrame(frame);
        }
    }, [isOpen, hasOpened]);

    if (!isOpen && !hasOpened) {
        return null;
    }

    return <BookingModal />;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");
    const normalizedPath = pathname.replace(/\/+$/, "") || "/";
    const isCountryDetailPage =
        normalizedPath.startsWith("/destinations/") && normalizedPath !== "/destinations";

    return (
        <>
            <ServiceWorkerRegistrar />
            <Toaster
                position="top-center"
                containerStyle={{
                    top: "calc(1rem + env(safe-area-inset-top, 0px))",
                    zIndex: 80,
                }}
                toastOptions={{
                    duration: 3500,
                    style: {
                        background: "var(--card)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.875rem",
                        fontSize: "0.875rem",
                        boxShadow: "0 10px 30px -6px rgba(15, 23, 42, 0.25)",
                    },
                }}
            />

            {isAdmin ? (
                <main className="flex-grow min-h-screen">
                    <ErrorBoundary>{children}</ErrorBoundary>
                </main>
            ) : (
                <>
                    <ScrollProgress />
                    <div className="flex flex-col min-h-screen">
                        <Header />
                        <main className="flex-grow pt-[calc(5rem+env(safe-area-inset-top,0px))]">
                            <ErrorBoundary>
                                <PageTransition>{children}</PageTransition>
                            </ErrorBoundary>
                        </main>
                        <Footer />
                        <MobileTabBar />
                    </div>
                    <BookingModalHost />
                    <ShortlistCompareDrawer hasBottomDockWhenScrolled={isCountryDetailPage} />
                    <PortfolioNoticeModal />
                    <BackToTop />
                </>
            )}
        </>
    );
}
