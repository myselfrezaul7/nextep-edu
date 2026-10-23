"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useRef, useSyncExternalStore } from "react";
import { destinations } from "@/data/destinations";
import { useTranslation } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

// Top 6 destinations to show on homepage
const TOP_SLUGS = ["germany", "usa", "australia", "canada", "uk", "south-korea"];
const topDestinations = TOP_SLUGS
    .map(slug => destinations[slug])
    .filter(Boolean);

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } }
};

const subscribeTouch = (callback: () => void) => {
    const media = window.matchMedia("(hover: none)");
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
};

function Card3D({ children, href }: { children: React.ReactNode; href: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const isTouchDevice = useSyncExternalStore(
        subscribeTouch,
        () => window.matchMedia("(hover: none)").matches,
        () => false
    );

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 25 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 25 });

    // Subtle 2.5deg tilt for a refined tactile feel
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["2.5deg", "-2.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-2.5deg", "2.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isTouchDevice || !ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const xPct = (e.clientX - rect.left) / rect.width - 0.5;
        const yPct = (e.clientY - rect.top) / rect.height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000,
                transformStyle: "preserve-3d",
            }}
            className="h-full relative block"
        >
            <Link href={href} className="group block h-full outline-none">
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    style={{
                        rotateX: isTouchDevice ? 0 : rotateX,
                        rotateY: isTouchDevice ? 0 : rotateY,
                    }}
                    className="surface-card relative h-full overflow-hidden rounded-2xl transform-gpu flex flex-col"
                >
                    {children}
                </motion.div>
            </Link>
        </motion.div>
    );
}

export function DestinationsGrid({ featuredOnly = false }: { featuredOnly?: boolean }) {
    const { t } = useTranslation();

    const displayedDestinations = featuredOnly
        ? topDestinations
        : Object.values(destinations);

    return (
        <div>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
                {displayedDestinations.map((destination) => (
                    <motion.div variants={item} key={destination.slug} className="h-full relative z-0 hover:z-10">
                        <Card3D href={`/destinations/${destination.slug}`}>
                            {/* Image Wrapper */}
                            <div className="relative h-48 md:h-56 overflow-hidden bg-slate-200/50 dark:bg-slate-800/50">
                                <Image
                                    src={destination.heroImage}
                                    alt={destination.name}
                                    fill
                                    loading="lazy"
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                                <div className="absolute bottom-4 left-5 right-5 text-white z-10 flex items-end justify-between">
                                    <h3 className="text-xl md:text-2xl font-bold font-heading flex items-center gap-2">
                                        <span>{destination.flag}</span>
                                        <span>{t(`destinations.countries.${destination.slug}.name`, undefined, destination.name)}</span>
                                    </h3>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent bg-slate-950/60 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full group-hover:bg-accent group-hover:text-slate-950 transition-colors duration-200">
                                        {t("common.nav.explore", undefined, "Explore")}
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 md:p-6 flex-grow flex flex-col justify-between">
                                <div className="space-y-3.5">
                                    {destination.benefits.slice(0, 2).map((benefit, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 text-accent mt-0.5">
                                                <benefit.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-foreground">
                                                    {t(`destinations.benefits.${benefit.title}.title`, undefined, benefit.title)}
                                                </h4>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                                                    {t(`destinations.benefits.${benefit.title}.desc`, undefined, benefit.description)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card3D>
                    </motion.div>
                ))}
            </motion.div>

            {/* See All Destinations Button - Only show if featuredOnly is true */}
            {featuredOnly && (
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-center mt-12"
                >
                    <Button size="lg" className="rounded-full text-base px-8 h-12 gap-2" asChild>
                        <Link href="/destinations">
                            <span>{t("common.nav.viewAllDestinations", undefined, "View All Destinations")}</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
