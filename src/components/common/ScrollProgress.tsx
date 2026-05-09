"use client";

import { useEffect, useRef } from "react";

export function ScrollProgress() {
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!progressRef.current) return;
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressRef.current.style.width = `${scrollPercent}%`;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-[3px] z-[60] pointer-events-none">
            <div
                ref={progressRef}
                className="h-full bg-gradient-to-r from-accent via-yellow-400 to-accent transition-[width] duration-100 ease-out"
                style={{ width: "0%" }}
            />
        </div>
    );
}
