"use client";

import {
    FileCheck,
    ScrollText,
    Plane,
    Coins,
    Megaphone,
    GraduationCap,
    Globe,
    Landmark
} from "lucide-react";
import { motion } from "framer-motion";

export function ServicesSection() {
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
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl md:text-5xl font-bold font-heading mb-6 text-primary"
                    >
                        What We <span className="text-accent relative inline-block">
                            Actually
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                            </svg>
                        </span> Do For You
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="text-lg text-muted-foreground"
                    >
                        Detailed SOPs, visa support, scholarship hunting—we handle the gritty details so you can focus on packing your bags.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {items.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className="group relative bg-surface/50 dark:bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 flex flex-col"
                        >
                            {/* Icon Container */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br ${item.colorClass}`}>
                                <item.icon className={`h-6 w-6 ${item.iconColorClass}`} />
                            </div>

                            {/* Content */}
                            <h3 className="font-heading font-semibold text-xl text-primary mb-3">
                                {item.title}
                            </h3>
                            <p className="font-sans text-muted-foreground text-sm leading-relaxed flex-grow">
                                {item.description}
                            </p>

                            {/* Subtle decorative accent on hover */}
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl" />
                        </motion.div>
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
        icon: ScrollText,
        colorClass: "from-accent/20 to-accent/5",
        iconColorClass: "text-accent"
    },
    {
        title: "Offer Letter",
        description: "Fast-tracked applications via our university network. We ensure your application is complete and error-free to maximize acceptance chances.",
        icon: Megaphone,
        colorClass: "from-primary/10 to-primary/5",
        iconColorClass: "text-primary dark:text-primary-foreground"
    },
    {
        title: "Visa Support",
        description: "End-to-end guidance from appointment booking to mock interviews. We know the checklists inside out.",
        icon: FileCheck,
        colorClass: "from-green-500/20 to-green-500/5",
        iconColorClass: "text-green-600 dark:text-green-400"
    },
    {
        title: "University Selection",
        description: "Oxford or Toronto? We help you shortlist unis that fit your vibe, budget, and goals.",
        icon: GraduationCap,
        colorClass: "from-blue-500/20 to-blue-500/5",
        iconColorClass: "text-blue-600 dark:text-blue-400"
    },
    {
        title: "Bank Solvency",
        description: "Struggling to show funds? We guide you on proper documentation, blocked accounts, and financial proof strategies that satisfy visa officers.",
        icon: Landmark,
        colorClass: "from-purple-500/20 to-purple-500/5",
        iconColorClass: "text-purple-600 dark:text-purple-400"
    },
    {
        title: "Scholarship Hunting",
        description: "Studying abroad is expensive. We find hidden financial aid options and help you apply effectively.",
        icon: Coins,
        colorClass: "from-yellow-500/20 to-yellow-500/5",
        iconColorClass: "text-yellow-600 dark:text-yellow-400"
    },
    {
        title: "Pre-Departure",
        description: "Blocked accounts, housing, packing lists—we prepare you for life abroad before you even board the plane.",
        icon: Plane,
        colorClass: "from-teal-500/20 to-teal-500/5",
        iconColorClass: "text-teal-600 dark:text-teal-400"
    },
    {
        title: "A Global Network",
        description: "Join a community of students who have gone before you. Get tips, support, and connections in your new city.",
        icon: Globe,
        colorClass: "from-slate-500/20 to-slate-500/5",
        iconColorClass: "text-slate-600 dark:text-slate-400"
    },
];
