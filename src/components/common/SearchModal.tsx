"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    Search,
    Globe,
    GraduationCap,
    MapPin,
    X,
    Clock,
    Compass,
    CalendarCheck,
    Coins,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { DESTINATIONS_META_LIST } from "@/data/destinations-meta";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageContext";
import { useBookingModal } from "@/context/BookingModalContext";
import { useMounted } from "@/lib/use-mounted";

interface SearchResult {
    title: string;
    category: string;
    href: string;
    description?: string;
    flag?: string;
    isRecent?: boolean;
}

const RECENT_STORAGE_KEY = "nextepedu_recent_searches";

const destinationResults: SearchResult[] = DESTINATIONS_META_LIST.map((d) => ({
    title: d.name,
    category: "Destination",
    href: `/destinations/${d.slug}`,
    description: `${d.region} - ${d.tuitionShort} | ${d.workRightsShort}`,
    flag: d.flag,
}));

const serviceResults: SearchResult[] = [
    { title: "University Selection", category: "Service", href: "/#services", description: "Find the perfect university for you" },
    { title: "Visa Assistance", category: "Service", href: "/#services", description: "Navigate visa requirements with ease" },
    { title: "LOM / SOP Solution", category: "Service", href: "/#services", description: "Craft compelling motivation letters and SOPs" },
    { title: "Scholarship Search", category: "Service", href: "/#services", description: "Discover funding and scholarship options" },
];

const pageResults: SearchResult[] = [
    { title: "Track Application", category: "Page", href: "/track", description: "Check live application and visa status" },
    { title: "All Destinations", category: "Page", href: "/destinations", description: "Explore all 17+ study destinations" },
    { title: "About Us", category: "Page", href: "/#about", description: "Learn about our mission and team" },
    { title: "Student Stories", category: "Page", href: "/#stories", description: "Hear from our students studying abroad" },
];

const searchData: SearchResult[] = [...destinationResults, ...serviceResults, ...pageResults];

const TOP_QUICK_COUNTRIES = [
    { name: "Germany", slug: "germany", flag: "🇩🇪" },
    { name: "UK", slug: "uk", flag: "🇬🇧" },
    { name: "USA", slug: "usa", flag: "🇺🇸" },
    { name: "Canada", slug: "canada", flag: "🇨🇦" },
    { name: "Australia", slug: "australia", flag: "🇦🇺" },
];

function readRecentSearches(): SearchResult[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(RECENT_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as SearchResult[]) : [];
    } catch {
        return [];
    }
}

function writeRecentSearches(items: SearchResult[]) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(items));
    } catch {
        // Ignore storage errors in private or restricted webviews
    }
}

export interface SearchModalProps {
    isOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    renderTrigger?: boolean;
}

export function SearchModal({
    isOpen: controlledOpen,
    onOpen,
    onClose,
    renderTrigger = true,
}: SearchModalProps = {}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = typeof controlledOpen === "boolean";
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentItems, setRecentItems] = useState<SearchResult[]>([]);
    const router = useRouter();
    const { t } = useTranslation();
    const { openModal: openBookingModal } = useBookingModal();
    const mounted = useMounted();
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsContainerRef = useRef<HTMLDivElement>(null);

    const openSearch = useCallback(() => {
        setRecentItems(readRecentSearches());
        if (isControlled) {
            onOpen?.();
        } else {
            setInternalOpen(true);
        }
    }, [isControlled, onOpen]);

    const closeModal = useCallback(() => {
        if (isControlled) {
            onClose?.();
        } else {
            setInternalOpen(false);
        }
        setTimeout(() => setQuery(""), 200);
        setSelectedIndex(0);
    }, [isControlled, onClose]);

    // Refresh recent searches whenever modal opens (works for both controlled & uncontrolled modes)
    useEffect(() => {
        if (!isOpen) return;
        const frame = requestAnimationFrame(() => {
            setRecentItems(readRecentSearches());
        });
        return () => cancelAnimationFrame(frame);
    }, [isOpen]);

    const navigateToResult = useCallback(
        (href: string, result?: SearchResult) => {
            if (result) {
                const existing = readRecentSearches();
                const resultToSave = { ...result };
                delete resultToSave.isRecent;
                const newRecent = [resultToSave, ...existing.filter((r) => r.href !== href)].slice(0, 5);
                writeRecentSearches(newRecent);
                setRecentItems(newRecent);
            }
            router.push(href);
            closeModal();
        },
        [router, closeModal]
    );

    // Body scroll lock & mobile focus when open
    useEffect(() => {
        if (!isOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 60);
        return () => {
            clearTimeout(timer);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen]);

    // Keyboard shortcut (Cmd/Ctrl + K and Escape)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isControlled && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                openSearch();
            }
            if (e.key === "Escape" && isOpen) {
                closeModal();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isControlled, isOpen, openSearch, closeModal]);

    // Filter results based on query
    const results = useMemo(() => {
        if (!query.trim()) {
            if (recentItems.length > 0) {
                return recentItems.map((r) => ({ ...r, isRecent: true }));
            }
            return searchData.slice(0, 8);
        }

        const trimmed = query.trim().toLowerCase();
        const chars = trimmed.split("");

        const isFuzzyMatch = (text: string) => {
            const lowerText = text.toLowerCase();
            if (lowerText.includes(trimmed)) return true;
            let queryIdx = 0;
            for (let i = 0; i < lowerText.length; i++) {
                if (lowerText[i] === chars[queryIdx]) {
                    queryIdx++;
                }
                if (queryIdx === chars.length) return true;
            }
            return false;
        };

        return searchData
            .filter(
                (item) =>
                    isFuzzyMatch(item.title) ||
                    isFuzzyMatch(item.category) ||
                    (item.description && isFuzzyMatch(item.description))
            )
            .slice(0, 10);
    }, [query, recentItems]);

    // Keyboard Navigation within Modal
    useEffect(() => {
        if (!isOpen) return;

        const handleModalKeyDown = (e: KeyboardEvent) => {
            if (results.length === 0) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % results.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
            } else if (e.key === "Enter") {
                e.preventDefault();
                const selectedResult = results[selectedIndex];
                if (selectedResult) {
                    navigateToResult(selectedResult.href, selectedResult);
                }
            }
        };

        window.addEventListener("keydown", handleModalKeyDown);
        return () => window.removeEventListener("keydown", handleModalKeyDown);
    }, [isOpen, results, selectedIndex, navigateToResult]);

    // Scroll selected item into view smoothly inside list
    useEffect(() => {
        if (isOpen && resultsContainerRef.current) {
            const items = resultsContainerRef.current.querySelectorAll<HTMLElement>("[data-search-item='true']");
            const selectedElement = items[selectedIndex];
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
        }
    }, [selectedIndex, isOpen]);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Destination":
                return <Globe className="w-5 h-5" />;
            case "Service":
                return <GraduationCap className="w-5 h-5" />;
            case "Page":
                return <MapPin className="w-5 h-5" />;
            default:
                return <Search className="w-5 h-5" />;
        }
    };

    const modalOverlay = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label={t("common.search.dialogLabel", undefined, "Site search")}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-[100] flex items-stretch sm:items-start justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 sm:pt-[14vh]"
                    onClick={closeModal}
                >
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full h-[100dvh] sm:h-auto sm:max-h-[80vh] sm:max-w-2xl bg-background sm:bg-surface/95 dark:bg-[#0B1120] sm:dark:bg-[#0B1120]/95 sm:backdrop-blur-2xl rounded-none sm:rounded-2xl shadow-2xl sm:border border-border/60 dark:border-white/10 overflow-hidden flex flex-col"
                            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Glowing Accent Hairline */}
                            <div className="hidden sm:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

                            {/* Search Input Bar */}
                            <div className="relative flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3.5 border-b border-border/50 bg-background/80 shrink-0">
                                <Search className="w-5 h-5 text-accent shrink-0 ml-1" />
                                <input
                                    ref={inputRef}
                                    type="search"
                                    enterKeyHint="search"
                                    autoComplete="off"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setSelectedIndex(0);
                                    }}
                                    placeholder={t(
                                        "common.search.placeholder",
                                        undefined,
                                        "Search destinations, universities, services..."
                                    )}
                                    className="flex-1 min-w-0 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base sm:text-lg font-medium py-2 [&::-webkit-search-cancel-button]:hidden"
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuery("");
                                            setSelectedIndex(0);
                                            inputRef.current?.focus();
                                        }}
                                        aria-label={t("common.search.clear", undefined, "Clear search")}
                                        className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors shrink-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="sm:hidden min-h-[44px] px-2.5 text-sm font-semibold text-accent hover:text-accent/80 shrink-0"
                                >
                                    {t("common.search.cancel", undefined, "Cancel")}
                                </button>
                                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted/50 rounded-md border border-border/50 uppercase tracking-wider shrink-0">
                                    ESC
                                </kbd>
                            </div>

                            {/* Scrollable Results & Quick Actions */}
                            <div
                                ref={resultsContainerRef}
                                className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-3 sm:p-2.5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-2.5"
                            >
                                {/* Zero-query Quick Actions + Top Countries */}
                                {!query.trim() && (
                                    <div className="mb-3 space-y-3 px-1">
                                        <div>
                                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
                                                {t("common.search.quickActions", undefined, "Quick Actions")}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => navigateToResult("/track")}
                                                    className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl bg-accent/10 border border-accent/25 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors"
                                                >
                                                    <Compass className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{t("common.search.trackAction", undefined, "Track Application")}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        closeModal();
                                                        openBookingModal();
                                                    }}
                                                    className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl bg-surface dark:bg-white/[0.05] border border-border/70 text-foreground text-xs font-semibold hover:border-accent/40 hover:text-accent transition-colors"
                                                >
                                                    <CalendarCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                                                    <span>{t("common.search.bookAction", undefined, "Book Consultation")}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => navigateToResult("/destinations?category=budget")}
                                                    className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl bg-surface dark:bg-white/[0.05] border border-border/70 text-foreground text-xs font-semibold hover:border-accent/40 hover:text-accent transition-colors"
                                                >
                                                    <Coins className="w-3.5 h-3.5 text-accent shrink-0" />
                                                    <span>{t("common.search.scholarshipsAction", undefined, "Scholarships")}</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
                                                {t("common.search.topCountries", undefined, "Top Countries")}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {TOP_QUICK_COUNTRIES.map((country) => (
                                                    <button
                                                        key={country.slug}
                                                        type="button"
                                                        onClick={() =>
                                                            navigateToResult(`/destinations/${country.slug}`, {
                                                                title: country.name,
                                                                category: "Destination",
                                                                href: `/destinations/${country.slug}`,
                                                                flag: country.flag,
                                                            })
                                                        }
                                                        className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[36px] px-3 rounded-full bg-surface dark:bg-white/[0.05] border border-border/70 text-xs font-medium text-foreground hover:border-accent/45 hover:text-accent transition-colors"
                                                    >
                                                        <span>{country.flag}</span>
                                                        <span>{country.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {results.length > 0 ? (
                                    <div className="space-y-1">
                                        {!query.trim() && (
                                            <div className="text-[11px] font-semibold text-muted-foreground/80 uppercase tracking-wider px-2.5 pt-1 pb-1">
                                                {recentItems.length > 0
                                                    ? t("common.search.recent", undefined, "Recent")
                                                    : t("common.search.suggested", undefined, "Suggested")}
                                            </div>
                                        )}
                                        {results.map((result, index) => {
                                            const isSelected = index === selectedIndex;
                                            return (
                                                <button
                                                    type="button"
                                                    data-search-item="true"
                                                    key={`${result.href}-${index}`}
                                                    onClick={() => navigateToResult(result.href, result)}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                    className={cn(
                                                        "group flex items-center gap-3.5 p-3 rounded-xl cursor-pointer transition-colors duration-150 w-full relative text-left min-h-[56px]",
                                                        isSelected ? "bg-accent/10 sm:pr-10" : "hover:bg-muted/50"
                                                    )}
                                                >
                                                    {isSelected && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-md" />
                                                    )}

                                                    <div
                                                        className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-2xs",
                                                            isSelected
                                                                ? "bg-accent text-slate-950"
                                                                : "bg-card border border-border/60 text-muted-foreground group-hover:text-foreground"
                                                        )}
                                                    >
                                                        {result.isRecent ? (
                                                            <Clock className="w-5 h-5" />
                                                        ) : (
                                                            getCategoryIcon(result.category)
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h4
                                                                className={cn(
                                                                    "font-semibold truncate transition-colors flex items-center gap-2 text-sm sm:text-base",
                                                                    isSelected
                                                                        ? "text-accent"
                                                                        : "text-foreground group-hover:text-primary"
                                                                )}
                                                            >
                                                                {result.flag && <span>{result.flag}</span>}
                                                                <span className="truncate">{result.title}</span>
                                                            </h4>
                                                            <span
                                                                className={cn(
                                                                    "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap hidden sm:inline-block shrink-0",
                                                                    isSelected
                                                                        ? "bg-accent/20 text-accent"
                                                                        : "bg-muted text-muted-foreground"
                                                                )}
                                                            >
                                                                {result.category}
                                                            </span>
                                                        </div>
                                                        {result.description && (
                                                            <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                                                                {result.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {isSelected && (
                                                        <div className="absolute right-4 text-accent hidden sm:block">
                                                            <svg
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            >
                                                                <polyline points="9 10 4 15 9 20" />
                                                                <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="px-6 py-12 text-center">
                                        <div className="w-14 h-14 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border/50">
                                            <Search className="w-7 h-7 text-muted-foreground/50" />
                                        </div>
                                        <p className="text-foreground font-semibold text-base">
                                            {t("common.search.noResults", undefined, "No results found")}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1 max-w-[260px] mx-auto">
                                            {t("common.search.noResultsHint", undefined, "We couldn't find anything matching")}{" "}
                                            &quot;<span className="text-foreground">{query}</span>&quot;.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Desktop Keyboard Hints Footer */}
                            <div className="hidden sm:flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/20 text-xs text-muted-foreground shrink-0">
                                <div className="flex items-center gap-6">
                                    <span className="flex items-center gap-2">
                                        <span className="flex gap-1">
                                            <kbd className="w-5 h-5 flex items-center justify-center rounded text-[10px] bg-background border border-border/60 shadow-2xs font-sans">
                                                ↑
                                            </kbd>
                                            <kbd className="w-5 h-5 flex items-center justify-center rounded text-[10px] bg-background border border-border/60 shadow-2xs font-sans">
                                                ↓
                                            </kbd>
                                        </span>
                                        {t("common.search.navigateHint", undefined, "to navigate")}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <kbd className="h-5 px-1.5 flex items-center justify-center rounded text-[10px] bg-background border border-border/60 shadow-2xs font-sans tracking-wide">
                                            ENTER
                                        </kbd>
                                        {t("common.search.selectHint", undefined, "to select")}
                                    </span>
                                </div>
                                <span className="flex items-center gap-2 text-accent font-medium">
                                    {t("common.search.brandLabel", undefined, "NexTep Edu Search")}
                                </span>
                            </div>
                        </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            {renderTrigger && (
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={openSearch}
                    className="p-2 w-11 h-11 lg:w-9 lg:h-9 flex items-center justify-center rounded-full text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10 hover:text-accent transition-colors shrink-0"
                    aria-label={t("common.search.triggerLabel", undefined, "Search destinations, services, and pages")}
                >
                    <Search className="w-5 h-5 lg:w-4 lg:h-4" />
                </motion.button>
            )}

            {/* Portal directly into document.body so Header transform/backdrop-filter never clips fixed inset-0 */}
            {mounted ? createPortal(modalOverlay, document.body) : null}
        </>
    );
}
