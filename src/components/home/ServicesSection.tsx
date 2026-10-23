"use client";

import {
    FileCheck,
    ScrollText,
    Coins,
    Megaphone,
    GraduationCap,
    Landmark,
    ChevronDown
} from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/LanguageContext";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const items = [
    {
        id: "lom",
        title: "LOM / SOP Solution",
        description: "We craft your story, not just edit grammar. Our experts help you write compelling Letters of Motivation and SOPs that admissions officers actually read.",
        details: "Includes brainstorming sessions, up to 3 review rounds, and plagiarism checks.",
        icon: ScrollText,
    },
    {
        id: "offer",
        title: "Offer Letter",
        description: "Fast-tracked applications via our university network. We ensure your application is complete and error-free to maximize acceptance chances.",
        details: "Direct communication with university admissions and priority processing.",
        icon: Megaphone,
    },
    {
        id: "visa",
        title: "Visa Support",
        description: "End-to-end guidance from appointment booking to mock interviews. We know the checklists inside out.",
        details: "Document verification, embassy interview prep, and form filling assistance.",
        icon: FileCheck,
    },
    {
        id: "selection",
        title: "University Selection",
        description: "Oxford or Toronto? We help you shortlist unis that fit your vibe, budget, and goals.",
        details: "Personalized shortlisting based on profile evaluation and career goals.",
        icon: GraduationCap,
    },
    {
        id: "bank",
        title: "Bank Solvency",
        description: "Struggling to show funds? We guide you on proper documentation, blocked accounts, and financial proof strategies that satisfy visa officers.",
        details: "Step-by-step guidance on blocked accounts and sponsor documentation.",
        icon: Landmark,
    },
    {
        id: "scholarship",
        title: "Scholarship Hunting",
        description: "Studying abroad is expensive. We find hidden financial aid options and help you apply effectively.",
        details: "Assistance with DAAD, Erasmus+, and university-specific scholarships.",
        icon: Coins,
    }
];

export function ServicesSection() {
    const { t } = useTranslation();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [activeDot, setActiveDot] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const width = scrollContainerRef.current.offsetWidth;
        setActiveDot(Math.round(scrollLeft / width));
    };

    return (
        <section id="services" className="py-20 md:py-28 bg-surface/60 dark:bg-card/40 border-y border-border/50 relative overflow-hidden">
            {/* Subtle background accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[35%] h-[35%] bg-accent/[0.04] rounded-full blur-3xl" />
                <div className="absolute top-[20%] -right-[10%] w-[25%] h-[25%] bg-primary/[0.04] rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-14 md:mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                        className="text-3xl md:text-5xl font-bold font-heading mb-5 text-primary"
                    >
                        {t("home.services.title", undefined, "What We ")}{" "}
                        <span className="text-accent">
                            {t("home.services.titleAccent", undefined, "Actually")}
                        </span>{" "}
                        {t("home.services.titleSuffix", undefined, "Do For You")}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ delay: 0.1, duration: 0.6, ease: EASE_OUT_EXPO }}
                        className="text-base md:text-lg text-muted-foreground"
                    >
                        {t(
                            "home.services.subtitle",
                            undefined,
                            "Detailed SOPs, visa support, scholarship hunting - we handle the gritty details so you can focus on packing your bags."
                        )}
                    </motion.p>
                </div>

                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-auto md:px-0 scrollbar-hide"
                >
                    {items.map((item, i) => {
                        const isExpanded = expandedId === i;
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                onClick={() => setExpandedId(isExpanded ? null : i)}
                                transition={{ duration: 0.5, delay: i * 0.07, ease: EASE_OUT_EXPO }}
                                className="surface-card relative group cursor-pointer overflow-hidden rounded-2xl p-6 md:p-7 flex flex-col w-[78vw] sm:w-[300px] md:w-auto md:min-w-0 snap-center shrink-0 md:shrink"
                            >
                                {/* Unified Brand Icon Container */}
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 bg-accent/10 border border-accent/20 text-accent group-hover:bg-accent/15 transition-colors">
                                    <item.icon className="h-5 w-5" />
                                </div>

                                {/* Content */}
                                <h3 className="font-heading font-semibold text-xl text-primary mb-2.5">
                                    {t(`home.services.items.${item.id}.title`, undefined, item.title)}
                                </h3>
                                <p className="font-sans text-sm text-muted-foreground leading-relaxed flex-grow">
                                    {t(`home.services.items.${item.id}.description`, undefined, item.description)}
                                </p>

                                {/* Expandable Details */}
                                <motion.div
                                    initial={false}
                                    animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                                    className="overflow-hidden"
                                >
                                    <p className="pt-3.5 mt-3.5 border-t border-border/50 text-xs font-medium text-foreground/90 leading-relaxed">
                                        {item.details}
                                    </p>
                                </motion.div>

                                {/* Explicit Interactive Affordance */}
                                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-medium text-muted-foreground group-hover:text-accent transition-colors">
                                    <span>{isExpanded ? "Hide deliverables" : "Included deliverables"}</span>
                                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isExpanded && "rotate-180 text-accent")} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="flex justify-center gap-2 mt-6 md:hidden">
                    {items.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                activeDot === i ? "w-6 bg-accent" : "w-1.5 bg-accent/30"
                            )}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
