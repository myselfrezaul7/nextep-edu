"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
    "98% of our students get their visas approved",
    "Connections with 500+ universities worldwide",
    "Counselors who've actually studied abroad",
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
    { value: "50+", label: "Students Placed" },
    { value: "20+", label: "Countries" },
    { value: "1M+", label: "Scholarships Secured (BDT)" },
];

export function AboutSection() {
    return (
        <section id="about" className="py-24 bg-background overflow-hidden">
            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-primary">Why Do People Choose Us?</h2>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        Honestly? Because we've been in your shoes. Our team includes people who went through this exact process: the stress, the excitement, the million questions. We know what it's like to feel lost navigating all of this. That's why we don't treat you like just another application file. You're a person with dreams, and we take that seriously.
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

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 text-center hover:border-accent transition-all duration-500 ease-out overflow-hidden"
                        >
                            <h3 className="text-4xl md:text-5xl font-bold text-accent mb-2">{stat.value}</h3>
                            <p className="font-medium text-muted-foreground">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
