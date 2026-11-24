"use client";

import { useState, useEffect, useCallback, useRef, FormEvent, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
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
    Copy,
    Check,
    Share2,
    Mail,
    UploadCloud,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/use-mounted";
import { ApplicationTimeline } from "@/components/tracker/ApplicationTimeline";
import { DocumentUpload } from "@/components/tracker/DocumentUpload";
import ConfettiExplosion from "react-confetti-explosion";
import type { Application, UploadedDocumentInfo } from "@/lib/supabase";
import { useTranslation } from "@/i18n/LanguageContext";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const RECENT_TRACKS_STORAGE_KEY = "nextep_recent_tracks";
const MAX_RECENT_TRACKS = 5;
const TRACKING_CODE_REGEX = /^NX-[A-Z0-9]{8}$/;

export interface RecentTrackItem {
    code: string;
    name: string;
    destination?: string | null;
    phone?: string;
    updatedAt: string;
}

const subscribeMobile = (callback: () => void) => {
    const mq = window.matchMedia("(max-width: 767px)");
    mq.addEventListener("change", callback);
    return () => mq.removeEventListener("change", callback);
};

function parseSmartTrackingCode(raw: string): string {
    const upper = raw.toUpperCase();
    const extracted = upper.match(/NX-[A-Z0-9]{8}/);
    if (extracted) {
        return extracted[0];
    }
    const compact = upper.replace(/\s+/g, "");
    if (/^[A-Z0-9]{8}$/.test(compact)) {
        return `NX-${compact}`;
    }
    return compact;
}

function SkeletonBar({ width, className }: { width: string; className?: string }) {
    return (
        <div
            className={cn("h-3 rounded-full animate-pulse bg-muted-foreground/10", className)}
            style={{ width }}
        />
    );
}

export function TrackPageClient() {
    const { theme, systemTheme } = useTheme();
    const mounted = useMounted();
    const { t } = useTranslation();
    const currentTheme = theme === "system" ? systemTheme : theme;
    const searchParams = useSearchParams();
    const isMobileViewport = useSyncExternalStore(
        subscribeMobile,
        () => window.matchMedia("(max-width: 767px)").matches,
        () => true
    );

    const [lookupMode, setLookupMode] = useState<"code" | "phone">("code");
    const [trackingCode, setTrackingCode] = useState(
        () => searchParams.get("code")?.trim().toUpperCase() || ""
    );
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Application | null>(null);
    const [uploadedDocs, setUploadedDocs] = useState<UploadedDocumentInfo[]>([]);
    const [copiedCode, setCopiedCode] = useState(false);

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
                                    TRACKING_CODE_REGEX.test(item.code)
                            )
                    );
                }
            }
        } catch {
            // Ignore localStorage access errors
        }
        return [];
    });

    const [justUpdated, setJustUpdated] = useState(false);
    const [updateMessage, setUpdateMessage] = useState("Status updated just now");
    const [syncStatus, setSyncStatus] = useState<"live" | "reconnecting" | "offline">("live");
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

    const saveRecentTrack = useCallback((app: Application, usedPhone?: string) => {
        try {
            setRecentTracks((prev) => {
                const existing = prev.find((item) => item.code === app.tracking_code);
                const entry: RecentTrackItem = {
                    code: app.tracking_code,
                    name: app.name,
                    destination: app.destination,
                    phone: usedPhone || existing?.phone || undefined,
                    updatedAt: new Date().toISOString(),
                };
                const next = [
                    entry,
                    ...prev.filter((item) => item.code !== app.tracking_code),
                ].slice(0, MAX_RECENT_TRACKS);
                localStorage.setItem(RECENT_TRACKS_STORAGE_KEY, JSON.stringify(next));
                return next;
            });
        } catch {
            // Ignore localStorage write errors
        }
    }, []);

    const removeRecentTrack = (codeToRemove: string) => {
        try {
            setRecentTracks((prev) => {
                const next = prev.filter((item) => item.code !== codeToRemove);
                localStorage.setItem(RECENT_TRACKS_STORAGE_KEY, JSON.stringify(next));
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
            const cleanCode = codeInput ? parseSmartTrackingCode(codeInput) : "";
            const cleanPhone = phoneInput.trim();

            if (!cleanCode && !cleanPhone) return;

            // Client-side format validation before hitting rate-limited /api/track
            if (cleanCode && !cleanPhone && !TRACKING_CODE_REGEX.test(cleanCode)) {
                if (!silent) {
                    setError("Please enter a valid tracking code like NX-A7K2M9X1 (8 characters after NX-).");
                }
                return;
            }
            if (cleanPhone && !cleanCode && cleanPhone.replace(/[^\d]/g, "").length < 8) {
                if (!silent) {
                    setError("Please enter a valid registered phone number (e.g. 017XXXXXXXX).");
                }
                return;
            }

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
                    const nextDocs: UploadedDocumentInfo[] = Array.isArray(json.uploadedDocuments)
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

                    // Persist active tracking code in URL so low-RAM mobile camera tab reloads keep session
                    if (typeof window !== "undefined") {
                        const nextUrl = `/track?code=${encodeURIComponent(nextApp.tracking_code)}`;
                        if (window.location.pathname + window.location.search !== nextUrl) {
                            window.history.replaceState(null, "", nextUrl);
                        }
                    }
                } else if (!silent) {
                    setError(json.error || "Something went wrong.");
                }
            } catch {
                if (!silent) {
                    setError("Network error. Please check your connection and try again.");
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
            const parsed = parseSmartTrackingCode(urlCode);
            setTrackingCode(parsed);
            setLookupMode("code");
            if (TRACKING_CODE_REGEX.test(parsed)) {
                await performLookup(parsed, "");
            }
        };

        void runAuto();
    }, [searchParams, performLookup]);

    const appId = data?.id;
    const appTrackingCode = data?.tracking_code;

    // Lazy-loaded Supabase Realtime subscription (loaded only AFTER code lookup succeeds)
    useEffect(() => {
        if (!appId || !appTrackingCode) return;

        let cancelled = false;
        let cleanup: (() => void) | undefined;

        void import("@/lib/supabase").then(({ supabase }) => {
            if (cancelled) return;

            const channel = supabase
                .channel(`track:${appTrackingCode}`)
                .on("broadcast", { event: "application-updated" }, (payload) => {
                    if (payload.payload && typeof payload.payload === "object") {
                        const updatedApp = payload.payload as Application;
                        if (updatedApp.id && updatedApp.tracking_code) {
                            setData(updatedApp);
                            saveRecentTrack(updatedApp, phone);
                            triggerUpdateBanner("Application status updated live");
                        }
                    }
                })
                .on("broadcast", { event: "application-deleted" }, () => {
                    removeRecentTrack(appTrackingCode);
                    setData(null);
                    setUploadedDocs([]);
                    setError("This application is no longer active.");
                })
                .on("broadcast", { event: "documents_updated" }, (payload) => {
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
                            triggerUpdateBanner("Document feedback added by counselor");
                        } else {
                            triggerUpdateBanner("Documents list updated live");
                        }
                    }
                })
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

            cleanup = () => {
                supabase.removeChannel(channel);
            };
        });

        return () => {
            cancelled = true;
            cleanup?.();
        };
    }, [appId, appTrackingCode, channelRetryKey, phone, saveRecentTrack, triggerUpdateBanner]);

    // Mobile connection resilience
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

        const handleOnline = () => handleReconnectAndSync();
        const handleOffline = () => setSyncStatus("offline");

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [appTrackingCode, performLookup]);

    // Polling fallback
    useEffect(() => {
        if (!appTrackingCode) return;

        const interval = setInterval(() => {
            if (typeof document !== "undefined" && document.visibilityState !== "visible") {
                return;
            }
            void performLookup(appTrackingCode, "", { silent: true });
        }, 30000);

        return () => clearInterval(interval);
    }, [appTrackingCode, performLookup]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (lookupMode === "code") {
            const parsed = parseSmartTrackingCode(trackingCode);
            setTrackingCode(parsed);
            await performLookup(parsed, "");
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
        autoLookupRanRef.current = null;
        if (typeof window !== "undefined") {
            window.history.replaceState(null, "", "/track");
        }
    };

    const handleCopyTrackingCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(true);
            toast.success(t("track.results.codeCopied", undefined, "Tracking code copied!"));
            setTimeout(() => setCopiedCode(false), 2000);
        } catch {
            toast.error("Could not copy tracking code.");
        }
    };

    const handleShareStatus = async () => {
        if (!data) return;
        const currentStepObj = data.notes.find((s) => s.step === data.current_step);
        const stepLabel = currentStepObj?.label || `Step ${data.current_step}`;
        const url =
            typeof window !== "undefined"
                ? `${window.location.origin}/track?code=${encodeURIComponent(data.tracking_code)}`
                : `https://www.nextepedu.com/track?code=${encodeURIComponent(data.tracking_code)}`;
        const text = `NexTep Edu Application Update (${data.tracking_code}): ${data.name} is on Step ${data.current_step}/${data.notes.length} - ${stepLabel}. Track live:`;

        if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
            try {
                await navigator.share({
                    title: `Application Status - ${data.tracking_code}`,
                    text,
                    url,
                });
                return;
            } catch (err) {
                if ((err as Error)?.name === "AbortError") return;
            }
        }
        try {
            await navigator.clipboard.writeText(`${text} ${url}`);
            toast.success(t("track.results.shareCopied", undefined, "Status link copied to share with parents!"));
        } catch {
            toast.error("Could not copy status link.");
        }
    };

    const isDark = mounted && currentTheme === "dark";

    const rejectedDocsCount = uploadedDocs.filter((d) => d.status === "rejected").length;
    const canUploadDocs = Boolean(data && (data.current_step <= 2 || rejectedDocsCount > 0));
    const needsInitialUpload = Boolean(data && data.current_step <= 2 && uploadedDocs.length === 0);

    const renderLiveSyncBadge = () => {
        if (syncStatus === "offline") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                    <WifiOff className="w-3 h-3" />
                    {t("track.sync.offline", undefined, "Offline")}
                </span>
            );
        }
        if (syncStatus === "reconnecting") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    {t("track.sync.reconnecting", undefined, "Syncing...")}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                {t("track.sync.live", undefined, "Live Sync")}
            </span>
        );
    };

    const latestTrack = mounted && recentTracks.length > 0 ? recentTracks[0] : null;

    return (
        <section className="relative min-h-[78vh] flex items-center justify-center py-8 sm:py-16 md:py-20 px-4">
            {/* Subtle ambient light (no animated GPU orbs on phones) */}
            <div className="absolute top-[8%] left-[50%] -translate-x-1/2 w-[480px] h-[480px] bg-[radial-gradient(circle,_rgba(212,175,55,0.11)_0%,_transparent_70%)] -z-10 pointer-events-none" />
            <div className="hidden sm:block absolute bottom-[10%] right-[20%] w-[250px] h-[250px] bg-[radial-gradient(circle,_rgba(212,175,55,0.06)_0%,_transparent_70%)] -z-10 pointer-events-none" />

            <div className="w-full max-w-lg">
                <AnimatePresence mode="wait">
                    {!data ? (
                        /* ---------------- Lookup Form View ---------------- */
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                        >
                            {/* Hoisted 1-Tap Resume Last Tracked Chip (hydration-safe via mounted) */}
                            {latestTrack && !loading && (
                                <button
                                    type="button"
                                    onClick={() => handleQuickResume(latestTrack)}
                                    className="w-full mb-4 p-3.5 rounded-2xl surface-card border-accent/35 hover:border-accent flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                                                {t("track.resumeLast", undefined, "Resume Last Tracked")}
                                            </p>
                                            <p className="text-sm font-bold text-primary truncate">
                                                <span className="font-mono">{latestTrack.code}</span>
                                                {latestTrack.name ? ` - ${latestTrack.name}` : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1.5 rounded-xl bg-accent text-slate-950 text-xs font-bold shrink-0">
                                        {t("track.open", undefined, "Open")}
                                    </span>
                                </button>
                            )}

                            <div className="surface-card rounded-2xl p-5 sm:p-8 shadow-lg">
                                {/* Heading */}
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl md:text-3xl font-bold font-heading text-primary">
                                        {t("track.title", undefined, "Track Your Application")}
                                    </h1>
                                    <div className="mt-2 mx-auto w-12 h-1 rounded-full bg-accent" />
                                    <p className="mt-3 text-sm text-muted-foreground">
                                        {t(
                                            "track.subtitle",
                                            undefined,
                                            "Check your live application progress and document verification status."
                                        )}
                                    </p>
                                </div>

                                {/* Mode Toggle */}
                                <div
                                    role="tablist"
                                    aria-label="Lookup method"
                                    className={cn(
                                        "grid grid-cols-2 gap-1.5 p-1 rounded-xl mb-5 border",
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
                                        {t("track.tabCode", undefined, "Tracking Code")}
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
                                        {t("track.tabPhone", undefined, "Phone Number")}
                                    </button>
                                </div>

                                {/* Lookup Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {lookupMode === "code" ? (
                                        <div>
                                            <label
                                                htmlFor="tracking-code"
                                                className="block text-sm font-medium text-foreground mb-1.5"
                                            >
                                                {t("track.codeLabel", undefined, "Tracking Code")}
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
                                                onPaste={(e) => {
                                                    const pasted = e.clipboardData.getData("text");
                                                    const matched = pasted.toUpperCase().match(/NX-[A-Z0-9]{8}/);
                                                    if (matched) {
                                                        e.preventDefault();
                                                        setTrackingCode(matched[0]);
                                                        setError(null);
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const val = e.target.value.toUpperCase();
                                                    const matched = val.match(/NX-[A-Z0-9]{8}/);
                                                    setTrackingCode(matched ? matched[0] : val);
                                                    if (error) setError(null);
                                                }}
                                                className={cn(
                                                    "w-full min-h-[48px] px-4 py-3 rounded-xl border text-base sm:text-sm font-mono tracking-wider uppercase transition-colors duration-200",
                                                    "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
                                                    isDark
                                                        ? "bg-white/5 border-white/10 text-foreground"
                                                        : "bg-white/80 border-black/10 text-foreground"
                                                )}
                                            />
                                            <p className="text-[11px] text-muted-foreground mt-1.5">
                                                {t(
                                                    "track.codePasteHint",
                                                    undefined,
                                                    "Tip: You can paste the full WhatsApp confirmation message and we'll extract your code."
                                                )}
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <label
                                                htmlFor="phone"
                                                className="block text-sm font-medium text-foreground mb-1.5"
                                            >
                                                {t("track.phoneLabel", undefined, "Registered Phone Number")}
                                            </label>
                                            <input
                                                id="phone"
                                                type="tel"
                                                inputMode="tel"
                                                enterKeyHint="search"
                                                required
                                                placeholder="+8801XXXXXXXXX"
                                                value={phone}
                                                onChange={(e) => {
                                                    setPhone(e.target.value);
                                                    if (error) setError(null);
                                                }}
                                                className={cn(
                                                    "w-full min-h-[48px] px-4 py-3 rounded-xl border text-base sm:text-sm transition-colors duration-200",
                                                    "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
                                                    isDark
                                                        ? "bg-white/5 border-white/10 text-foreground"
                                                        : "bg-white/80 border-black/10 text-foreground"
                                                )}
                                            />
                                        </div>
                                    )}

                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex items-start gap-2 text-sm text-red-500 dark:text-red-400 bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20"
                                            >
                                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                                <span>{error}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={cn(
                                            "w-full min-h-[48px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200",
                                            "bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20",
                                            "disabled:opacity-60 disabled:cursor-not-allowed"
                                        )}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                {t("track.searching", undefined, "Searching...")}
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-4 h-4" />
                                                {t("track.submit", undefined, "Track Application")}
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Saved Recent Tracking Codes (hydration-safe via mounted) */}
                                {mounted && recentTracks.length > 0 && !loading && (
                                    <div className="mt-6 pt-5 border-t border-border/60">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                            <History className="w-3.5 h-3.5 text-accent" />
                                            {t("track.recentTitle", undefined, "Recent Applications")}
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
                                                        onClick={() => handleQuickResume(item)}
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
                                                        onClick={() => removeRecentTrack(item.code)}
                                                        aria-label={`Remove ${item.code} from recent history`}
                                                        className="min-h-[44px] w-10 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors border-l border-border/50"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Loading Skeleton */}
                                <AnimatePresence>
                                    {loading && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="mt-7 space-y-4"
                                        >
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="flex items-start gap-3.5">
                                                    <div className="w-10 h-10 rounded-full bg-muted-foreground/10 animate-pulse shrink-0" />
                                                    <div className="flex-1 space-y-2 pt-1">
                                                        <SkeletonBar width={i % 2 === 0 ? "60%" : "75%"} />
                                                        <SkeletonBar width="40%" className="h-2" />
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
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                            className="space-y-4 sm:space-y-5"
                        >
                            {/* Top Action Needed Banner when document upload or re-upload is required */}
                            {(rejectedDocsCount > 0 || needsInitialUpload) && (
                                <div
                                    className={cn(
                                        "rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                                        rejectedDocsCount > 0
                                            ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
                                            : "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200"
                                    )}
                                >
                                    <div className="flex items-start gap-2.5 min-w-0">
                                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold leading-snug">
                                                {rejectedDocsCount > 0
                                                    ? t(
                                                          "track.actionNeeded.reuploadTitle",
                                                          { count: String(rejectedDocsCount) },
                                                          `Action Needed: Re-upload ${rejectedDocsCount} Document${rejectedDocsCount > 1 ? "s" : ""}`
                                                      )
                                                    : t(
                                                          "track.actionNeeded.uploadTitle",
                                                          undefined,
                                                          "Action Needed: Upload Your Documents"
                                                      )}
                                            </p>
                                            <p className="text-xs opacity-85 mt-0.5 leading-snug">
                                                {rejectedDocsCount > 0
                                                    ? t(
                                                          "track.actionNeeded.reuploadDesc",
                                                          undefined,
                                                          "Your counselor left feedback below. Upload a clearer copy to keep your application moving."
                                                      )
                                                    : t(
                                                          "track.actionNeeded.uploadDesc",
                                                          undefined,
                                                          "Upload your passport, transcripts, or IELTS certificate so our team can verify your file."
                                                      )}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            document
                                                .getElementById("documents-section")
                                                ?.scrollIntoView({ behavior: "smooth", block: "start" });
                                        }}
                                        className={cn(
                                            "min-h-[44px] px-4 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors",
                                            rejectedDocsCount > 0
                                                ? "bg-red-500 text-white hover:bg-red-600"
                                                : "bg-accent text-slate-950 hover:brightness-110"
                                        )}
                                    >
                                        <UploadCloud className="w-4 h-4 shrink-0" />
                                        <span>
                                            {rejectedDocsCount > 0
                                                ? t("track.actionNeeded.goReupload", undefined, "Re-upload Now")
                                                : t("track.actionNeeded.goUpload", undefined, "Upload Now")}
                                        </span>
                                    </button>
                                </div>
                            )}

                            {/* Applicant Summary Header Card */}
                            <div className="surface-card rounded-2xl p-4 sm:p-6 shadow-lg space-y-4">
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div className="min-w-0">
                                        <h2 className="text-xl md:text-2xl font-bold font-heading text-primary truncate">
                                            {data.name}
                                        </h2>
                                        {data.destination && (
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                {t("track.results.destination", undefined, "Destination:")}{" "}
                                                <span className="text-foreground font-medium">
                                                    {data.destination}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                        {renderLiveSyncBadge()}
                                        {/* Tap-to-copy Tracking Code Badge */}
                                        <button
                                            type="button"
                                            onClick={() => void handleCopyTrackingCode(data.tracking_code)}
                                            className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1 rounded-full text-xs font-semibold bg-accent/12 text-accent border border-accent/25 hover:bg-accent/20 transition-colors font-mono"
                                            title="Tap to copy tracking code"
                                        >
                                            <span>{data.tracking_code}</span>
                                            {copiedCode ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Student Utility Bar: Share Status + Email Support */}
                                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-border/50">
                                    <button
                                        type="button"
                                        onClick={() => void handleShareStatus()}
                                        className="min-h-[44px] px-3 rounded-xl border border-border/70 bg-background/70 hover:border-accent/40 text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <Share2 className="w-4 h-4 text-accent shrink-0" />
                                        <span className="truncate">
                                            {t("track.results.shareParents", undefined, "Share Status")}
                                        </span>
                                    </button>
                                    <a
                                        href={`mailto:info@nextepedu.com?subject=${encodeURIComponent(
                                            `Application Inquiry (${data.tracking_code})`
                                        )}`}
                                        className="min-h-[44px] px-3 rounded-xl border border-border/70 bg-background/70 hover:border-accent/40 text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <Mail className="w-4 h-4 text-accent shrink-0" />
                                        <span className="truncate">
                                            {t("track.results.askCounselor", undefined, "Email Support")}
                                        </span>
                                    </a>
                                </div>

                                {/* Live update notification banner */}
                                <AnimatePresence>
                                    {justUpdated && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                                            className="flex items-center gap-2 text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-xl px-3 py-2"
                                        >
                                            <Radio className="w-3.5 h-3.5 shrink-0" />
                                            <span>{updateMessage}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Timeline & Documents Card (no duplicate heading!) */}
                            <div className="surface-card rounded-2xl p-4 sm:p-6 shadow-lg">
                                <ApplicationTimeline
                                    steps={data.notes}
                                    currentStep={data.current_step}
                                />
                                {(data.current_step <= 2 || uploadedDocs.length > 0) && (
                                    <DocumentUpload
                                        trackingCode={data.tracking_code}
                                        initialDocuments={uploadedDocs}
                                        onDocumentsUpdated={(docs) => setUploadedDocs(docs)}
                                        canUpload={canUploadDocs}
                                    />
                                )}
                            </div>

                            {/* Celebration overlay (lighter particle count on mobile GPUs) */}
                            {(data.current_step === 6 || data.current_step === 7) && (
                                <div className="fixed left-1/2 top-1/4 -translate-x-1/2 pointer-events-none z-50">
                                    <ConfettiExplosion
                                        force={0.7}
                                        duration={3000}
                                        particleCount={isMobileViewport ? 80 : 180}
                                        width={isMobileViewport ? 800 : 1400}
                                    />
                                </div>
                            )}

                            {/* Check Another button */}
                            <button
                                type="button"
                                onClick={handleReset}
                                className="surface-card w-full min-h-[48px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-foreground hover:border-accent/40 transition-all active:scale-[0.99]"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {t("track.results.checkAnother", undefined, "Check Another Application")}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
