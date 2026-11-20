"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useMounted } from "@/lib/use-mounted";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const mounted = useMounted();
    const [shimmerDoneForPath, setShimmerDoneForPath] = useState<string>(() => pathname);
    const showShimmer = mounted && shimmerDoneForPath !== pathname;

    return (
        <>
            {showShimmer && (
                <motion.div
                    key={pathname + "-shimmer"}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.45, delay: 0.15 }}
                    onAnimationComplete={() => setShimmerDoneForPath(pathname)}
                    className="fixed left-0 w-full h-[2px] overflow-hidden z-[100] pointer-events-none"
                    style={{ top: "env(safe-area-inset-top, 0px)" }}
                    aria-hidden="true"
                >
                    <div className="w-full h-full bg-accent animate-shimmer-once" />
                </motion.div>
            )}
            <motion.div
                key={pathname}
                initial={mounted ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.24,
                    ease: EASE_OUT_EXPO,
                }}
            >
                {children}
            </motion.div>
        </>
    );
}
