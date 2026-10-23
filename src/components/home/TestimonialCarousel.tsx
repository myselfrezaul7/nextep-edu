"use client";

import { motion } from "framer-motion";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageContext";

const subscribeResize = (callback: () => void) => {
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
};

const testimonials = [
    {
        text: "NexTep Edu guided me through every step of my application to Germany. From document preparation to university selection, their support was invaluable. Now I'm pursuing my Master's in IMIS and it's been an incredible journey.",
        author: "Mehedi Drubok",
        university: "IMIS, South Westphalia University of Applied Sciences, Germany",
        flag: "🇩🇪",
        initials: "MD",
        visaDate: "January 12, 2025",
    },
    {
        text: "I couldn't have imagined studying in Germany without NexTep Edu's help. They made the complex admission process feel simple and were always there to answer my questions. My dream of studying at Wismar University came true!",
        author: "Jannatul Ferdous",
        university: "Wismar University of Applied Sciences, Germany",
        flag: "🇩🇪",
        initials: "JF",
        visaDate: "February 10, 2025",
    },
    {
        text: "What I loved is they didn't just help with applications, they helped me figure out where to live, how to manage money abroad, everything. It's like having an older sibling.",
        author: "Tanvir Hasan",
        university: "Monash University, Australia",
        flag: "🇦🇺",
        initials: "TH",
        visaDate: "March 22, 2025",
    },
    {
        text: "No pushy sales tactics, no fake promises. Just real people doing their job well. I respected that, and it made me trust them with my education.",
        author: "Nusrat Jahan",
        university: "University of Leeds, UK",
        flag: "🇬🇧",
        initials: "NJ",
        visaDate: "June 8, 2025",
    },
    {
        text: "I was worried about the costs of studying in Europe, but the team found an incredibly affordable program in Latvia that perfectly matched my career goals.",
        author: "Rafiul Islam",
        university: "Riga Technical University, Latvia",
        flag: "🇱🇻",
        initials: "RI",
        visaDate: "April 15, 2025",
    },
    {
        text: "The guidance on English-taught programs in the Mediterranean was spot on. Highly recommend their services for anyone looking beyond the traditional destinations.",
        author: "Ayesha Khan",
        university: "University of Nicosia, Cyprus",
        flag: "🇨🇾",
        initials: "AK",
        visaDate: "May 2, 2025",
    },
    {
        text: "They didn't just help me get admitted, they helped me strategize my post-graduation work opportunities in North America. Worth every penny.",
        author: "Sakib Hossain",
        university: "University of Toronto, Canada",
        flag: "🇨🇦",
        initials: "SH",
        visaDate: "July 20, 2025",
    }
];

export function TestimonialCarousel() {
    const mounted = useMounted();
    const [isHovered, setIsHovered] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { theme, systemTheme } = useTheme();
    const { t } = useTranslation();

    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = mounted && currentTheme === "dark";

    const isMobile = useSyncExternalStore(
        subscribeResize,
        () => window.innerWidth < 768,
        () => false
    );
    const [dragConstraints, setDragConstraints] = useState(0);

    useEffect(() => {
        if (scrollRef.current && isMobile) {
            setDragConstraints(scrollRef.current.scrollWidth - scrollRef.current.offsetWidth);
        }
    }, [isMobile]);

    return (
        <section id="stories" className="py-20 md:py-28 bg-surface/60 dark:bg-card/40 border-t border-border/50 relative overflow-hidden">
            {/* Soft Background Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(212,175,55,0.04)_0%,_transparent_50%),_radial-gradient(circle_at_80%_20%,_rgba(212,175,55,0.04)_0%,_transparent_50%)] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold tracking-wider uppercase mb-4">
                            {t("home.testimonials.badge", undefined, "Real Stories")}
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold font-heading mb-4 text-primary"
                    >
                        {t("home.testimonials.title", undefined, "From Students Who've Been There")}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
                    >
                        {t("home.testimonials.subtitle", undefined, "These stories say it better than we ever could.")}
                    </motion.p>
                </div>
            </div>

            {/* Marquee Container */}
            <div
                className="relative w-full overflow-hidden flex flex-col gap-6 select-none group cursor-grab active:cursor-grabbing"
                ref={scrollRef}
            >
                {/* Edge Fades for smooth entry/exit */}
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-8 md:w-28 z-10 pointer-events-none bg-gradient-to-r to-transparent",
                    isDark ? "from-[#0B1120]" : "from-[#F1F5F9]"
                )} />
                <div className={cn(
                    "absolute right-0 top-0 bottom-0 w-8 md:w-28 z-10 pointer-events-none bg-gradient-to-l to-transparent",
                    isDark ? "from-[#0B1120]" : "from-[#F1F5F9]"
                )} />

                {/* Infinite Scrolling Track (Desktop) / Drag Track (Mobile) */}
                <motion.div
                    drag="x"
                    dragConstraints={{ right: 0, left: -dragConstraints }}
                    dragElastic={0.1}
                    onDragStart={() => setIsHovered(true)}
                    onDragEnd={() => setIsHovered(false)}
                    style={{ willChange: "transform" }}
                    className={cn(
                        "flex w-max gap-6 px-4 md:px-0 transform-gpu animate-marquee hover:pause",
                        isHovered && "pause"
                    )}
                >
                    {[...testimonials, ...testimonials].map((story, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-[84vw] sm:w-[360px] md:w-[420px] shrink-0",
                                isMobile && i >= testimonials.length && "hidden"
                            )}
                        >
                            <div className="surface-card relative p-6 md:p-7 rounded-2xl h-full flex flex-col overflow-hidden">
                                {/* Header with Quote and Stars */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent">
                                        <Quote className="w-4 h-4 fill-current opacity-85" />
                                    </div>
                                    <div className="flex gap-1 text-accent">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className="w-3.5 h-3.5 fill-current opacity-90" />
                                        ))}
                                    </div>
                                </div>

                                {/* Testimonial Text */}
                                <p className="text-muted-foreground mb-6 flex-grow leading-relaxed text-sm md:text-[15px]">
                                    &ldquo;{story.text}&rdquo;
                                </p>

                                {/* Author Info */}
                                <div className="flex items-center gap-3.5 pt-5 border-t border-border/50">
                                    <div className="w-11 h-11 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                                        {story.initials}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-semibold text-primary text-sm truncate flex items-center gap-2">
                                            <span>{story.author}</span>
                                            <span className="text-xs bg-muted border border-border/60 px-1.5 py-0.5 rounded">{story.flag}</span>
                                        </h4>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                                            {story.university}
                                        </p>
                                        <p className={cn(
                                            "text-[11px] font-medium mt-1.5 flex items-center gap-1",
                                            isDark ? "text-emerald-400" : "text-emerald-600"
                                        )}>
                                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                                            <span>{t("home.testimonials.visaLabel", undefined, "Visa Approved: ")}{story.visaDate}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
