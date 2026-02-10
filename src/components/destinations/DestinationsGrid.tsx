"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { destinations } from "@/data/destinations";

// Top 6 destinations to show on homepage
const TOP_SLUGS = ["germany", "usa", "australia", "canada", "uk", "south-korea"];
const topDestinations = TOP_SLUGS
    .map(slug => destinations[slug])
    .filter(Boolean);

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
        <div>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {topDestinations.map((destination) => (
                    <motion.div variants={item} key={destination.slug} className="h-full">
                        <Link href={`/destinations/${destination.slug}`} className="group block h-full">
                            <div className="relative h-full overflow-hidden rounded-2xl border border-border/30 bg-card/95 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
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

            {/* See All Destinations Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-center mt-12"
            >
                <Link
                    href="/destinations"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                    See All Destinations
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </motion.div>
        </div>
    );
}
