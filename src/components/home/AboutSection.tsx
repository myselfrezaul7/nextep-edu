"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
    "Zero Fraud Risk: We NEVER hold your original passport or documents",
    "No Advance Fees: You pay only after service delivery (consultation excluded)",
    "Connections with 200+ universities worldwide",
    "BPMN 2.0 optimized workflows for faster, error-free applications",
];

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

const stats = [
    { value: 50, suffix: "+", label: "Students Placed" },
    { value: 20, suffix: "+", label: "Countries" },
    { value: 1, suffix: "M+", label: "Scholarships Secured (BDT)" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
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
}

// Simplified world map dots representing key destination cities
function WorldMapDecor() {
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
            <circle cx="195" cy="48" r="3" fill="currentColor" className="text-accent" opacity="0.8" />
            {/* Berlin */}
            <circle cx="210" cy="52" r="3" fill="currentColor" className="text-accent" opacity="0.8" />
            {/* Toronto */}
            <circle cx="90" cy="55" r="3" fill="currentColor" className="text-accent" opacity="0.8" />
            {/* Sydney */}
            <circle cx="330" cy="148" r="3" fill="currentColor" className="text-accent" opacity="0.8" />

            {/* Connecting arcs from Bangladesh to key cities */}
            <path d="M270 75 Q 230 20 195 48" stroke="currentColor" className="text-accent" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.4" />
            <path d="M270 75 Q 230 30 210 52" stroke="currentColor" className="text-accent" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.4" />
            <path d="M270 75 Q 180 30 90 55" stroke="currentColor" className="text-accent" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.4" />
            <path d="M270 75 Q 300 120 330 148" stroke="currentColor" className="text-accent" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.4" />
        </svg>
    );
}

export function AboutSection() {
    return (
        <section id="about" className="py-16 md:py-24 bg-background overflow-hidden">
            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-primary">Why Students Trust Us</h2>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        We&apos;ve helped hundreds of Bangladeshi students achieve their dreams of studying abroad. Our team combines personal experience with professional expertise.
                    </p>

                    <motion.ul
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="space-y-4 mb-8"
                    >
                        {features.map((feature, i) => (
                            <motion.li
                                key={i}
                                variants={itemVariants}
                                className="flex items-center gap-3 font-medium text-foreground"
                            >
                                <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                                {feature}
                            </motion.li>
                        ))}
                    </motion.ul>
                    <Button
                        size="lg"
                        onClick={() => document.getElementById('booking-modal')?.classList.remove('hidden')}
                    >
                        Chat With Us
                    </Button>
                </motion.div>

                {/* Stats Grid with World Map Background */}
                <div className="relative">
                    {/* World Map Decoration */}
                    <WorldMapDecor />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 relative z-10">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                className="relative bg-card/95 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-border/30 text-center hover:border-accent hover:shadow-xl hover:shadow-accent/5 transition-all duration-500 ease-out overflow-hidden"
                            >
                                <h3 className="text-4xl md:text-5xl font-bold text-accent mb-2">
                                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                </h3>
                                <p className="font-medium text-muted-foreground">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
