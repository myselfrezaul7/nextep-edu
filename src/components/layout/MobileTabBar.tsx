"use client";

import { useState, useEffect, useRef } from "react";
import { Home, BookOpen, CalendarCheck, Info } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/LanguageContext";

export function MobileTabBar() {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const [activeHash, setActiveHash] = useState("");
    const { t } = useTranslation();
    const [tabVisible, setTabVisible] = useState(true);
    const lastScrollY = useRef(0);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = mounted && currentTheme === "dark";

    useEffect(() => {
        setMounted(true);
        
        // Setup Intersection Observer for scroll-spy
        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            // Find the most visible section
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
            rootMargin: '-20% 0px -40% 0px', // Trigger when section is in the middle-top of the screen
            threshold: [0, 0.25, 0.5, 0.75, 1]
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe main sections
        const sections = [
            document.querySelector("section.relative.min-h-\\[90vh\\]"), // Hero section (doesn't have an ID, select by unique class)
            document.getElementById("services"),
            document.getElementById("about")
        ];

        sections.forEach(section => {
            if (section) {
                // Add id to hero if not present for easier tracking
                if (!section.id && section.tagName === 'SECTION') section.id = "hero";
                observer.observe(section);
            }
        });

        // Track hash changes from manual clicks
        const handleHashChange = () => {
            setActiveHash(window.location.hash);
        };
        
        window.addEventListener("hashchange", handleHashChange);
        handleHashChange(); // Init
        
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setTabVisible(false); // scrolling down
            } else {
                setTabVisible(true); // scrolling up
            }
            lastScrollY.current = currentScrollY;

            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                setTabVisible(true);
            }, 300);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener("hashchange", handleHashChange);
            observer.disconnect();
            window.removeEventListener("scroll", handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, []);

    // Determine active tab based on activeHash and pathname
    // If we're on a child page (e.g. /destinations/uk), the Home icon should take us back or we can just not highlight it if we're not on home
    const isHomeActive = pathname === "/" && (!activeHash || activeHash === "");
    const isServicesActive = pathname === "/" && activeHash === "#services";
    const isAboutActive = pathname === "/" && activeHash === "#about";
    // For BOOK, we don't really have a hash, it's a modal, but we can highlight it on click momentarily or leave it stateless
    
    const handleNavClick = (hash: string) => {
        if (pathname !== "/") {
            window.location.href = `/${hash}`;
        } else {
            if (hash === "") {
                window.scrollTo({ top: 0, behavior: "smooth" });
                // Strip hash without scrolling jump
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
            initial={{ y: 0 }}
            animate={{ y: tabVisible ? 0 : "120%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
                "fixed bottom-4 left-4 right-4 z-50 md:hidden",
                "px-4 py-2.5 rounded-[2rem] border glass-nav transition-all duration-300",
                isDark
                    ? "bg-[rgba(15,23,42,0.85)] border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
                    : "bg-white/85 border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
            )}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="flex justify-between items-center">
                {/* HOME */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleNavClick("")}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-all duration-200",
                        isHomeActive
                            ? "bg-accent/15 text-accent"
                            : isDark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Home className={cn("w-5 h-5", isHomeActive && "fill-accent/20")} strokeWidth={isHomeActive ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t("common.tab.home")}</span>
                    {isHomeActive && (
                        <motion.div
                            layoutId="activeTabPill"
                            className="absolute bottom-1 w-1 h-1 rounded-full bg-accent"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    )}
                </motion.button>

                {/* SERVICES */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleNavClick("#services")}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-all duration-200",
                        isServicesActive
                            ? "bg-accent/15 text-accent"
                            : isDark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <BookOpen className={cn("w-5 h-5", isServicesActive && "fill-accent/20")} strokeWidth={isServicesActive ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t("common.tab.services")}</span>
                    {isServicesActive && (
                        <motion.div
                            layoutId="activeTabPill"
                            className="absolute bottom-1 w-1 h-1 rounded-full bg-accent"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    )}
                </motion.button>

                {/* BOOK */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-all duration-200",
                        isDark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <CalendarCheck className="w-5 h-5" strokeWidth={2} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Book</span>
                </motion.button>

                {/* ABOUT */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleNavClick("#about")}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-all duration-200",
                        isAboutActive
                            ? "bg-accent/15 text-accent"
                            : isDark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Info className={cn("w-5 h-5", isAboutActive && "fill-accent/20")} strokeWidth={isAboutActive ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t("common.tab.about")}</span>
                    {isAboutActive && (
                        <motion.div
                            layoutId="activeTabPill"
                            className="absolute bottom-1 w-1 h-1 rounded-full bg-accent"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    )}
                </motion.button>
            </div>
        </motion.nav>
    );
}
