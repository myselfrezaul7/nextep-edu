"use client";

import { useState, useEffect, useRef } from "react";
import { Home, BookOpen, Globe2, Compass, CalendarCheck } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/LanguageContext";
import { useMounted } from "@/lib/use-mounted";

export function MobileTabBar() {
    const { theme, systemTheme } = useTheme();
    const mounted = useMounted();
    const pathname = usePathname();
    const router = useRouter();
    const [activeHash, setActiveHash] = useState("");
    const { t } = useTranslation();
    const [tabVisible, setTabVisible] = useState(true);
    const lastScrollY = useRef(0);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = mounted && currentTheme === "dark";

    useEffect(() => {
        window.dispatchEvent(new CustomEvent("tabbar-visibility", { detail: { visible: tabVisible } }));
    }, [tabVisible]);

    useEffect(() => {
        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            let mostVisible = entries[0];
            entries.forEach(entry => {
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

        const observerOptions = {
            root: null,
            rootMargin: "-20% 0px -40% 0px",
            threshold: [0, 0.25, 0.5, 0.75, 1]
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        const sections = [
            document.getElementById("hero"),
            document.getElementById("services"),
            document.getElementById("about")
        ];

        sections.forEach(section => {
            if (section) {
                observer.observe(section);
            }
        });

        const handleHashChange = () => {
            setActiveHash(window.location.hash);
        };

        window.addEventListener("hashchange", handleHashChange);
        handleHashChange();

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY <= 20) {
                setTabVisible(true);
            } else if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
                setTabVisible(false);
            } else if (currentScrollY < lastScrollY.current) {
                setTabVisible(true);
            }
            lastScrollY.current = currentScrollY;

            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                setTabVisible(true);
            }, 150);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("hashchange", handleHashChange);
            observer.disconnect();
            window.removeEventListener("scroll", handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, [pathname]);

    const isHomeActive = pathname === "/" && (!activeHash || activeHash === "");
    const isServicesActive = pathname === "/" && activeHash === "#services";
    const isCountriesActive = pathname.startsWith("/destinations");
    const isTrackActive = pathname.startsWith("/track");

    const handleNavClick = (hash: string) => {
        if (pathname !== "/") {
            router.push(`/${hash}`);
        } else {
            if (hash === "") {
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
        }
    };

    return (
        <motion.nav
            className={cn(
                "fixed bottom-3.5 left-3.5 right-3.5 z-50 md:hidden",
                "px-2.5 py-2 rounded-2xl border glass-nav transition-all duration-300 ease-out",
                tabVisible ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-0",
                isDark
                    ? "bg-slate-900/90 border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
                    : "bg-white/90 border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
            )}
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            <div className="grid grid-cols-5 items-center gap-1">
                {/* HOME */}
                <button
                    onClick={() => handleNavClick("")}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-0.5 h-11 rounded-xl transition-colors duration-200",
                        isHomeActive
                            ? "text-accent"
                            : isDark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Home className="w-4 h-4" strokeWidth={isHomeActive ? 2.4 : 1.9} />
                    <span className="text-[10px] font-semibold tracking-tight">{t("common.tab.home", undefined, "Home")}</span>
                    {isHomeActive && (
                        <motion.div
                            layoutId="tab-indicator"
                            className="absolute inset-0 rounded-xl bg-accent/12 -z-10"
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        />
                    )}
                </button>

                {/* SERVICES */}
                <button
                    onClick={() => handleNavClick("#services")}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-0.5 h-11 rounded-xl transition-colors duration-200",
                        isServicesActive
                            ? "text-accent"
                            : isDark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <BookOpen className="w-4 h-4" strokeWidth={isServicesActive ? 2.4 : 1.9} />
                    <span className="text-[10px] font-semibold tracking-tight">{t("common.tab.services", undefined, "Services")}</span>
                    {isServicesActive && (
                        <motion.div
                            layoutId="tab-indicator"
                            className="absolute inset-0 rounded-xl bg-accent/12 -z-10"
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        />
                    )}
                </button>

                {/* COUNTRIES */}
                <button
                    onClick={() => router.push("/destinations")}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-0.5 h-11 rounded-xl transition-colors duration-200",
                        isCountriesActive
                            ? "text-accent"
                            : isDark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Globe2 className="w-4 h-4" strokeWidth={isCountriesActive ? 2.4 : 1.9} />
                    <span className="text-[10px] font-semibold tracking-tight">{t("common.tab.countries", undefined, "Countries")}</span>
                    {isCountriesActive && (
                        <motion.div
                            layoutId="tab-indicator"
                            className="absolute inset-0 rounded-xl bg-accent/12 -z-10"
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        />
                    )}
                </button>

                {/* TRACK */}
                <button
                    onClick={() => router.push("/track")}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-0.5 h-11 rounded-xl transition-colors duration-200",
                        isTrackActive
                            ? "text-accent"
                            : isDark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Compass className="w-4 h-4" strokeWidth={isTrackActive ? 2.4 : 1.9} />
                    <span className="text-[10px] font-semibold tracking-tight">{t("common.tab.track", undefined, "Track")}</span>
                    {isTrackActive && (
                        <motion.div
                            layoutId="tab-indicator"
                            className="absolute inset-0 rounded-xl bg-accent/12 -z-10"
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        />
                    )}
                </button>

                {/* BOOK */}
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent("open-booking-modal"))}
                    className="relative flex flex-col items-center justify-center gap-0.5 h-11 rounded-xl bg-accent/15 text-accent font-semibold transition-colors duration-200"
                >
                    <CalendarCheck className="w-4 h-4" strokeWidth={2.2} />
                    <span className="text-[10px] font-bold tracking-tight">{t("common.tab.book", undefined, "Book")}</span>
                </button>
            </div>
        </motion.nav>
    );
}
