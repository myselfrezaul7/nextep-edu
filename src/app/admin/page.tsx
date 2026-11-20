"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
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
    WifiOff,
    RefreshCw,
    Phone,
    ExternalLink,
    AlertTriangle,
    FileClock,
    FileText,
    ListChecks,
} from "lucide-react";
import { ApplicationTimeline } from "@/components/tracker/ApplicationTimeline";
import { DocumentViewer } from "@/components/admin/DocumentViewer";
import { DESTINATIONS_META, DESTINATIONS_META_LIST } from "@/data/destinations-meta";
import { toWhatsAppPhone } from "@/lib/sanitize";
import { supabase } from "@/lib/supabase";
import type { Application } from "@/lib/supabase";
import { useMounted } from "@/lib/use-mounted";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const subscribeMobileDrawer = (callback: () => void) => {
    const mq = window.matchMedia("(max-width: 1023px)");
    mq.addEventListener("change", callback);
    return () => mq.removeEventListener("change", callback);
};

// --- Step color helper ---
function getStepColor(step: number) {
    if (step <= 2) return { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" };
    if (step <= 4) return { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" };
    if (step <= 6) return { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" };
    return { bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" };
}

// --- Destination options for dropdown -------------------------
const DESTINATION_OPTIONS = DESTINATIONS_META_LIST.map((d) => ({
    slug: d.slug,
    name: d.name,
    flag: d.flag,
}));

// --- Helpers --------------------------------------------------
function getDestinationFlag(dest: string | null) {
    if (!dest) return "🌍";
    const found = DESTINATIONS_META_LIST.find(
        (d) => d.slug === dest || d.name.toLowerCase() === dest?.toLowerCase()
    );
    return found?.flag || "🌍";
}

function normalizeDestinationSlug(dest: string | null | undefined): string {
    if (!dest) return "";
    const trimmed = dest.trim();
    const lower = trimmed.toLowerCase();
    const found = DESTINATIONS_META_LIST.find(
        (d) => d.slug.toLowerCase() === lower || d.name.toLowerCase() === lower
    );
    return found ? found.slug : trimmed;
}

function getPendingDocCounts(app: Application): { pending: number; rejected: number } {
    let pending = 0;
    let rejected = 0;
    if (!Array.isArray(app.notes)) return { pending, rejected };
    for (const step of app.notes) {
        if (step?.document_reviews && typeof step.document_reviews === "object") {
            for (const review of Object.values(step.document_reviews)) {
                if (review?.status === "pending") pending += 1;
                else if (review?.status === "rejected") rejected += 1;
            }
        }
    }
    return { pending, rejected };
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// --- Main Admin Page ------------------------------------------
export default function AdminPage() {
    const { resolvedTheme } = useTheme();
    const mounted = useMounted();

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("admin_token");
            return Boolean(storedToken && storedToken.length > 20);
        }
        return false;
    });
    const [token, setToken] = useState(() => {
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("admin_token");
            if (storedToken && storedToken.length > 20) return storedToken;
        }
        return "";
    });
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const [view, setView] = useState<"list" | "add" | "edit">("list");
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 25;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 250);
        return () => clearTimeout(timer);
    }, [searchQuery]);

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
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [undoLoading, setUndoLoading] = useState(false);
    const [drawerTab, setDrawerTab] = useState<"actions" | "timeline">("actions");
    const [confirmAction, setConfirmAction] = useState<{
        title: string;
        description: string;
        confirmLabel: string;
        destructive?: boolean;
        onConfirm: () => void;
    } | null>(null);

    const isMobileDrawer = useSyncExternalStore(
        subscribeMobileDrawer,
        () => window.matchMedia("(max-width: 1023px)").matches,
        () => false
    );
    const drawerDragControls = useDragControls();

    // Realtime & connection resilience state
    const [syncStatus, setSyncStatus] = useState<"live" | "reconnecting" | "offline">("live");
    const [channelRetryKey, setChannelRetryKey] = useState(0);
    const [docRefreshTrigger, setDocRefreshTrigger] = useState(0);
    const selectedAppRef = useRef<Application | null>(null);
    const lastCreatedIdRef = useRef<string | null>(null);

    useEffect(() => {
        selectedAppRef.current = selectedApp;
    }, [selectedApp]);

    const openAppDetail = useCallback((app: Application, pushHistory = true) => {
        setSelectedApp(app);
        setView("edit");
        setDrawerTab("actions");
        setAdvanceNote("");
        if (pushHistory && typeof window !== "undefined") {
            const nextUrl = `/admin?app=${encodeURIComponent(app.tracking_code)}`;
            if (window.location.pathname + window.location.search !== nextUrl) {
                window.history.pushState({ adminApp: app.tracking_code }, "", nextUrl);
            }
        }
    }, []);

    const closeAppDetail = useCallback((replaceUrl = true) => {
        setView("list");
        if (replaceUrl && typeof window !== "undefined" && window.location.search.includes("app=")) {
            if (window.history.state && (window.history.state as { adminApp?: string }).adminApp) {
                window.history.back();
            } else {
                window.history.replaceState(null, "", "/admin");
            }
        }
    }, []);

    // Escape key dismissal for confirm sheet, edit modal, and mobile detail drawer
    useEffect(() => {
        if (!confirmAction && !isEditModalOpen && !(view === "edit" && isMobileDrawer)) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Escape" || e.defaultPrevented) return;
            if (confirmAction) {
                setConfirmAction(null);
            } else if (isEditModalOpen && !editLoading) {
                setIsEditModalOpen(false);
            } else if (view === "edit" && isMobileDrawer) {
                closeAppDetail();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [confirmAction, isEditModalOpen, editLoading, view, isMobileDrawer, closeAppDetail]);

    // Handle Android Back / Browser popstate to close detail drawer smoothly
    useEffect(() => {
        if (typeof window === "undefined") return;
        const onPopState = () => {
            const params = new URLSearchParams(window.location.search);
            const appCode = params.get("app")?.trim().toUpperCase();
            if (!appCode) {
                setView("list");
            } else {
                const match = applications.find((a) => a.tracking_code === appCode);
                if (match) {
                    setSelectedApp(match);
                    setView("edit");
                }
            }
        };
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, [applications]);

    // Body scroll lock when mobile detail drawer, edit modal, or confirm sheet is open
    useEffect(() => {
        const shouldLock =
            (view === "edit" && isMobileDrawer) || isEditModalOpen || Boolean(confirmAction);
        if (!shouldLock) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [view, isMobileDrawer, isEditModalOpen, confirmAction]);

    const isDark = mounted && resolvedTheme === "dark";
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        // Set noindex meta tag for admin page
        const meta = document.createElement("meta");
        meta.name = "robots";
        meta.content = "noindex, nofollow";
        document.head.appendChild(meta);
        return () => {
            mountedRef.current = false;
            document.head.removeChild(meta);
        };
    }, []);


    const handleLogout = useCallback(() => {
        localStorage.removeItem("admin_token");
        setToken("");
        setIsAuthenticated(false);
        setApplications([]);
        setView("list");
        setSearchQuery("");
    }, []);

    // --- Fetch applications ---
    const fetchApplications = useCallback(async (options?: { silent?: boolean }) => {
        const silent = Boolean(options?.silent);
        if (!silent) {
            setLoading(true);
        }
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                sortOrder: sortOrder,
            });
            if (filterStep !== "all") {
                params.set("step", filterStep.toString());
            }
            if (debouncedSearch.trim()) {
                params.set("search", debouncedSearch.trim());
            }
            const res = await fetch(`/api/admin/applications?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
                handleLogout();
                toast.error("Session expired. Please log in again.");
                return;
            }
            if (res.ok) {
                const data = await res.json();
                const fetchedApps: Application[] = data.applications || [];
                setApplications(fetchedApps);
                setTotalCount(data.total || 0);
                setSyncStatus("live");
                if (selectedAppRef.current) {
                    const updatedSelected = fetchedApps.find(
                        (a) => a.id === selectedAppRef.current?.id
                    );
                    if (updatedSelected) {
                        setSelectedApp(updatedSelected);
                    }
                } else if (typeof window !== "undefined") {
                    const urlAppCode = new URLSearchParams(window.location.search)
                        .get("app")
                        ?.trim()
                        .toUpperCase();
                    if (urlAppCode) {
                        const matched = fetchedApps.find(
                            (a) => a.tracking_code === urlAppCode
                        );
                        if (matched) {
                            openAppDetail(matched, false);
                        }
                    }
                }
            } else if (!silent) {
                toast.error("Failed to fetch applications.");
            }
        } catch {
            if (!silent) {
                toast.error("Network error while fetching applications.");
            } else {
                setSyncStatus("offline");
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, [token, currentPage, sortOrder, filterStep, debouncedSearch, handleLogout, openAppDetail]);

    useEffect(() => {
        if (!isAuthenticated) return;
        let isMounted = true;
        const load = async () => {
            await Promise.resolve();
            if (isMounted) {
                void fetchApplications();
            }
        };
        load();
        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, fetchApplications]);

    // --- Supabase Realtime subscription on admin:live ---
    useEffect(() => {
        if (!isAuthenticated) return;

        const channel = supabase
            .channel("admin:live")
            .on(
                "broadcast",
                { event: "application-created" },
                (payload) => {
                    const body = payload.payload as
                        | { application?: Application }
                        | undefined;
                    if (
                        body?.application &&
                        body.application.id !== lastCreatedIdRef.current
                    ) {
                        toast.success(
                            `New application received: ${body.application.name}`
                        );
                    }
                    void fetchApplications({ silent: true });
                }
            )
            .on(
                "broadcast",
                { event: "application-updated" },
                (payload) => {
                    const body = payload.payload as
                        | { application?: Application }
                        | undefined;
                    const updatedApp = body?.application;
                    if (updatedApp && updatedApp.id) {
                        setApplications((prev) =>
                            prev.map((a) =>
                                a.id === updatedApp.id ? updatedApp : a
                            )
                        );
                        if (selectedAppRef.current?.id === updatedApp.id) {
                            setSelectedApp(updatedApp);
                        }
                    } else {
                        void fetchApplications({ silent: true });
                    }
                }
            )
            .on(
                "broadcast",
                { event: "application-deleted" },
                (payload) => {
                    const body = payload.payload as
                        | { application?: { id?: string } }
                        | undefined;
                    const deletedId = body?.application?.id;
                    if (deletedId) {
                        setApplications((prev) =>
                            prev.filter((a) => a.id !== deletedId)
                        );
                        setTotalCount((prev) => Math.max(0, prev - 1));
                        if (selectedAppRef.current?.id === deletedId) {
                            setSelectedApp(null);
                            setView("list");
                        }
                    } else {
                        void fetchApplications({ silent: true });
                    }
                }
            )
            .on(
                "broadcast",
                { event: "documents_updated" },
                (payload) => {
                    const body = payload.payload as
                        | { trackingCode?: string; action?: string }
                        | undefined;
                    if (body?.trackingCode) {
                        if (
                            selectedAppRef.current?.tracking_code ===
                            body.trackingCode
                        ) {
                            setDocRefreshTrigger((prev) => prev + 1);
                        }
                        if (body.action === "uploaded") {
                            toast.success(
                                `New document uploaded (${body.trackingCode})`
                            );
                        }
                    }
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
    }, [isAuthenticated, channelRetryKey, fetchApplications]);

    // --- Mobile connection resilience (visibilitychange, online, offline) ---
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleReconnectAndSync = () => {
            if (typeof navigator !== "undefined" && !navigator.onLine) {
                setSyncStatus("offline");
                return;
            }
            setSyncStatus("reconnecting");
            setChannelRetryKey((prev) => prev + 1);
            void fetchApplications({ silent: true });
            if (selectedAppRef.current) {
                setDocRefreshTrigger((prev) => prev + 1);
            }
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
    }, [isAuthenticated, fetchApplications]);

    // --- Auth handler ---
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


    // --- Add application handler ---
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
                lastCreatedIdRef.current = data.application.id;
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

    // --- Advance step handler (with instant optimistic UI update) ---
    const handleAdvance = async () => {
        if (!selectedApp || selectedApp.current_step >= 7) return;
        const previousApp = selectedApp;
        const nextStepNum = selectedApp.current_step + 1;
        const optimisticNow = new Date().toISOString();
        const optimisticApp: Application = {
            ...selectedApp,
            current_step: nextStepNum,
            notes: selectedApp.notes.map((step, idx) =>
                idx === nextStepNum - 1
                    ? {
                          ...step,
                          date: optimisticNow,
                          note: advanceNote || step.note,
                      }
                    : step
            ),
            updated_at: optimisticNow,
        };

        setAdvanceLoading(true);
        setSelectedApp(optimisticApp);
        setApplications((prev) =>
            prev.map((a) => (a.id === optimisticApp.id ? optimisticApp : a))
        );

        try {
            const res = await fetch("/api/admin/applications", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: previousApp.id,
                    action: "advance",
                    note: advanceNote,
                    updated_at: previousApp.updated_at,
                }),
            });
            const data = await res.json();
            if (res.status === 409) {
                toast.error("Data was modified by another user. Refreshing...");
                void fetchApplications({ silent: true });
                setSelectedApp(null);
                return;
            }
            if (res.ok && data.application) {
                setSelectedApp(data.application);
                setApplications((prev) =>
                    prev.map((a) =>
                        a.id === data.application.id ? data.application : a
                    )
                );
                setAdvanceNote("");
                setShowSparkle(true);
                setTimeout(() => { if (mountedRef.current) setShowSparkle(false); }, 1500);
                toast.success("Step advanced successfully!");
                void fetchApplications({ silent: true });
            } else {
                setSelectedApp(previousApp);
                setApplications((prev) =>
                    prev.map((a) => (a.id === previousApp.id ? previousApp : a))
                );
                toast.error(data.error || "Failed to advance step.");
            }
        } catch {
            setSelectedApp(previousApp);
            setApplications((prev) =>
                prev.map((a) => (a.id === previousApp.id ? previousApp : a))
            );
            toast.error("Network error while advancing step.");
        } finally {
            setAdvanceLoading(false);
        }
    };

    const handleUndo = async () => {
        if (!selectedApp || selectedApp.current_step <= 1) return;
        const previousApp = selectedApp;
        const prevStepNum = selectedApp.current_step - 1;
        const optimisticNow = new Date().toISOString();
        const optimisticApp: Application = {
            ...selectedApp,
            current_step: prevStepNum,
            notes: selectedApp.notes.map((step, idx) =>
                idx === selectedApp.current_step - 1
                    ? { ...step, date: null, note: "" }
                    : step
            ),
            updated_at: optimisticNow,
        };

        setUndoLoading(true);
        setSelectedApp(optimisticApp);
        setApplications((prev) =>
            prev.map((a) => (a.id === optimisticApp.id ? optimisticApp : a))
        );

        try {
            const res = await fetch("/api/admin/applications", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: previousApp.id,
                    action: "undo",
                    updated_at: previousApp.updated_at,
                }),
            });
            const data = await res.json();
            if (res.status === 409) {
                toast.error("Data was modified by another user. Refreshing...");
                void fetchApplications({ silent: true });
                setSelectedApp(null);
                return;
            }
            if (res.ok && data.application) {
                setSelectedApp(data.application);
                setApplications((prev) =>
                    prev.map((a) =>
                        a.id === data.application.id ? data.application : a
                    )
                );
                toast.success("Step undone successfully!");
                void fetchApplications({ silent: true });
            } else {
                setSelectedApp(previousApp);
                setApplications((prev) =>
                    prev.map((a) => (a.id === previousApp.id ? previousApp : a))
                );
                toast.error(data.error || "Failed to undo step.");
            }
        } catch {
            setSelectedApp(previousApp);
            setApplications((prev) =>
                prev.map((a) => (a.id === previousApp.id ? previousApp : a))
            );
            toast.error("Network error while undoing step.");
        } finally {
            setUndoLoading(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApp || editLoading) return;
        const previousApp = selectedApp;
        const optimisticApp: Application = {
            ...selectedApp,
            name: editForm.name.trim(),
            phone: editForm.phone.trim(),
            email: editForm.email.trim() || null,
            destination: editForm.destination || null,
        };
        setEditLoading(true);
        setSelectedApp(optimisticApp);
        setApplications((prev) =>
            prev.map((a) => (a.id === optimisticApp.id ? optimisticApp : a))
        );

        try {
            const res = await fetch("/api/admin/applications", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: previousApp.id,
                    action: "edit",
                    updated_at: previousApp.updated_at,
                    ...editForm,
                }),
            });
            const data = await res.json();
            if (res.status === 409) {
                toast.error("Data was modified by another user. Refreshing...");
                void fetchApplications({ silent: true });
                setIsEditModalOpen(false);
                setSelectedApp(null);
                return;
            }
            if (res.ok && data.application) {
                setSelectedApp(data.application);
                setApplications((prev) =>
                    prev.map((a) =>
                        a.id === data.application.id ? data.application : a
                    )
                );
                setIsEditModalOpen(false);
                toast.success("Application updated successfully!");
                void fetchApplications({ silent: true });
            } else {
                setSelectedApp(previousApp);
                setApplications((prev) =>
                    prev.map((a) => (a.id === previousApp.id ? previousApp : a))
                );
                toast.error(data.error || "Failed to update application.");
            }
        } catch {
            setSelectedApp(previousApp);
            setApplications((prev) =>
                prev.map((a) => (a.id === previousApp.id ? previousApp : a))
            );
            toast.error("Network error while updating application.");
        } finally {
            setEditLoading(false);
        }
    };

    const executeDelete = async () => {
        if (!selectedApp) return;
        setConfirmAction(null);
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
                closeAppDetail();
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

    const requestDeleteConfirm = () => {
        if (!selectedApp) return;
        setConfirmAction({
            title: "Delete Application?",
            description: `Permanently delete ${selectedApp.name} (${selectedApp.tracking_code}) and its timeline? This action cannot be undone.`,
            confirmLabel: "Delete Permanently",
            destructive: true,
            onConfirm: () => void executeDelete(),
        });
    };

    // --- Notify handlers --------------------------------------
    const handleWhatsApp = (app: Application) => {
        const currentStep = app.notes.find((s) => s.step === app.current_step);
        const stepLabel = currentStep?.label || `Step ${app.current_step}`;
        const text = `Hi ${app.name}! Your NexTep Edu application (${app.tracking_code}) has been updated to: *${stepLabel}* (Step ${app.current_step}/7). Track your progress anytime!`;
        const waPhone = toWhatsAppPhone(app.phone);
        if (waPhone.length < 10) {
            toast.error("Invalid phone number format.");
            return;
        }
        window.open(
            `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`,
            "_blank",
            "noopener,noreferrer"
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
            setTimeout(() => { if (mountedRef.current) setCodeCopied(false); }, 2000);
            toast.success("Tracking code copied!");
        } catch {
            toast.error("Failed to copy to clipboard.");
        }
    };

    // --- Filtered apps ----------------------------------------
    // Since search, step filtering, and sorting are executed server-side via Supabase PostgREST,
    // the returned applications array is already accurately filtered and sorted across the database.
    const filteredApps = applications;

    // --- Glass card classes -----------------------------------
    const glassCard = isDark
        ? "bg-[rgba(15,23,42,0.85)] border border-white/10 backdrop-blur-xl"
        : "bg-white/60 border border-black/5 backdrop-blur-xl";

    const glassCardHover = isDark
        ? "hover:bg-[rgba(15,23,42,0.95)] hover:border-white/20"
        : "hover:bg-white/80 hover:border-black/10";

    // --- Render -----------------------------------------------
    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    // --- LOGIN VIEW -------------------------------------------
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
                                className={`w-full min-h-[48px] pl-10 pr-4 py-3 rounded-xl text-base sm:text-sm transition-all duration-200 outline-none ${
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

    // --- DASHBOARD VIEWS --------------------------------------
    return (
        <div className="min-h-screen bg-background">
            <AnimatePresence>
                {/* --- LIST VIEW (stays mounted on mobile when edit drawer is open) --- */}
                {(view === "list" || view === "edit") && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                        className={`max-w-5xl mx-auto px-4 py-8 ${view === "edit" ? "lg:hidden" : ""}`}
                    >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl md:text-3xl font-bold font-heading text-primary">
                                        Application Tracker Admin
                                    </h1>
                                    {syncStatus === "offline" ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                                            <WifiOff className="w-3 h-3" />
                                            Offline
                                        </span>
                                    ) : syncStatus === "reconnecting" ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                            <RefreshCw className="w-3 h-3 animate-spin" />
                                            Syncing...
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                            </span>
                                            Live Sync
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {totalCount} total applicant
                                    {totalCount !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <div className="flex gap-2.5 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setView("add");
                                        setCreatedApp(null);
                                    }}
                                    className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:brightness-110 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add New
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className={`min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
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
                        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="search"
                                    inputMode="search"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Search by name, code, or destination..."
                                    aria-label="Search applications"
                                    className={`w-full min-h-[46px] pl-10 pr-4 py-2.5 rounded-xl text-base sm:text-sm transition-all duration-200 outline-none ${
                                        isDark
                                            ? "bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                            : "bg-white/50 border border-black/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                    }`}
                                />
                            </div>
                            <div className="grid grid-cols-2 md:flex gap-2.5 md:gap-4">
                                <select
                                    value={filterStep}
                                    onChange={(e) => {
                                        setFilterStep(e.target.value === "all" ? "all" : Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    aria-label="Filter by step"
                                    className={`min-h-[46px] px-3.5 py-2.5 rounded-xl text-base sm:text-sm outline-none transition-all ${
                                        isDark
                                            ? "bg-white/5 border border-white/10 text-foreground focus:border-accent/50"
                                            : "bg-white/50 border border-black/10 text-foreground focus:border-accent/50"
                                    }`}
                                >
                                    <option value="all">All Steps</option>
                                    {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                                        <option key={step} value={step}>Step {step}</option>
                                    ))}
                                </select>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => {
                                        setSortOrder(e.target.value as "newest" | "oldest");
                                        setCurrentPage(1);
                                    }}
                                    aria-label="Sort order"
                                    className={`min-h-[46px] px-3.5 py-2.5 rounded-xl text-base sm:text-sm outline-none transition-all ${
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
                            <div className="grid gap-3" aria-busy="true" aria-label="Loading applications">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className={`w-full rounded-2xl p-4 md:p-5 ${glassCard} animate-pulse flex items-center justify-between gap-4`}
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                            <div className="w-10 h-10 rounded-xl bg-accent/15 shrink-0" />
                                            <div className="space-y-2 flex-1 max-w-[220px]">
                                                <div className="h-4 bg-foreground/15 rounded w-3/4" />
                                                <div className="h-3 bg-foreground/10 rounded w-1/2" />
                                            </div>
                                        </div>
                                        <div className="h-7 w-20 rounded-full bg-foreground/10 shrink-0" />
                                    </div>
                                ))}
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
                                {filteredApps.map((app, index) => {
                                    const docCounts = getPendingDocCounts(app);
                                    return (
                                        <motion.button
                                            key={app.id}
                                            type="button"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.35,
                                                delay: Math.min(index * 0.02, 0.3),
                                                ease: EASE_OUT_EXPO,
                                            }}
                                            onClick={() => openAppDetail(app)}
                                            className={`w-full text-left rounded-2xl p-4 md:p-5 transition-all duration-200 cursor-pointer group ${glassCard} ${glassCardHover} shadow-sm hover:shadow-lg`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className="text-2xl shrink-0">
                                                        {getDestinationFlag(app.destination)}
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
                                                <div className="flex items-center gap-2.5 shrink-0">
                                                    {docCounts.pending > 0 && (
                                                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                                                            <FileClock className="w-3 h-3" />
                                                            {docCounts.pending} pending
                                                        </span>
                                                    )}
                                                    <div className="text-right hidden sm:block">
                                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getStepColor(app.current_step).bg} ${getStepColor(app.current_step).text} ${getStepColor(app.current_step).border}`}>
                                                            Step {app.current_step}/7
                                                        </span>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {formatDate(app.updated_at)}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                                                </div>
                                            </div>
                                            {/* Mobile step & pending-doc indicator */}
                                            <div className="flex items-center justify-between gap-2 mt-3 sm:hidden flex-wrap">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getStepColor(app.current_step).bg} ${getStepColor(app.current_step).text} ${getStepColor(app.current_step).border}`}>
                                                        Step {app.current_step}/7
                                                    </span>
                                                    {docCounts.pending > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                                                            <FileClock className="w-3 h-3" />
                                                            {docCounts.pending} pending
                                                        </span>
                                                    )}
                                                    {docCounts.rejected > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-500 border border-red-500/25">
                                                            {docCounts.rejected} rejected
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(app.updated_at)}
                                                </p>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {!loading && filteredApps.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {filteredApps.length} of {totalCount} applications
                                </p>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                        disabled={currentPage * itemsPerPage >= totalCount}
                                        className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* --- ADD VIEW --- */}
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
                            /* --- Success Screen --- */
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
                                        type="button"
                                        onClick={() => {
                                            const text = `Hi ${createdApp.name}! Welcome to NexTep Edu! Your application tracking code is: *${createdApp.tracking_code}*. You can use this to track your progress.`;
                                            const waPhone = toWhatsAppPhone(createdApp.phone);
                                            if (waPhone.length < 10) {
                                                toast.error("Invalid phone number format.");
                                                return;
                                            }
                                            window.open(
                                                `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`,
                                                "_blank",
                                                "noopener,noreferrer"
                                            );
                                        }}
                                        className="min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-all"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Send via WhatsApp
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCreatedApp(null);
                                            setView("list");
                                            fetchApplications();
                                        }}
                                        className="min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border bg-muted/40 hover:bg-muted text-foreground transition-all"
                                    >
                                        Done
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            /* --- Add Form --- */
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
                                            className={`w-full min-h-[48px] px-4 py-3 rounded-xl text-base sm:text-sm outline-none transition-all duration-200 ${
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
                                            inputMode="tel"
                                            value={addForm.phone}
                                            onChange={(e) =>
                                                setAddForm({
                                                    ...addForm,
                                                    phone: e.target.value,
                                                })
                                            }
                                            required
                                            placeholder="e.g. +8801XXXXXXXXX"
                                            className={`w-full min-h-[48px] px-4 py-3 rounded-xl text-base sm:text-sm outline-none transition-all duration-200 ${
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
                                            inputMode="email"
                                            value={addForm.email}
                                            onChange={(e) =>
                                                setAddForm({
                                                    ...addForm,
                                                    email: e.target.value,
                                                })
                                            }
                                            placeholder="student@example.com"
                                            className={`w-full min-h-[48px] px-4 py-3 rounded-xl text-base sm:text-sm outline-none transition-all duration-200 ${
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
                                            className={`w-full min-h-[48px] px-4 py-3 rounded-xl text-base sm:text-sm outline-none transition-all duration-200 cursor-pointer ${
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

                {/* --- EDIT VIEW (Mobile Swipeable Bottom Sheet / Desktop View) --- */}
                {view === "edit" && selectedApp && (
                    <motion.div
                        key="edit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:bg-black/60 max-lg:backdrop-blur-xs max-lg:flex max-lg:flex-col max-lg:justify-end"
                        onClick={() => closeAppDetail()}
                    >
                        <motion.div
                            initial={{ y: isMobileDrawer ? "100%" : 24, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: isMobileDrawer ? "100%" : 24, opacity: 0 }}
                            transition={{ type: "spring", damping: 32, stiffness: 320 }}
                            drag={isMobileDrawer ? "y" : false}
                            dragControls={drawerDragControls}
                            dragListener={false}
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={{ top: 0, bottom: 0.45 }}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 90 || info.velocity.y > 450) {
                                    closeAppDetail();
                                }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full max-w-2xl mx-auto lg:py-8 max-lg:max-h-[92dvh] max-lg:flex max-lg:flex-col max-lg:rounded-t-3xl max-lg:shadow-2xl max-lg:border-t overflow-hidden ${
                                isDark
                                    ? "max-lg:bg-[#0B1120] max-lg:border-white/15"
                                    : "max-lg:bg-background max-lg:border-black/10"
                            }`}
                        >
                            {/* Sticky Drawer Handle + Navigation Header */}
                            <div
                                onPointerDown={(e) => {
                                    if (isMobileDrawer && !(e.target as HTMLElement).closest("button")) {
                                        drawerDragControls.start(e);
                                    }
                                }}
                                className="sticky top-0 z-20 px-4 pt-2.5 pb-3 border-b border-border/60 bg-background/95 dark:bg-[#0B1120]/95 backdrop-blur-md touch-none shrink-0"
                            >
                                <div className="lg:hidden flex justify-center pb-2.5 cursor-grab active:cursor-grabbing">
                                    <div className="w-11 h-1.5 rounded-full bg-muted-foreground/35" />
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() => closeAppDetail()}
                                        className="inline-flex items-center gap-1.5 min-h-[44px] px-3 -ml-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to List
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {syncStatus === "offline" ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                                                <WifiOff className="w-3 h-3" />
                                                Offline
                                            </span>
                                        ) : syncStatus === "reconnecting" ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                <RefreshCw className="w-3 h-3 animate-spin" />
                                                Syncing...
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                                </span>
                                                Live Sync
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => closeAppDetail()}
                                            aria-label="Close application drawer"
                                            className="lg:hidden min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Drawer Body (overscroll-contain + safe-area bottom clearance) */}
                            <div
                                className="flex-1 overflow-y-auto overscroll-contain px-4 pt-4 space-y-5"
                                style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
                            >
                                {/* Applicant Header */}
                                <div className={`rounded-2xl p-4 sm:p-6 flex flex-col gap-4 ${glassCard} shadow-lg`}>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <span className="text-3xl sm:text-4xl shrink-0">
                                                {getDestinationFlag(selectedApp.destination)}
                                            </span>
                                            <div className="min-w-0">
                                                <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
                                                    {selectedApp.name}
                                                </h2>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyCode(selectedApp.tracking_code)}
                                                        className="inline-flex items-center gap-1.5 min-h-[36px] font-mono text-sm text-accent hover:underline"
                                                        title="Tap to copy tracking code"
                                                    >
                                                        <span>{selectedApp.tracking_code}</span>
                                                        {codeCopied ? (
                                                            <Check className="w-3.5 h-3.5 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                    {selectedApp.destination && (
                                                        <span className="text-xs text-muted-foreground">
                                                            -{" "}
                                                            {DESTINATIONS_META[selectedApp.destination]?.name ||
                                                                selectedApp.destination}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditForm({
                                                        name: selectedApp.name,
                                                        phone: selectedApp.phone,
                                                        email: selectedApp.email || "",
                                                        destination: normalizeDestinationSlug(selectedApp.destination),
                                                    });
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium border transition-colors border-border text-foreground hover:bg-muted/60"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={requestDeleteConfirm}
                                                disabled={deleteLoading}
                                                className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium border transition-colors border-red-500/25 text-red-500 hover:bg-red-500/10 disabled:opacity-50 flex items-center justify-center"
                                            >
                                                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* One-Tap Mobile Counselor Quick Actions */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-border/50">
                                        <a
                                            href={`tel:${selectedApp.phone.replace(/[^0-9+]/g, "")}`}
                                            className="min-h-[44px] px-3 py-2 rounded-xl bg-accent/12 hover:bg-accent/20 text-accent text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            <Phone className="w-4 h-4 shrink-0" />
                                            <span className="truncate">Call Student</span>
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => handleWhatsApp(selectedApp)}
                                            className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-500/12 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            <MessageCircle className="w-4 h-4 shrink-0" />
                                            <span className="truncate">WhatsApp</span>
                                        </button>
                                        <a
                                            href={`/track?code=${encodeURIComponent(selectedApp.tracking_code)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="col-span-2 sm:col-span-1 min-h-[44px] px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4 shrink-0 text-muted-foreground" />
                                            <span className="truncate">Student Portal</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Mobile Segmented Tabs: Actions & Docs First, Timeline Second */}
                                <div className="lg:hidden grid grid-cols-2 gap-1.5 p-1 rounded-xl border border-border bg-muted/40">
                                    <button
                                        type="button"
                                        onClick={() => setDrawerTab("actions")}
                                        className={`min-h-[44px] px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                                            drawerTab === "actions"
                                                ? "bg-accent text-slate-950 shadow-2xs"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        <FileText className="w-4 h-4 shrink-0" />
                                        Actions &amp; Docs
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDrawerTab("timeline")}
                                        className={`min-h-[44px] px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                                            drawerTab === "timeline"
                                                ? "bg-accent text-slate-950 shadow-2xs"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        <ListChecks className="w-4 h-4 shrink-0" />
                                        Timeline (Step {selectedApp.current_step}/7)
                                    </button>
                                </div>

                                {/* TAB 1: Actions & Documents (always shown on lg+, active by default on mobile) */}
                                <div className={`space-y-5 ${drawerTab === "timeline" ? "hidden lg:block" : "block"}`}>
                                    {/* Documents First for Fast Counselor Review */}
                                    <div className={`rounded-2xl p-4 sm:p-6 ${glassCard} shadow-lg`}>
                                        <h3 className="text-base font-semibold text-foreground mb-4">
                                            Uploaded Documents
                                        </h3>
                                        <DocumentViewer
                                            trackingCode={selectedApp.tracking_code}
                                            token={token}
                                            refreshTrigger={docRefreshTrigger}
                                            onApplicationUpdated={(updatedApp) => {
                                                setSelectedApp(updatedApp);
                                                setApplications((prev) =>
                                                    prev.map((a) =>
                                                        a.id === updatedApp.id ? updatedApp : a
                                                    )
                                                );
                                            }}
                                        />
                                    </div>

                                    {/* Step Control Card (Undo works even on Step 7!) */}
                                    <div className={`rounded-2xl p-4 sm:p-6 ${glassCard} shadow-lg`}>
                                        <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <StickyNote className="w-4 h-4 text-accent" />
                                            {selectedApp.current_step < 7
                                                ? "Advance Application"
                                                : "Application Completed (Step 7/7)"}
                                        </h3>

                                        {selectedApp.current_step < 7 && (
                                            <textarea
                                                value={advanceNote}
                                                onChange={(e) => setAdvanceNote(e.target.value)}
                                                placeholder="Add a note for this step (optional)..."
                                                rows={3}
                                                className={`w-full px-4 py-3 rounded-xl text-base sm:text-sm outline-none transition-all duration-200 resize-none mb-4 border ${
                                                    isDark
                                                        ? "bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                                        : "bg-white/60 border-black/10 text-foreground placeholder:text-muted-foreground focus:border-accent/50"
                                                }`}
                                            />
                                        )}

                                        <div className="relative flex flex-col sm:flex-row gap-2.5">
                                            {selectedApp.current_step > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setConfirmAction({
                                                            title: `Undo to Step ${selectedApp.current_step - 1}?`,
                                                            description: `Move ${selectedApp.name} back to Step ${selectedApp.current_step - 1}/7? This will clear the timestamp and counselor note recorded for Step ${selectedApp.current_step}.`,
                                                            confirmLabel: `Undo to Step ${selectedApp.current_step - 1}`,
                                                            destructive: true,
                                                            onConfirm: () => {
                                                                setConfirmAction(null);
                                                                void handleUndo();
                                                            },
                                                        })
                                                    }
                                                    disabled={undoLoading}
                                                    className="min-h-[46px] px-5 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm transition-all hover:bg-muted/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                >
                                                    {undoLoading ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        `Undo to Step ${selectedApp.current_step - 1}`
                                                    )}
                                                </button>
                                            )}
                                            {selectedApp.current_step < 7 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setConfirmAction({
                                                            title: `Advance to Step ${selectedApp.current_step + 1}?`,
                                                            description: `Move ${selectedApp.name} to Step ${selectedApp.current_step + 1}/7? This will update their live portal and send an email notification if an email is on file.`,
                                                            confirmLabel: `Advance to Step ${selectedApp.current_step + 1}`,
                                                            onConfirm: () => {
                                                                setConfirmAction(null);
                                                                void handleAdvance();
                                                            },
                                                        })
                                                    }
                                                    disabled={advanceLoading}
                                                    className="flex-1 min-h-[46px] py-2.5 px-5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {advanceLoading ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <ChevronRight className="w-4 h-4" />
                                                            Advance to Step {selectedApp.current_step + 1}
                                                        </>
                                                    )}
                                                </button>
                                            )}
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

                                    {/* Notify Buttons */}
                                    <div className={`rounded-2xl p-4 sm:p-6 ${glassCard} shadow-lg`}>
                                        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                                            <Send className="w-4 h-4 text-accent" />
                                            Notify Applicant
                                        </h3>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleWhatsApp(selectedApp)}
                                                className="flex-1 min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-all"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                WhatsApp
                                            </button>

                                            <div className="relative flex-1 group">
                                                <button
                                                    type="button"
                                                    onClick={handleEmailNotify}
                                                    disabled={!selectedApp.email || notifyLoading}
                                                    className={`w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
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
                                </div>

                                {/* TAB 2: Timeline (always shown on lg+, selectable tab on mobile) */}
                                <div className={`${drawerTab === "actions" ? "hidden lg:block" : "block"}`}>
                                    <div className={`rounded-2xl p-4 sm:p-6 ${glassCard} shadow-lg`}>
                                        <h3 className="text-base font-semibold text-foreground mb-4">
                                            Application Timeline
                                        </h3>
                                        <ApplicationTimeline
                                            steps={selectedApp.notes}
                                            currentStep={selectedApp.current_step}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* --- EDIT MODAL (Mobile Bottom Sheet / Desktop Centered Modal) --- */}
                {isEditModalOpen && selectedApp && (
                    <motion.div
                        key="edit-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => !editLoading && setIsEditModalOpen(false)}
                    >
                        <motion.div
                            initial={{ y: 24, scale: 0.98 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 24, scale: 0.98 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-6 ${glassCard} shadow-2xl relative max-h-[90dvh] overflow-y-auto overscroll-contain`}
                            style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
                        >
                            <div className="sm:hidden flex justify-center pb-3">
                                <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
                            </div>
                            <button
                                type="button"
                                onClick={() => !editLoading && setIsEditModalOpen(false)}
                                aria-label="Close edit modal"
                                className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                            <h2 className="text-2xl font-bold font-heading text-foreground mb-5">
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
                                        className={`w-full min-h-[48px] px-4 py-3 rounded-xl border text-base sm:text-sm transition-all outline-none focus:border-accent/60 ${
                                            isDark ? "bg-white/5 border-white/15 text-foreground" : "bg-white/80 border-black/15 text-foreground"
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
                                        inputMode="tel"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        className={`w-full min-h-[48px] px-4 py-3 rounded-xl border text-base sm:text-sm transition-all outline-none focus:border-accent/60 ${
                                            isDark ? "bg-white/5 border-white/15 text-foreground" : "bg-white/80 border-black/15 text-foreground"
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
                                        inputMode="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className={`w-full min-h-[48px] px-4 py-3 rounded-xl border text-base sm:text-sm transition-all outline-none focus:border-accent/60 ${
                                            isDark ? "bg-white/5 border-white/15 text-foreground" : "bg-white/80 border-black/15 text-foreground"
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
                                        className={`w-full min-h-[48px] px-4 py-3 rounded-xl border text-base sm:text-sm outline-none transition-all focus:border-accent/60 ${
                                            isDark ? "bg-white/5 border-white/15 text-foreground" : "bg-white/80 border-black/15 text-foreground"
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
                                        disabled={editLoading}
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 min-h-[46px] py-3 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-muted/60 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editLoading}
                                        className="flex-1 min-h-[46px] py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {editLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* --- IN-APP CONFIRMATION BOTTOM SHEET (replaces native window.confirm) --- */}
                {confirmAction && (
                    <motion.div
                        key="confirm-sheet"
                        role="dialog"
                        aria-modal="true"
                        aria-label={confirmAction.title}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setConfirmAction(null)}
                        className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ y: 28, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 28, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-card dark:bg-[#0F172A] border border-border p-6 shadow-2xl space-y-4"
                            style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        confirmAction.destructive
                                            ? "bg-red-500/15 text-red-500"
                                            : "bg-accent/15 text-accent"
                                    }`}
                                >
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-foreground">
                                        {confirmAction.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                                        {confirmAction.description}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setConfirmAction(null)}
                                    className="min-h-[46px] rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmAction.onConfirm}
                                    className={`min-h-[46px] rounded-xl text-sm font-bold transition-colors ${
                                        confirmAction.destructive
                                            ? "bg-red-500 hover:bg-red-600 text-white"
                                            : "bg-accent text-accent-foreground hover:brightness-110"
                                    }`}
                                >
                                    {confirmAction.confirmLabel}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
