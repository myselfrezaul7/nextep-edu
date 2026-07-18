"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
    Search,
    Plus,
    LogOut,
    ArrowLeft,
    Copy,
    Check,
    Send,
    Mail,
    MessageCircle,
    ChevronRight,
    Lock,
    Loader2,
    Shield,
    StickyNote,
} from "lucide-react";
import { ApplicationTimeline } from "@/components/tracker/ApplicationTimeline";
import { destinations } from "@/data/destinations";
import type { Application, ApplicationStep } from "@/lib/supabase";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// ─── Destination options for dropdown ─────────────────────────
const DESTINATION_OPTIONS = Object.values(destinations).map((d) => ({
    slug: d.slug,
    name: d.name,
    flag: d.flag,
}));

// ─── Helpers ──────────────────────────────────────────────────
function getDestinationFlag(dest: string | null) {
    if (!dest) return "🌍";
    const found = Object.values(destinations).find(
        (d) => d.slug === dest || d.name.toLowerCase() === dest?.toLowerCase()
    );
    return found?.flag || "🌍";
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// ─── Main Admin Page ──────────────────────────────────────────
export default function AdminPage() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const [view, setView] = useState<"list" | "add" | "edit">("list");
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    // Add form
    const [addForm, setAddForm] = useState({
        name: "",
        phone: "",
        email: "",
        destination: "",
    });
    const [addLoading, setAddLoading] = useState(false);
    const [createdApp, setCreatedApp] = useState<Application | null>(null);
    const [codeCopied, setCodeCopied] = useState(false);

    // Edit state
    const [advanceNote, setAdvanceNote] = useState("");
    const [advanceLoading, setAdvanceLoading] = useState(false);
    const [notifyLoading, setNotifyLoading] = useState(false);

    const isDark = mounted && resolvedTheme === "dark";

    useEffect(() => {
        setMounted(true);
        // Set noindex meta tag for admin page
        const meta = document.createElement("meta");
        meta.name = "robots";
        meta.content = "noindex, nofollow";
        document.head.appendChild(meta);
        // Check stored auth
        const token = localStorage.getItem("admin_token");
        if (token === "admin-authenticated") {
            setIsAuthenticated(true);
        }
        return () => {
            document.head.removeChild(meta);
        };
    }, []);

    const token = useMemo(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("admin_token") || "";
        }
        return "";
    }, [isAuthenticated]);

    // ─── Fetch applications ───────────────────────────────────
    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/applications", {
                headers: { Authorization: token },
            });
            if (res.ok) {
                const data = await res.json();
                setApplications(data.applications || []);
            }
        } catch {
            /* swallow */
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchApplications();
        }
    }, [isAuthenticated, fetchApplications]);

    // ─── Auth handler ─────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("");
        setAuthLoading(true);
        try {
            const res = await fetch("/api/admin/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem("admin_token", data.token);
                setIsAuthenticated(true);
                setPassword("");
            } else {
                setAuthError(data.error || "Invalid password");
            }
        } catch {
            setAuthError("Connection error. Please try again.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        setIsAuthenticated(false);
        setApplications([]);
        setView("list");
    };

    // ─── Add application handler ──────────────────────────────
    const handleAddApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        try {
            const res = await fetch("/api/admin/applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify(addForm),
            });
            const data = await res.json();
            if (res.ok) {
                setCreatedApp(data.application);
                setAddForm({ name: "", phone: "", email: "", destination: "" });
            }
        } catch {
            /* swallow */
        } finally {
            setAddLoading(false);
        }
    };

    // ─── Advance step handler ─────────────────────────────────
    const handleAdvance = async () => {
        if (!selectedApp) return;
        setAdvanceLoading(true);
        try {
            const res = await fetch("/api/admin/applications", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({
                    id: selectedApp.id,
                    action: "advance",
                    note: advanceNote,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSelectedApp(data.application);
                setAdvanceNote("");
                fetchApplications();
            }
        } catch {
            /* swallow */
        } finally {
            setAdvanceLoading(false);
        }
    };

    // ─── Notify handlers ──────────────────────────────────────
    const handleWhatsApp = (app: Application) => {
        const currentStep = app.notes.find((s) => s.step === app.current_step);
        const stepLabel = currentStep?.label || `Step ${app.current_step}`;
        const text = `Hi ${app.name}! 🎓 Your NexTep Edu application (${app.tracking_code}) has been updated to: *${stepLabel}* (Step ${app.current_step}/7). Track your progress anytime!`;
        const phone = app.phone.replace(/[^0-9]/g, "");
        window.open(
            `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
            "_blank"
        );
    };

    const handleEmailNotify = async () => {
        if (!selectedApp?.email) return;
        setNotifyLoading(true);
        try {
            await fetch("/api/admin/notify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({
                    applicationId: selectedApp.id,
                    type: "email",
                }),
            });
        } catch {
            /* swallow */
        } finally {
            setNotifyLoading(false);
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    // ─── Filtered apps ────────────────────────────────────────
    const filteredApps = useMemo(() => {
        if (!searchQuery.trim()) return applications;
        const q = searchQuery.toLowerCase();
        return applications.filter(
            (app) =>
                app.name.toLowerCase().includes(q) ||
                app.tracking_code.toLowerCase().includes(q) ||
                (app.destination && app.destination.toLowerCase().includes(q))
        );
    }, [applications, searchQuery]);

    // ─── Glass card classes ───────────────────────────────────
    const glassCard = isDark
        ? "bg-[rgba(15,23,42,0.85)] border border-white/10 backdrop-blur-xl"
        : "bg-white/60 border border-black/5 backdrop-blur-xl";

    const glassCardHover = isDark
        ? "hover:bg-[rgba(15,23,42,0.95)] hover:border-white/20"
        : "hover:bg-white/80 hover:border-black/10";

    // ─── Render ───────────────────────────────────────────────
    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    // ─── LOGIN VIEW ───────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                    className={`w-full max-w-sm rounded-2xl shadow-2xl p-8 ${glassCard}`}
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20 mb-4">
                            <Shield className="w-8 h-8 text-accent" />
                        </div>
                        <h1 className="text-2xl font-bold font-heading text-primary">
                            Admin Access
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            NexTep Edu Dashboard
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none ${
                                    isDark
                                        ? "bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50 focus:bg-white/10"
                                        : "bg-white/50 border border-black/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50 focus:bg-white/70"
                                }`}
                                autoFocus
                            />
                        </div>

                        <AnimatePresence>
                            {authError && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-sm text-red-500 text-center"
                                >
                                    {authError}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={authLoading || !password}
                            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {authLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    // ─── DASHBOARD VIEWS ──────────────────────────────────────
    return (
        <div className="min-h-screen bg-background">
            <AnimatePresence mode="wait">
                {/* ─── LIST VIEW ─── */}
                {view === "list" && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                        className="max-w-5xl mx-auto px-4 py-8"
                    >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold font-heading text-primary">
                                    Application Tracker Admin
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {applications.length} total applicant
                                    {applications.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setView("add");
                                        setCreatedApp(null);
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:brightness-110 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add New
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        isDark
                                            ? "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                                            : "bg-black/5 border border-black/5 text-muted-foreground hover:bg-black/10"
                                    }`}
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, code, or destination..."
                                className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none ${
                                    isDark
                                        ? "bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                        : "bg-white/50 border border-black/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                }`}
                            />
                        </div>

                        {/* Application Cards */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                            </div>
                        ) : filteredApps.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-muted-foreground text-lg">
                                    {searchQuery
                                        ? "No applicants match your search."
                                        : "No applications yet."}
                                </p>
                                {!searchQuery && (
                                    <button
                                        onClick={() => setView("add")}
                                        className="mt-4 inline-flex items-center gap-2 text-accent hover:underline text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add your first applicant
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {filteredApps.map((app, index) => (
                                    <motion.button
                                        key={app.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.4,
                                            delay: index * 0.03,
                                            ease: EASE_OUT_EXPO,
                                        }}
                                        onClick={() => {
                                            setSelectedApp(app);
                                            setView("edit");
                                            setAdvanceNote("");
                                        }}
                                        className={`w-full text-left rounded-2xl p-4 md:p-5 transition-all duration-300 cursor-pointer group ${glassCard} ${glassCardHover} shadow-sm hover:shadow-lg`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="text-2xl flex-shrink-0">
                                                    {getDestinationFlag(
                                                        app.destination
                                                    )}
                                                </span>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-foreground truncate">
                                                        {app.name}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                                        {app.tracking_code}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <div className="text-right hidden sm:block">
                                                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                                                        Step{" "}
                                                        {app.current_step}/7
                                                    </span>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {formatDate(
                                                            app.updated_at
                                                        )}
                                                    </p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                                            </div>
                                        </div>
                                        {/* Mobile step indicator */}
                                        <div className="flex items-center justify-between mt-3 sm:hidden">
                                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                                                Step {app.current_step}/7
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(app.updated_at)}
                                            </p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ─── ADD VIEW ─── */}
                {view === "add" && (
                    <motion.div
                        key="add"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                        className="max-w-lg mx-auto px-4 py-8"
                    >
                        <button
                            onClick={() => {
                                setView("list");
                                setCreatedApp(null);
                                fetchApplications();
                            }}
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to List
                        </button>

                        {createdApp ? (
                            /* ─── Success Screen ─── */
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.5,
                                    ease: EASE_OUT_EXPO,
                                }}
                                className={`rounded-2xl p-8 text-center ${glassCard} shadow-lg`}
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                                    <Check className="w-8 h-8 text-green-500" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground mb-2">
                                    Application Created!
                                </h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    {createdApp.name}&apos;s tracking code:
                                </p>

                                <div
                                    className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl mb-6 ${
                                        isDark
                                            ? "bg-white/5 border border-white/10"
                                            : "bg-black/5 border border-black/10"
                                    }`}
                                >
                                    <span className="text-2xl font-bold font-mono text-accent">
                                        {createdApp.tracking_code}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleCopyCode(
                                                createdApp.tracking_code
                                            )
                                        }
                                        className="p-1.5 rounded-lg hover:bg-accent/10 transition-colors"
                                        title="Copy code"
                                    >
                                        {codeCopied ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={() => {
                                            const text = `Hi ${createdApp.name}! 🎓 Welcome to NexTep Edu! Your application tracking code is: *${createdApp.tracking_code}*. You can use this to track your progress.`;
                                            const phone =
                                                createdApp.phone.replace(
                                                    /[^0-9]/g,
                                                    ""
                                                );
                                            window.open(
                                                `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
                                                "_blank"
                                            );
                                        }}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-all"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Send via WhatsApp
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCreatedApp(null);
                                            setView("list");
                                            fetchApplications();
                                        }}
                                        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            isDark
                                                ? "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                                                : "bg-black/5 border border-black/5 text-muted-foreground hover:bg-black/10"
                                        }`}
                                    >
                                        Done
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            /* ─── Add Form ─── */
                            <div
                                className={`rounded-2xl p-6 md:p-8 ${glassCard} shadow-lg`}
                            >
                                <h2 className="text-xl font-bold font-heading text-primary mb-6">
                                    Add New Applicant
                                </h2>

                                <form
                                    onSubmit={handleAddApplication}
                                    className="space-y-5"
                                >
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Full Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={addForm.name}
                                            onChange={(e) =>
                                                setAddForm({
                                                    ...addForm,
                                                    name: e.target.value,
                                                })
                                            }
                                            required
                                            placeholder="e.g. Rafiq Ahmed"
                                            className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 ${
                                                isDark
                                                    ? "bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                                    : "bg-white/50 border border-black/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                            }`}
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Phone Number{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={addForm.phone}
                                            onChange={(e) =>
                                                setAddForm({
                                                    ...addForm,
                                                    phone: e.target.value,
                                                })
                                            }
                                            required
                                            placeholder="e.g. +8801XXXXXXXXX"
                                            className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 ${
                                                isDark
                                                    ? "bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                                    : "bg-white/50 border border-black/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                            }`}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Email{" "}
                                            <span className="text-xs text-muted-foreground">
                                                (optional)
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            value={addForm.email}
                                            onChange={(e) =>
                                                setAddForm({
                                                    ...addForm,
                                                    email: e.target.value,
                                                })
                                            }
                                            placeholder="student@example.com"
                                            className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 ${
                                                isDark
                                                    ? "bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                                    : "bg-white/50 border border-black/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                            }`}
                                        />
                                    </div>

                                    {/* Destination */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">
                                            Destination
                                        </label>
                                        <select
                                            value={addForm.destination}
                                            onChange={(e) =>
                                                setAddForm({
                                                    ...addForm,
                                                    destination:
                                                        e.target.value,
                                                })
                                            }
                                            className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 appearance-none cursor-pointer ${
                                                isDark
                                                    ? "bg-white/5 border border-white/10 text-foreground focus:border-accent/50"
                                                    : "bg-white/50 border border-black/10 text-foreground focus:border-accent/50"
                                            }`}
                                        >
                                            <option value="">
                                                Select a destination...
                                            </option>
                                            {DESTINATION_OPTIONS.map((d) => (
                                                <option
                                                    key={d.slug}
                                                    value={d.slug}
                                                >
                                                    {d.flag} {d.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={
                                            addLoading ||
                                            !addForm.name ||
                                            !addForm.phone
                                        }
                                        className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {addLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                Create Application
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ─── EDIT VIEW ─── */}
                {view === "edit" && selectedApp && (
                    <motion.div
                        key="edit"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                        className="max-w-2xl mx-auto px-4 py-8"
                    >
                        <button
                            onClick={() => setView("list")}
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to List
                        </button>

                        {/* Applicant Header */}
                        <div
                            className={`rounded-2xl p-5 md:p-6 mb-6 ${glassCard} shadow-lg`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">
                                    {getDestinationFlag(
                                        selectedApp.destination
                                    )}
                                </span>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">
                                        {selectedApp.name}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        <span className="font-mono text-sm text-accent">
                                            {selectedApp.tracking_code}
                                        </span>
                                        {selectedApp.destination && (
                                            <span className="text-xs text-muted-foreground">
                                                →{" "}
                                                {destinations[
                                                    selectedApp.destination
                                                ]?.name ||
                                                    selectedApp.destination}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div
                            className={`rounded-2xl p-5 md:p-6 mb-6 ${glassCard} shadow-lg`}
                        >
                            <h3 className="text-base font-semibold text-foreground mb-4">
                                Application Timeline
                            </h3>
                            <ApplicationTimeline
                                steps={selectedApp.notes}
                                currentStep={selectedApp.current_step}
                            />
                        </div>

                        {/* Advance Step */}
                        {selectedApp.current_step < 7 && (
                            <div
                                className={`rounded-2xl p-5 md:p-6 mb-6 ${glassCard} shadow-lg`}
                            >
                                <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                                    <StickyNote className="w-4 h-4 text-accent" />
                                    Advance Application
                                </h3>
                                <textarea
                                    value={advanceNote}
                                    onChange={(e) =>
                                        setAdvanceNote(e.target.value)
                                    }
                                    placeholder="Add a note for this step (optional)..."
                                    rows={3}
                                    className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 resize-none mb-4 ${
                                        isDark
                                            ? "bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                            : "bg-white/50 border border-black/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                    }`}
                                />
                                <button
                                    onClick={handleAdvance}
                                    disabled={advanceLoading}
                                    className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {advanceLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <ChevronRight className="w-4 h-4" />
                                            Advance to Step{" "}
                                            {selectedApp.current_step + 1}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Notify Buttons */}
                        <div
                            className={`rounded-2xl p-5 md:p-6 ${glassCard} shadow-lg`}
                        >
                            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Send className="w-4 h-4 text-accent" />
                                Notify Applicant
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() =>
                                        handleWhatsApp(selectedApp)
                                    }
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-all"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    WhatsApp
                                </button>

                                <div className="relative flex-1 group">
                                    <button
                                        onClick={handleEmailNotify}
                                        disabled={
                                            !selectedApp.email ||
                                            notifyLoading
                                        }
                                        className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                                            selectedApp.email
                                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                                : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        }`}
                                    >
                                        {notifyLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Mail className="w-4 h-4" />
                                        )}
                                        Email
                                    </button>
                                    {!selectedApp.email && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                                            No email on file
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
