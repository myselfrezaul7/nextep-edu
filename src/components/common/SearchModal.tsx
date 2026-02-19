"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Globe, GraduationCap, MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { destinations } from "@/data/destinations";
import { cn } from "@/lib/utils";

interface SearchResult {
    title: string;
    category: string;
    href: string;
    description?: string;
}

// Auto-generate search data from destinations data source
const destinationResults: SearchResult[] = Object.values(destinations).map(d => ({
    title: d.name,
    category: "Destination",
    href: `/destinations/${d.slug}`,
    description: d.hero.description.slice(0, 60) + "..."
}));

const serviceResults: SearchResult[] = [
    { title: "University Selection", category: "Service", href: "/#services", description: "Find the perfect university for you" },
    { title: "Visa Assistance", category: "Service", href: "/#services", description: "Navigate visa requirements with ease" },
    { title: "Career Planning", category: "Service", href: "/#services", description: "Plan your future career path" },
    { title: "Scholarship Search", category: "Service", href: "/#services", description: "Discover funding opportunities" },
];

const pageResults: SearchResult[] = [
    { title: "About Us", category: "Page", href: "/#about", description: "Learn about our mission" },
    { title: "All Destinations", category: "Page", href: "/destinations", description: "Explore all study destinations" },
    { title: "Student Stories", category: "Page", href: "/#stories", description: "Hear from our students" },
];

const searchData: SearchResult[] = [...destinationResults, ...serviceResults, ...pageResults];

export function SearchModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsContainerRef = useRef<HTMLDivElement>(null);

    // Keyboard shortcut (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === "Escape") {
                closeModal();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Filter results based on query
    const results = useMemo(() => {
        if (!query.trim()) return searchData.slice(0, 8); // Show popular results

        const lowerQuery = query.toLowerCase();
        return searchData.filter(
            item =>
                item.title.toLowerCase().includes(lowerQuery) ||
                item.category.toLowerCase().includes(lowerQuery) ||
                item.description?.toLowerCase().includes(lowerQuery)
        ).slice(0, 10); // Limit results for performance
    }, [query]);

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [results]);

    // Handle Keyboard Navigation within Modal
    useEffect(() => {
        if (!isOpen) return;

        const handleModalKeyDown = (e: KeyboardEvent) => {
            if (results.length === 0) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % results.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
            } else if (e.key === "Enter") {
                e.preventDefault();
                const selectedResult = results[selectedIndex];
                if (selectedResult) {
                    navigateToResult(selectedResult.href);
                }
            }
        };

        window.addEventListener("keydown", handleModalKeyDown);
        return () => window.removeEventListener("keydown", handleModalKeyDown);
    }, [isOpen, results, selectedIndex]);

    // Scroll selected item into view smoothly
    useEffect(() => {
        if (isOpen && resultsContainerRef.current) {
            const selectedElement = resultsContainerRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
        }
    }, [selectedIndex, isOpen]);


    const closeModal = () => {
        setIsOpen(false);
        setTimeout(() => setQuery(""), 200); // Clear query after animation
        setSelectedIndex(0);
    };

    const navigateToResult = (href: string) => {
        router.push(href);
        closeModal();
    };

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

    return (
        <>
            {/* Search Trigger Button - Modern Pill Design */}
            <button
                onClick={() => setIsOpen(true)}
                className="group relative flex items-center justify-between gap-3 w-10 md:w-56 h-10 px-0 md:px-3 rounded-full bg-surface/50 dark:bg-card/50 hover:bg-surface dark:hover:bg-card border border-border/60 hover:border-accent/50 shadow-sm hover:shadow-md transition-all duration-300"
                aria-label="Search destinations, services, and pages"
            >
                <div className="flex items-center gap-2 justify-center w-full md:w-auto md:justify-start">
                    <Search className="w-[18px] h-[18px] text-muted-foreground group-hover:text-accent transition-colors" />
                    <span className="hidden md:inline text-sm text-muted-foreground group-hover:text-foreground transition-colors font-sans">
                        Search...
                    </span>
                </div>
                <kbd className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground bg-background/80 rounded shadow-sm border border-border/50">
                    <span className="text-[10px]">⌘</span>K
                </kbd>
            </button>

            {/* Premium Search Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-4 pt-[12vh] sm:pt-[20vh]"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: 10 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full max-w-2xl bg-surface/90 dark:bg-[#0B1120]/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 dark:border-white/5 overflow-hidden ring-1 ring-black/5"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Glowing Background Effect */}
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

                            {/* Search Input Area */}
                            <div className="relative flex items-center gap-3 p-4 border-b border-border/40 bg-background/40">
                                <Search className="w-5 h-5 text-accent flex-shrink-0" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search destinations, universities, services..."
                                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-lg md:text-xl font-medium"
                                    autoFocus
                                />
                                {query && (
                                    <button
                                        onClick={() => setQuery("")}
                                        className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors mr-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted/50 rounded-md border border-border/50 uppercase tracking-wider">
                                    ESC
                                </kbd>
                            </div>

                            {/* Search Results Area */}
                            <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2" ref={resultsContainerRef}>
                                <AnimatePresence mode="popLayout">
                                    {results.length > 0 ? (
                                        <>
                                            {!query && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-3 pt-2 pb-1"
                                                >
                                                    Suggested
                                                </motion.div>
                                            )}
                                            {results.map((result, index) => {
                                                const isSelected = index === selectedIndex;
                                                return (
                                                    <motion.div
                                                        layout
                                                        key={`${result.href}-${index}`}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        transition={{ duration: 0.15, delay: index * 0.02 }}
                                                        onClick={() => navigateToResult(result.href)}
                                                        onMouseEnter={() => setSelectedIndex(index)}
                                                        className={cn(
                                                            "group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 w-full relative",
                                                            isSelected ? "bg-accent/10 pr-10" : "hover:bg-muted/50"
                                                        )}
                                                    >
                                                        {/* Active indicator bar */}
                                                        {isSelected && (
                                                            <motion.div
                                                                layoutId="active-indicator"
                                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-md"
                                                            />
                                                        )}

                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-sm",
                                                            isSelected ? "bg-accent text-primary-foreground" : "bg-background border border-border/50 text-muted-foreground group-hover:text-foreground"
                                                        )}>
                                                            {getCategoryIcon(result.category)}
                                                        </div>

                                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <h4 className={cn(
                                                                    "font-semibold truncate transition-colors",
                                                                    isSelected ? "text-accent" : "text-foreground group-hover:text-primary"
                                                                )}>
                                                                    {result.title}
                                                                </h4>
                                                                <span className={cn(
                                                                    "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap hidden sm:inline-block",
                                                                    isSelected ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                                                                )}>
                                                                    {result.category}
                                                                </span>
                                                            </div>
                                                            {result.description && (
                                                                <p className="text-sm text-muted-foreground truncate mt-0.5 group-hover:text-muted-foreground/80">
                                                                    {result.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Enter symbol on active */}
                                                        {isSelected && (
                                                            <div className="absolute right-4 text-accent hidden sm:block">
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="9 10 4 15 9 20"></polyline>
                                                                    <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="px-6 py-14 text-center"
                                        >
                                            <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border/50 shadow-sm">
                                                <Search className="w-8 h-8 text-muted-foreground/50" />
                                            </div>
                                            <p className="text-foreground font-medium text-lg">
                                                No results found
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1 max-w-[250px] mx-auto">
                                                We couldn't find anything matching "<span className="text-foreground">{query}</span>".
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Minimal Footer for Controls */}
                            <div className="hidden sm:flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/20 text-xs text-muted-foreground">
                                <div className="flex items-center gap-6">
                                    <span className="flex items-center gap-2">
                                        <span className="flex gap-1">
                                            <kbd className="w-5 h-5 flex items-center justify-center rounded text-[10px] bg-background border border-border/60 shadow-sm font-sans">↑</kbd>
                                            <kbd className="w-5 h-5 flex items-center justify-center rounded text-[10px] bg-background border border-border/60 shadow-sm font-sans">↓</kbd>
                                        </span>
                                        to navigate
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <kbd className="h-5 px-1.5 flex items-center justify-center rounded text-[10px] bg-background border border-border/60 shadow-sm font-sans tracking-wide">ENTER</kbd>
                                        to select
                                    </span>
                                </div>
                                <span className="flex items-center gap-2 text-accent font-medium">
                                    NexTep Edu Search
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
