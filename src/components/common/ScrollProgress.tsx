"use client";

import { useEffect, useRef } from "react";
import { subscribeScrollFrame } from "@/lib/scroll-store";

export function ScrollProgress() {
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return subscribeScrollFrame((_y, progress) => {
            if (progressRef.current) {
                progressRef.current.style.transform = `scaleX(${progress})`;
            }
        });
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-[2px] z-[60] pointer-events-none" aria-hidden="true">
            <div
                ref={progressRef}
                className="h-full w-full origin-left bg-accent/85 will-change-transform"
                style={{ transform: "scaleX(0)" }}
            />
        </div>
    );
}
