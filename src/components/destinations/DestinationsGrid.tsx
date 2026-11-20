"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Bookmark, BookmarkCheck } from "lucide-react";
import { useRef, useState, useMemo, useSyncExternalStore } from "react";
import toast from "react-hot-toast";
import { destinations, type Destination } from "@/data/destinations";
import { useTranslation } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { useBookingModal } from "@/context/BookingModalContext";
import { useShortlist } from "@/lib/shortlist-store";
import { IMAGE_BLUR_PLACEHOLDERS } from "@/data/image-placeholders";
import { cn } from "@/lib/utils";

const TOP_SLUGS = ["germany", "usa", "australia", "canada", "uk", "south-korea"];
const WORK_RIGHTS_SLUGS = ["uk", "usa", "canada", "australia", "germany", "netherlands", "france", "belgium", "austria"];

export type DestinationFilterCategory =
    | "all"
    | "featured"
    | "europe"
    | "schengen"
    | "north-america"
    | "asia-pacific"
    | "budget"
    | "work-rights";

const HOME_FILTER_CHIPS: { id: DestinationFilterCategory; key: string; label: string }[] = [
    { id: "featured", key: "destinations.filters.topPicks", label: "Top Picks" },
    { id: "europe", key: "destinations.filters.europe", label: "Europe" },
    { id: "north-america", key: "destinations.filters.northAmerica", label: "North America" },
    { id: "asia-pacific", key: "destinations.filters.asiaPacific", label: "Asia-Pacific" },
    { id: "budget", key: "destinations.filters.lowTuition", label: "Low Tuition" },
];

const topDestinations = TOP_SLUGS.map((slug) => destinations[slug]).filter(Boolean);

export function filterDestinations(
    category: DestinationFilterCategory,
    searchQuery: string,
    featuredOnly = false
): Destination[] {
    const allList = Object.values(destinations);
    let filtered: Destination[];

    switch (category) {
        case "featured":
            filtered = topDestinations;
            break;
        case "europe":
            filtered = allList.filter((d) => d.region === "Europe");
            break;
        case "schengen":
            filtered = allList.filter((d) => d.isSchengen);
            break;
        case "north-america":
            filtered = allList.filter((d) => d.region === "North America");
            break;
        case "asia-pacific":
            filtered = allList.filter((d) => d.region === "Asia-Pacific");
            break;
        case "budget":
            filtered = allList.filter((d) => d.tuitionTier === "free" || d.tuitionTier === "low");
            break;
        case "work-rights":
            filtered = allList.filter((d) => WORK_RIGHTS_SLUGS.includes(d.slug));
            break;
        case "all":
        default:
            filtered = allList;
            break;
    }

    if (featuredOnly && category !== "featured") {
        filtered = filtered.slice(0, 6);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
        filtered = filtered.filter((d) => {
            const matchName = d.name.toLowerCase().includes(q);
            const matchRegion = d.region.toLowerCase().includes(q);
            const matchTuition = d.tuitionRange.toLowerCase().includes(q);
            const matchDesc = d.hero.description.toLowerCase().includes(q);
            const matchBenefit = d.benefits.some(
                (b) =>
                    b.title.toLowerCase().includes(q) ||
                    b.description.toLowerCase().includes(q)
            );
            const matchUni = d.universities.some((u) => u.name.toLowerCase().includes(q));
            return matchName || matchRegion || matchTuition || matchDesc || matchBenefit || matchUni;
        });
    }

    return filtered;
}

const subscribeTouch = (callback: () => void) => {
    const media = window.matchMedia("(hover: none)");
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
};

function DesktopTiltCard({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 25 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 25 });
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["2deg", "-2deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-2deg", "2deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 1000 }}
            className="h-full relative"
        >
            <motion.div
                style={{ rotateX, rotateY }}
                className="surface-card group relative h-full overflow-hidden rounded-2xl flex flex-col"
            >
                {children}
            </motion.div>
        </div>
    );
}

function CardSurface({ children }: { children: React.ReactNode }) {
    const isTouchDevice = useSyncExternalStore(
        subscribeTouch,
        () => window.matchMedia("(hover: none)").matches,
        () => true
    );

    if (isTouchDevice) {
        return (
            <div className="surface-card group relative h-full overflow-hidden rounded-2xl flex flex-col active:scale-[0.99] transition-transform">
                {children}
            </div>
        );
    }

    return <DesktopTiltCard>{children}</DesktopTiltCard>;
}

interface DestinationsGridProps {
    featuredOnly?: boolean;
    searchQuery?: string;
    activeCategory?: DestinationFilterCategory;
    compactMobile?: boolean;
    onResetFilters?: () => void;
}

export function DestinationsGrid({
    featuredOnly = false,
    searchQuery = "",
    activeCategory = "all",
    compactMobile = false,
    onResetFilters,
}: DestinationsGridProps) {
    const { t } = useTranslation();
    const { openModal } = useBookingModal();
    const { isShortlisted, toggleShortlist } = useShortlist();
    const [homeFilter, setHomeFilter] = useState<DestinationFilterCategory>("featured");
    const [activeSlide, setActiveSlide] = useState(0);
    const mobileRailRef = useRef<HTMLDivElement>(null);

    const effectiveCategory = featuredOnly ? homeFilter : activeCategory;

    const displayedDestinations = useMemo(
        () => filterDestinations(effectiveCategory, searchQuery, featuredOnly),
        [featuredOnly, effectiveCategory, searchQuery]
    );

    const handleToggleShortlist = (dest: Destination) => {
        const result = toggleShortlist(dest.slug);
        if (result === "added") {
            toast.success(`${dest.name} added to Compare shortlist`);
        } else if (result === "removed") {
            toast(`${dest.name} removed from shortlist`);
        } else {
            toast.error("You can compare up to 3 countries at once. Remove one first.");
        }
    };

    const handleMobileScroll = () => {
        const container = mobileRailRef.current;
        if (!container) return;
        const cardWidth = container.firstElementChild?.clientWidth || container.offsetWidth;
        const idx = Math.round(container.scrollLeft / (cardWidth + 16));
        setActiveSlide(Math.min(displayedDestinations.length - 1, Math.max(0, idx)));
    };

    const scrollToSlide = (index: number) => {
        const container = mobileRailRef.current;
        if (!container) return;
        const cardWidth = container.firstElementChild?.clientWidth || container.offsetWidth;
        container.scrollTo({ left: index * (cardWidth + 16), behavior: "smooth" });
        setActiveSlide(index);
    };

    const renderCard = (destination: Destination, compact = false) => {
        const saved = isShortlisted(destination.slug);
        const countryName = t(`destinations.countries.${destination.slug}.name`, undefined, destination.name);

        return (
            <CardSurface>
                {/* Full-card stretched link directly on CardSurface (position: relative),
                    so tapping photo or card body navigates cleanly while z-20 buttons stay independent */}
                <Link
                    href={`/destinations/${destination.slug}`}
                    aria-label={`Explore ${countryName}`}
                    className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />

                {/* Image Wrapper */}
                <div
                    className={cn(
                        "relative overflow-hidden bg-slate-200/50 dark:bg-slate-800/50 shrink-0 pointer-events-none",
                        compact ? "h-32 sm:h-48" : "h-44 sm:h-48 md:h-52"
                    )}
                >
                    <Image
                        src={destination.heroImage}
                        alt={countryName}
                        fill
                        loading="lazy"
                        placeholder={IMAGE_BLUR_PLACEHOLDERS[destination.heroImage] ? "blur" : "empty"}
                        blurDataURL={IMAGE_BLUR_PLACEHOLDERS[destination.heroImage]}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes={
                            compact
                                ? "(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
                                : "(max-width: 768px) 84vw, (max-width: 1200px) 50vw, 33vw"
                        }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/15" />

                    {/* Top-left Region + Top-right Shortlist Bookmark */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-2 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-950/65 text-white/90 border border-white/15 backdrop-blur-md">
                            {destination.region}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleToggleShortlist(destination)}
                            aria-label={saved ? `Remove ${destination.name} from shortlist` : `Add ${destination.name} to shortlist`}
                            aria-pressed={saved}
                            className={cn(
                                "pointer-events-auto w-11 h-11 -m-1 rounded-full flex items-center justify-center transition-colors backdrop-blur-md border",
                                saved
                                    ? "bg-accent text-slate-950 border-accent shadow-sm"
                                    : "bg-slate-950/55 text-white border-white/20 hover:bg-slate-950/80"
                            )}
                        >
                            {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Country Title */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 text-white z-10 flex items-end justify-between gap-2">
                        <h3
                            className={cn(
                                "font-bold font-heading flex items-center gap-1.5 min-w-0",
                                compact ? "text-base sm:text-xl" : "text-xl md:text-2xl"
                            )}
                        >
                            <span className="shrink-0">{destination.flag}</span>
                            <span className="truncate">{countryName}</span>
                        </h3>
                        {!compact && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent bg-slate-950/65 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full group-hover:bg-accent group-hover:text-slate-950 transition-colors duration-200 shrink-0">
                                {t("common.nav.explore", undefined, "Explore")}
                                <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                        )}
                    </div>
                </div>

                {/* Card Body */}
                <div className={cn("flex-grow flex flex-col justify-between", compact ? "p-3 sm:p-5 gap-2.5" : "p-4 sm:p-5 md:p-6 gap-3.5")}>
                    {/* Quick-Scan Metadata Tags */}
                    <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-accent/12 text-accent border border-accent/20">
                            {destination.tuitionShort}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border/50">
                            {destination.workRightsShort}
                        </span>
                    </div>

                    {/* Top 2 Benefits (hidden in ultra-compact 2-col mobile mode) */}
                    {!compact && (
                        <div className="space-y-3">
                            {destination.benefits.slice(0, 2).map((benefit, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 text-accent mt-0.5">
                                        <benefit.icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-sm text-foreground leading-snug">
                                            {t(`destinations.benefits.${benefit.title}.title`, undefined, benefit.title)}
                                        </h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                                            {t(`destinations.benefits.${benefit.title}.desc`, undefined, benefit.description)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Card Footer with Interactive Button at z-20 (valid HTML, never nested inside Link) */}
                    <div className="pt-2.5 border-t border-border/50 flex items-center justify-between gap-2">
                        {!compact && (
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate">
                                {t("destinations.card.fullGuide", undefined, "Full country & visa guide")}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() =>
                                openModal({
                                    destination: destination.name,
                                    topic: `Study in ${destination.name}`,
                                })
                            }
                            className={cn(
                                "relative z-20 inline-flex items-center justify-center gap-1.5 px-3 min-h-[44px] rounded-xl bg-accent/12 hover:bg-accent text-accent hover:text-slate-950 text-xs font-semibold transition-colors shrink-0",
                                compact && "w-full"
                            )}
                        >
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            <span>{t("destinations.card.freeAssessment", undefined, "Free Assessment")}</span>
                        </button>
                    </div>
                </div>
            </CardSurface>
        );
    };

    return (
        <div>
            {featuredOnly && (
                <div className="relative mb-6 md:mb-8">
                    <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 py-1 snap-x">
                        {HOME_FILTER_CHIPS.map((chip) => {
                            const isActive = homeFilter === chip.id;
                            return (
                                <button
                                    key={chip.id}
                                    type="button"
                                    onClick={() => {
                                        setHomeFilter(chip.id);
                                        setActiveSlide(0);
                                        mobileRailRef.current?.scrollTo({ left: 0, behavior: "smooth" });
                                    }}
                                    className={cn(
                                        "relative px-4 min-h-[44px] rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 snap-start flex items-center gap-1.5 border",
                                        isActive
                                            ? "bg-accent text-slate-950 border-accent shadow-xs"
                                            : "bg-card/80 text-muted-foreground border-border/70 hover:text-foreground hover:border-accent/40"
                                    )}
                                >
                                    <span>{t(chip.key, undefined, chip.label)}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div
                        aria-hidden="true"
                        className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent"
                    />
                </div>
            )}

            {displayedDestinations.length === 0 ? (
                <div className="surface-card rounded-2xl p-8 md:p-12 text-center max-w-xl mx-auto my-4">
                    <p className="text-lg font-heading font-bold text-primary mb-2">
                        {t("destinations.empty.title", undefined, "No destinations matched your filter")}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                        {t(
                            "destinations.empty.subtitle",
                            undefined,
                            "Try clearing your search query or switching to a broader region filter, or ask our counselors for a custom university shortlist."
                        )}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        {onResetFilters && (
                            <Button
                                variant="outline"
                                className="rounded-full min-h-[44px] px-6 w-full sm:w-auto"
                                onClick={onResetFilters}
                            >
                                {t("destinations.empty.reset", undefined, "Reset Filters")}
                            </Button>
                        )}
                        <Button
                            className="rounded-full min-h-[44px] px-6 w-full sm:w-auto gap-2"
                            onClick={() => openModal({ topic: "Custom Country & University Shortlist" })}
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>{t("destinations.empty.customShortlist", undefined, "Get Custom Shortlist")}</span>
                        </Button>
                    </div>
                </div>
            ) : featuredOnly ? (
                <>
                    {/* Homepage: Horizontal snap-carousel on mobile (<768px), 2/3-col grid on md+ */}
                    <div
                        ref={mobileRailRef}
                        onScroll={handleMobileScroll}
                        className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-7 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-pl-4 pb-3 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide"
                    >
                        {displayedDestinations.map((destination) => (
                            <div
                                key={destination.slug}
                                className="w-[84vw] sm:w-[360px] md:w-auto shrink-0 md:shrink snap-start h-full flex flex-col"
                            >
                                {renderCard(destination, false)}
                            </div>
                        ))}
                    </div>

                    {/* Mobile Pagination Dots */}
                    {displayedDestinations.length > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-3 md:hidden">
                            <div className="flex items-center gap-0.5">
                                {displayedDestinations.map((d, i) => (
                                    <button
                                        key={d.slug}
                                        type="button"
                                        onClick={() => scrollToSlide(i)}
                                        aria-label={`View ${d.name}`}
                                        className="min-h-[44px] min-w-[28px] px-1 flex items-center justify-center"
                                    >
                                        <span
                                            className={cn(
                                                "block h-1.5 rounded-full transition-all duration-300",
                                                activeSlide === i ? "w-6 bg-accent" : "w-1.5 bg-accent/30"
                                            )}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                                {activeSlide + 1} / {displayedDestinations.length}
                            </span>
                        </div>
                    )}
                </>
            ) : (
                /* Full /destinations Explorer Grid (1-col or compact 2-col on mobile) */
                <div
                    className={cn(
                        "grid md:grid-cols-2 lg:grid-cols-3",
                        compactMobile ? "grid-cols-2 gap-3 sm:gap-5 md:gap-7" : "grid-cols-1 gap-5 md:gap-7"
                    )}
                >
                    {displayedDestinations.map((destination) => (
                        <div key={destination.slug} className="h-full flex flex-col">
                            {renderCard(destination, compactMobile)}
                        </div>
                    ))}
                </div>
            )}

            {/* See All Destinations Button - Only show if featuredOnly is true */}
            {featuredOnly && (
                <div className="text-center mt-8 md:mt-12">
                    <Button size="lg" className="rounded-full text-base px-8 min-h-[48px] gap-2" asChild>
                        <Link href="/destinations">
                            <span>{t("common.nav.viewAllDestinations", undefined, "View All Destinations")}</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
