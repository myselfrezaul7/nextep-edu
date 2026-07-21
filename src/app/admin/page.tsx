"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
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
    Sparkles,
    Users,
    X,
} from "lucide-react";
import { ApplicationTimeline } from "@/components/tracker/ApplicationTimeline";
import { DocumentViewer } from "@/components/admin/DocumentViewer";
import { destinations } from "@/data/destinations";
import type { Application, ApplicationStep } from "@/lib/supabase";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// ─── Step color helper ────────────────────────────────────────
function getStepColor(step: number) {
    if (step <= 2) return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" };
    if (step <= 4) return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" };
    if (step <= 6) return { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" };
    return { bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" };
}

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
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const [view, setView] = useState<"list" | "add" | "edit">("list");
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 25;

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
    const [showSparkle, setShowSparkle] = useState(false);

    // New UI features state
    const [filterStep, setFilterStep] = useState<number | "all">("all");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", destination: "" });
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [undoLoading, setUndoLoading] = useState(false);

    const isDark = mounted && resolvedTheme === "dark";

    useEffect(() => {
        setMounted(true);
        // Set noindex meta tag for admin page
        const meta = document.createElement("meta");
        meta.name = "robots";
        meta.content = "noindex, nofollow";
        document.head.appendChild(meta);
        // Check stored auth
        const storedToken = localStorage.getItem("admin_token");
        if (storedToken && storedToken.length > 20) {
            setToken(storedToken);
            setIsAuthenticated(true);
        }
        return () => {
            document.head.removeChild(meta);
        };
    }, []);


    // ─── Fetch applications ───────────────────────────────────
    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                sortOrder: sortOrder,
            });
            const res = await fetch(`/api/admin/applications?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setApplications(data.applications || []);
                setTotalCount(data.total || 0);
            } else {
                toast.error("Failed to fetch applications.");
            }
        } catch {
            toast.error("Network error while fetching applications.");
        } finally {
            setLoading(false);
        }
    }, [token, currentPage, sortOrder]);

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
                setToken(data.token);
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
        setToken("");
        setIsAuthenticated(false);
        setApplications([]);
        setView("list");
        setSearchQuery("");
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
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(addForm),
            });
            const data = await res.json();
            if (res.ok && data.application) {
                setCreatedApp(data.application);
                setAddForm({ name: "", phone: "", email: "", destination: "" });
                toast.success("Application created successfully!");
            } else {
                toast.error(data.error || "Failed to create application.");
            }
        } catch {
            toast.error("Network error while creating application.");
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
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: selectedApp.id,
                    action: "advance",
                    note: advanceNote,
                }),
            });
            const data = await res.json();
            if (res.ok && data.application) {
                setSelectedApp(data.application); // Optimistic update
                setAdvanceNote("");
                setShowSparkle(true);
                setTimeout(() => setShowSparkle(false), 1500);
                toast.success("Step advanced successfully!");
                fetchApplications(); // Refresh list in background
            } else {
                toast.error(data.error || "Failed to advance step.");
            }
        } catch {
            toast.error("Network error while advancing step.");
        } finally {
            setAdvanceLoading(false);
        }
    };

    const handleUndo = async () => {
        if (!selectedApp) return;
        setUndoLoading(true);
        try {
            const res = await fetch("/api/admin/applications", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: selectedApp.id,
                    action: "undo",
                }),
            });
            const data = await res.json();
            if (res.ok && data.application) {
                setSelectedApp(data.application);
                toast.success("Step undone successfully!");
                fetchApplications();
            } else {
                toast.error(data.error || "Failed to undo step.");
            }
        } catch {
            toast.error("Network error while undoing step.");
        } finally {
            setUndoLoading(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApp) return;
        try {
            const res = await fetch("/api/admin/applications", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: selectedApp.id,
                    action: "edit",
                    ...editForm,
                }),
            });
            const data = await res.json();
            if (res.ok && data.application) {
                setSelectedApp(data.application);
                setIsEditModalOpen(false);
                toast.success("Application updated successfully!");
                fetchApplications();
            } else {
                toast.error(data.error || "Failed to update application.");
            }
        } catch {
            toast.error("Network error while updating application.");
        }
    };

    const handleDelete = async () => {
        if (!selectedApp) return;
        if (!window.confirm("Are you sure you want to permanently delete this application? This action cannot be undone.")) return;
        
        setDeleteLoading(true);
        try {
            const res = await fetch("/api/admin/applications", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: selectedApp.id,
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSelectedApp(null);
                setView("list");
                toast.success("Application deleted successfully!");
                fetchApplications();
            } else {
                toast.error(data.error || "Failed to delete application.");
            }
        } catch {
            toast.error("Network error while deleting application.");
        } finally {
            setDeleteLoading(false);
        }
    };

    // ─── Notify handlers ──────────────────────────────────────
    const handleWhatsApp = (app: Application) => {
        const currentStep = app.notes.find((s) => s.step === app.current_step);
        const stepLabel = currentStep?.label || `Step ${app.current_step}`;
        const text = `Hi ${app.name}! 🎓 Your NexTep Edu application (${app.tracking_code}) has been updated to: *${stepLabel}* (Step ${app.current_step}/7). Track your progress anytime!`;
        const phone = app.phone.replace(/[^0-9]/g, "");
        if (phone.length < 10) {
            toast.error("Invalid phone number format.");
            return;
        }
        window.open(
            `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
            "_blank"
        );
    };

    const handleEmailNotify = async () => {
        if (!selectedApp?.email) return;
        setNotifyLoading(true);
        try {
            const res = await fetch("/api/admin/notify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    applicationId: selectedApp.id,
                    type: "email",
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("Email sent successfully!");
            } else {
                toast.error(data.error || "Failed to send email.");
            }
        } catch {
            toast.error("Network error while sending email.");
        } finally {
            setNotifyLoading(false);
        }
    };

    const handleCopyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
            toast.success("Tracking code copied!");
        } catch {
            toast.error("Failed to copy to clipboard.");
        }
    };

    // ─── Filtered apps ────────────────────────────────────────
    // Note: With server-side pagination and sorting, we only do client-side filtering 
    // for search and step to keep things fast, but ideally these would also move to the server.
    const filteredApps = useMemo(() => {
        let result = applications;

        // 1. Filter by step
        if (filterStep !== "all") {
            result = result.filter(app => app.current_step === filterStep);
        }

        // 2. Filter by search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (app) =>
                    app.name.toLowerCase().includes(q) ||
                    app.tracking_code.toLowerCase().includes(q) ||
                    (app.destination && app.destination.toLowerCase().includes(q))
            );
        }

        // The array is already sorted by the backend query!
        return result;
    }, [applications, searchQuery, filterStep]);

    // Reset page to 1 when filters or sort change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStep, sortOrder]);

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

                        {/* Search, Filter, and Sort */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name, code, or destination..."
                                    aria-label="Search applications"
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none ${
                                        isDark
                                            ? "bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                            : "bg-white/50 border border-black/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                    }`}
                                />
                            </div>
                            <div className="flex gap-4">
                                <select
                                    value={filterStep}
                                    onChange={(e) => setFilterStep(e.target.value === "all" ? "all" : Number(e.target.value))}
                                    className={`px-4 py-3 rounded-xl text-sm outline-none transition-all ${
                                        isDark
                                            ? "bg-white/5 border border-white/10 text-foreground focus:border-accent/50"
                                            : "bg-white/50 border border-black/10 text-foreground focus:border-accent/50"
                                    }`}
                                >
                                    <option value="all">All Steps</option>
                                    {[1,2,3,4,5,6,7].map(step => (
                                        <option key={step} value={step}>Step {step}</option>
                                    ))}
                                </select>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                                    className={`px-4 py-3 rounded-xl text-sm outline-none transition-all ${
                                        isDark
                                            ? "bg-white/5 border border-white/10 text-foreground focus:border-accent/50"
                                            : "bg-white/50 border border-black/10 text-foreground focus:border-accent/50"
                                    }`}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                            </div>
                        </div>

                        {/* Application Cards */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                            </div>
                        ) : filteredApps.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/5 border border-accent/10 mb-5">
                                    <Users className="w-10 h-10 text-accent/40" />
                                </div>
                                <p className="text-muted-foreground text-lg">
                                    {searchQuery
                                        ? "No applicants match your search."
                                        : "No applications yet."}
                                </p>
                                <p className="text-sm text-muted-foreground/60 mt-1">
                                    {searchQuery
                                        ? "Try a different name, code, or destination."
                                        : "Applications from bookings will appear here automatically."}
                                </p>
                                {!searchQuery && (
                                    <button
                                        onClick={() => setView("add")}
                                        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground hover:brightness-110 text-sm font-semibold transition-all"
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
                                            delay: Math.min(index * 0.03, 0.5),
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
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getStepColor(app.current_step).bg} ${getStepColor(app.current_step).text} ${getStepColor(app.current_step).border}`}>
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
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getStepColor(app.current_step).bg} ${getStepColor(app.current_step).text} ${getStepColor(app.current_step).border}`}>
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

                        {/* Pagination Controls */}
                        {!loading && filteredApps.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {filteredApps.length} of {totalCount} applications
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? "border-white/10 hover:bg-white/10 text-foreground" : "border-black/10 hover:bg-black/5 text-foreground"}`}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        disabled={currentPage * itemsPerPage >= totalCount}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? "border-white/10 hover:bg-white/10 text-foreground" : "border-black/10 hover:bg-black/5 text-foreground"}`}
                                    >
                                        Next
                                    </button>
                                </div>
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
                            className={`rounded-2xl p-5 md:p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${glassCard} shadow-lg`}
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
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditForm({
                                            name: selectedApp.name,
                                            phone: selectedApp.phone,
                                            email: selectedApp.email || "",
                                            destination: selectedApp.destination || "",
                                        });
                                        setIsEditModalOpen(true);
                                    }}
                                    className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors border-white/10 text-foreground hover:bg-white/10"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteLoading}
                                    className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors border-red-500/20 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                                >
                                    {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                                </button>
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

                        {/* Documents */}
                        <div className={`rounded-2xl p-5 md:p-6 mb-6 ${glassCard} shadow-lg`}>
                            <h3 className="text-base font-semibold text-foreground mb-4">
                                Uploaded Documents
                            </h3>
                            <DocumentViewer trackingCode={selectedApp.tracking_code} token={token} />
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
                                <div className="relative flex gap-3">
                                    {selectedApp.current_step > 1 && (
                                        <button
                                            onClick={handleUndo}
                                            disabled={undoLoading}
                                            className="px-6 py-3 rounded-xl border border-white/10 text-foreground font-semibold text-sm transition-all hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            {undoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Undo Step"}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to advance to Step ${selectedApp.current_step + 1}? This will send an email notification to the applicant.`)) {
                                                handleAdvance();
                                            }
                                        }}
                                        disabled={advanceLoading}
                                        className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                                    {/* Sparkle celebration */}
                                    <AnimatePresence>
                                        {showSparkle && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                                                className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold whitespace-nowrap"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                Step advanced!
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
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

                {/* ─── EDIT MODAL ─── */}
                {isEditModalOpen && selectedApp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className={`w-full max-w-lg rounded-2xl p-6 ${glassCard} shadow-2xl relative`}
                        >
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                            <h2 className="text-2xl font-bold font-heading text-foreground mb-6">
                                Edit Application
                            </h2>
                            <form onSubmit={handleEdit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Applicant Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all outline-none ${
                                            isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                                        }`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all outline-none ${
                                            isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                                        }`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all outline-none ${
                                            isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        Destination
                                    </label>
                                    <select
                                        value={editForm.destination}
                                        onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all ${
                                            isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                                        }`}
                                    >
                                        <option value="">Select Destination</option>
                                        {DESTINATION_OPTIONS.map((d) => (
                                            <option key={d.slug} value={d.slug}>
                                                {d.flag} {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 py-3 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:brightness-110 transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
