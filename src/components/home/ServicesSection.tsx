"use client";

import {
    FileCheck,
    ScrollText,
    Coins,
    Megaphone,
    GraduationCap,
    Landmark
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/LanguageContext";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function ServicesSection() {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();
    const currentTheme = theme === "system" ? systemTheme : theme;
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [activeDot, setActiveDot] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const width = scrollContainerRef.current.offsetWidth;
        setActiveDot(Math.round(scrollLeft / width));
    };

    useEffect(() => {
        setMounted(true);
    }, []);
    return (
        <section id="services" className="py-24 bg-surface dark:bg-card relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl opacity-50" />
                <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                        className="text-3xl md:text-5xl font-bold font-heading mb-6 text-primary"
                    >
                        {t("home.services.title")} <span className="text-accent relative inline-block">
                            {t("home.services.titleAccent")}
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                            </svg>
                        </span> {t("home.services.titleSuffix")}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ delay: 0.1, duration: 0.6, ease: EASE_OUT_EXPO }}
                        className={cn(
                            "text-lg",
                            mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground"
                        )}
                    >
                        {t("home.services.subtitle")}
                    </motion.p>
                </div>

                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-auto md:px-0 scrollbar-hide"
                >
                    {items.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setExpandedId(expandedId === i ? null : i)}
                            transition={{ duration: 0.5, delay: i * 0.08, ease: EASE_OUT_EXPO }}
                            className={cn(
                                "relative group cursor-pointer overflow-hidden rounded-3xl p-6 md:p-8 flex flex-col w-[75vw] sm:w-[280px] md:w-auto md:min-w-0 snap-center shrink-0 md:shrink border",
                                mounted && currentTheme === "dark"
                                    ? "bg-[rgba(15,23,42,0.85)] border-white/10 hover:bg-[rgba(15,23,42,0.95)]"
                                    : "bg-white/60 border-black/5 hover:bg-white/80"
                            )}
                        >
                            {/* Icon Container */}
                            <motion.div 
                                whileHover={{ y: -2 }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br ${item.colorClass}`}
                            >
                                <item.icon className={`h-6 w-6 ${item.iconColorClass}`} />
                            </motion.div>

                            {/* Content */}
                            <h3 className="font-heading font-semibold text-xl text-primary mb-3">
                                {item.title}
                            </h3>
                            <p className={cn(
                                "font-sans text-sm leading-relaxed flex-grow line-clamp-3 md:line-clamp-none transition-all",
                                mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground"
                            )}>
                                {item.description}
                            </p>

                            <motion.div
                                initial={false}
                                animate={{ height: expandedId === i ? "auto" : 0, opacity: expandedId === i ? 1 : 0 }}
                                className="overflow-hidden"
                            >
                                <p className="pt-4 text-sm font-medium text-accent">
                                    {item.details}
                                </p>
                            </motion.div>

                            {/* Subtle decorative accent on hover */}
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl" />
                        </motion.div>
                    ))}
                </div>

                <div className="flex justify-center gap-2 mt-6 md:hidden">
                    {items.map((_, i) => (
                        <div 
                            key={i} 
                            className={cn("h-1.5 rounded-full transition-all duration-300", activeDot === i ? "w-6 bg-accent" : "w-1.5 bg-accent/30")} 
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

const items = [
    {
        title: "LOM / SOP Solution",
        description: "We craft your story, not just edit grammar. Our experts help you write compelling Letters of Motivation and SOPs that admissions officers actually read.",
        details: "Includes brainstorming sessions, up to 3 review rounds, and plagiarism checks.",
        icon: ScrollText,
        colorClass: "from-accent/20 to-accent/5",
        iconColorClass: "text-accent"
    },
    {
        title: "Offer Letter",
        description: "Fast-tracked applications via our university network. We ensure your application is complete and error-free to maximize acceptance chances.",
        details: "Direct communication with university admissions and priority processing.",
        icon: Megaphone,
        colorClass: "from-primary/10 to-primary/5",
        iconColorClass: "text-primary dark:text-primary-foreground"
    },
    {
        title: "Visa Support",
        description: "End-to-end guidance from appointment booking to mock interviews. We know the checklists inside out.",
        details: "Document verification, embassy interview prep, and form filling assistance.",
        icon: FileCheck,
        colorClass: "from-green-500/20 to-green-500/5",
        iconColorClass: "text-green-600 dark:text-green-400"
    },
    {
        title: "University Selection",
        description: "Oxford or Toronto? We help you shortlist unis that fit your vibe, budget, and goals.",
        details: "Personalized shortlisting based on profile evaluation and career goals.",
        icon: GraduationCap,
        colorClass: "from-blue-500/20 to-blue-500/5",
        iconColorClass: "text-blue-600 dark:text-blue-400"
    },
    {
        title: "Bank Solvency",
        description: "Struggling to show funds? We guide you on proper documentation, blocked accounts, and financial proof strategies that satisfy visa officers.",
        details: "Step-by-step guidance on blocked accounts and sponsor documentation.",
        icon: Landmark,
        colorClass: "from-purple-500/20 to-purple-500/5",
        iconColorClass: "text-purple-600 dark:text-purple-400"
    },
    {
        title: "Scholarship Hunting",
        description: "Studying abroad is expensive. We find hidden financial aid options and help you apply effectively.",
        details: "Assistance with DAAD, Erasmus+, and university-specific scholarships.",
        icon: Coins,
        colorClass: "from-yellow-500/20 to-yellow-500/5",
        iconColorClass: "text-yellow-600 dark:text-yellow-400"
    }
];
