"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Globe, GraduationCap, MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { destinations } from "@/data/destinations";

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

    // Keyboard shortcut (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Filter results based on query
    const results = useMemo(() => {
        if (!query.trim()) return searchData.slice(0, 10); // Show popular results

        const lowerQuery = query.toLowerCase();
        return searchData.filter(
            item =>
                item.title.toLowerCase().includes(lowerQuery) ||
                item.category.toLowerCase().includes(lowerQuery) ||
                item.description?.toLowerCase().includes(lowerQuery)
        );
    }, [query]);

    const closeModal = () => {
        setIsOpen(false);
        setQuery("");
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Destination":
                return <Globe className="w-4 h-4" />;
            case "Service":
                return <GraduationCap className="w-4 h-4" />;
            case "Page":
                return <MapPin className="w-4 h-4" />;
            default:
                return <Search className="w-4 h-4" />;
        }
    };

    return (
        <>
            {/* Enhanced Search Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 border border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 hover:scale-105"
                aria-label="Search destinations, services, and pages"
            >
                <Search className="w-4 h-4 text-accent group-hover:rotate-12 transition-transform duration-300" />
                <span className="hidden md:inline text-sm font-medium text-foreground">Search</span>
                <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-muted-foreground bg-background/50 rounded border border-border/50">
                    <span className="text-[10px]">⌘</span>K
                </kbd>
            </button>

            {/* Search Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-[15vh]"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full max-w-2xl bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Search Input */}
                            <div className="flex items-center gap-3 p-4 border-b border-border/50">
                                <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search destinations, universities, programs..."
                                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-lg"
                                    autoFocus
                                />
                                <button
                                    onClick={closeModal}
                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                    aria-label="Close search"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Search Results */}
                            <div className="max-h-[60vh] overflow-y-auto">
                                {results.length > 0 ? (
                                    <div className="p-2">
                                        {!query && (
                                            <p className="text-xs text-muted-foreground px-3 py-2">
                                                Popular searches
                                            </p>
                                        )}
                                        {results.map((result, index) => (
                                            <Link
                                                key={index}
                                                href={result.href}
                                                onClick={closeModal}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200 group"
                                            >
                                                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0 group-hover:bg-accent group-hover:text-primary transition-colors">
                                                    {getCategoryIcon(result.category)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-foreground group-hover:text-accent transition-colors">
                                                            {result.title}
                                                        </h4>
                                                        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                                                            {result.category}
                                                        </span>
                                                    </div>
                                                    {result.description && (
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {result.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground">
                                            No results found for &quot;{query}&quot;
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Try searching for destinations, universities, or services
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/30 text-xs text-muted-foreground">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 rounded bg-background border border-border">↑↓</kbd>
                                        Navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 rounded bg-background border border-border">↵</kbd>
                                        Select
                                    </span>
                                </div>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 rounded bg-background border border-border">ESC</kbd>
                                    Close
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
