"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { useMounted } from "@/lib/use-mounted";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageContext";
import { useBookingModal } from "@/context/BookingModalContext";
import { IMAGE_BLUR_PLACEHOLDERS } from "@/data/image-placeholders";

const HeroCanvas = dynamic(
    () => import("@/components/home/HeroCanvas").then((mod) => mod.HeroCanvas),
    { ssr: false }
);

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const subscribeDesktop = (callback: () => void) => {
    const mq = window.matchMedia("(min-width: 1024px)");
    mq.addEventListener("change", callback);
    return () => mq.removeEventListener("change", callback);
};

const getDesktopSnapshot = () => window.matchMedia("(min-width: 1024px)").matches;

export function HeroSection() {
    const { theme, systemTheme } = useTheme();
    const mounted = useMounted();
    const { t } = useTranslation();
    const { openModal } = useBookingModal();
    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = mounted && currentTheme === "dark";
    const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, () => false);
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 1000], [0, 90]);

    const heroTitle = t("home.hero.title", undefined, "Your Bridge to ");
    const heroTitleAccent = t("home.hero.titleAccent", undefined, "Global Education");

    return (
        <section id="hero" className="relative lg:min-h-[84vh] flex items-center overflow-hidden py-6 sm:py-12 lg:py-24 isolate">
            {/* 3D Subtle Holographic Constellation (lightweight 2D on mobile) */}
            <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
                <HeroCanvas />
            </div>

            {/* Subtle Radial Ambient Light */}
            <div className="absolute top-[-15%] right-[-10%] w-[560px] h-[560px] bg-[radial-gradient(circle,_rgba(212,175,55,0.12)_0%,_transparent_70%)] -z-10 pointer-events-none" />

            <div className="container mx-auto px-4 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
                {/* Text Content */}
                <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left min-w-0">
                    {/* Subtle Eyebrow Tagline Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-semibold tracking-wider uppercase">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>{t("home.hero.tagline", undefined, "Dream it. Plan it. Achieve it.")}</span>
                    </div>

                    {/* LCP Headline - immediately visible at opacity 1 without JS hydration wait */}
                    <h1 className="text-[2rem] sm:text-5xl md:text-6xl font-bold font-heading text-primary leading-[1.14] tracking-tight">
                        <span>{heroTitle.trim()} </span>
                        <span className="text-accent">{heroTitleAccent}</span>
                    </h1>

                    <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        {t(
                            "home.hero.description",
                            undefined,
                            "Expert guidance for Bangladeshi students aspiring to study abroad. We make your international education journey seamless and successful."
                        )}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 pt-1">
                        <motion.div whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="rounded-full text-base px-8 min-h-[48px] w-full sm:w-auto gap-2"
                                onClick={() => openModal()}
                            >
                                {t("home.hero.ctaPrimary", undefined, "Let's Talk")}
                                <ArrowRight className="w-4 h-4 shrink-0" />
                            </Button>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-full text-base px-8 min-h-[48px] w-full sm:w-auto"
                                asChild
                            >
                                <Link href="/#services">
                                    {t("home.hero.ctaSecondary", undefined, "See Our Work")}
                                </Link>
                            </Button>
                        </motion.div>
                    </div>

                    {/* Quick Destination Jump Chips - Single-row horizontal scroll rail on mobile */}
                    <div className="pt-1 -mx-4 px-4 lg:mx-0 lg:px-0">
                        <div className="flex flex-nowrap lg:flex-wrap items-center justify-start gap-2 overflow-x-auto lg:overflow-visible scrollbar-hide py-0.5">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-0.5 shrink-0">
                                {t("home.hero.popularLabel", undefined, "Popular:")}
                            </span>
                            {[
                                { name: "Germany", slug: "germany", flag: "🇩🇪" },
                                { name: "UK", slug: "uk", flag: "🇬🇧" },
                                { name: "USA", slug: "usa", flag: "🇺🇸" },
                                { name: "Canada", slug: "canada", flag: "🇨🇦" },
                                { name: "Australia", slug: "australia", flag: "🇦🇺" },
                            ].map((country) => (
                                <Link
                                    key={country.slug}
                                    href={`/destinations/${country.slug}`}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 px-3.5 min-h-[44px] sm:min-h-[38px] rounded-full text-xs font-medium border transition-all active:scale-95 shrink-0 whitespace-nowrap",
                                        isDark
                                            ? "bg-slate-900/70 border-white/10 text-foreground/90 hover:border-accent/50 hover:text-accent"
                                            : "bg-white/85 border-slate-200/90 text-foreground/90 hover:border-accent/50 hover:text-accent shadow-2xs"
                                    )}
                                >
                                    <span>{country.flag}</span>
                                    <span>{country.name}</span>
                                </Link>
                            ))}
                            <Link
                                href="/destinations"
                                className="inline-flex items-center gap-1 px-3.5 min-h-[44px] sm:min-h-[38px] rounded-full text-xs font-semibold text-accent bg-accent/10 border border-accent/25 hover:bg-accent/20 transition-all active:scale-95 shrink-0 whitespace-nowrap"
                            >
                                <span>{t("home.hero.allCountriesChip", undefined, "17+ Countries")}</span>
                                <ArrowRight className="w-3 h-3 shrink-0" />
                            </Link>
                        </div>
                    </div>

                    <motion.div
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                        className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3"
                    >
                        <div
                            className={cn(
                                "inline-flex items-center gap-3 px-3.5 sm:px-4 py-2 rounded-full glass-nav border max-w-full",
                                isDark
                                    ? "bg-slate-900/75 border-white/[0.08]"
                                    : "bg-white/80 border-slate-200/80 shadow-sm"
                            )}
                        >
                            <div className="flex -space-x-2 shrink-0">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-background bg-slate-800 text-accent flex items-center justify-center text-[10px] sm:text-[11px] font-bold z-30">
                                    TH
                                </div>
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-background bg-slate-700 text-white flex items-center justify-center text-[10px] sm:text-[11px] font-bold z-20">
                                    NJ
                                </div>
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-background bg-accent text-slate-950 flex items-center justify-center text-[10px] sm:text-[11px] font-bold z-10">
                                    MD
                                </div>
                            </div>
                            <div className="w-px h-5 bg-border shrink-0" />
                            <div className="text-xs sm:text-sm text-left leading-snug">
                                <span className="text-muted-foreground">{t("home.hero.trustedBy", undefined, "Trusted by ")}</span>
                                <span className="text-foreground font-bold">200+</span>
                                <span className="text-muted-foreground">{t("home.hero.students", undefined, " students")}</span>
                                <span className="text-muted-foreground/80">{t("home.hero.across", undefined, " across ")}</span>
                                <span className="font-semibold text-accent">{t("home.hero.countries", undefined, "17+ countries")}</span>
                            </div>
                        </div>

                        {/* Mobile-visible compact trust badges (wraps cleanly on 360px) */}
                        <div className="flex flex-wrap sm:hidden items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-foreground">
                                <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                                {t("home.hero.visaSuccessBadge", undefined, "98% Visa Success")}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-foreground">
                                <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                                {t("home.hero.zeroFeesBadge", undefined, "Zero Advance Fees")}
                            </span>
                        </div>
                    </motion.div>
                </div>

                {/* Hero Architectural Image Frame - immediate LCP paint, desktop-only parallax */}
                <motion.div
                    style={isDesktop ? { y } : undefined}
                    className="lg:col-span-5 relative h-full w-full flex items-center justify-center"
                >
                    <div className="relative w-full max-w-lg group">
                        <div className="surface-card relative rounded-2xl overflow-hidden p-2 sm:p-2.5">
                            <Image
                                src="/assets/hero-scholar.jpg"
                                alt="Study abroad scholar workspace overlooking European university courtyard"
                                width={600}
                                height={420}
                                sizes="(max-width: 1024px) calc(100vw - 3rem), 480px"
                                placeholder={IMAGE_BLUR_PLACEHOLDERS["/assets/hero-scholar.jpg"] ? "blur" : "empty"}
                                blurDataURL={IMAGE_BLUR_PLACEHOLDERS["/assets/hero-scholar.jpg"]}
                                className="rounded-xl w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                                priority
                            />
                        </div>

                        {/* Subtle Structured Floating Trust Pill - Top Right */}
                        <div
                            className={cn(
                                "hidden sm:flex items-center gap-2.5 absolute -top-4 -right-4 px-4 py-2.5 rounded-xl border glass-nav shadow-lg transition-transform duration-300 group-hover:-translate-y-0.5",
                                isDark
                                    ? "bg-slate-900/90 border-white/10 text-white"
                                    : "bg-white/95 border-slate-200/90 text-slate-900"
                            )}
                        >
                            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold leading-none">
                                    {t("home.hero.visaSuccessBadge", undefined, "98% Visa Success")}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {t("home.hero.verifiedTrackRecord", undefined, "Verified Track Record")}
                                </p>
                            </div>
                        </div>

                        {/* Subtle Structured Floating Trust Pill - Bottom Left */}
                        <div
                            className={cn(
                                "hidden sm:flex items-center gap-2.5 absolute -bottom-4 -left-4 px-4 py-2.5 rounded-xl border glass-nav shadow-lg transition-transform duration-300 group-hover:translate-y-0.5",
                                isDark
                                    ? "bg-slate-900/90 border-white/10 text-white"
                                    : "bg-white/95 border-slate-200/90 text-slate-900"
                            )}
                        >
                            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent shrink-0">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold leading-none">
                                    {t("home.hero.zeroFeesBadge", undefined, "Zero Advance Fees")}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {t("home.hero.payAfterDelivery", undefined, "Pay After Delivery")}
                                </p>
                            </div>
                        </div>

                        {/* Soft ambient glow behind frame */}
                        <div className="absolute -inset-3 bg-accent/[0.07] rounded-3xl -z-10 blur-2xl pointer-events-none" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
