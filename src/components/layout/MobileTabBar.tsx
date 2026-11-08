"use client";

import { useState, useEffect } from "react";
import { Home, BookOpen, Globe2, Compass, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/LanguageContext";
import { useBookingModal } from "@/context/BookingModalContext";
import { useNavVisible } from "@/lib/scroll-store";

function triggerHaptic() {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        try {
            navigator.vibrate(8);
        } catch {
            // Silently ignore on unsupported browsers
        }
    }
}

export function MobileTabBar() {
    const pathname = usePathname();
    const router = useRouter();
    const [activeHash, setActiveHash] = useState("");
    const { t } = useTranslation();
    const { openModal } = useBookingModal();
    const tabVisible = useNavVisible();

    useEffect(() => {
        if (pathname.startsWith("/admin")) return;

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            let mostVisible = entries[0];
            entries.forEach((entry) => {
                if (entry.intersectionRatio > mostVisible.intersectionRatio) {
                    mostVisible = entry;
                }
            });

            if (mostVisible && mostVisible.isIntersecting) {
                const id = mostVisible.target.id;
                if (id === "hero") setActiveHash("");
                else if (id === "services") setActiveHash("#services");
                else if (id === "about") setActiveHash("#about");
            }
        };

        const observer = new IntersectionObserver(observerCallback, {
            root: null,
            rootMargin: "-20% 0px -40% 0px",
            threshold: [0, 0.25, 0.5, 0.75, 1],
        });

        const sections = [
            document.getElementById("hero"),
            document.getElementById("services"),
            document.getElementById("about"),
        ];

        sections.forEach((section) => {
            if (section) observer.observe(section);
        });

        const handleHashChange = () => {
            setActiveHash(window.location.hash);
        };

        window.addEventListener("hashchange", handleHashChange);
        handleHashChange();

        return () => {
            window.removeEventListener("hashchange", handleHashChange);
            observer.disconnect();
        };
    }, [pathname]);

    if (pathname.startsWith("/admin")) {
        return null;
    }

    const isHomeActive = pathname === "/" && (!activeHash || activeHash === "");
    const isServicesActive = pathname === "/" && activeHash === "#services";
    const isCountriesActive = pathname.startsWith("/destinations");
    const isTrackActive = pathname.startsWith("/track");

    const handleNavClick = (hash: string) => {
        triggerHaptic();
        if (pathname !== "/") {
            router.push(`/${hash}`);
        } else if (hash === "") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            history.replaceState(null, "", " ");
            setActiveHash("");
        } else {
            const element = document.querySelector(hash);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
                history.pushState(null, "", hash);
                setActiveHash(hash);
            }
        }
    };

    const handleRouteClick = (href: string) => {
        triggerHaptic();
        router.push(href);
    };

    const handleBookClick = () => {
        triggerHaptic();
        openModal();
    };

    return (
        <nav
            aria-label="Mobile primary navigation"
            className={cn(
                "fixed left-3.5 right-3.5 z-50 md:hidden will-change-transform",
                "px-2.5 py-2 rounded-[1.75rem] border glass-nav saturate-[1.8]",
                "bg-white/75 dark:bg-slate-900/78 border-slate-200/85 dark:border-white/[0.1]",
                "shadow-[0_10px_34px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.75)] dark:shadow-[0_12px_38px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]",
                "transition-[transform,opacity] duration-300 ease-out",
                tabVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-[140%] opacity-0 pointer-events-none"
            )}
            style={{
                bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
            }}
        >
            {/* Subtle Gold Hairline Accent along top edge */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-accent/65 to-transparent"
            />

            <div className="grid grid-cols-5 items-center gap-1">
                {/* 1. HOME */}
                <button
                    type="button"
                    onClick={() => handleNavClick("")}
                    aria-label={t("common.tab.home", undefined, "Home")}
                    aria-current={isHomeActive ? "page" : undefined}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-0.5 min-h-[46px] rounded-2xl transition-all duration-150 active:scale-[0.92]",
                        isHomeActive
                            ? "text-accent"
                            : "text-muted-foreground dark:text-white/65 hover:text-foreground dark:hover:text-white"
                    )}
                >
                    <Home className="w-[18px] h-[18px]" strokeWidth={isHomeActive ? 2.3 : 1.8} />
                    <span className="text-[10px] font-semibold tracking-tight leading-none mt-0.5">
                        {t("common.tab.home", undefined, "Home")}
                    </span>
                    {isHomeActive && (
                        <>
                            <motion.div
                                layoutId="tab-indicator"
                                className="absolute inset-0 rounded-2xl bg-accent/14 border border-accent/25 -z-10"
                                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                            />
                            <span className="w-1 h-1 rounded-full bg-accent mt-0.5" />
                        </>
                    )}
                </button>

                {/* 2. SERVICES */}
                <button
                    type="button"
                    onClick={() => handleNavClick("#services")}
                    aria-label={t("common.tab.services", undefined, "Services")}
                    aria-current={isServicesActive ? "page" : undefined}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-0.5 min-h-[46px] rounded-2xl transition-all duration-150 active:scale-[0.92]",
                        isServicesActive
                            ? "text-accent"
                            : "text-muted-foreground dark:text-white/65 hover:text-foreground dark:hover:text-white"
                    )}
                >
                    <BookOpen className="w-[18px] h-[18px]" strokeWidth={isServicesActive ? 2.3 : 1.8} />
                    <span className="text-[10px] font-semibold tracking-tight leading-none mt-0.5">
                        {t("common.tab.services", undefined, "Services")}
                    </span>
                    {isServicesActive && (
                        <>
                            <motion.div
                                layoutId="tab-indicator"
                                className="absolute inset-0 rounded-2xl bg-accent/14 border border-accent/25 -z-10"
                                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                            />
                            <span className="w-1 h-1 rounded-full bg-accent mt-0.5" />
                        </>
                    )}
                </button>

                {/* 3. RAISED CENTER BOOK CTA */}
                <div className="relative flex flex-col items-center justify-center">
                    <button
                        type="button"
                        onClick={handleBookClick}
                        aria-label={t("common.tab.book", undefined, "Book Free Consultation")}
                        className="group relative flex flex-col items-center justify-center focus:outline-none active:scale-[0.92] transition-transform duration-150"
                    >
                        <div className="-mt-6 w-13 h-13 rounded-full bg-gradient-to-br from-[#E6C55A] via-[#D4AF37] to-[#B8901F] text-slate-950 ring-4 ring-background shadow-[0_8px_24px_rgba(212,175,55,0.42)] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                            <CalendarCheck className="w-5 h-5" strokeWidth={2.3} />
                        </div>
                        <span className="text-[10px] font-bold tracking-tight text-accent leading-none mt-1">
                            {t("common.tab.book", undefined, "Book")}
                        </span>
                    </button>
                </div>

                {/* 4. COUNTRIES */}
                <button
                    type="button"
                    onClick={() => handleRouteClick("/destinations")}
                    aria-label={t("common.tab.countries", undefined, "Countries")}
                    aria-current={isCountriesActive ? "page" : undefined}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-0.5 min-h-[46px] rounded-2xl transition-all duration-150 active:scale-[0.92]",
                        isCountriesActive
                            ? "text-accent"
                            : "text-muted-foreground dark:text-white/65 hover:text-foreground dark:hover:text-white"
                    )}
                >
                    <Globe2 className="w-[18px] h-[18px]" strokeWidth={isCountriesActive ? 2.3 : 1.8} />
                    <span className="text-[10px] font-semibold tracking-tight leading-none mt-0.5">
                        {t("common.tab.countries", undefined, "Countries")}
                    </span>
                    {isCountriesActive && (
                        <>
                            <motion.div
                                layoutId="tab-indicator"
                                className="absolute inset-0 rounded-2xl bg-accent/14 border border-accent/25 -z-10"
                                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                            />
                            <span className="w-1 h-1 rounded-full bg-accent mt-0.5" />
                        </>
                    )}
                </button>

                {/* 5. TRACK */}
                <button
                    type="button"
                    onClick={() => handleRouteClick("/track")}
                    aria-label={t("common.tab.track", undefined, "Track Application")}
                    aria-current={isTrackActive ? "page" : undefined}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-0.5 min-h-[46px] rounded-2xl transition-all duration-150 active:scale-[0.92]",
                        isTrackActive
                            ? "text-accent"
                            : "text-muted-foreground dark:text-white/65 hover:text-foreground dark:hover:text-white"
                    )}
                >
                    <Compass className="w-[18px] h-[18px]" strokeWidth={isTrackActive ? 2.3 : 1.8} />
                    <span className="text-[10px] font-semibold tracking-tight leading-none mt-0.5">
                        {t("common.tab.track", undefined, "Track")}
                    </span>
                    {isTrackActive && (
                        <>
                            <motion.div
                                layoutId="tab-indicator"
                                className="absolute inset-0 rounded-2xl bg-accent/14 border border-accent/25 -z-10"
                                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                            />
                            <span className="w-1 h-1 rounded-full bg-accent mt-0.5" />
                        </>
                    )}
                </button>
            </div>
        </nav>
    );
}
