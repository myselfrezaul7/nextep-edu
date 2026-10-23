"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Moon, Sun, ChevronDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useTranslation } from "@/i18n/LanguageContext";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useMounted } from "@/lib/use-mounted";
import { destinations as destinationsData } from "@/data/destinations";

const SearchModal = dynamic(() => import("@/components/common/SearchModal").then(mod => mod.SearchModal), { ssr: false });

const allDestinations = Object.values(destinationsData).map(d => ({
    name: d.name,
    href: `/destinations/${d.slug}`,
    flag: d.flag
}));

const subscribeHash = (callback: () => void) => {
    window.addEventListener("hashchange", callback);
    return () => window.removeEventListener("hashchange", callback);
};

export function Header() {
    const mounted = useMounted();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [navVisible, setNavVisible] = useState(true);
    const { theme, setTheme, systemTheme } = useTheme();
    const { t } = useTranslation();
    const pathname = usePathname();
    const activeHash = useSyncExternalStore(
        subscribeHash,
        () => window.location.hash,
        () => ""
    );
    const [scrollY, setScrollY] = useState(0);
    const lastScrollY = useRef(0);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = mounted && currentTheme === "dark";

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollY(currentScrollY);

            if (currentScrollY <= 20) {
                setNavVisible(true);
            } else if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
                setNavVisible(false);
            } else if (currentScrollY < lastScrollY.current) {
                setNavVisible(true);
            }
            lastScrollY.current = currentScrollY;

            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                setNavVisible(true);
            }, 150);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, []);

    const isServicesActive = pathname === "/" && activeHash === "#services";
    const isAboutActive = pathname === "/" && activeHash === "#about";
    const isDestinationsActive = pathname.startsWith("/destinations");
    const isTrackActive = pathname.startsWith("/track");

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <div
            className={cn(
                "fixed top-0 left-0 w-full z-50 flex justify-center mt-4 px-4 transition-all duration-300 ease-out",
                navVisible ? "translate-y-0 opacity-100" : "-translate-y-[120%] opacity-0"
            )}
        >
            <nav
                className={cn(
                    "flex justify-between items-center w-full max-w-5xl px-4 md:px-6 py-2.5 transition-all duration-300",
                    "rounded-full border glass-nav",
                    isDark
                        ? "bg-slate-900/85 border-white/[0.08] shadow-[0_4px_28px_rgba(0,0,0,0.35)]"
                        : "bg-white/85 border-slate-200/80 shadow-[0_4px_24px_rgba(15,23,42,0.06)]"
                )}
                style={{ backdropFilter: `blur(${Math.min(Math.max(scrollY / 8, 12), 20)}px)`, WebkitBackdropFilter: `blur(${Math.min(Math.max(scrollY / 8, 12), 20)}px)` }}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                    <div className="relative w-9 h-9 overflow-hidden rounded-lg">
                        <Image
                            src="/assets/logo.png"
                            alt="NexTep Edu Logo"
                            fill
                            className="object-contain"
                            sizes="36px"
                            priority
                        />
                    </div>
                    <span className="font-heading font-bold text-xl text-primary group-hover:text-accent transition-colors">
                        NexTep Edu
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-5">
                    <Link href="/#services" className="relative py-1.5 text-sm font-medium text-foreground/85 hover:text-accent transition-colors">
                        {t("common.nav.services", undefined, "Services")}
                        {isServicesActive && <motion.div layoutId="nav-underline" className="absolute left-0 right-0 bottom-0 h-0.5 bg-accent rounded-full" />}
                    </Link>

                    <div
                        className="relative"
                        onMouseEnter={() => setDropdownOpen(true)}
                        onMouseLeave={() => setDropdownOpen(false)}
                    >
                        <button
                            className="relative flex items-center gap-1 text-sm font-medium text-foreground/85 hover:text-accent transition-colors py-1.5"
                            aria-expanded={dropdownOpen}
                            aria-haspopup="true"
                        >
                            {t("common.nav.destinations", undefined, "Destinations")}
                            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", dropdownOpen && "rotate-180")} />
                            {isDestinationsActive && <motion.div layoutId="nav-underline" className="absolute left-0 right-0 bottom-0 h-0.5 bg-accent rounded-full" />}
                        </button>

                        {/* 2-Column Compact Institutional Dropdown */}
                        <div
                            className={cn(
                                "absolute top-full left-1/2 -translate-x-1/2 w-[380px] transition-all duration-200 origin-top mt-2 p-2.5 grid grid-cols-2 gap-1 max-h-80 overflow-y-auto",
                                "rounded-2xl border glass-nav",
                                isDark
                                    ? "bg-slate-900/95 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                                    : "bg-white/95 border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.12)]",
                                dropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
                            )}
                        >
                            {allDestinations.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setDropdownOpen(false)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:text-accent transition-colors truncate",
                                        isDark ? "hover:bg-white/[0.06]" : "hover:bg-slate-100/80"
                                    )}
                                >
                                    <span className="text-sm shrink-0">{item.flag}</span>
                                    <span className="truncate">{item.name}</span>
                                </Link>
                            ))}
                            <Link
                                href="/destinations"
                                onClick={() => setDropdownOpen(false)}
                                className={cn(
                                    "col-span-2 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-accent text-center border-t mt-1 pt-2.5 rounded-xl transition-colors",
                                    isDark
                                        ? "border-white/10 hover:bg-white/[0.06]"
                                        : "border-slate-200/80 hover:bg-slate-100/80"
                                )}
                            >
                                <span>{t("common.nav.viewAllDestinations", undefined, "View All Destinations")}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    <Link href="/#about" className="relative py-1.5 text-sm font-medium text-foreground/85 hover:text-accent transition-colors">
                        {t("common.nav.about", undefined, "About")}
                        {isAboutActive && <motion.div layoutId="nav-underline" className="absolute left-0 right-0 bottom-0 h-0.5 bg-accent rounded-full" />}
                    </Link>

                    <Link href="/track" className="relative py-1.5 text-sm font-medium text-foreground/85 hover:text-accent transition-colors">
                        {t("common.nav.trackApplication", undefined, "Track Status")}
                        {isTrackActive && <motion.div layoutId="nav-underline" className="absolute left-0 right-0 bottom-0 h-0.5 bg-accent rounded-full" />}
                    </Link>

                    <div className="w-px h-5 bg-border/70 mx-0.5" />

                    <SearchModal />

                    <LanguageToggle />

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className="p-2 w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-primary shrink-0"
                        aria-label="Toggle Theme"
                    >
                        {mounted && theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </motion.button>

                    <Button
                        size="sm"
                        className="rounded-full px-5 h-9 text-xs font-semibold"
                        onClick={() => window.dispatchEvent(new CustomEvent("open-booking-modal"))}
                    >
                        {t("common.nav.bookConsultation", undefined, "Book Consultation")}
                    </Button>
                </div>

                {/* Mobile Icons (Search, Language, Theme) */}
                <div className="flex items-center gap-1 lg:hidden">
                    <SearchModal />
                    <div className="w-px h-4 bg-border/60 mx-0.5" />
                    <LanguageToggle />
                    <div className="w-px h-4 bg-border/60 mx-0.5" />
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className="p-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-primary shrink-0"
                        aria-label="Toggle theme"
                    >
                        {mounted && theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </motion.button>
                </div>
            </nav>
        </div>
    );
}
