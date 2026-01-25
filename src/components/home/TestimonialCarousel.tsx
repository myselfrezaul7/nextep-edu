"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
    {
        text: "I was honestly lost before I found these guys. My SOP was a mess, and I had no idea how visa interviews worked. They sat with me, fixed everything, and now I'm actually in Toronto studying Computer Science. Still feels unreal.",
        author: "Rahim Ahmed",
        university: "University of Toronto, Canada",
        flag: "🇨🇦",
        initials: "RA",
    },
    {
        text: "They found me a scholarship I had never even heard of. Like, who knew these things existed? The team is super chill and actually listens to what you want. Made the whole UK dream possible for my family.",
        author: "Fatima Akter",
        university: "University of Manchester, UK",
        flag: "🇬🇧",
        initials: "FA",
    },
    {
        text: "What I loved is they didn't just help with applications — they helped me figure out where to live, how to manage money abroad, everything. It's like having an older sibling who's been through it all.",
        author: "Tanvir Hasan",
        university: "Monash University, Australia",
        flag: "🇦🇺",
        initials: "TH",
    },
    {
        text: "No pushy sales tactics, no fake promises. Just real people doing their job well. I respected that, and it made me trust them with something as big as my education.",
        author: "Nusrat Jahan",
        university: "University of Leeds, UK",
        flag: "🇬🇧",
        initials: "NJ",
    },
    {
        text: "From choosing the right program to getting my visa approved — NexTep was there every step of the way. The team genuinely cares about your success, and that made all the difference.",
        author: "Sadia Khan",
        university: "TU Munich, Germany",
        flag: "🇩🇪",
        initials: "SK",
    },
];

export function TestimonialCarousel() {
    // Using simple index state instead of complex manual carousel logic
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(1);

    // Responsive items per page
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setItemsPerPage(3);
            else if (window.innerWidth >= 768) setItemsPerPage(2);
            else setItemsPerPage(1);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const totalPages = Math.ceil(testimonials.length / itemsPerPage);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    // Just show 3 at a time in a simple looped grid for MVP, or a true carousel.
    // Let's do a simple animated slider.

    return (
        <section id="stories" className="py-24 bg-surface dark:bg-card/50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(212,175,55,0.05)_0%,_transparent_50%),_radial-gradient(circle_at_80%_20%,_rgba(212,175,55,0.05)_0%,_transparent_50%)] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-4">
                        Real Stories
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4 text-primary">From Students Who've Been There</h2>
                    <p className="text-lg text-muted-foreground">
                        We could tell you how great we are, but honestly? These stories say it better than we ever could.
                    </p>
                </div>

                {/* Carousel Container */}
                <div className="relative">
                    <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory scrollbar-hide">
                        {testimonials.map((story, i) => (
                            <motion.div
                                key={i}
                                className="min-w-[300px] md:min-w-[350px] flex-none snap-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="bg-gradient-to-br from-card to-slate-50 dark:from-slate-800 dark:to-slate-900 p-8 rounded-2xl border border-accent/10 hover:border-accent/30 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col relative group">
                                    {/* Top Accent Line */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-yellow-400 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

                                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6 text-accent">
                                        <Quote className="w-6 h-6 fill-current" />
                                    </div>

                                    <div className="flex gap-1 mb-4 text-yellow-400">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className="w-4 h-4 fill-current" />
                                        ))}
                                    </div>

                                    <p className="text-muted-foreground italic mb-6 flex-grow leading-relaxed">
                                        "{story.text}"
                                    </p>

                                    <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-yellow-400 flex items-center justify-center text-slate-900 font-bold shadow-lg">
                                            {story.initials}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-primary">{story.author}</h4>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                <span className="text-base">{story.flag}</span> {story.university}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Gradient Fade for scroll indication */}
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
                </div>
            </div>
        </section>
    );
}
