"use client";

import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { subscribeScrollFrame, useNavVisible, usePastFold } from "@/lib/scroll-store";

const RING_CIRCUMFERENCE = 289.026;

export function BackToTop() {
    const pathname = usePathname();
    const visible = usePastFold();
    const tabBarVisible = useNavVisible();
    const ringRef = useRef<SVGCircleElement>(null);

    useEffect(() => {
        if (!visible) return;
        return subscribeScrollFrame((_y, progress) => {
            if (ringRef.current) {
                ringRef.current.style.strokeDashoffset = String(
                    RING_CIRCUMFERENCE - RING_CIRCUMFERENCE * progress
                );
            }
        });
    }, [visible]);

    if (pathname.startsWith("/admin")) {
        return null;
    }

    const isCountryDetailPage = pathname.startsWith("/destinations/") && pathname !== "/destinations";
    const baseRem = tabBarVisible
        ? (isCountryDetailPage ? "10.75rem" : "6.75rem")
        : (isCountryDetailPage ? "5.5rem" : "1.5rem");
    const bottomOffset = `calc(${baseRem} + env(safe-area-inset-bottom, 0px))`;

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
                    className="fixed md:!bottom-6 left-4 sm:left-5 z-50 w-11 h-11 rounded-full surface-card flex items-center justify-center text-accent transition-[bottom] duration-300"
                    aria-label="Scroll to top"
                >
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3.5" strokeOpacity="0.15" />
                        <circle
                            ref={ringRef}
                            cx="50"
                            cy="50"
                            r="46"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeDasharray={RING_CIRCUMFERENCE}
                            style={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                        />
                    </svg>
                    <ArrowUp className="w-4 h-4 relative z-10" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
