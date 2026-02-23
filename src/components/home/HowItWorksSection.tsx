"use client";

import { motion } from "framer-motion";
import { PhoneCall, ClipboardList, SendHorizonal, PlaneTakeoff } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
    {
        number: "01",
        title: "Book a Call",
        description: "Schedule a free 30-minute consultation. We listen, understand your goals, and assess your profile.",
        icon: PhoneCall,
    },
    {
        number: "02",
        title: "Get Your Plan",
        description: "Receive a personalized roadmap with university shortlists, timelines, and a clear checklist.",
        icon: ClipboardList,
    },
    {
        number: "03",
        title: "Apply & Prepare",
        description: "We handle SOPs, documents, visa applications, and mock interviews. You stay stress-free.",
        icon: SendHorizonal,
    },
    {
        number: "04",
        title: "Fly Abroad",
        description: "Pre-departure briefing, blocked accounts, housing tips — you're fully ready for your new life.",
        icon: PlaneTakeoff,
    },
];

export function HowItWorksSection() {
    return (
        <section className="py-16 md:py-28 bg-background relative overflow-hidden">
            {/* Subtle background accents */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[10%] right-[5%] w-[250px] h-[250px] bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16 md:mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm md:text-base font-medium mb-4">
                            Simple Process
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold font-heading mb-4 text-primary"
                    >
                        How It Works
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        From your first call to your flight — four simple steps to studying abroad.
                    </motion.p>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 max-w-6xl mx-auto">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.12 }}
                            className="relative group"
                        >
                            {/* Connector line — hidden on mobile, visible on lg between cards */}
                            {i < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-12 left-[calc(100%+0.25rem)] w-[calc(100%-3rem)] border-t-2 border-dashed border-accent/20 z-0 pointer-events-none" />
                            )}

                            <div className="relative bg-card/80 dark:bg-card/50 backdrop-blur-sm border border-border/40 rounded-2xl p-6 md:p-8 text-center hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 h-full flex flex-col items-center overflow-hidden">
                                {/* Top glow line on hover */}
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Step number badge */}
                                <div className="text-xs font-bold tracking-widest text-accent/60 mb-4">
                                    STEP {step.number}
                                </div>

                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                                    <step.icon className="w-7 h-7 text-accent" />
                                </div>

                                {/* Content */}
                                <h3 className="font-heading font-bold text-xl text-primary mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-center mt-12 md:mt-16"
                >
                    <Button
                        size="lg"
                        className="rounded-full text-base px-8"
                        onClick={() => document.getElementById('booking-modal')?.classList.remove('hidden')}
                    >
                        Start With Step 1 — It&apos;s Free
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
