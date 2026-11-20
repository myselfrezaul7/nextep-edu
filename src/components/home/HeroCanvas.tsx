"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";

const HeroCanvas3D = dynamic(
    () => import("@/components/home/HeroCanvas3D").then((mod) => mod.HeroCanvas3D),
    { ssr: false }
);

interface NetworkInformationLike {
    saveData?: boolean;
    effectiveType?: string;
}

function shouldUseLightweight2D(): boolean {
    if (typeof window === "undefined") return true;
    if (window.innerWidth < 768) return true;
    const nav = navigator as Navigator & { connection?: NetworkInformationLike };
    const conn = nav.connection;
    if (conn?.saveData) return true;
    if (conn?.effectiveType && ["slow-2g", "2g", "3g"].includes(conn.effectiveType)) {
        return true;
    }
    return false;
}

const MOBILE_ARCS = [
    { x: 0.16, y: 0.24, speed: 0.0028, offset: 0.0 },
    { x: 0.84, y: 0.22, speed: 0.0033, offset: 0.28 },
    { x: 0.22, y: 0.72, speed: 0.0025, offset: 0.55 },
    { x: 0.82, y: 0.76, speed: 0.0031, offset: 0.8 },
];

const STARS = Array.from({ length: 34 }, (_, i) => ({
    x: ((i * 37 + 13) % 100) / 100,
    y: ((i * 53 + 29) % 100) / 100,
    r: 0.8 + (i % 3) * 0.45,
}));

function HeroCanvas2D() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { resolvedTheme } = useTheme();
    const isDarkRef = useRef(resolvedTheme === "dark");

    useEffect(() => {
        isDarkRef.current = resolvedTheme === "dark";
    }, [resolvedTheme]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let width = 0;
        let height = 0;

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            width = parent.clientWidth;
            height = parent.clientHeight;
            canvas.width = Math.max(1, Math.floor(width * dpr));
            canvas.height = Math.max(1, Math.floor(height * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();
        window.addEventListener("resize", resize, { passive: true });

        let rafId = 0;
        let isRunning = false;
        let isIntersecting = true;
        let isTabVisible = document.visibilityState === "visible";
        let t = 0;
        let lastTime = performance.now();

        const draw = (now: number) => {
            const dt = Math.min(Math.max((now - lastTime) / 16.6667, 0.1), 3);
            lastTime = now;
            if (!prefersReduced) t += dt;

            const isDark = isDarkRef.current;
            ctx.clearRect(0, 0, width, height);

            // Subtle dust stars
            ctx.fillStyle = isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(100, 116, 139, 0.16)";
            for (const s of STARS) {
                ctx.beginPath();
                ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
                ctx.fill();
            }

            const ox = width * 0.5;
            const oy = height * 0.45;

            // Dhaka origin glow + ring
            ctx.strokeStyle = isDark ? "rgba(212, 175, 55, 0.35)" : "rgba(184, 134, 11, 0.22)";
            ctx.lineWidth = 1.2;
            const ringR = 10 + Math.sin(t * 0.04) * 2.5;
            ctx.beginPath();
            ctx.arc(ox, oy, ringR, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = isDark ? "rgba(212, 175, 55, 0.85)" : "rgba(184, 134, 11, 0.7)";
            ctx.beginPath();
            ctx.arc(ox, oy, 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Arcs + animated packets
            for (const arc of MOBILE_ARCS) {
                const ex = arc.x * width;
                const ey = arc.y * height;
                const cx = (ox + ex) * 0.5;
                const cy = (oy + ey) * 0.5 - 32;

                ctx.strokeStyle = isDark ? "rgba(212, 175, 55, 0.22)" : "rgba(202, 138, 4, 0.14)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(ox, oy);
                ctx.quadraticCurveTo(cx, cy, ex, ey);
                ctx.stroke();

                // Hub dot
                ctx.fillStyle = isDark ? "rgba(56, 189, 248, 0.65)" : "rgba(2, 132, 199, 0.45)";
                ctx.beginPath();
                ctx.arc(ex, ey, 2.8, 0, Math.PI * 2);
                ctx.fill();

                if (!prefersReduced) {
                    const p = (t * arc.speed + arc.offset) % 1;
                    const inv = 1 - p;
                    const px = inv * inv * ox + 2 * inv * p * cx + p * p * ex;
                    const py = inv * inv * oy + 2 * inv * p * cy + p * p * ey;
                    const alpha = p < 0.15 ? p / 0.15 : p > 0.85 ? (1 - p) / 0.15 : 1;
                    ctx.fillStyle = isDark
                        ? `rgba(254, 240, 138, ${0.85 * alpha})`
                        : `rgba(212, 175, 55, ${0.75 * alpha})`;
                    ctx.beginPath();
                    ctx.arc(px, py, 2.6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            if (!prefersReduced && isRunning) {
                rafId = requestAnimationFrame(draw);
            }
        };

        const syncLoop = () => {
            const shouldRun = !prefersReduced && isIntersecting && isTabVisible;
            if (shouldRun && !isRunning) {
                isRunning = true;
                lastTime = performance.now();
                rafId = requestAnimationFrame(draw);
            } else if (!shouldRun && isRunning) {
                isRunning = false;
                cancelAnimationFrame(rafId);
            }
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                isIntersecting = entry.isIntersecting;
                syncLoop();
            },
            { threshold: 0.05 }
        );
        observer.observe(canvas);

        const onVis = () => {
            isTabVisible = document.visibilityState === "visible";
            syncLoop();
        };
        document.addEventListener("visibilitychange", onVis);

        if (prefersReduced) {
            draw(performance.now());
        } else {
            syncLoop();
        }

        return () => {
            isRunning = false;
            cancelAnimationFrame(rafId);
            observer.disconnect();
            document.removeEventListener("visibilitychange", onVis);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
        />
    );
}

export function HeroCanvas() {
    const [mode, setMode] = useState<"idle" | "2d" | "3d">("idle");

    useEffect(() => {
        if (shouldUseLightweight2D()) {
            const frame = requestAnimationFrame(() => setMode("2d"));
            return () => cancelAnimationFrame(frame);
        }

        // Defer Three.js WebGL initialization until browser idle on desktop
        const win = window as Window & {
            requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
            cancelIdleCallback?: (id: number) => void;
        };

        if (typeof win.requestIdleCallback === "function") {
            const id = win.requestIdleCallback(() => setMode("3d"), { timeout: 600 });
            return () => win.cancelIdleCallback?.(id);
        }

        const timer = setTimeout(() => setMode("3d"), 250);
        return () => clearTimeout(timer);
    }, []);

    if (mode === "3d") {
        return <HeroCanvas3D />;
    }

    if (mode === "2d") {
        return <HeroCanvas2D />;
    }

    return null;
}
