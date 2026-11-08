"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [shimmerDoneForPath, setShimmerDoneForPath] = useState<string | null>(null);
    const showShimmer = shimmerDoneForPath !== pathname;

    return (
        <>
            {showShimmer && (
                <motion.div
                    key={pathname + "-shimmer"}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.45, delay: 0.15 }}
                    onAnimationComplete={() => setShimmerDoneForPath(pathname)}
                    className="fixed top-0 left-0 w-full h-[2px] overflow-hidden z-[100] pointer-events-none"
                    aria-hidden="true"
                >
                    <div className="w-full h-full bg-accent animate-shimmer-once" />
                </motion.div>
            )}
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.28,
                    ease: EASE_OUT_EXPO,
                }}
                className="transform-gpu"
            >
                {children}
            </motion.div>
        </>
    );
}
