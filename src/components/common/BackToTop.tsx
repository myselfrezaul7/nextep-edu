"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BackToTop() {
    const [visible, setVisible] = useState(false);
    const [scrollPercent, setScrollPercent] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setVisible(scrollTop > 400);
            
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollPercent(percent);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    onClick={scrollToTop}
                    className="fixed bottom-[6.5rem] md:bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-card border border-border/50 shadow-lg hover:shadow-xl hover:border-accent hover:scale-110 transition-all duration-300 flex items-center justify-center text-accent relative"
                    aria-label="Scroll to top"
                >
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
                        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="289.026" strokeDashoffset={289.026 - (289.026 * scrollPercent) / 100} className="transition-[stroke-dashoffset] duration-100" />
                    </svg>
                    <ArrowUp className="w-5 h-5 relative z-10" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
