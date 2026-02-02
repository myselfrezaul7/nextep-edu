"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        text: "I was honestly lost before I found these guys. My SOP was a mess, and I had no idea how visa interviews worked. They sat with me, fixed everything, and now I'm actually in Toronto studying Computer Science.",
        author: "Rahim Ahmed",
        university: "University of Toronto, Canada",
        flag: "🇨🇦",
        initials: "RA",
    },
    {
        text: "They found me a scholarship I had never even heard of. The team is super chill and actually listens to what you want. Made the whole UK dream possible for my family.",
        author: "Fatima Akter",
        university: "University of Manchester, UK",
        flag: "🇬🇧",
        initials: "FA",
    },
    {
        text: "What I loved is they didn't just help with applications, they helped me figure out where to live, how to manage money abroad, everything. It's like having an older sibling.",
        author: "Tanvir Hasan",
        university: "Monash University, Australia",
        flag: "🇦🇺",
        initials: "TH",
    },
    {
        text: "No pushy sales tactics, no fake promises. Just real people doing their job well. I respected that, and it made me trust them with my education.",
        author: "Nusrat Jahan",
        university: "University of Leeds, UK",
        flag: "🇬🇧",
        initials: "NJ",
    },
];

export function TestimonialCarousel() {
    return (
        <section id="stories" className="py-12 md:py-24 bg-surface dark:bg-card/50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(212,175,55,0.05)_0%,_transparent_50%),_radial-gradient(circle_at_80%_20%,_rgba(212,175,55,0.05)_0%,_transparent_50%)] pointer-events-none" />

            <div className="container mx-auto px-3 md:px-4 relative z-10">
                <div className="text-center mb-8 md:mb-16">
                    <span className="inline-block px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs md:text-sm font-semibold mb-3 md:mb-4">
                        Real Stories
                    </span>
                    <h2 className="text-2xl md:text-5xl font-bold font-heading mb-2 md:mb-4 text-primary">From Students Who've Been There</h2>
                    <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                        These stories say it better than we ever could.
                    </p>
                </div>

                {/* Card Grid Layout - Always 2 columns */}
                <div className="grid grid-cols-2 gap-3 md:gap-6">
                    {testimonials.map((story, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{
                                delay: i * 0.1,
                                duration: 0.6,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                        >
                            <div className="relative bg-card/95 backdrop-blur-xl p-3 md:p-6 rounded-xl md:rounded-2xl border border-border/30 hover:border-accent/30 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col group overflow-hidden">
                                {/* Top Accent Line */}
                                <div className="absolute top-0 left-0 right-0 h-0.5 md:h-1 bg-gradient-to-r from-accent via-yellow-400 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl md:rounded-t-2xl" />

                                {/* Header with Quote and Stars */}
                                <div className="flex items-center justify-between mb-2 md:mb-4">
                                    <div className="w-7 h-7 md:w-10 md:h-10 bg-accent/10 rounded-lg md:rounded-xl flex items-center justify-center text-accent">
                                        <Quote className="w-3 h-3 md:w-5 md:h-5 fill-current" />
                                    </div>
                                    <div className="flex gap-0.5 text-yellow-400">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className="w-2.5 h-2.5 md:w-4 md:h-4 fill-current" />
                                        ))}
                                    </div>
                                </div>

                                {/* Testimonial Text */}
                                <p className="text-muted-foreground italic mb-3 md:mb-6 flex-grow leading-relaxed text-[11px] md:text-sm line-clamp-4 md:line-clamp-none">
                                    "{story.text}"
                                </p>

                                {/* Author Info */}
                                <div className="flex items-center gap-2 md:gap-3 pt-2 md:pt-4 border-t border-border/50">
                                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-accent to-yellow-400 flex items-center justify-center text-slate-900 font-bold text-[10px] md:text-sm shadow-lg flex-shrink-0">
                                        {story.initials}
                                    </div>
                                    <div className="min-w-0 overflow-hidden">
                                        <h4 className="font-bold text-primary text-[11px] md:text-sm truncate">{story.author}</h4>
                                        <p className="text-[9px] md:text-xs text-muted-foreground flex items-center gap-1 truncate">
                                            <span className="text-xs md:text-sm">{story.flag}</span>
                                            <span className="truncate">{story.university}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
