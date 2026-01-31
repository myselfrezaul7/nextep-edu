"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { destinations } from "@/data/destinations";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 50 } }
};

export function DestinationsGrid() {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
            {Object.values(destinations).map((destination) => (
                <motion.div variants={item} key={destination.slug} className="h-full">
                    <Link href={`/destinations/${destination.slug}`} className="group block h-full">
                        <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-surface dark:bg-card shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                            {/* Image Wrapper */}
                            <div className="relative h-64 overflow-hidden">
                                <Image
                                    src={destination.heroImage}
                                    alt={destination.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                                <div className="absolute bottom-6 left-6 text-white z-10">
                                    <h3 className="text-2xl font-bold font-heading mb-1">{destination.name}</h3>
                                    <div className="flex items-center gap-2 text-sm font-medium text-white/90 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                        Explore <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {destination.benefits.slice(0, 2).map((benefit, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 text-accent">
                                                <benefit.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-foreground">{benefit.title}</h4>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{benefit.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
}
