"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, memo } from "react";
import { CheckCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageContext";
import { useBookingModal } from "@/context/BookingModalContext";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.15,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0 },
};

const featureFallbacks = [
    "Zero Fraud Risk: We NEVER hold your original passport or documents",
    "No Advance Fees: You pay only after service delivery (consultation excluded)",
    "Connections with 200+ universities worldwide",
    "BPMN 2.0 optimized workflows for faster, error-free applications",
];

const stats = [
    { value: 200, suffix: "+", labelKey: "home.about.stats.consultations", fallback: "Consultations Done" },
    { value: 17, suffix: "+", labelKey: "home.about.stats.countries", fallback: "Countries" },
    { value: 98, suffix: "%", labelKey: "home.about.stats.visa", fallback: "Visa Success Rate" },
];

const AnimatedCounter = memo(function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.4 });

    useEffect(() => {
        if (!isInView) return;

        const prefersReduced =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) {
            const frame = requestAnimationFrame(() => setDisplay(value));
            return () => cancelAnimationFrame(frame);
        }

        const duration = 1600;
        const startTime = performance.now();
        let rafId = 0;

        const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));

            if (progress < 1) {
                rafId = requestAnimationFrame(step);
            }
        };

        rafId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafId);
    }, [isInView, value]);

    return (
        <span ref={ref}>
            {display}
            {suffix}
        </span>
    );
});

function WorldMapDecor() {
    const { scrollYProgress } = useScroll();
    const pathLength = useTransform(scrollYProgress, [0.3, 0.8], [0, 1]);

    return (
        <svg
            viewBox="0 0 400 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full opacity-[0.06] dark:opacity-[0.08] pointer-events-none"
            aria-hidden="true"
        >
            <circle cx="80" cy="60" r="20" fill="currentColor" className="text-accent" />
            <circle cx="100" cy="70" r="15" fill="currentColor" className="text-accent" />
            <circle cx="70" cy="80" r="12" fill="currentColor" className="text-accent" />
            <circle cx="200" cy="50" r="14" fill="currentColor" className="text-accent" />
            <circle cx="215" cy="60" r="12" fill="currentColor" className="text-accent" />
            <circle cx="190" cy="65" r="10" fill="currentColor" className="text-accent" />
            <circle cx="280" cy="65" r="18" fill="currentColor" className="text-accent" />
            <circle cx="300" cy="75" r="14" fill="currentColor" className="text-accent" />
            <circle cx="260" cy="80" r="12" fill="currentColor" className="text-accent" />
            <circle cx="320" cy="145" r="15" fill="currentColor" className="text-accent" />
            <circle cx="335" cy="140" r="10" fill="currentColor" className="text-accent" />
            <circle cx="120" cy="130" r="14" fill="currentColor" className="text-accent" />
            <circle cx="115" cy="150" r="10" fill="currentColor" className="text-accent" />
            <circle cx="210" cy="110" r="16" fill="currentColor" className="text-accent" />
            <circle cx="220" cy="130" r="12" fill="currentColor" className="text-accent" />

            <circle cx="195" cy="48" r="3" fill="currentColor" className="text-accent" opacity="0.8" />
            <circle cx="210" cy="52" r="3" fill="currentColor" className="text-accent" opacity="0.8" />
            <circle cx="90" cy="55" r="3" fill="currentColor" className="text-accent" opacity="0.8" />
            <circle cx="330" cy="148" r="3" fill="currentColor" className="text-accent" opacity="0.8" />

            <motion.path d="M270 75 Q 230 20 195 48" stroke="currentColor" className="text-accent" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.4" style={{ pathLength }} />
            <motion.path d="M270 75 Q 230 30 210 52" stroke="currentColor" className="text-accent" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.4" style={{ pathLength }} />
            <motion.path d="M270 75 Q 180 30 90 55" stroke="currentColor" className="text-accent" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.4" style={{ pathLength }} />
            <motion.path d="M270 75 Q 300 120 330 148" stroke="currentColor" className="text-accent" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.4" style={{ pathLength }} />
        </svg>
    );
}

export function AboutSection() {
    const { theme, systemTheme } = useTheme();
    const mounted = useMounted();
    const { t } = useTranslation();
    const { openModal } = useBookingModal();
    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = mounted && currentTheme === "dark";
    const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

    return (
        <section id="about" className="py-16 md:py-24 bg-background overflow-hidden">
            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4 md:mb-6 text-primary text-center lg:text-left">
                        {t("home.about.title", undefined, "Why Students Trust Us")}
                    </h2>
                    <p
                        className={cn(
                            "text-base md:text-lg mb-7 leading-relaxed text-center lg:text-left",
                            isDark ? "text-white/70" : "text-muted-foreground"
                        )}
                    >
                        {t(
                            "home.about.description",
                            undefined,
                            "We've helped hundreds of Bangladeshi students achieve their dreams of studying abroad. Our team combines personal experience with professional expertise."
                        )}
                    </p>

                    <motion.ul
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="space-y-3.5 mb-8 text-left"
                    >
                        {[0, 1, 2, 3].map((index) => (
                            <motion.li
                                key={index}
                                variants={itemVariants}
                                className="flex items-start gap-3 font-medium text-sm sm:text-base leading-snug text-foreground"
                            >
                                <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                <span>{t(`home.about.features.${index}`, undefined, featureFallbacks[index])}</span>
                            </motion.li>
                        ))}
                    </motion.ul>
                    <div className="flex justify-center lg:justify-start">
                        <motion.div whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto rounded-full text-base px-8 min-h-[48px] font-semibold shadow-md"
                                onClick={() => openModal()}
                            >
                                {t("home.about.ctaButton", undefined, "Chat With Us")}
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Stats Grid with World Map Background (2+1 layout on narrow mobile prevents 3-col Bengali cramping) */}
                <div className="relative">
                    <WorldMapDecor />

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 sm:gap-4 md:gap-6 relative z-10">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.labelKey}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ delay: index * 0.08, duration: 0.55, ease: EASE_OUT_EXPO }}
                                className={cn(
                                    "surface-card relative p-4 sm:p-5 md:p-8 rounded-2xl text-center flex flex-col items-center justify-center overflow-hidden",
                                    index === 2 && "col-span-2 sm:col-span-1"
                                )}
                            >
                                <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold text-accent mb-1 md:mb-2 tabular-nums">
                                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                </h3>
                                <p
                                    className={cn(
                                        "font-medium text-xs sm:text-sm md:text-base leading-snug",
                                        isDark ? "text-white/75" : "text-muted-foreground"
                                    )}
                                >
                                    {t(stat.labelKey, undefined, stat.fallback)}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
