"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const prevPathname = useRef(pathname);

    const currentDepth = pathname.split("/").filter(Boolean).length;
    const prevDepth = prevPathname.current.split("/").filter(Boolean).length;
    const isDeeper = currentDepth >= prevDepth;
    const startX = isDeeper ? 30 : -30;

    useEffect(() => {
        prevPathname.current = pathname;
    }, [pathname]);

    return (
        <>
            <motion.div
                key={pathname + "-shimmer"}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="fixed top-0 left-0 w-full h-[2px] overflow-hidden z-[100] pointer-events-none"
            >
                <div className="w-full h-full bg-accent animate-shimmer" />
            </motion.div>
            <motion.div
                key={pathname}
                initial={{ opacity: 0, x: startX, y: 12 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{
                    duration: 0.4,
                    ease: EASE_OUT_EXPO,
                }}
            >
                {children}
            </motion.div>
        </>
    );
}
