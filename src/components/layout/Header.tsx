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

// Top 6 for mobile menu to avoid excessive scrolling
const MOBILE_TOP_SLUGS = ["germany", "usa", "australia", "canada", "uk", "south-korea"];
const mobileTopDestinations = MOBILE_TOP_SLUGS
    .map(slug => destinationsData[slug])
    .filter(Boolean)
    .map(d => ({ name: `Study in ${d.name}`, href: `/destinations/${d.slug}` }));

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

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <div className="fixed top-0 left-0 w-full z-50 flex justify-center mt-4 px-4 transition-all duration-300">
            <nav
                className={cn(
                    "flex justify-between items-center w-full max-w-4xl px-6 py-3 transition-all duration-300",
                    "rounded-full border backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]",
                    "bg-white/70 border-black/5 dark:bg-[#1E1E1E]/60 dark:border-white/10 dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)]",
                    "shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                )}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
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

                        {/* Dropdown Menu — now uses matching glassmorphism */}
                        <div
                            className={cn(
                                "absolute top-full left-1/2 -translate-x-1/2 w-60 transition-all duration-200 origin-top mt-2 p-2 grid gap-1 relative overflow-hidden max-h-80 overflow-y-auto",
                                "rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] border",
                                "bg-white/70 border-black/5 dark:bg-[#1E1E1E]/70 dark:border-white/10 backdrop-blur-xl",
                                dropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                            )}
                        >
                            {allDestinations.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block px-4 py-2 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/10 hover:text-accent transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <Link href="/destinations" className="block px-4 py-2 text-xs font-bold text-accent text-center border-t border-black/10 dark:border-white/10 mt-1 pt-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">
                                View All Destinations
                            </Link>
                        </div>
                    </div>

                    <Button className="rounded-full px-6" onClick={() => document.getElementById('booking-modal')?.classList.remove('hidden')}>
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
            </nav>

            {/* Mobile Menu Content — Portfolio Style */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-20 left-4 right-4 md:hidden z-40 bg-white/85 dark:bg-[rgba(30,30,30,0.85)] backdrop-blur-[20px] shadow-2xl border border-black/5 dark:border-white/10 rounded-[24px] overflow-hidden"
                    >
                        <div className="p-6 flex flex-col gap-2">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.0 }}
                            >
                                <Link
                                    href="/#services"
                                    className="block p-4 -mx-4 text-[18px] font-semibold text-foreground hover:text-accent transition-colors border-b border-black/10 dark:border-white/10"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Services
                                </Link>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Link
                                    href="/#about"
                                    className="block p-4 -mx-4 text-[18px] font-semibold text-foreground hover:text-accent transition-colors border-b border-black/10 dark:border-white/10"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    About
                                </Link>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="py-2 mt-2"
                            >
                                <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider block">Top Destinations</p>
                                <div className="flex flex-col gap-1">
                                    {mobileTopDestinations.map((item, i) => (
                                        <motion.div
                                            key={item.href}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + (i * 0.05) }}
                                        >
                                            <Link
                                                href={item.href}
                                                className="block p-3 -mx-3 text-[16px] font-medium text-foreground hover:text-accent transition-colors border-b border-black/5 dark:border-white/5"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {item.name}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (mobileTopDestinations.length * 0.05) }}
                                >
                                    <Link
                                        href="/destinations"
                                        className="text-sm font-bold text-accent mt-4 block p-3 -mx-3 hover:text-accent/80 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        View All Destinations →
                                    </Link>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-4"
                            >
                                <Button className="w-full py-6 text-[15px] font-bold shadow-md rounded-full bg-foreground text-background hover:opacity-90" size="lg" onClick={() => {
                                    setMobileMenuOpen(false);
                                    document.getElementById('booking-modal')?.classList.remove('hidden');
                                }}>
                                    Book Consultation
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
