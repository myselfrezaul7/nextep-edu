"use client";

import { motion } from "framer-motion";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageContext";

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
    },
];

export function TestimonialCarousel() {
    const mounted = useMounted();
    const [isHovered, setIsHovered] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const sectionRef = useRef<HTMLElement>(null);
    const mobileScrollRef = useRef<HTMLDivElement>(null);
    const { theme, systemTheme } = useTheme();
    const { t } = useTranslation();

    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = mounted && currentTheme === "dark";

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold: 0.05 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const handleMobileScroll = () => {
        const container = mobileScrollRef.current;
        if (!container) return;
        const cardWidth = container.firstElementChild?.clientWidth || container.offsetWidth;
        const gap = 16;
        const idx = Math.round(container.scrollLeft / (cardWidth + gap));
        setActiveSlide(Math.min(testimonials.length - 1, Math.max(0, idx)));
    };

    const scrollToSlide = (index: number) => {
        const container = mobileScrollRef.current;
        if (!container) return;
        const cardWidth = container.firstElementChild?.clientWidth || container.offsetWidth;
        const gap = 16;
        container.scrollTo({ left: index * (cardWidth + gap), behavior: "smooth" });
        setActiveSlide(index);
    };

    const renderCard = (story: (typeof testimonials)[number]) => (
        <div className="surface-card relative p-5 sm:p-6 md:p-7 rounded-2xl h-full flex flex-col overflow-hidden">
            {/* Header with Quote and Stars */}
            <div className="flex items-center justify-between mb-4 md:mb-5">
                <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent">
                    <Quote className="w-4 h-4 fill-current opacity-85" />
                </div>
                <div className="flex gap-1 text-accent" aria-label="5 out of 5 stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-current opacity-90" />
                    ))}
                </div>
            </div>

            {/* Testimonial Text */}
            <p className="text-muted-foreground mb-5 md:mb-6 flex-grow leading-relaxed text-sm md:text-[15px]">
                &ldquo;{story.text}&rdquo;
            </p>

            {/* Author Info */}
            <div className="flex items-start gap-3.5 pt-4 md:pt-5 border-t border-border/50">
                <div className="w-11 h-11 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                    {story.initials}
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-primary text-sm flex items-center gap-2">
                        <span className="truncate">{story.author}</span>
                        <span className="text-xs bg-muted border border-border/60 px-1.5 py-0.5 rounded shrink-0">
                            {story.flag}
                        </span>
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                        {story.university}
                    </p>
                    <p
                        className={cn(
                            "text-[11px] font-medium mt-1.5 flex items-center gap-1",
                            isDark ? "text-emerald-400" : "text-emerald-600"
                        )}
                    >
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>
                            {t("home.testimonials.visaLabel", undefined, "Visa Approved: ")}
                            {story.visaDate}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <section
            ref={sectionRef}
            id="stories"
            className="py-16 md:py-28 bg-surface/60 dark:bg-card/40 border-t border-border/50 relative overflow-hidden cv-auto"
        >
            {/* Soft Background Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(212,175,55,0.04)_0%,_transparent_50%),_radial-gradient(circle_at_80%_20%,_rgba(212,175,55,0.04)_0%,_transparent_50%)] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-10 md:mb-16">
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

            {/* Mobile Native Scroll-Snap Carousel (< 768px) */}
            <div className="md:hidden relative z-10">
                <div
                    ref={mobileScrollRef}
                    onScroll={handleMobileScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 scroll-pl-4 pb-3 scrollbar-hide"
                >
                    {testimonials.map((story) => (
                        <div key={story.author} className="w-[84vw] sm:w-[360px] shrink-0 snap-start">
                            {renderCard(story)}
                        </div>
                    ))}
                </div>

                {/* Pagination Dots + Swipe Counter */}
                <div className="flex items-center justify-center gap-3 mt-3 px-4">
                    <div className="flex items-center gap-0.5" role="tablist" aria-label="Testimonial slides">
                        {testimonials.map((story, i) => (
                            <button
                                key={story.author}
                                type="button"
                                onClick={() => scrollToSlide(i)}
                                aria-label={`View story by ${story.author}`}
                                aria-selected={activeSlide === i}
                                role="tab"
                                className="min-h-[44px] min-w-[28px] px-1 flex items-center justify-center"
                            >
                                <span
                                    className={cn(
                                        "block h-1.5 rounded-full transition-all duration-300",
                                        activeSlide === i ? "w-6 bg-accent" : "w-1.5 bg-accent/30"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                        {activeSlide + 1} / {testimonials.length}
                    </span>
                </div>
            </div>

            {/* Desktop Infinite CSS Marquee (md+) */}
            <div
                className="hidden md:flex relative w-full overflow-hidden flex-col gap-6 select-none group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Edge Fades */}
                <div
                    className={cn(
                        "absolute left-0 top-0 bottom-0 w-28 z-10 pointer-events-none bg-gradient-to-r to-transparent",
                        isDark ? "from-[#0B1120]" : "from-[#F1F5F9]"
                    )}
                />
                <div
                    className={cn(
                        "absolute right-0 top-0 bottom-0 w-28 z-10 pointer-events-none bg-gradient-to-l to-transparent",
                        isDark ? "from-[#0B1120]" : "from-[#F1F5F9]"
                    )}
                />

                <div
                    style={{ willChange: "transform" }}
                    className={cn(
                        "flex w-max gap-6 transform-gpu animate-marquee hover:pause",
                        (isHovered || !isInView) && "pause"
                    )}
                >
                    {[...testimonials, ...testimonials].map((story, i) => (
                        <div key={`${story.author}-${i}`} className="w-[420px] shrink-0">
                            {renderCard(story)}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
