"use client";

import { useState, useEffect, useCallback, useRef, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
    Search,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Radio,
    History,
    X,
    Hash,
    Phone,
    WifiOff,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/use-mounted";
import { ApplicationTimeline } from "@/components/tracker/ApplicationTimeline";
import { DocumentUpload } from "@/components/tracker/DocumentUpload";
import ConfettiExplosion from "react-confetti-explosion";
import { supabase } from "@/lib/supabase";
import type { Application, UploadedDocumentInfo } from "@/lib/supabase";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const RECENT_TRACKS_STORAGE_KEY = "nextep_recent_tracks";
const MAX_RECENT_TRACKS = 5;

export interface RecentTrackItem {
    code: string;
    name: string;
    destination?: string | null;
    phone?: string;
    updatedAt: string;
}

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
    const mounted = useMounted();
    const currentTheme = theme === "system" ? systemTheme : theme;
    const searchParams = useSearchParams();

    // Lookup mode toggle ("code" | "phone")
    const [lookupMode, setLookupMode] = useState<"code" | "phone">("code");

    // Form state
    const [trackingCode, setTrackingCode] = useState(
        () => searchParams.get("code")?.trim().toUpperCase() || ""
    );
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Application | null>(null);
    const [uploadedDocs, setUploadedDocs] = useState<UploadedDocumentInfo[]>(
        []
    );

    // Recent tracked codes in localStorage (lazy initialized on client)
    const [recentTracks, setRecentTracks] = useState<RecentTrackItem[]>(() => {
        if (typeof window === "undefined") return [];
        try {
            const raw = localStorage.getItem(RECENT_TRACKS_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    return parsed.filter(
                        (item): item is RecentTrackItem =>
                            Boolean(
                                item &&
                                    typeof item.code === "string" &&
                                    /^NX-[A-Z0-9]{8}$/.test(item.code)
                            )
                    );
                }
            }
        } catch {
            // Ignore localStorage access errors
        }
        return [];
    });

    // Realtime & connection resilience state
    const [justUpdated, setJustUpdated] = useState(false);
    const [updateMessage, setUpdateMessage] = useState(
        "Status updated just now"
    );
    const [syncStatus, setSyncStatus] = useState<
        "live" | "reconnecting" | "offline"
    >("live");
    const [channelRetryKey, setChannelRetryKey] = useState(0);

    const autoLookupRanRef = useRef<string | null>(null);
    const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const triggerUpdateBanner = useCallback((msg = "Status updated just now") => {
        setUpdateMessage(msg);
        setJustUpdated(true);
        if (updateTimerRef.current) {
            clearTimeout(updateTimerRef.current);
        }
        updateTimerRef.current = setTimeout(() => {
            setJustUpdated(false);
        }, 3500);
    }, []);

    useEffect(() => {
        return () => {
            if (updateTimerRef.current) {
                clearTimeout(updateTimerRef.current);
            }
        };
    }, []);

    const saveRecentTrack = useCallback(
        (app: Application, usedPhone?: string) => {
            try {
                setRecentTracks((prev) => {
                    const existing = prev.find(
                        (item) => item.code === app.tracking_code
                    );
                    const entry: RecentTrackItem = {
                        code: app.tracking_code,
                        name: app.name,
                        destination: app.destination,
                        phone: usedPhone || existing?.phone || undefined,
                        updatedAt: new Date().toISOString(),
                    };
                    const next = [
                        entry,
                        ...prev.filter(
                            (item) => item.code !== app.tracking_code
                        ),
                    ].slice(0, MAX_RECENT_TRACKS);
                    localStorage.setItem(
                        RECENT_TRACKS_STORAGE_KEY,
                        JSON.stringify(next)
                    );
                    return next;
                });
            } catch {
                // Ignore localStorage write errors
            }
        },
        []
    );

    const removeRecentTrack = (codeToRemove: string) => {
        try {
            setRecentTracks((prev) => {
                const next = prev.filter((item) => item.code !== codeToRemove);
                localStorage.setItem(
                    RECENT_TRACKS_STORAGE_KEY,
                    JSON.stringify(next)
                );
                return next;
            });
        } catch {
            // Ignore localStorage write errors
        }
    };

    const performLookup = useCallback(
        async (
            codeInput: string,
            phoneInput: string,
            options?: { silent?: boolean }
        ) => {
            const silent = Boolean(options?.silent);
            const cleanCode = codeInput.trim().toUpperCase();
            const cleanPhone = phoneInput.trim();

            if (!cleanCode && !cleanPhone) return;

            if (!silent) {
                setError(null);
                setLoading(true);
            }

            try {
                const res = await fetch("/api/track", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        trackingCode: cleanCode,
                        phone: cleanPhone,
                    }),
                });

                const json = await res.json();

                if (json.success && json.data) {
                    const nextApp = json.data as Application;
                    const nextDocs: UploadedDocumentInfo[] = Array.isArray(
                        json.uploadedDocuments
                    )
                        ? json.uploadedDocuments
                        : [];

                    setData((prev) => {
                        if (
                            silent &&
                            prev &&
                            (prev.current_step !== nextApp.current_step ||
                                prev.updated_at !== nextApp.updated_at)
                        ) {
                            triggerUpdateBanner("Status updated just now");
                        }
                        return nextApp;
                    });
                    setUploadedDocs((prevDocs) => {
                        if (silent && prevDocs.length > 0) {
                            const prevSig = prevDocs
                                .map((d) => `${d.name}:${d.status}:${d.feedback || ""}`)
                                .join("|");
                            const nextSig = nextDocs
                                .map((d) => `${d.name}:${d.status}:${d.feedback || ""}`)
                                .join("|");
                            if (prevSig !== nextSig) {
                                triggerUpdateBanner("Documents status updated");
                            }
                        }
                        return nextDocs;
                    });
                    setTrackingCode(nextApp.tracking_code);
                    saveRecentTrack(nextApp, cleanPhone);
                    setSyncStatus("live");
                } else if (!silent) {
                    setError(json.error || "Something went wrong.");
                }
            } catch {
                if (!silent) {
                    setError(
                        "Network error. Please check your connection and try again."
                    );
                } else {
                    setSyncStatus("offline");
                }
            } finally {
                if (!silent) {
                    setLoading(false);
                }
            }
        },
        [saveRecentTrack, triggerUpdateBanner]
    );

    // Auto-run lookup when ?code= is present in URL query string
    useEffect(() => {
        const urlCode = searchParams.get("code")?.trim().toUpperCase() || "";
        if (!urlCode || autoLookupRanRef.current === urlCode) return;

        autoLookupRanRef.current = urlCode;

        const runAuto = async () => {
            await Promise.resolve();
            setTrackingCode(urlCode);
            setLookupMode("code");
            if (/^NX-[A-Z0-9]{8}$/.test(urlCode)) {
                await performLookup(urlCode, "");
            }
        };

        void runAuto();
    }, [searchParams, performLookup]);

    const appId = data?.id;
    const appTrackingCode = data?.tracking_code;

    // Supabase Realtime subscription (Application + Documents Broadcast + Postgres Changes)
    useEffect(() => {
        if (!appId || !appTrackingCode) return;

        const channel = supabase
            .channel(`track:${appTrackingCode}`)
            .on(
                "broadcast",
                { event: "application-updated" },
                (payload) => {
                    if (
                        payload.payload &&
                        typeof payload.payload === "object"
                    ) {
                        const updatedApp = payload.payload as Application;
                        if (updatedApp.id && updatedApp.tracking_code) {
                            setData(updatedApp);
                            saveRecentTrack(updatedApp, phone);
                            triggerUpdateBanner("Application status updated live");
                        }
                    }
                }
            )
            .on(
                "broadcast",
                { event: "application-deleted" },
                () => {
                    removeRecentTrack(appTrackingCode);
                    setData(null);
                    setUploadedDocs([]);
                    setError("This application is no longer active.");
                }
            )
            .on(
                "broadcast",
                { event: "documents_updated" },
                (payload) => {
                    const body = payload.payload as
                        | {
                              trackingCode?: string;
                              documents?: UploadedDocumentInfo[];
                              action?: string;
                          }
                        | undefined;
                    if (body && Array.isArray(body.documents)) {
                        setUploadedDocs(body.documents);
                        if (body.action === "verified") {
                            triggerUpdateBanner("Document verified by counselor");
                        } else if (body.action === "rejected") {
                            triggerUpdateBanner(
                                "Document feedback added by counselor"
                            );
                        } else {
                            triggerUpdateBanner("Documents list updated live");
                        }
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "applications",
                    filter: `id=eq.${appId}`,
                },
                (payload) => {
                    const updatedApp = payload.new as Application;
                    setData(updatedApp);
                    saveRecentTrack(updatedApp, phone);
                    triggerUpdateBanner("Application status updated live");
                }
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    setSyncStatus("live");
                } else if (
                    status === "CHANNEL_ERROR" ||
                    status === "TIMED_OUT" ||
                    status === "CLOSED"
                ) {
                    setSyncStatus(
                        typeof navigator !== "undefined" && !navigator.onLine
                            ? "offline"
                            : "reconnecting"
                    );
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [
        appId,
        appTrackingCode,
        channelRetryKey,
        phone,
        saveRecentTrack,
        triggerUpdateBanner,
    ]);

    // Mobile connection resilience: visibilitychange, online, and offline listeners
    useEffect(() => {
        if (!appTrackingCode) return;

        const handleReconnectAndSync = () => {
            if (typeof navigator !== "undefined" && !navigator.onLine) {
                setSyncStatus("offline");
                return;
            }
            setSyncStatus("reconnecting");
            setChannelRetryKey((prev) => prev + 1);
            void performLookup(appTrackingCode, "", { silent: true });
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                handleReconnectAndSync();
            }
        };

        const handleOnline = () => {
            handleReconnectAndSync();
        };

        const handleOffline = () => {
            setSyncStatus("offline");
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [appTrackingCode, performLookup]);

    // Polling fallback for status updates when RLS limits direct anon table subscription
    useEffect(() => {
        if (!appTrackingCode) return;

        const interval = setInterval(() => {
            if (
                typeof document !== "undefined" &&
                document.visibilityState !== "visible"
            ) {
                return;
            }
            void performLookup(appTrackingCode, "", { silent: true });
        }, 30000);

        return () => {
            clearInterval(interval);
        };
    }, [appTrackingCode, performLookup]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (lookupMode === "code") {
            await performLookup(trackingCode, "");
        } else {
            await performLookup("", phone);
        }
    };

    const handleQuickResume = (item: RecentTrackItem) => {
        setTrackingCode(item.code);
        setLookupMode("code");
        void performLookup(item.code, "");
    };

    const handleReset = () => {
        setData(null);
        setUploadedDocs([]);
        setError(null);
        setTrackingCode("");
        setPhone("");
        setJustUpdated(false);
    };

    const isDark = mounted && currentTheme === "dark";

    const renderLiveSyncBadge = () => {
        if (syncStatus === "offline") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                    <WifiOff className="w-3 h-3" />
                    Offline
                </span>
            );
        }
        if (syncStatus === "reconnecting") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Syncing...
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                Live Sync
            </span>
        );
    };

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
                        /* ---------------- Form View ---------------- */
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                        >
                            <div
                                className={cn(
                                    "rounded-2xl p-6 sm:p-8 border backdrop-blur-xl shadow-lg",
                                    isDark
                                        ? "bg-[rgba(15,23,42,0.85)] border-white/10"
                                        : "bg-white/60 border-black/5"
                                )}
                            >
                                {/* Heading */}
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl md:text-3xl font-bold font-heading text-primary">
                                        Track Your Application
                                    </h1>
                                    <div className="mt-2 mx-auto w-12 h-1 rounded-full bg-accent" />
                                    <p className="mt-3 text-sm text-muted-foreground">
                                        Check your live application progress and
                                        document verification status.
                                    </p>
                                </div>

                                {/* Mode Toggle Buttons (44px min height for mobile touch ergonomics) */}
                                <div
                                    role="tablist"
                                    aria-label="Lookup method"
                                    className={cn(
                                        "grid grid-cols-2 gap-1.5 p-1 rounded-xl mb-6 border",
                                        isDark
                                            ? "bg-white/5 border-white/10"
                                            : "bg-black/5 border-black/5"
                                    )}
                                >
                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={lookupMode === "code"}
                                        onClick={() => {
                                            setLookupMode("code");
                                            setError(null);
                                        }}
                                        className={cn(
                                            "min-h-[44px] px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all",
                                            lookupMode === "code"
                                                ? "bg-accent text-accent-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Hash className="w-4 h-4 shrink-0" />
                                        Tracking Code
                                    </button>
                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={lookupMode === "phone"}
                                        onClick={() => {
                                            setLookupMode("phone");
                                            setError(null);
                                        }}
                                        className={cn(
                                            "min-h-[44px] px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all",
                                            lookupMode === "phone"
                                                ? "bg-accent text-accent-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Phone className="w-4 h-4 shrink-0" />
                                        Phone Number
                                    </button>
                                </div>

                                {/* Form */}
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    {lookupMode === "code" ? (
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
                                                autoCapitalize="characters"
                                                spellCheck={false}
                                                enterKeyHint="search"
                                                placeholder="NX-XXXXXXXX"
                                                value={trackingCode}
                                                onChange={(e) =>
                                                    setTrackingCode(
                                                        e.target.value.toUpperCase()
                                                    )
                                                }
                                                className={cn(
                                                    "w-full min-h-[44px] px-4 py-3 rounded-xl border text-sm font-mono tracking-wider uppercase transition-colors duration-200",
                                                    "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
                                                    isDark
                                                        ? "bg-white/5 border-white/10 text-foreground"
                                                        : "bg-white/80 border-black/10 text-foreground"
                                                )}
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label
                                                htmlFor="phone"
                                                className="block text-sm font-medium text-foreground mb-1.5"
                                            >
                                                Registered Phone Number
                                            </label>
                                            <input
                                                id="phone"
                                                type="tel"
                                                inputMode="tel"
                                                enterKeyHint="search"
                                                required
                                                placeholder="+8801XXXXXXXXX"
                                                value={phone}
                                                onChange={(e) =>
                                                    setPhone(e.target.value)
                                                }
                                                className={cn(
                                                    "w-full min-h-[44px] px-4 py-3 rounded-xl border text-sm transition-colors duration-200",
                                                    "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
                                                    isDark
                                                        ? "bg-white/5 border-white/10 text-foreground"
                                                        : "bg-white/80 border-black/10 text-foreground"
                                                )}
                                            />
                                        </div>
                                    )}

                                    {/* Error message */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    height: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    height: "auto",
                                                }}
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
                                            "w-full min-h-[44px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300",
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

                                {/* Saved Recent Tracking Codes */}
                                {recentTracks.length > 0 && !loading && (
                                    <div className="mt-6 pt-5 border-t border-border/60">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                            <History className="w-3.5 h-3.5 text-accent" />
                                            Recent Applications
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {recentTracks.map((item) => (
                                                <div
                                                    key={item.code}
                                                    className={cn(
                                                        "inline-flex items-center rounded-xl border text-xs transition-all overflow-hidden",
                                                        isDark
                                                            ? "bg-white/5 border-white/10 hover:border-accent/40"
                                                            : "bg-black/[0.03] border-black/10 hover:border-accent/40"
                                                    )}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleQuickResume(
                                                                item
                                                            )
                                                        }
                                                        className="min-h-[44px] px-3 py-2 flex items-center gap-2 text-left hover:bg-accent/10 transition-colors"
                                                    >
                                                        <span className="font-mono font-bold text-accent">
                                                            {item.code}
                                                        </span>
                                                        {item.name && (
                                                            <span className="text-muted-foreground truncate max-w-[110px]">
                                                                {item.name}
                                                            </span>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeRecentTrack(
                                                                item.code
                                                            )
                                                        }
                                                        aria-label={`Remove ${item.code} from recent history`}
                                                        className="min-h-[44px] px-2.5 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors border-l border-border/50"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Loading skeleton - timeline shimmer */}
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
                        /* ---------------- Results View ---------------- */
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
                                <div className="flex items-start justify-between gap-4 flex-wrap">
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
                                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                                        {/* Live Sync indicator pill */}
                                        {renderLiveSyncBadge()}
                                        {/* Tracking code badge */}
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 whitespace-nowrap font-mono">
                                            {data.tracking_code}
                                        </span>
                                    </div>
                                </div>

                                {/* Live update notification banner */}
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
                                            {updateMessage}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Timeline & Documents Card */}
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
                                {(data.current_step <= 2 ||
                                    uploadedDocs.length > 0) && (
                                    <DocumentUpload
                                        trackingCode={data.tracking_code}
                                        initialDocuments={uploadedDocs}
                                        onDocumentsUpdated={(docs) =>
                                            setUploadedDocs(docs)
                                        }
                                        canUpload={
                                            data.current_step <= 2 ||
                                            uploadedDocs.some(
                                                (d) => d.status === "rejected"
                                            )
                                        }
                                    />
                                )}
                            </div>

                            {/* Celebration overlay */}
                            {(data.current_step === 6 ||
                                data.current_step === 7) && (
                                <div className="fixed left-1/2 top-1/4 -translate-x-1/2 pointer-events-none z-50">
                                    <ConfettiExplosion
                                        force={0.8}
                                        duration={3500}
                                        particleCount={250}
                                        width={1600}
                                    />
                                </div>
                            )}

                            {/* Check Another button */}
                            <motion.button
                                type="button"
                                onClick={handleReset}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "w-full min-h-[44px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 border",
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
