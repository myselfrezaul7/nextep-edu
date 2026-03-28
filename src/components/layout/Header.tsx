"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Search, Moon, Sun, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchModal } from "@/components/common/SearchModal";
import { destinations as destinationsData } from "@/data/destinations";

// Auto-generate destination nav items from data
const allDestinations = Object.values(destinationsData).map(d => ({
    name: `Study in ${d.name}`,
    href: `/destinations/${d.slug}`,
    flag: d.flag
}));

// Top 6 for mobile menu to avoid excessive scrolling
const MOBILE_TOP_SLUGS = ["germany", "usa", "australia", "canada", "uk", "south-korea"];
const mobileTopDestinations = MOBILE_TOP_SLUGS
    .map(slug => destinationsData[slug])
    .filter(Boolean)
    .map(d => ({ name: `Study in ${d.name}`, href: `/destinations/${d.slug}` }));

export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const currentTheme = theme === "system" ? systemTheme : theme;

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
        <div className="fixed top-0 left-0 w-full z-50 flex justify-center mt-4 px-4 transition-all duration-300">
            <nav
                className={cn(
                    "flex justify-between items-center w-full max-w-5xl px-4 md:px-6 py-3 transition-all duration-300",
                    "rounded-full border glass-nav",
                    mounted && currentTheme === "dark"
                        ? "bg-[rgba(15,23,42,0.85)] border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                        : "bg-white/70 border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
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
                <div className="hidden lg:flex items-center gap-6">
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

                        {/* Dropdown Menu — perfectly matches mobile glassmorphism */}
                        <div
                            className={cn(
                                "absolute top-full left-1/2 -translate-x-1/2 w-64 transition-all duration-200 origin-top mt-2 p-2 grid gap-1 overflow-hidden max-h-80 overflow-y-auto",
                                "rounded-[24px] border glass-nav",
                                mounted && currentTheme === "dark" 
                                    ? "bg-[rgba(30,30,30,0.85)] border-[rgba(255,255,255,0.08)] shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
                                    : "bg-white/85 border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.15)]",
                                dropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                            )}
                        >
                            {allDestinations.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "block px-4 py-2.5 text-[15px] font-medium text-foreground rounded-[12px] hover:text-accent transition-colors",
                                        mounted && currentTheme === "dark" ? "hover:bg-white/10" : "hover:bg-black/5"
                                    )}
                                >
                                    <span className="mr-2 text-base">{item.flag}</span>
                                    {item.name}
                                </Link>
                            ))}
                            <Link 
                                href="/destinations" 
                                className={cn(
                                    "block px-4 py-2 text-xs font-bold text-accent text-center border-t mt-1 pt-2 rounded-lg transition-colors",
                                    mounted && currentTheme === "dark" 
                                        ? "border-white/10 hover:bg-white/10" 
                                        : "border-black/10 hover:bg-black/5"
                                )}
                            >
                                View All Destinations
                            </Link>
                        </div>
                    </div>

                    <Button className="rounded-full px-6" onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}>
                        Book Consultation
                    </Button>

                    <SearchModal />

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        className="p-2 w-11 h-11 md:w-auto md:h-auto flex items-center justify-center rounded-full hover:bg-muted transition-colors text-primary shrink-0"
                        aria-label="Toggle Theme"
                    >
                        {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </motion.button>
                </div>

                {/* Mobile Icons (Logo, Search, Theme) */}
                <div className="flex items-center gap-1.5 lg:hidden">
                    <SearchModal />
                    <div className="w-[1px] h-5 bg-border/60 mx-1" />
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        className="p-2 w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-primary shrink-0"
                        aria-label="Toggle theme"
                    >
                        {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </motion.button>
                </div>
            </nav>
        </div>
    );
}
