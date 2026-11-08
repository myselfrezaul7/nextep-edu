"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Mail,
    Phone,
    MapPin,
    Facebook,
    Instagram,
    ChevronDown,
    ArrowUpRight,
    ArrowUp,
    Sparkles,
    Compass,
    CheckCircle2,
    Globe2,
    Users,
    MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageContext";
import { useBookingModal } from "@/context/BookingModalContext";
import { usePathname } from "next/navigation";

const POPULAR_DESTINATIONS = [
    { name: "United Kingdom", href: "/destinations/uk", flag: "🇬🇧" },
    { name: "Germany", href: "/destinations/germany", flag: "🇩🇪" },
    { name: "USA", href: "/destinations/usa", flag: "🇺🇸" },
    { name: "Canada", href: "/destinations/canada", flag: "🇨🇦" },
    { name: "Australia", href: "/destinations/australia", flag: "🇦🇺" },
    { name: "South Korea", href: "/destinations/south-korea", flag: "🇰🇷" },
];

export function Footer() {
    const pathname = usePathname();
    const [openSection, setOpenSection] = useState<string | null>(null);
    const { t } = useTranslation();
    const { openModal } = useBookingModal();

    if (pathname.startsWith("/admin")) {
        return null;
    }

    const toggleSection = (section: string) => {
        setOpenSection((prev) => (prev === section ? null : section));
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="relative z-10 bg-background">
            {/* Top Gold Hairline */}
            <div
                aria-hidden="true"
                className="h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent"
            />

            {/* Premium CTA Banner */}
            <div className="relative overflow-hidden bg-[#0B1120] text-white">
                {/* Radial Gold Spotlight */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(212,175,55,0.16)_0%,_transparent_68%)]"
                />
                {/* Subtle Architectural Grid Texture */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:36px_36px]"
                />

                <div className="container mx-auto px-4 py-14 md:py-20 relative z-10 text-center max-w-3xl">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Free 1-on-1 Profile Evaluation</span>
                    </span>

                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-white mb-3.5 leading-tight">
                        {t(
                            "common.footer.ctaTitle",
                            undefined,
                            "Ready to Begin Your Study Abroad Journey?"
                        )}
                    </h3>
                    <p className="text-white/70 mb-7 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                        {t(
                            "common.footer.ctaSubtitle",
                            undefined,
                            "Book a free 30-minute consultation with our counselors today."
                        )}
                    </p>

                    {/* Trust Pill Strip */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-8">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-medium text-white/85">
                            <Users className="w-3.5 h-3.5 text-accent" />
                            <span>200+ Consultations</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-medium text-white/85">
                            <Globe2 className="w-3.5 h-3.5 text-accent" />
                            <span>17+ Countries</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-medium text-white/85">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                            <span>98% Visa Success</span>
                        </span>
                    </div>

                    {/* Dual CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                        <Button
                            size="lg"
                            variant="accent"
                            className="rounded-full font-bold text-sm sm:text-base px-8 min-h-[48px] w-full sm:w-auto gap-2 shadow-[0_8px_28px_rgba(212,175,55,0.28)]"
                            onClick={() => openModal()}
                        >
                            <span>
                                {t(
                                    "common.footer.ctaButton",
                                    undefined,
                                    "Book Free Consultation"
                                )}
                            </span>
                            <ArrowUpRight className="w-4 h-4" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full font-semibold text-sm sm:text-base px-7 min-h-[48px] w-full sm:w-auto gap-2 border-white/20 bg-white/[0.05] text-white hover:bg-white/12 hover:text-white"
                            asChild
                        >
                            <a
                                href="https://wa.me/4915147483493?text=Hi%21%20I%27d%20like%20to%20book%20a%20free%20study%20abroad%20consultation."
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                                <span>Chat on WhatsApp</span>
                            </a>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Subtle Gold Hairline Divider */}
            <div
                aria-hidden="true"
                className="h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent"
            />

            {/* Main Footer Surface */}
            <div className="bg-white/85 dark:bg-[#0D1527]/95 md:backdrop-blur-xl py-12 md:py-16 border-t border-slate-200/80 dark:border-white/[0.08]">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
                        {/* Column 1: Brand & Socials (4 cols on desktop) */}
                        <div className="md:col-span-4 space-y-5">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-3 group"
                            >
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden p-1 border bg-white/80 dark:bg-white/10 border-slate-200/80 dark:border-white/15 shrink-0 shadow-2xs">
                                    <Image
                                        src="/assets/logo.png"
                                        alt="NexTep Edu Logo"
                                        fill
                                        sizes="40px"
                                        className="object-contain"
                                    />
                                </div>
                                <div>
                                    <span className="font-heading font-bold text-xl text-primary group-hover:text-accent transition-colors block leading-none">
                                        NexTep Edu
                                    </span>
                                    <span className="text-[11px] font-medium text-muted-foreground tracking-wide">
                                        Global Education Consultancy
                                    </span>
                                </div>
                            </Link>

                            <p className="text-sm leading-relaxed text-muted-foreground dark:text-white/70 max-w-sm">
                                Your trusted partner for global higher education from Bangladesh. We simplify every step from university shortlisting to visa approval.
                            </p>

                            {/* 44x44px Tactile Social Pills */}
                            <div className="flex items-center gap-2.5 pt-1">
                                <a
                                    href="https://facebook.com/nextepbd"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Follow NexTep Edu on Facebook"
                                    className="w-11 h-11 rounded-full border border-slate-200/90 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.04] text-muted-foreground dark:text-white/70 hover:text-accent hover:border-accent/50 flex items-center justify-center transition-colors active:scale-95"
                                >
                                    <Facebook className="w-4 h-4" />
                                </a>
                                <a
                                    href="https://instagram.com/nextepedu"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Follow NexTep Edu on Instagram"
                                    className="w-11 h-11 rounded-full border border-slate-200/90 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.04] text-muted-foreground dark:text-white/70 hover:text-accent hover:border-accent/50 flex items-center justify-center transition-colors active:scale-95"
                                >
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a
                                    href="https://wa.me/4915147483493"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Message NexTep Edu on WhatsApp"
                                    className="w-11 h-11 rounded-full border border-slate-200/90 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.04] text-muted-foreground dark:text-white/70 hover:text-[#25D366] hover:border-[#25D366]/50 flex items-center justify-center transition-colors active:scale-95"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Explore Links (2 cols on desktop, CSS Accordion on mobile) */}
                        <div className="md:col-span-2 border-y md:border-none border-border/40">
                            <button
                                type="button"
                                onClick={() => toggleSection("quick-links")}
                                aria-expanded={openSection === "quick-links"}
                                className="w-full min-h-[48px] md:min-h-0 flex items-center justify-between py-3.5 md:py-0 md:mb-5 text-sm font-bold uppercase tracking-wider text-foreground md:cursor-default"
                            >
                                <span>
                                    {t(
                                        "common.footer.quickLinks",
                                        undefined,
                                        "Explore"
                                    )}
                                </span>
                                <ChevronDown
                                    className={cn(
                                        "w-4 h-4 md:hidden text-muted-foreground transition-transform duration-200",
                                        openSection === "quick-links" &&
                                            "rotate-180 text-accent"
                                    )}
                                />
                            </button>
                            <div
                                className={cn(
                                    "grid transition-[grid-template-rows,opacity] duration-250 ease-out md:grid-rows-[1fr] md:opacity-100",
                                    openSection === "quick-links"
                                        ? "grid-rows-[1fr] opacity-100 pb-4 md:pb-0"
                                        : "grid-rows-[0fr] opacity-0 md:opacity-100"
                                )}
                            >
                                <ul className="overflow-hidden space-y-1 md:space-y-2.5 text-sm">
                                    <li>
                                        <Link
                                            href="/"
                                            className="min-h-[40px] md:min-h-0 flex items-center text-muted-foreground dark:text-white/70 hover:text-accent transition-colors"
                                        >
                                            {t("common.footer.home", undefined, "Home")}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/#services"
                                            className="min-h-[40px] md:min-h-0 flex items-center text-muted-foreground dark:text-white/70 hover:text-accent transition-colors"
                                        >
                                            {t(
                                                "common.footer.services",
                                                undefined,
                                                "Services"
                                            )}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/destinations"
                                            className="min-h-[40px] md:min-h-0 flex items-center text-muted-foreground dark:text-white/70 hover:text-accent transition-colors"
                                        >
                                            {t(
                                                "common.footer.destinations",
                                                undefined,
                                                "All Destinations"
                                            )}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/#about"
                                            className="min-h-[40px] md:min-h-0 flex items-center text-muted-foreground dark:text-white/70 hover:text-accent transition-colors"
                                        >
                                            {t(
                                                "common.footer.aboutUs",
                                                undefined,
                                                "About Us"
                                            )}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/track"
                                            className="min-h-[40px] md:min-h-0 flex items-center font-medium text-accent hover:underline"
                                        >
                                            Track Application
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Column 3: Popular Destinations with Flags (3 cols on desktop) */}
                        <div className="md:col-span-3 border-b md:border-none border-border/40 -mt-8 md:mt-0">
                            <button
                                type="button"
                                onClick={() => toggleSection("destinations")}
                                aria-expanded={openSection === "destinations"}
                                className="w-full min-h-[48px] md:min-h-0 flex items-center justify-between py-3.5 md:py-0 md:mb-5 text-sm font-bold uppercase tracking-wider text-foreground md:cursor-default"
                            >
                                <span>
                                    {t(
                                        "common.footer.popularDestinations",
                                        undefined,
                                        "Top Destinations"
                                    )}
                                </span>
                                <ChevronDown
                                    className={cn(
                                        "w-4 h-4 md:hidden text-muted-foreground transition-transform duration-200",
                                        openSection === "destinations" &&
                                            "rotate-180 text-accent"
                                    )}
                                />
                            </button>
                            <div
                                className={cn(
                                    "grid transition-[grid-template-rows,opacity] duration-250 ease-out md:grid-rows-[1fr] md:opacity-100",
                                    openSection === "destinations"
                                        ? "grid-rows-[1fr] opacity-100 pb-4 md:pb-0"
                                        : "grid-rows-[0fr] opacity-0 md:opacity-100"
                                )}
                            >
                                <ul className="overflow-hidden space-y-1 md:space-y-2.5 text-sm">
                                    {POPULAR_DESTINATIONS.map((country) => (
                                        <li key={country.href}>
                                            <Link
                                                href={country.href}
                                                className="min-h-[40px] md:min-h-0 flex items-center gap-2 text-muted-foreground dark:text-white/70 hover:text-accent transition-colors"
                                            >
                                                <span className="text-base leading-none">
                                                    {country.flag}
                                                </span>
                                                <span>{country.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Column 4: Direct Contact & Live Tracker Card (3 cols on desktop) */}
                        <div className="md:col-span-3 space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                                {t("common.footer.contactUs", undefined, "Direct Contact")}
                            </h4>

                            <div className="space-y-2.5 text-sm">
                                <a
                                    href="https://wa.me/4915147483493"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50 bg-surface/50 dark:bg-white/[0.03] hover:border-accent/40 text-muted-foreground dark:text-white/75 hover:text-foreground transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-accent/12 text-accent flex items-center justify-center shrink-0">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">+49 151 47483493</span>
                                </a>

                                <a
                                    href="mailto:info@nextepedu.com"
                                    className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50 bg-surface/50 dark:bg-white/[0.03] hover:border-accent/40 text-muted-foreground dark:text-white/75 hover:text-foreground transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-accent/12 text-accent flex items-center justify-center shrink-0">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium truncate">info@nextepedu.com</span>
                                </a>

                                <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50 bg-surface/50 dark:bg-white/[0.03] text-muted-foreground dark:text-white/75">
                                    <div className="w-8 h-8 rounded-lg bg-accent/12 text-accent flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs leading-snug">
                                        1500, Munshiganj, Dhaka, Bangladesh
                                    </span>
                                </div>
                            </div>

                            {/* Live Application Tracker Quick Card */}
                            <Link
                                href="/track"
                                className="group flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-accent/30 bg-accent/[0.08] hover:bg-accent/15 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-accent text-slate-950 flex items-center justify-center shrink-0">
                                        <Compass className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-primary truncate">
                                            Live Application Portal
                                        </p>
                                        <p className="text-[11px] text-muted-foreground truncate">
                                            Track visa & offer status in real time
                                        </p>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className="border-t border-slate-200/80 dark:border-white/[0.08] bg-surface/40 dark:bg-[#090E1B] pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
                <div className="container mx-auto px-4 py-5 md:py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground dark:text-white/55">
                    <p className="text-center sm:text-left">
                        &copy; {new Date().getFullYear()} NexTep Edu. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <span>Built for Bangladeshi Scholars</span>
                        <span aria-hidden="true" className="text-border">|</span>
                        <button
                            type="button"
                            onClick={scrollToTop}
                            className="inline-flex items-center gap-1.5 font-semibold text-foreground dark:text-white/80 hover:text-accent transition-colors min-h-[36px] px-2 rounded-lg"
                        >
                            <span>Back to top</span>
                            <ArrowUp className="w-3.5 h-3.5 text-accent" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
