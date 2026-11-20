"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/i18n/LanguageContext";
import {
    DestinationsGrid,
    filterDestinations,
    type DestinationFilterCategory,
} from "@/components/destinations/DestinationsGrid";
import { destinations } from "@/data/destinations";
import { Button } from "@/components/ui/button";
import { Search, X, Sparkles, LayoutGrid, Rows3 } from "lucide-react";
import { useBookingModal } from "@/context/BookingModalContext";
import { useNavVisible } from "@/lib/scroll-store";
import { cn } from "@/lib/utils";

const EXPLORER_CHIPS: { id: DestinationFilterCategory; key: string; label: string }[] = [
    { id: "all", key: "destinations.filters.all", label: "All Countries" },
    { id: "europe", key: "destinations.filters.europe", label: "Europe" },
    { id: "schengen", key: "destinations.filters.schengen", label: "Schengen Zone" },
    { id: "north-america", key: "destinations.filters.northAmerica", label: "North America" },
    { id: "asia-pacific", key: "destinations.filters.asiaPacific", label: "Asia-Pacific" },
    { id: "budget", key: "destinations.filters.lowTuition", label: "Low / No Tuition" },
    { id: "work-rights", key: "destinations.filters.workRights", label: "High Work Rights" },
];

const VALID_CATEGORIES = new Set<DestinationFilterCategory>(EXPLORER_CHIPS.map((c) => c.id));

function parseCategoryParam(raw: string | null): DestinationFilterCategory {
    if (!raw) return "all";
    const normalized = raw.toLowerCase().trim();
    if (normalized === "affordable" || normalized === "scholarships") return "budget";
    if (VALID_CATEGORIES.has(normalized as DestinationFilterCategory)) {
        return normalized as DestinationFilterCategory;
    }
    return "all";
}

export function DestinationsPageContent() {
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const { openModal } = useBookingModal();
    const navVisible = useNavVisible();

    const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
    const [activeCategory, setActiveCategory] = useState<DestinationFilterCategory>(() =>
        parseCategoryParam(searchParams.get("category"))
    );
    const [compactMobile, setCompactMobile] = useState(false);

    // Sync incoming route query param changes (e.g. SearchModal quick action while already on /destinations)
    const searchParamsString = searchParams.toString();
    const prevSearchParamsRef = useRef(searchParamsString);
    useEffect(() => {
        if (prevSearchParamsRef.current === searchParamsString) return;
        prevSearchParamsRef.current = searchParamsString;
        const incomingQ = searchParams.get("q") || "";
        const incomingCat = parseCategoryParam(searchParams.get("category"));
        const frame = requestAnimationFrame(() => {
            setSearchQuery(incomingQ);
            setActiveCategory(incomingCat);
        });
        return () => cancelAnimationFrame(frame);
    }, [searchParams, searchParamsString]);

    // Sync local filter edits to URL without page reload so Back button restores exact filter state
    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams();
        if (activeCategory !== "all") params.set("category", activeCategory);
        if (searchQuery.trim()) params.set("q", searchQuery.trim());
        const qs = params.toString();
        const nextUrl = qs ? `/destinations?${qs}` : "/destinations";
        if (window.location.pathname + window.location.search !== nextUrl) {
            prevSearchParamsRef.current = qs;
            window.history.replaceState(null, "", nextUrl);
        }
    }, [activeCategory, searchQuery]);

    const totalCount = Object.keys(destinations).length;
    const matchCount = useMemo(
        () => filterDestinations(activeCategory, searchQuery, false).length,
        [activeCategory, searchQuery]
    );

    const resetFilters = () => {
        setSearchQuery("");
        setActiveCategory("all");
    };

    return (
        <div className="min-h-screen">
            {/* Hero Intro */}
            <section className="pt-8 pb-6 md:py-16 bg-gradient-to-b from-accent/[0.05] to-transparent">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-block px-3.5 py-1.5 rounded-full bg-accent/10 text-accent font-semibold text-xs tracking-wider uppercase mb-3 border border-accent/20">
                            {totalCount} {t("destinations.page.countBadge", undefined, "Study Destinations")}
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-primary mb-3">
                            {t("destinations.page.title", undefined, "Explore Study Abroad Destinations")}
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                            {t(
                                "destinations.page.subtitle",
                                undefined,
                                "Compare tuition, post-study work opportunities, and partner universities across our global network."
                            )}
                        </p>
                    </div>
                </div>
            </section>

            {/* Sticky Search + Filter Bar (synced with Header visibility) */}
            <div
                className={cn(
                    "sticky z-30 bg-background/92 backdrop-blur-xl border-y border-border/60 transition-[top] duration-300 ease-out",
                    navVisible ? "top-[calc(4.75rem+env(safe-area-inset-top,0px))]" : "top-0"
                )}
            >
                <div className="container mx-auto px-4 py-3 space-y-2.5 max-w-5xl">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="w-5 h-5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="search"
                            inputMode="search"
                            enterKeyHint="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t(
                                "destinations.page.searchPlaceholder",
                                undefined,
                                "Search by country, university (e.g. Oxford, TUM), or benefit..."
                            )}
                            className="w-full min-h-[48px] pl-11 pr-12 py-2.5 rounded-2xl border border-border/80 bg-card/90 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent shadow-2xs transition-all [&::-webkit-search-cancel-button]:hidden"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                aria-label="Clear search"
                                className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Horizontal Filter Chips with Right-Edge Scroll Fade */}
                    <div className="relative">
                        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 py-0.5 snap-x">
                            {EXPLORER_CHIPS.map((chip) => {
                                const isActive = activeCategory === chip.id;
                                return (
                                    <button
                                        key={chip.id}
                                        type="button"
                                        onClick={() => setActiveCategory(chip.id)}
                                        className={cn(
                                            "px-4 min-h-[44px] rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 snap-start border",
                                            isActive
                                                ? "bg-accent text-slate-950 border-accent shadow-2xs"
                                                : "bg-card/85 text-muted-foreground border-border/70 hover:text-foreground hover:border-accent/40"
                                        )}
                                    >
                                        {t(chip.key, undefined, chip.label)}
                                    </button>
                                );
                            })}
                        </div>
                        <div
                            aria-hidden="true"
                            className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent"
                        />
                    </div>

                    {/* Live Count + Mobile Compact 2-Col Toggle */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                        <p className="text-xs font-medium text-muted-foreground">
                            {t("destinations.page.showingPrefix", undefined, "Showing")}{" "}
                            <span className="font-bold text-primary">{matchCount}</span>{" "}
                            {t("destinations.page.showingOf", undefined, "of")}{" "}
                            <span className="font-bold text-primary">{totalCount}</span>{" "}
                            {t("destinations.page.showingSuffix", undefined, "countries")}
                        </p>

                        <div className="flex items-center gap-1.5 md:hidden">
                            <button
                                type="button"
                                onClick={() => setCompactMobile(false)}
                                aria-label="Single column view"
                                aria-pressed={!compactMobile}
                                className={cn(
                                    "min-h-[38px] px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors",
                                    !compactMobile
                                        ? "bg-accent/15 border-accent/40 text-accent"
                                        : "bg-card border-border/60 text-muted-foreground"
                                )}
                            >
                                <Rows3 className="w-3.5 h-3.5" />
                                <span>Cards</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setCompactMobile(true)}
                                aria-label="Compact two column view"
                                aria-pressed={compactMobile}
                                className={cn(
                                    "min-h-[38px] px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors",
                                    compactMobile
                                        ? "bg-accent/15 border-accent/40 text-accent"
                                        : "bg-card border-border/60 text-muted-foreground"
                                )}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>Compact</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Destinations Grid */}
            <section className="py-8 md:py-16">
                <div className="container mx-auto px-4">
                    <DestinationsGrid
                        searchQuery={searchQuery}
                        activeCategory={activeCategory}
                        compactMobile={compactMobile}
                        onResetFilters={resetFilters}
                    />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 md:py-20 bg-surface/60 dark:bg-card/40 border-t border-border/50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold font-heading text-primary mb-3">
                        {t("destinations.page.ctaTitle", undefined, "Not Sure Which Country Fits Your Profile?")}
                    </h2>
                    <p className="text-muted-foreground mb-7 max-w-xl mx-auto text-sm md:text-base">
                        {t(
                            "destinations.page.ctaSubtitle",
                            undefined,
                            "Book a free profile evaluation or chat with our counselors for a personalized country and university shortlist based on your academic background and budget."
                        )}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                        <Button
                            size="lg"
                            className="rounded-full px-8 min-h-[48px] w-full sm:w-auto gap-2"
                            onClick={() => openModal({ topic: "Country & University Shortlisting" })}
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>
                                {t("destinations.page.bookAssessment", undefined, "Book Free Profile Assessment")}
                            </span>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full px-8 min-h-[48px] w-full sm:w-auto gap-2"
                            asChild
                        >
                            <a
                                href="https://wa.me/4915147483493?text=Hi%2C%20I%20need%20help%20choosing%20a%20study%20destination"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                <span>{t("destinations.page.ctaButton", undefined, "Chat With a Counselor")}</span>
                            </a>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
