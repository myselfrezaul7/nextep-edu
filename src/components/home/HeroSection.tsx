"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/lib/use-mounted";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageContext";

const HeroCanvas = dynamic(
    () => import("@/components/home/HeroCanvas").then((mod) => mod.HeroCanvas),
    { ssr: false }
);

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function HeroSection() {
    const { theme, systemTheme } = useTheme();
    const mounted = useMounted();
    const { t } = useTranslation();
    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = mounted && currentTheme === "dark";
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 1000], [0, 90]);

    const heroTitle = t("home.hero.title", undefined, "Your Bridge to ");
    const heroTitleAccent = t("home.hero.titleAccent", undefined, "Global Education");

    return (
        <section id="hero" className="relative min-h-[88vh] flex items-center overflow-hidden py-14 md:py-28 isolate">
            {/* 3D Subtle Holographic Constellation */}
            <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
                <HeroCanvas />
            </div>

            {/* Subtle Radial Ambient Light */}
            <div className="absolute top-[-15%] right-[-10%] w-[560px] h-[560px] bg-[radial-gradient(circle,_rgba(212,175,55,0.12)_0%,_transparent_70%)] -z-10 pointer-events-none" />

            <div className="container mx-auto px-4 grid lg:grid-cols-12 gap-12 lg:gap-10 items-center relative z-10">
                {/* Text Content */}
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                    {/* Subtle Eyebrow Tagline Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-semibold tracking-wider uppercase"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t("home.hero.tagline", undefined, "Dream it. Plan it. Achieve it.")}</span>
                    </motion.div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading text-primary leading-[1.12] tracking-tight flex flex-wrap justify-center lg:justify-start gap-x-2.5 md:gap-x-3.5">
                        {heroTitle.trim().split(" ").map((word: string, i: number) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.75, delay: 0.05 + i * 0.08, ease: EASE_OUT_EXPO }}
                                className="inline-block"
                            >
                                {word}
                            </motion.span>
                        ))}
                        <motion.span
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75, delay: 0.05 + heroTitle.trim().split(" ").length * 0.08, ease: EASE_OUT_EXPO }}
                            className="text-accent inline-block"
                        >
                            {heroTitleAccent}
                        </motion.span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT_EXPO }}
                        className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
                    >
                        {t(
                            "home.hero.description",
                            undefined,
                            "Expert guidance for Bangladeshi students aspiring to study abroad. We make your international education journey seamless and successful."
                        )}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT_EXPO }}
                        className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3.5 pt-2"
                    >
                        <motion.div whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="rounded-full text-base px-8 w-full sm:w-auto gap-2"
                                onClick={() => window.dispatchEvent(new CustomEvent("open-booking-modal"))}
                            >
                                {t("home.hero.ctaPrimary", undefined, "Let's Talk")}
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-full text-base px-8 w-full sm:w-auto"
                                asChild
                            >
                                <Link href="/#services">
                                    {t("home.hero.ctaSecondary", undefined, "See Our Work")}
                                </Link>
                            </Button>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: EASE_OUT_EXPO }}
                        className="pt-4 flex justify-center lg:justify-start"
                    >
                        <div className={cn(
                            "inline-flex items-center gap-3.5 px-4 py-2.5 rounded-full glass-nav border",
                            isDark
                                ? "bg-slate-900/75 border-white/[0.08]"
                                : "bg-white/80 border-slate-200/80 shadow-sm"
                        )}>
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full ring-2 ring-background bg-slate-800 text-accent flex items-center justify-center text-[11px] font-bold z-30">TH</div>
                                <div className="w-8 h-8 rounded-full ring-2 ring-background bg-slate-700 text-white flex items-center justify-center text-[11px] font-bold z-20">NJ</div>
                                <div className="w-8 h-8 rounded-full ring-2 ring-background bg-accent text-slate-950 flex items-center justify-center text-[11px] font-bold z-10">MD</div>
                            </div>
                            <div className="w-px h-5 bg-border" />
                            <div className="text-xs sm:text-sm text-left">
                                <span className="text-muted-foreground">{t("home.hero.trustedBy", undefined, "Trusted by ")}</span>
                                <span className="text-foreground font-bold">200+</span>
                                <span className="text-muted-foreground">{t("home.hero.students", undefined, " students")}</span>
                                <span className="text-muted-foreground/80">{t("home.hero.across", undefined, " across ")}</span>
                                <span className="font-semibold text-accent">{t("home.hero.countries", undefined, "20+ countries")}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Hero Architectural Image Frame */}
                <motion.div style={{ y }} className="lg:col-span-5 relative h-full w-full flex items-center justify-center transform-gpu">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.25, ease: EASE_OUT_EXPO }}
                        className="relative w-full max-w-lg group"
                    >
                        <div className="surface-card relative rounded-2xl overflow-hidden p-2.5">
                            <Image
                                src="/assets/hero-scholar.jpg"
                                alt="Study abroad scholar workspace overlooking European university courtyard"
                                width={600}
                                height={420}
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
                                <p className="text-xs font-bold leading-none">98% Visa Success</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Verified Track Record</p>
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
                                <p className="text-xs font-bold leading-none">Zero Advance Fees</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Pay After Delivery</p>
                            </div>
                        </div>

                        {/* Soft ambient glow behind frame */}
                        <div className="absolute -inset-3 bg-accent/[0.07] rounded-3xl -z-10 blur-2xl pointer-events-none" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
