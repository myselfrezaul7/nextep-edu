"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { PhoneCall, ClipboardList, SendHorizonal, PlaneTakeoff, Clock } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageContext";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const stepsData = [
    {
        id: "call",
        icon: PhoneCall,
        timeEstimate: "15 mins",
        fallbackTitle: "Book a Call",
        fallbackDesc: "Schedule a free 30-minute consultation. We listen, understand your goals, and assess your profile.",
    },
    {
        id: "plan",
        icon: ClipboardList,
        timeEstimate: "1-2 days",
        fallbackTitle: "Get Your Plan",
        fallbackDesc: "Receive a personalized roadmap with university shortlists, timelines, and a clear checklist.",
    },
    {
        id: "apply",
        icon: SendHorizonal,
        timeEstimate: "2-4 weeks",
        fallbackTitle: "Apply & Prepare",
        fallbackDesc: "We handle SOPs, documents, visa applications, and mock interviews. You stay stress-free.",
    },
    {
        id: "fly",
        icon: PlaneTakeoff,
        timeEstimate: "3-6 months",
        fallbackTitle: "Fly Abroad",
        fallbackDesc: "Pre-departure briefing, blocked accounts, housing tips - you're fully ready for your new life.",
    },
];

export function HowItWorksSection() {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });
    const pathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

    return (
        <section className="py-20 md:py-28 bg-background relative overflow-hidden">
            {/* Subtle background accents */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-[300px] h-[300px] bg-accent/[0.04] rounded-full blur-3xl" />
                <div className="absolute bottom-[10%] right-[5%] w-[250px] h-[250px] bg-primary/[0.04] rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-12 md:mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                    >
                        <span className="inline-block px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold tracking-wider uppercase mb-4">
                            {t("home.howItWorks.badge", undefined, "Simple Process")}
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                        className="text-3xl md:text-5xl font-bold font-heading mb-4 text-primary"
                    >
                        {t("home.howItWorks.title", undefined, "How It Works")}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT_EXPO }}
                        className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
                    >
                        {t("home.howItWorks.subtitle", undefined, "From your first call to your flight - four simple steps to studying abroad.")}
                    </motion.p>
                </div>

                {/* Steps Grid */}
                <div ref={containerRef} className="relative flex overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl md:mx-auto">
                    {/* SVG Progress Line */}
                    <div className="hidden lg:block absolute top-20 left-[12.5%] w-[75%] h-[2px] z-0 pointer-events-none">
                        <svg className="w-full h-full" preserveAspectRatio="none">
                            <line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" className="text-accent/20" strokeWidth="2" strokeDasharray="6 6" />
                            <motion.line
                                x1="0" y1="1" x2="100%" y2="1"
                                stroke="currentColor"
                                className="text-accent"
                                strokeWidth="2"
                                style={{ pathLength }}
                            />
                        </svg>
                    </div>

                    {stepsData.map((step, i) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.6, delay: i * 0.12, ease: EASE_OUT_EXPO }}
                            className="relative group w-[78vw] sm:w-[300px] md:w-auto shrink-0 md:shrink snap-center"
                        >
                            <div className="surface-card relative rounded-2xl p-6 md:p-7 text-center h-full flex flex-col items-center overflow-hidden">
                                {/* Step number badge */}
                                <div className="text-[11px] font-bold tracking-widest text-accent/70 mb-4 uppercase">
                                    {t("home.howItWorks.stepLabel", undefined, "STEP")} 0{i + 1}
                                </div>

                                {/* Icon */}
                                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-3.5 group-hover:scale-105 group-hover:bg-accent/15 transition-all duration-300">
                                    <step.icon className="w-6 h-6 text-accent" />
                                </div>

                                {/* Time Estimate */}
                                <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent text-xs font-medium px-3 py-1 rounded-full mb-4">
                                    <Clock className="w-3 h-3" />
                                    <span>{step.timeEstimate}</span>
                                </div>

                                {/* Content */}
                                <h3 className="font-heading font-bold text-xl text-primary mb-2.5">
                                    {t(`home.howItWorks.steps.${step.id}.title`, undefined, step.fallbackTitle)}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                                    {t(`home.howItWorks.steps.${step.id}.description`, undefined, step.fallbackDesc)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-center mt-12 md:mt-16"
                >
                    <Button
                        size="lg"
                        className="rounded-full text-base px-8 h-12 font-semibold"
                        onClick={() => window.dispatchEvent(new CustomEvent("open-booking-modal"))}
                    >
                        {t("home.howItWorks.ctaButton", undefined, "Start With Step 1 - It's Free")}
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
