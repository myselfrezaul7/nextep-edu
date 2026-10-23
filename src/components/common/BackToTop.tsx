"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BackToTop() {
    const [visible, setVisible] = useState(false);
    const [scrollPercent, setScrollPercent] = useState(0);
    const [bottomOffset, setBottomOffset] = useState("6.25rem");

    useEffect(() => {
        const handleTabBar = (e: Event) => {
            const customEvent = e as CustomEvent<{ visible: boolean }>;
            setBottomOffset(customEvent.detail?.visible ? "6.25rem" : "1.5rem");
        };
        window.addEventListener("tabbar-visibility", handleTabBar);
        return () => window.removeEventListener("tabbar-visibility", handleTabBar);
    }, []);

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
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onClick={scrollToTop}
                    style={{ bottom: bottomOffset }}
                    className="fixed md:!bottom-6 left-5 z-50 w-11 h-11 rounded-full surface-card flex items-center justify-center text-accent transition-[bottom,transform] duration-300 hover:-translate-y-0.5"
                    aria-label="Scroll to top"
                >
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3.5" strokeOpacity="0.15" />
                        <circle
                            cx="50"
                            cy="50"
                            r="46"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeDasharray="289.026"
                            strokeDashoffset={289.026 - (289.026 * scrollPercent) / 100}
                            className="transition-[stroke-dashoffset] duration-100"
                        />
                    </svg>
                    <ArrowUp className="w-4 h-4 relative z-10" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
