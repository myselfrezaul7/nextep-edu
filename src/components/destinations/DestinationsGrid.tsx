"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { destinations } from "@/data/destinations";
import { useTranslation } from "@/i18n/LanguageContext";

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

function Card3D({ children, href }: { children: React.ReactNode, href: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const currentTheme = theme === "system" ? systemTheme : theme;

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

    const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
    const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);

    useEffect(() => {
        setMounted(true);
        setIsTouchDevice(window.matchMedia("(hover: none)").matches);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isTouchDevice || !ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000,
                transformStyle: "preserve-3d",
            }}
            className="h-full relative block"
        >
            <Link href={href} className="group block h-full outline-none">
                <motion.div
                    whileTap={{ scale: 0.97 }}
                    style={{
                        rotateX: isTouchDevice ? 0 : rotateX,
                        rotateY: isTouchDevice ? 0 : rotateY,
                    }}
                    className={cn(
                        "relative h-full overflow-hidden rounded-2xl border backdrop-blur-xl shadow-lg transition-all duration-300 transform-gpu group-hover:shadow-2xl group-active:scale-95 group-hover:z-10",
                        mounted && currentTheme === "dark" ? "bg-[rgba(15,23,42,0.85)] border-white/10" : "bg-white/60 border-black/5"
                    )}
                >
                    {children}

                    {/* Glare effect overlay */}
                    {!isTouchDevice && (
                        <motion.div
                            className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 mix-blend-overlay"
                            style={{
                                background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)`,
                            }}
                        />
                    )}
                </motion.div>
            </Link>
        </motion.div>
    );
}

export function DestinationsGrid({ featuredOnly = false }: { featuredOnly?: boolean }) {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();
    const currentTheme = theme === "system" ? systemTheme : theme;

    useEffect(() => {
        setMounted(true);
    }, []);
    const displayedDestinations = featuredOnly
        ? topDestinations
        : Object.values(destinations);

    return (
        <div>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {displayedDestinations.map((destination) => (
                    <motion.div variants={item} key={destination.slug} className="h-full relative z-0 hover:z-10">
                        <Card3D href={`/destinations/${destination.slug}`}>
                            {/* Image Wrapper with Loading Skeleton Background color */}
                            <div className="relative h-48 md:h-64 overflow-hidden bg-black/5 dark:bg-white/5">
                                <Image
                                    src={destination.heroImage}
                                    alt={destination.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                                <div className="absolute bottom-6 left-6 text-white z-10" style={{ transform: "translateZ(30px)" }}>
                                    <h3 className="text-2xl font-bold font-heading mb-1 flex items-center gap-2">
                                        <span>{destination.flag}</span> {t(`destinations.countries.${destination.slug}.name`, undefined, destination.name)}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm font-medium text-white/90 opacity-100 md:opacity-0 md:group-hover:opacity-100 transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-all duration-500">
                                        {t("common.nav.explore", undefined, "Explore")} <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {destination.benefits.slice(0, 2).map((benefit, i) => (
                                        <div key={i} className="flex items-start gap-3 transform-gpu" style={{ transform: "translateZ(20px)" }}>
                                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 text-accent">
                                                <benefit.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-foreground">{t(`destinations.benefits.${benefit.title}.title`, undefined, benefit.title)}</h4>
                                                <p className={cn(
                                                    "text-xs line-clamp-2",
                                                    mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground"
                                                )}>{t(`destinations.benefits.${benefit.title}.desc`, undefined, benefit.description)}</p>
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-center mt-12"
                >
                    <Link
                        href="/destinations"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        {t("common.nav.viewAllDestinations", undefined, "See All Destinations")}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
