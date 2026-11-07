"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import { DestinationsGrid, type DestinationFilterCategory } from "@/components/destinations/DestinationsGrid";
import { destinations } from "@/data/destinations";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, X, Sparkles } from "lucide-react";
import { useBookingModal } from "@/context/BookingModalContext";
import { cn } from "@/lib/utils";

const EXPLORER_CHIPS: { id: DestinationFilterCategory; label: string }[] = [
    { id: "all", label: "All Countries" },
    { id: "europe", label: "Europe" },
    { id: "schengen", label: "Schengen Zone" },
    { id: "north-america", label: "North America" },
    { id: "asia-pacific", label: "Asia-Pacific" },
    { id: "budget", label: "Low / No Tuition" },
    { id: "work-rights", label: "High Work Rights" },
];

export function DestinationsPageContent() {
    const { t } = useTranslation();
    const { openModal } = useBookingModal();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<DestinationFilterCategory>("all");

    const resetFilters = () => {
        setSearchQuery("");
        setActiveCategory("all");
    };

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="py-12 md:py-20 bg-gradient-to-b from-accent/[0.05] to-transparent border-b border-border/40">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-block px-3.5 py-1.5 rounded-full bg-accent/10 text-accent font-semibold text-xs tracking-wider uppercase mb-4 border border-accent/20">
                            {Object.keys(destinations).length} Study Destinations
                        </div>
                        <motion.h1
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-primary mb-4"
                        >
                            {t("destinations.page.title", undefined, "Explore Study Abroad Destinations")}
                        </motion.h1>
                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
                            {t(
                                "destinations.page.subtitle",
                                undefined,
                                "Compare tuition, post-study work opportunities, and partner universities across our global network."
                            )}
                        </p>

                        {/* Interactive Search & Quick Filter Bar */}
                        <div className="max-w-2xl mx-auto space-y-4">
                            <div className="relative">
                                <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="search"
                                    inputMode="search"
                                    enterKeyHint="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by country, university (e.g. Oxford, TUM), or benefit..."
                                    className="w-full min-h-[50px] pl-12 pr-12 py-3 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent shadow-sm transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        aria-label="Clear search"
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 py-1 snap-x">
                                {EXPLORER_CHIPS.map((chip) => {
                                    const isActive = activeCategory === chip.id;
                                    return (
                                        <button
                                            key={chip.id}
                                            type="button"
                                            onClick={() => setActiveCategory(chip.id)}
                                            className={cn(
                                                "px-4 min-h-[40px] rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 snap-start border",
                                                isActive
                                                    ? "bg-accent text-slate-950 border-accent shadow-xs"
                                                    : "bg-card/80 text-muted-foreground border-border/70 hover:text-foreground hover:border-accent/40"
                                            )}
                                        >
                                            {chip.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Destinations Grid */}
            <section className="py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <DestinationsGrid
                        searchQuery={searchQuery}
                        activeCategory={activeCategory}
                        onResetFilters={resetFilters}
                    />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-surface/60 dark:bg-card/40 border-t border-border/50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold font-heading text-primary mb-3">
                        {t("destinations.page.ctaTitle", undefined, "Not Sure Which Country Fits Your Profile?")}
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-sm md:text-base">
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
                            <span>Book Free Profile Assessment</span>
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full px-8 min-h-[48px] w-full sm:w-auto gap-2" asChild>
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
        </main>
    );
}
