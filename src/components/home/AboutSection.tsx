"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, memo } from "react";
import { CheckCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageContext";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

const featureFallbacks = [
    "Zero Fraud Risk: We NEVER hold your original passport or documents",
    "No Advance Fees: You pay only after service delivery (consultation excluded)",
    "Connections with 200+ universities worldwide",
    "BPMN 2.0 optimized workflows for faster, error-free applications",
];

const stats = [
    { value: 200, suffix: "+", labelKey: "home.about.stats.consultations", fallback: "Consultations Done" },
    { value: 20, suffix: "+", labelKey: "home.about.stats.countries", fallback: "Countries" },
    { value: 98, suffix: "%", labelKey: "home.about.stats.visa", fallback: "Visa Success Rate" },
];

const AnimatedCounter = memo(function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    useEffect(() => {
        if (!isInView) return;

        const duration = 2000;
        const startTime = performance.now();

        const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * value);

            setDisplay(current);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }, [isInView, value]);

    return (
        <span ref={ref}>
            {display}{suffix}
        </span>
    );
});

// Simplified world map dots representing key destination cities
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
            {/* Simplified continent outlines as dot clusters */}
            {/* North America */}
            <circle cx="80" cy="60" r="20" fill="currentColor" className="text-accent" />
            <circle cx="100" cy="70" r="15" fill="currentColor" className="text-accent" />
            <circle cx="70" cy="80" r="12" fill="currentColor" className="text-accent" />

            {/* Europe */}
            <circle cx="200" cy="50" r="14" fill="currentColor" className="text-accent" />
            <circle cx="215" cy="60" r="12" fill="currentColor" className="text-accent" />
            <circle cx="190" cy="65" r="10" fill="currentColor" className="text-accent" />

            {/* Asia */}
            <circle cx="280" cy="65" r="18" fill="currentColor" className="text-accent" />
            <circle cx="300" cy="75" r="14" fill="currentColor" className="text-accent" />
            <circle cx="260" cy="80" r="12" fill="currentColor" className="text-accent" />

            {/* Australia */}
            <circle cx="320" cy="145" r="15" fill="currentColor" className="text-accent" />
            <circle cx="335" cy="140" r="10" fill="currentColor" className="text-accent" />

            {/* South America */}
            <circle cx="120" cy="130" r="14" fill="currentColor" className="text-accent" />
            <circle cx="115" cy="150" r="10" fill="currentColor" className="text-accent" />

            {/* Africa */}
            <circle cx="210" cy="110" r="16" fill="currentColor" className="text-accent" />
            <circle cx="220" cy="130" r="12" fill="currentColor" className="text-accent" />

            {/* Gold accent dots on key cities */}
            {/* London */}
            <circle cx="195" cy="48" r="3" fill="currentColor" className="text-accent" opacity="0.8">
                <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Berlin */}
            <circle cx="210" cy="52" r="3" fill="currentColor" className="text-accent" opacity="0.8">
                <animate attributeName="r" values="3;6;3" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.5s" repeatCount="indefinite" />
            </circle>
            {/* Toronto */}
            <circle cx="90" cy="55" r="3" fill="currentColor" className="text-accent" opacity="0.8">
                <animate attributeName="r" values="3;6;3" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite" />
            </circle>
            {/* Sydney */}
            <circle cx="330" cy="148" r="3" fill="currentColor" className="text-accent" opacity="0.8">
                <animate attributeName="r" values="3;6;3" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.2s" repeatCount="indefinite" />
            </circle>

            {/* Connecting arcs from Bangladesh to key cities */}
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
    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = mounted && currentTheme === "dark";
    const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

    return (
        <section id="about" className="py-16 md:py-24 bg-background overflow-hidden">
            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4 md:mb-6 text-primary text-center lg:text-left">
                        {t("home.about.title", undefined, "Why Students Trust Us")}
                    </h2>
                    <p
                        className={cn(
                            "text-base md:text-lg mb-8 leading-relaxed text-center lg:text-left",
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
                        className="space-y-4 mb-8 text-left"
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
                        <motion.div whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto rounded-full text-base px-8 h-12 font-semibold shadow-md"
                                onClick={() => window.dispatchEvent(new CustomEvent("open-booking-modal"))}
                            >
                                {t("home.about.ctaButton", undefined, "Chat With Us")}
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Stats Grid with World Map Background */}
                <div className="relative">
                    {/* World Map Decoration */}
                    <WorldMapDecor />

                    <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5 sm:gap-4 md:gap-6 relative z-10">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.labelKey}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ delay: index * 0.12, duration: 0.7, ease: EASE_OUT_EXPO }}
                                className={cn(
                                    "relative backdrop-blur-xl p-3 sm:p-5 md:p-8 rounded-2xl shadow-lg border text-center flex flex-col items-center justify-center hover:border-accent hover:shadow-xl hover:shadow-accent/5 transition-all duration-500 ease-out overflow-hidden",
                                    isDark
                                        ? "bg-[rgba(15,23,42,0.85)] border-white/10 hover:bg-[rgba(15,23,42,0.95)]"
                                        : "bg-white/60 border-black/5 hover:bg-white/80"
                                )}
                            >
                                <h3 className="text-xl sm:text-2xl md:text-5xl font-bold text-accent mb-1 md:mb-2">
                                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                </h3>
                                <p
                                    className={cn(
                                        "font-medium text-[11px] sm:text-xs md:text-base leading-tight",
                                        isDark ? "text-white/70" : "text-muted-foreground"
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
