"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setProgress(scrollPercent);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-[3px] z-[60] pointer-events-none">
            <div
                className="h-full bg-gradient-to-r from-accent via-yellow-400 to-accent transition-[width] duration-100 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
