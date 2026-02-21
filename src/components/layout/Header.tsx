"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Menu, X, Moon, Sun, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchModal } from "@/components/common/SearchModal";
import { destinations as destinationsData } from "@/data/destinations";

// Auto-generate destination nav items from data
const allDestinations = Object.values(destinationsData).map(d => ({
    name: `Study in ${d.name}`,
    href: `/destinations/${d.slug}`
}));

export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-transparent",
                scrolled
                    ? "bg-background/70 backdrop-blur-xl border-border/20 shadow-lg py-3"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                    <div className="relative w-10 h-10 overflow-hidden rounded-lg">
                        <Image
                            src="/assets/logo.png"
                            alt="NexTep Edu Logo"
                            fill
                            className="object-contain"
                            sizes="40px"
                            priority
                        />
                    </div>
                    <span className="font-heading font-bold text-xl md:text-2xl text-primary group-hover:text-accent transition-colors">
                        NexTep Edu
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/#services" className="text-sm font-medium hover:text-accent transition-colors">
                        Services
                    </Link>
                    <Link href="/#about" className="text-sm font-medium hover:text-accent transition-colors">
                        About
                    </Link>

                    <div
                        className="relative"
                        onMouseEnter={() => setDropdownOpen(true)}
                        onMouseLeave={() => setDropdownOpen(false)}
                    >
                        <button
                            className="flex items-center gap-1 text-sm font-medium hover:text-accent transition-colors py-2"
                            aria-expanded={dropdownOpen}
                            aria-haspopup="true"
                        >
                            Destinations <ChevronDown className={cn("w-4 h-4 transition-transform", dropdownOpen && "rotate-180")} />
                        </button>

                        {/* Dropdown Menu — now shows all destinations with scroll */}
                        <div
                            className={cn(
                                "absolute top-full left-1/2 -translate-x-1/2 w-60 transition-all duration-200 origin-top",
                                dropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                            )}
                        >
                            <div className="mt-2 bg-card rounded-xl shadow-xl border border-border p-2 grid gap-1 relative overflow-hidden max-h-80 overflow-y-auto">
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-md -z-10" />

                                {allDestinations.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block px-4 py-2 text-sm rounded-lg hover:bg-muted hover:text-accent transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <Link href="/destinations" className="block px-4 py-2 text-xs font-bold text-accent text-center border-t border-border mt-1 pt-2">
                                    View All Destinations
                                </Link>
                            </div>
                        </div>
                    </div>

                    <Button onClick={() => document.getElementById('booking-modal')?.classList.remove('hidden')}>
                        Book Consultation
                    </Button>

                    <SearchModal />

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-muted transition-colors text-primary"
                        aria-label="Toggle Theme"
                    >
                        {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-4 md:hidden">
                    <SearchModal />
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-muted transition-colors text-primary"
                        aria-label="Toggle theme"
                    >
                        {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-primary"
                        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Content — now uses AnimatePresence for smooth slide/fade */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border shadow-2xl p-6 flex flex-col gap-4"
                    >
                        <Link
                            href="/#services"
                            className="text-lg font-medium p-3 -mx-3 rounded-lg hover:bg-muted transition-colors border-b border-border"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Services
                        </Link>
                        <Link
                            href="/#about"
                            className="text-lg font-medium p-3 -mx-3 rounded-lg hover:bg-muted transition-colors border-b border-border"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            About
                        </Link>
                        <div className="py-2">
                            <p className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider px-1">Destinations</p>
                            <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto pr-2">
                                {allDestinations.map(item => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="text-sm p-3 -mx-2 rounded-lg hover:bg-muted hover:text-accent transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                            <Link
                                href="/destinations"
                                className="text-sm font-bold text-accent mt-4 block text-center hover:underline p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                View All Destinations →
                            </Link>
                        </div>
                        <Button className="w-full mt-2 py-6 text-base shadow-md" size="lg" onClick={() => {
                            setMobileMenuOpen(false);
                            document.getElementById('booking-modal')?.classList.remove('hidden');
                        }}>
                            Book Consultation
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
