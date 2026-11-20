"use client";

import {
    FileCheck,
    ScrollText,
    Coins,
    Megaphone,
    GraduationCap,
    Landmark,
    ChevronDown,
    ArrowRight,
} from "lucide-react";
import { useState, useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/LanguageContext";
import { useBookingModal } from "@/context/BookingModalContext";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const subscribeDesktop = (callback: () => void) => {
    const mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", callback);
    return () => mq.removeEventListener("change", callback);
};

const getDesktopSnapshot = () => window.matchMedia("(min-width: 768px)").matches;

const items = [
    {
        id: "lom",
        title: "LOM / SOP Solution",
        description:
            "We craft your story, not just edit grammar. Our experts help you write compelling Letters of Motivation and SOPs that admissions officers actually read.",
        details: "Includes brainstorming sessions, up to 3 review rounds, and plagiarism checks.",
        icon: ScrollText,
    },
    {
        id: "offer",
        title: "Offer Letter",
        description:
            "Fast-tracked applications via our university network. We ensure your application is complete and error-free to maximize acceptance chances.",
        details: "Direct communication with university admissions and priority processing.",
        icon: Megaphone,
    },
    {
        id: "visa",
        title: "Visa Support",
        description:
            "End-to-end guidance from appointment booking to mock interviews. We know the checklists inside out.",
        details: "Document verification, embassy interview prep, and form filling assistance.",
        icon: FileCheck,
    },
    {
        id: "selection",
        title: "University Selection",
        description:
            "Oxford or Toronto? We help you shortlist unis that fit your vibe, budget, and goals.",
        details: "Personalized shortlisting based on profile evaluation and career goals.",
        icon: GraduationCap,
    },
    {
        id: "bank",
        title: "Bank Solvency",
        description:
            "Struggling to show funds? We guide you on proper documentation, blocked accounts, and financial proof strategies that satisfy visa officers.",
        details: "Step-by-step guidance on blocked accounts and sponsor documentation.",
        icon: Landmark,
    },
    {
        id: "scholarship",
        title: "Scholarship Hunting",
        description:
            "Studying abroad is expensive. We find hidden financial aid options and help you apply effectively.",
        details: "Assistance with DAAD, Erasmus+, and university-specific scholarships.",
        icon: Coins,
    },
];

export function ServicesSection() {
    const { t } = useTranslation();
    const { openModal } = useBookingModal();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [activeDot, setActiveDot] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, () => false);

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const cardWidth = container.firstElementChild?.clientWidth || container.offsetWidth;
        const idx = Math.round(container.scrollLeft / (cardWidth + 16));
        setActiveDot(Math.min(items.length - 1, Math.max(0, idx)));
    };

    const scrollToCard = (index: number) => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const cardWidth = container.firstElementChild?.clientWidth || container.offsetWidth;
        container.scrollTo({ left: index * (cardWidth + 16), behavior: "smooth" });
        setActiveDot(index);
    };

    return (
        <section id="services" className="py-16 md:py-28 bg-surface/60 dark:bg-card/40 border-y border-border/50 relative overflow-hidden">
            {/* Subtle background accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[35%] h-[35%] bg-accent/[0.04] rounded-full blur-3xl" />
                <div className="absolute top-[20%] -right-[10%] w-[25%] h-[25%] bg-primary/[0.04] rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                        className="text-3xl md:text-5xl font-bold font-heading mb-4 md:mb-5 text-primary"
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
                    className="flex items-start md:items-stretch md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-pl-4 pb-4 md:pb-0 -mx-4 px-4 md:mx-auto md:px-0 scrollbar-hide"
                >
                    {items.map((item, i) => {
                        const isExpanded = expandedId === i;
                        const detailsId = `service-details-${item.id}`;
                        const translatedTitle = t(`home.services.items.${item.id}.title`, undefined, item.title);

                        return (
                            <motion.div
                                key={item.id}
                                initial={isDesktop ? { opacity: 0, y: 20 } : false}
                                whileInView={isDesktop ? { opacity: 1, y: 0 } : undefined}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.5, delay: isDesktop ? i * 0.07 : 0, ease: EASE_OUT_EXPO }}
                                className="surface-card relative group overflow-hidden rounded-2xl p-6 md:p-7 flex flex-col w-[80vw] sm:w-[310px] md:w-auto md:min-w-0 snap-start shrink-0 md:shrink"
                            >
                                {/* Unified Brand Icon Container */}
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 bg-accent/10 border border-accent/20 text-accent group-hover:bg-accent/15 transition-colors">
                                    <item.icon className="h-5 w-5" />
                                </div>

                                {/* Content */}
                                <h3 className="font-heading font-semibold text-xl text-primary mb-2.5">
                                    {translatedTitle}
                                </h3>
                                <p className="font-sans text-sm text-muted-foreground leading-relaxed flex-grow">
                                    {t(`home.services.items.${item.id}.description`, undefined, item.description)}
                                </p>

                                {/* Expandable Details */}
                                <motion.div
                                    id={detailsId}
                                    initial={false}
                                    animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-3.5 mt-3.5 border-t border-border/50 space-y-3">
                                        <p className="text-xs font-medium text-foreground/90 leading-relaxed">
                                            {t(`home.services.items.${item.id}.details`, undefined, item.details)}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => openModal({ topic: `${item.title} Inquiry` })}
                                            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-accent/15 hover:bg-accent text-accent hover:text-slate-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            <span>
                                                {t("home.services.getHelpPrefix", undefined, "Get Help with ")}
                                                {translatedTitle}
                                            </span>
                                            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Explicit Semantic Expand Button */}
                                <button
                                    type="button"
                                    onClick={() => setExpandedId(isExpanded ? null : i)}
                                    aria-expanded={isExpanded}
                                    aria-controls={detailsId}
                                    className="mt-4 pt-3 border-t border-border/40 w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-accent transition-colors min-h-[44px] text-left"
                                >
                                    <span>
                                        {isExpanded
                                            ? t("home.services.hideDeliverables", undefined, "Hide deliverables")
                                            : t("home.services.includedDeliverables", undefined, "Included deliverables")}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            "w-4 h-4 transition-transform duration-200 shrink-0",
                                            isExpanded && "rotate-180 text-accent"
                                        )}
                                    />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="flex justify-center items-center gap-0.5 mt-4 md:hidden">
                    {items.map((item, i) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => scrollToCard(i)}
                            aria-label={`View ${item.title}`}
                            className="min-h-[44px] min-w-[32px] px-1.5 flex items-center justify-center"
                        >
                            <span
                                className={cn(
                                    "block h-1.5 rounded-full transition-all duration-300",
                                    activeDot === i ? "w-6 bg-accent" : "w-1.5 bg-accent/30"
                                )}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
