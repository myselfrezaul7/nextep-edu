"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

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
];

export function TestimonialCarousel() {
    return (
        <section id="stories" className="py-16 md:py-28 bg-surface dark:bg-card/30 relative overflow-hidden">
            {/* Soft Background Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(212,175,55,0.05)_0%,_transparent_50%),_radial-gradient(circle_at_80%_20%,_rgba(212,175,55,0.05)_0%,_transparent_50%)] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12 md:mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm md:text-base font-medium mb-4">
                            Real Stories
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold font-heading mb-4 text-primary"
                    >
                        From Students Who've Been There
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        These stories say it better than we ever could.
                    </motion.p>
                </div>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden flex flex-col gap-6 select-none group">

                {/* Edge Fades for smooth entry/exit */}
                <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-surface dark:from-card to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-surface dark:from-card to-transparent z-10 pointer-events-none" />

                {/* Infinite Scrolling Track */}
                <div className="flex w-max animate-marquee hover:pause gap-6 px-4 md:px-0">
                    {/* Duplicate the array 3 times to ensure the screen is always filled */}
                    {[...testimonials, ...testimonials, ...testimonials].map((story, i) => (
                        <div
                            key={i}
                            className="w-[300px] md:w-[450px] shrink-0"
                        >
                            {/* Glassmorphic Testimonial Card */}
                            <div className="relative bg-surface/80 dark:bg-card/60 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-border/50 hover:border-accent/40 shadow-sm hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 h-full flex flex-col group/card overflow-hidden">

                                {/* Top Accent Glow on Hover */}
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                                {/* Header with Quote and Stars */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                                        <Quote className="w-5 h-5 fill-current opacity-80" />
                                    </div>
                                    <div className="flex gap-1 text-accent">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className="w-4 h-4 fill-current opacity-90" />
                                        ))}
                                    </div>
                                </div>

                                {/* Testimonial Text */}
                                <p className="text-muted-foreground italic mb-8 flex-grow leading-relaxed text-sm md:text-base">
                                    "{story.text}"
                                </p>

                                {/* Author Info */}
                                <div className="flex items-center gap-4 pt-6 border-t border-border/40">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/80 to-accent/40 flex items-center justify-center text-accent-foreground font-bold text-lg shadow-inner flex-shrink-0">
                                        {story.initials}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-primary text-base truncate">{story.author}</h4>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate mt-0.5">
                                            <span className="text-base leading-none">{story.flag}</span>
                                            <span className="truncate">{story.university}</span>
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-500 font-medium mt-1.5 flex items-center gap-1">
                                            <span>✓</span> Visa approved · {story.visaDate}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
