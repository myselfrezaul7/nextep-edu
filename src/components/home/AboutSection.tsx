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

        let start = 0;
        const duration = 2000;
        const startTime = performance.now();

        const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
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
                                <CheckCircle className="w-5 h-5 text-accent" />
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

                {/* Stats Grid with animated counters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="relative bg-card/95 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-border/30 text-center hover:border-accent transition-all duration-500 ease-out overflow-hidden"
                        >
                            <h3 className="text-4xl md:text-5xl font-bold text-accent mb-2">
                                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                            </h3>
                            <p className="font-medium text-muted-foreground">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
