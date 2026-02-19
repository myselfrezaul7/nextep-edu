"use client";

import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
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

                <BentoGrid className="max-w-7xl mx-auto md:grid-cols-4">
                    {items.map((item, i) => (
                        <BentoGridItem
                            key={i}
                            title={item.title}
                            description={item.description}
                            header={item.header}
                            icon={item.icon}
                        />
                    ))}
                </BentoGrid>
            </div>
        </section>
    );
}

const Skeleton = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
    <div className={`flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 ${className}`}>
        {children}
    </div>
);

const items = [
    {
        title: "LOM / SOP Solution",
        description: "We craft your story, not just edit grammar. Our experts help you write compelling Letters of Motivation and SOPs that admissions officers actually read.",
        header: (
            <Skeleton className="items-center justify-center text-accent/20">
                <ScrollText className="w-20 h-20" />
            </Skeleton>
        ),
        icon: <ScrollText className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Offer Letter",
        description: "Fast-tracked applications via our university network. We ensure your application is complete and error-free to maximize acceptance chances.",
        header: (
            <Skeleton className="items-center justify-center text-primary/10">
                <Megaphone className="w-20 h-20" />
            </Skeleton>
        ),
        icon: <Megaphone className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Visa Support",
        description: "End-to-end guidance from appointment booking to mock interviews. We know the checklists inside out.",
        header: (
            <Skeleton className="items-center justify-center text-green-500/10">
                <FileCheck className="w-20 h-20" />
            </Skeleton>
        ),
        icon: <FileCheck className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "University Selection",
        description: "Oxford or Toronto? We help you shortlist unis that fit your vibe, budget, and goals.",
        header: (
            <Skeleton className="justify-center items-center">
                <div className="grid grid-cols-3 gap-4 opacity-50">
                    <div className="h-12 w-12 rounded-full bg-accent/20" />
                    <div className="h-12 w-12 rounded-full bg-primary/20" />
                    <div className="h-12 w-12 rounded-full bg-accent/20" />
                </div>
            </Skeleton>
        ),
        icon: <GraduationCap className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Bank Solvency",
        description: " struggling to show funds? We guide you on proper documentation, blocked accounts, and financial proof strategies that satisfy visa officers.",
        header: (
            <Skeleton className="items-center justify-center text-purple-500/10">
                <Landmark className="w-20 h-20" />
            </Skeleton>
        ),
        icon: <Landmark className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Scholarship Hunting",
        description: "Studying abroad is expensive. We find hidden financial aid options and help you apply effectively.",
        header: (
            <Skeleton className="items-center justify-center text-yellow-500/10">
                <Coins className="w-20 h-20" />
            </Skeleton>
        ),
        icon: <Coins className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Pre-Departure",
        description: "Blocked accounts, housing, packing lists—we prepare you for life abroad before you even board the plane.",
        header: (
            <Skeleton className="items-center justify-center text-blue-500/10">
                <Plane className="w-20 h-20" />
            </Skeleton>
        ),
        icon: <Plane className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "A Global Network",
        description: "Join a community of students who have gone before you. Get tips, support, and connections in your new city.",
        header: (
            <Skeleton className="items-center justify-center relative overflow-hidden">
                <Globe className="w-32 h-32 absolute -right-10 -bottom-10 text-slate-500/10" />
                <div className="z-10 text-center px-4">
                    <span className="text-4xl font-bold text-accent">500+</span>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Students Placed</p>
                </div>
            </Skeleton>
        ),
        icon: <Globe className="h-4 w-4 text-neutral-500" />,
    },
];
