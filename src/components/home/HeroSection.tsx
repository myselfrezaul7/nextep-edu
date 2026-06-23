"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { GraduationCap, Plane, Globe2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageContext";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function HeroSection() {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();
    const currentTheme = theme === "system" ? systemTheme : theme;
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 1000], [0, 150]);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden py-16 md:py-32">
            {/* Background Blur Effect */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(212,175,55,0.2)_0%,_transparent_70%)] -z-10 pointer-events-none" />

            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className="space-y-6">
                    <h1 className="text-3xl md:text-6xl font-bold font-heading text-primary leading-tight flex flex-wrap gap-x-2 md:gap-x-3">
                        {t("home.hero.title").split(" ").map((word: string, i: number) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: i * 0.1, ease: EASE_OUT_EXPO }}
                                className="inline-block"
                            >
                                {word}
                            </motion.span>
                        ))}
                        <motion.span
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: t("home.hero.title").split(" ").length * 0.1, ease: EASE_OUT_EXPO }}
                            className="text-accent inline-block"
                        >
                            {t("home.hero.titleAccent")}
                        </motion.span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.15, ease: EASE_OUT_EXPO }}
                        className="text-lg md:text-2xl font-medium font-[var(--font-script)] text-accent"
                    >
                        {t("home.hero.tagline")}
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.25, ease: EASE_OUT_EXPO }}
                        className="text-lg text-muted-foreground max-w-lg leading-relaxed"
                    >
                        {t("home.hero.description")}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.35, ease: EASE_OUT_EXPO }}
                        className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4"
                    >
                        <motion.div whileTap={{ scale: 0.95 }} className="w-full sm:w-auto group">
                            <Button
                                size="lg"
                                className="rounded-full text-base w-full sm:w-auto relative overflow-hidden"
                                onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                            >
                                Let&apos;s Talk
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                            </Button>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-full text-base w-full sm:w-auto"
                                asChild
                            >
                                <Link href="/#services">
                                    See Our Work
                                </Link>
                            </Button>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.45, ease: EASE_OUT_EXPO }}
                        className="pt-6"
                    >
                        <div className={cn(
                            "flex items-center gap-3 px-5 py-3 rounded-full w-fit glass-nav border",
                            mounted && currentTheme === "dark"
                                ? "bg-[rgba(15,23,42,0.7)] border-white/10"
                                : "bg-white/70 border-black/5"
                        )}>
                            <div className="flex -space-x-2.5">
                                <div className="w-9 h-9 rounded-full ring-2 ring-accent/50 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm z-30">TH</div>
                                <div className="w-9 h-9 rounded-full ring-2 ring-accent/50 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-sm z-20">NJ</div>
                                <div className="w-9 h-9 rounded-full ring-2 ring-accent/50 bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-sm z-10">MD</div>
                            </div>
                            <div className="w-px h-6 bg-accent/30" />
                            <div className="text-sm">
                                <span className="text-muted-foreground">Trusted by </span>
                                <span className="text-accent font-bold text-base">200+</span>
                                <span className="text-muted-foreground font-medium"> students</span>
                                <span className="text-muted-foreground/70"> across </span>
                                <span className="font-semibold text-foreground/80">20+ countries</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Hero Image */}
                <motion.div style={{ y }} className="relative h-full w-full flex items-center justify-center transform-gpu">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            y: [0, -10, 0] // Subtle floating effect
                        }}
                    transition={{
                        opacity: { duration: 1, delay: 0.3, ease: EASE_OUT_EXPO },
                        x: { duration: 1, delay: 0.3, ease: EASE_OUT_EXPO },
                        y: {
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }
                    }}
                    style={{ willChange: "transform, opacity" }}
                    className="relative group perspective-1000 transform-gpu"
                >
                    <div className={cn(
                        "relative rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:rotate-y-0 -rotate-y-6 p-2 border",
                        mounted && currentTheme === "dark" ? "bg-[rgba(15,23,42,0.85)] border-white/10" : "bg-white/80 border-white/20"
                    )}>
                        <Image
                            src="/assets/hero-library.png"
                            alt="Students studying in a modern library"
                            width={600}
                            height={400}
                            className="rounded-xl w-full h-auto object-cover"
                            priority
                        />
                    </div>

                    {/* Floating Decorative Icons */}
                    <motion.div
                        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="hidden md:block absolute -top-6 -right-6 bg-accent/20 backdrop-blur-md p-4 rounded-full border border-accent/20 shadow-lg text-accent"
                    >
                        <Plane className="w-8 h-8" />
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="hidden md:block absolute top-1/2 -left-8 bg-blue-500/20 backdrop-blur-md p-4 rounded-full border border-blue-500/20 shadow-lg text-blue-500"
                    >
                        <GraduationCap className="w-8 h-8" />
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="hidden md:block absolute -bottom-6 right-10 bg-green-500/20 backdrop-blur-md p-3 rounded-full border border-green-500/20 shadow-lg text-green-500"
                    >
                        <Globe2 className="w-6 h-6" />
                    </motion.div>

                    {/* Decorative element behind image */}
                    <div className="absolute -inset-4 bg-accent/10 rounded-3xl -z-10 blur-xl opacity-70" />
                </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
