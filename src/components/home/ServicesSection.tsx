"use client";

import { GraduationCap, FileCheck, Compass, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const services = [
    {
        title: "Picking Your University",
        description: "Oxford or Toronto? Business or Engineering? We sit down with you, understand what you actually want (not what sounds impressive), and help you shortlist unis that fit your vibe, budget, and goals.",
        icon: GraduationCap,
    },
    {
        title: "The Visa Stuff",
        description: "Yeah, visas are a headache. Documents, bank statements, interview prep — it's a lot. We'll handle the paperwork chaos and make sure you walk into that embassy feeling ready.",
        icon: FileCheck,
    },
    {
        title: "Career Planning",
        description: "A degree's great, but then what? We help you think long-term — internships, work permits, industry connections. Because getting a job after graduation matters just as much as getting in.",
        icon: Compass,
    },
    {
        title: "Finding You Money",
        description: "Studying abroad is expensive, we won't sugarcoat that. But there are scholarships out there that most people don't even know about. We find them and help you apply.",
        icon: Coins,
    },
];

export function ServicesSection() {
    return (
        <section id="services" className="py-24 bg-surface dark:bg-card relative">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold font-heading mb-4 text-primary"
                    >
                        What We Actually Do For You
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-muted-foreground"
                    >
                        Here's the deal — we don't just give you a list of universities and wish you luck. We stick with you from day one until you're settled in your dorm room abroad.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-card dark:bg-slate-800/50 p-8 rounded-2xl shadow-sm border border-border/50 hover:border-accent hover:shadow-lg hover:-translate-y-2 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 text-accent group-hover:bg-accent group-hover:text-primary transition-colors">
                                <service.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-primary">{service.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
