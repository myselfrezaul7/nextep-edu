"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Menu, X, Moon, Sun, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const destinations = [
    { name: "Study in UK", href: "/destinations/uk" },
    { name: "Study in USA", href: "/destinations/usa" },
    { name: "Study in Canada", href: "/destinations/canada" },
    { name: "Study in Australia", href: "/destinations/australia" },
    { name: "Study in Germany", href: "/destinations/germany" },
    { name: "Study in France", href: "/destinations/france" },
    { name: "Study in Netherlands", href: "/destinations/netherlands" },
    { name: "Study in South Korea", href: "/destinations/south-korea" },
];

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
                    ? "bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-lg py-3"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-10 h-10 overflow-hidden rounded-lg">
                        <Image
                            src="/assets/logo.png"
                            alt="NexTep Edu Logo"
                            fill
                            className="object-contain"
                            sizes="40px"
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
                        <button className="flex items-center gap-1 text-sm font-medium hover:text-accent transition-colors py-2">
                            Destinations <ChevronDown className={cn("w-4 h-4 transition-transform", dropdownOpen && "rotate-180")} />
                        </button>

                        {/* Dropdown Menu */}
                        <div
                            className={cn(
                                "absolute top-full left-1/2 -translate-x-1/2 w-56 transition-all duration-200 origin-top",
                                dropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                            )}
                        >
                            <div className="mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 grid gap-1 relative overflow-hidden">
                                {/* Glass effect implementation for dropdown too */}
                                <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md -z-10" />

                                {destinations.slice(0, 6).map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block px-4 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-accent transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <Link href="/destinations" className="block px-4 py-2 text-xs font-bold text-accent text-center border-t border-slate-100 dark:border-slate-700 mt-1 pt-2">
                                    View All Destinations
                                </Link>
                            </div>
                        </div>
                    </div>

                    <Button onClick={() => document.getElementById('booking-modal')?.classList.remove('hidden')}>
                        Book Consultation
                    </Button>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-primary"
                        aria-label="Toggle Theme"
                    >
                        {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-4 md:hidden">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-primary"
                    >
                        {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-primary"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Content */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-5">
                    <Link
                        href="/#services"
                        className="text-lg font-medium p-2 border-b border-slate-100 dark:border-slate-800"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Services
                    </Link>
                    <Link
                        href="/#about"
                        className="text-lg font-medium p-2 border-b border-slate-100 dark:border-slate-800"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        About
                    </Link>
                    <div className="py-2">
                        <p className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Destinations</p>
                        <div className="grid grid-cols-2 gap-2">
                            {destinations.slice(0, 6).map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-sm p-2 hover:text-accent transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <Button className="w-full mt-4" size="lg" onClick={() => {
                        setMobileMenuOpen(false);
                        document.getElementById('booking-modal')?.classList.remove('hidden');
                    }}>
                        Book Consultation
                    </Button>
                </div>
            )}
        </nav>
    );
}
