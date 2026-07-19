"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Search, ArrowLeft, Loader2, AlertCircle, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageContext";
import { ApplicationTimeline } from "@/components/tracker/ApplicationTimeline";
import { supabase } from "@/lib/supabase";
import type { Application } from "@/lib/supabase";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Skeleton shimmer bar for loading state */
function SkeletonBar({
    width,
    className,
}: {
    width: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "h-3 rounded-full animate-pulse bg-muted-foreground/10",
                className
            )}
            style={{ width }}
        />
    );
}

export function TrackPageClient() {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();
    const currentTheme = theme === "system" ? systemTheme : theme;

    // Form state
    const [trackingCode, setTrackingCode] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Application | null>(null);

    // Realtime state
    const [justUpdated, setJustUpdated] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // ── Supabase Realtime subscription ──
    useEffect(() => {
        if (!data) return;

        const channel = supabase
            .channel(`app-${data.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "applications",
                    filter: `id=eq.${data.id}`,
                },
                (payload) => {
                    setData(payload.new as Application);
                    setJustUpdated(true);
                    setTimeout(() => setJustUpdated(false), 3000);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [data?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    trackingCode: trackingCode.toUpperCase(),
                    phone,
                }),
            });

            const json = await res.json();

            if (json.success) {
                setData(json.data);
            } else {
                setError(json.error || "Something went wrong.");
            }
        } catch {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setData(null);
        setError(null);
        setTrackingCode("");
        setPhone("");
        setJustUpdated(false);
    };

    const isDark = mounted && currentTheme === "dark";

    return (
        <section className="relative min-h-[80vh] flex items-center justify-center py-16 md:py-24 px-4">
            {/* Background accent glow */}
            <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(212,175,55,0.12)_0%,_transparent_70%)] -z-10 pointer-events-none" />

            {/* Floating gradient orbs */}
            <div
                className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-[radial-gradient(circle,_rgba(212,175,55,0.08)_0%,_transparent_70%)] -z-10 pointer-events-none animate-pulse"
                style={{ animationDuration: "4s" }}
            />
            <div
                className="absolute bottom-[10%] right-[20%] w-[250px] h-[250px] bg-[radial-gradient(circle,_rgba(212,175,55,0.06)_0%,_transparent_70%)] -z-10 pointer-events-none animate-pulse"
                style={{ animationDuration: "6s" }}
            />
            <div
                className="absolute top-[60%] right-[10%] w-[200px] h-[200px] bg-[radial-gradient(circle,_rgba(212,175,55,0.05)_0%,_transparent_70%)] -z-10 pointer-events-none animate-pulse"
                style={{ animationDuration: "5s" }}
            />

            <div className="w-full max-w-md">
                <AnimatePresence mode="wait">
                    {!data ? (
                        /* ──────────────── Form View ──────────────── */
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                        >
                            <div
                                className={cn(
                                    "rounded-2xl p-8 border backdrop-blur-xl shadow-lg",
                                    isDark
                                        ? "bg-[rgba(15,23,42,0.85)] border-white/10"
                                        : "bg-white/60 border-black/5"
                                )}
                            >
                                {/* Heading */}
                                <div className="text-center mb-8">
                                    <h1 className="text-2xl md:text-3xl font-bold font-heading text-primary">
                                        Track Your Application
                                    </h1>
                                    <div className="mt-2 mx-auto w-12 h-1 rounded-full bg-accent" />
                                    <p className="mt-4 text-sm text-muted-foreground">
                                        Enter your tracking code and registered phone number to check your application status.
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Tracking Code */}
                                    <div>
                                        <label
                                            htmlFor="tracking-code"
                                            className="block text-sm font-medium text-foreground mb-1.5"
                                        >
                                            Tracking Code
                                        </label>
                                        <input
                                            id="tracking-code"
                                            type="text"
                                            required
                                            placeholder="NX-XXXX"
                                            value={trackingCode}
                                            onChange={(e) =>
                                                setTrackingCode(e.target.value.toUpperCase())
                                            }
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl border text-sm font-mono tracking-wider uppercase transition-colors duration-200",
                                                "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
                                                isDark
                                                    ? "bg-white/5 border-white/10 text-foreground"
                                                    : "bg-white/80 border-black/10 text-foreground"
                                            )}
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label
                                            htmlFor="phone"
                                            className="block text-sm font-medium text-foreground mb-1.5"
                                        >
                                            Phone Number
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            required
                                            placeholder="+880..."
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className={cn(
                                                "w-full px-4 py-3 rounded-xl border text-sm transition-colors duration-200",
                                                "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
                                                isDark
                                                    ? "bg-white/5 border-white/10 text-foreground"
                                                    : "bg-white/80 border-black/10 text-foreground"
                                            )}
                                        />
                                    </div>

                                    {/* Error message */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex items-start gap-2 text-sm text-red-500 dark:text-red-400 bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20"
                                            >
                                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <span>{error}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Submit button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={cn(
                                            "w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300",
                                            "bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20",
                                            "disabled:opacity-60 disabled:cursor-not-allowed"
                                        )}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Searching...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-4 h-4" />
                                                Track Application
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Loading skeleton — timeline shimmer */}
                                <AnimatePresence>
                                    {loading && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="mt-8 space-y-5"
                                        >
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-4"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-muted-foreground/10 animate-pulse flex-shrink-0" />
                                                    <div className="flex-1 space-y-2 pt-1">
                                                        <SkeletonBar
                                                            width={
                                                                i % 2 === 0
                                                                    ? "60%"
                                                                    : "75%"
                                                            }
                                                        />
                                                        <SkeletonBar
                                                            width="40%"
                                                            className="h-2"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ) : (
                        /* ──────────────── Results View ──────────────── */
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                            className="space-y-6"
                        >
                            {/* Header Card */}
                            <div
                                className={cn(
                                    "rounded-2xl p-6 border backdrop-blur-xl shadow-lg",
                                    isDark
                                        ? "bg-[rgba(15,23,42,0.85)] border-white/10"
                                        : "bg-white/60 border-black/5"
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-bold font-heading text-primary">
                                            {data.name}
                                        </h2>
                                        {data.destination && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Destination:{" "}
                                                <span className="text-foreground font-medium">
                                                    {data.destination}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* Live indicator */}
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                            </span>
                                            Live
                                        </span>
                                        {/* Tracking code badge */}
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 whitespace-nowrap">
                                            {data.tracking_code}
                                        </span>
                                    </div>
                                </div>

                                {/* "Status updated just now" toast */}
                                <AnimatePresence>
                                    {justUpdated && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{
                                                duration: 0.4,
                                                ease: EASE_OUT_EXPO,
                                            }}
                                            className="mt-3 flex items-center gap-2 text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-lg px-3 py-2"
                                        >
                                            <Radio className="w-3.5 h-3.5" />
                                            Status updated just now
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Timeline Card */}
                            <div
                                className={cn(
                                    "rounded-2xl p-6 border backdrop-blur-xl shadow-lg",
                                    isDark
                                        ? "bg-[rgba(15,23,42,0.85)] border-white/10"
                                        : "bg-white/60 border-black/5"
                                )}
                            >
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
                                    Application Progress
                                </h3>
                                <ApplicationTimeline
                                    steps={data.notes}
                                    currentStep={data.current_step}
                                />
                            </div>

                            {/* Check Another button */}
                            <motion.button
                                onClick={handleReset}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 border",
                                    isDark
                                        ? "bg-white/5 border-white/10 text-foreground hover:bg-white/10"
                                        : "bg-white/60 border-black/5 text-foreground hover:bg-white/80"
                                )}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Check Another Application
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
