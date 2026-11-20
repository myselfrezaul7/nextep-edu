"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMounted } from "@/lib/use-mounted";
import {
    FileText,
    Download,
    Loader2,
    ExternalLink,
    Trash2,
    CheckCircle2,
    XCircle,
    Clock,
    MessageSquareWarning,
    Eye,
    X,
    ZoomIn,
    ZoomOut,
    RotateCw,
    AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import type {
    Application,
    DocumentVerificationStatus,
    UploadedDocumentInfo,
} from "@/lib/supabase";

const QUICK_REJECT_REASONS = [
    "Blurry / unreadable photo",
    "Wrong document uploaded",
    "Expired or incomplete pages",
    "Missing signature or stamp",
] as const;

interface DocumentViewerProps {
    trackingCode: string;
    token: string;
    refreshTrigger?: number;
    onApplicationUpdated?: (app: Application) => void;
}

function isPdfDocument(doc: UploadedDocumentInfo): boolean {
    const name = (doc.originalName || doc.name || "").toLowerCase();
    return name.endsWith(".pdf");
}

export function DocumentViewer({
    trackingCode,
    token,
    refreshTrigger = 0,
    onApplicationUpdated,
}: DocumentViewerProps) {
    const mounted = useMounted();
    const [documents, setDocuments] = useState<UploadedDocumentInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingName, setDeletingName] = useState<string | null>(null);
    const [updatingName, setUpdatingName] = useState<string | null>(null);
    const [rejectingDocName, setRejectingDocName] = useState<string | null>(null);
    const [rejectFeedback, setRejectFeedback] = useState("");
    const [confirmDeleteDoc, setConfirmDeleteDoc] = useState<{
        fileName: string;
        displayName: string;
    } | null>(null);

    // In-app Lightbox state
    const [previewDoc, setPreviewDoc] = useState<UploadedDocumentInfo | null>(null);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [lightboxRejectMode, setLightboxRejectMode] = useState(false);
    const [lightboxRejectReason, setLightboxRejectReason] = useState("");

    const pinchStartDistRef = useRef<number | null>(null);
    const pinchStartZoomRef = useRef<number>(1);
    const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

    const fetchDocs = useCallback(
        async (silent = false) => {
            await Promise.resolve();
            if (!silent) setLoading(true);
            try {
                const res = await fetch(
                    `/api/admin/documents?trackingCode=${encodeURIComponent(trackingCode)}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const data = await res.json();
                if (res.ok) {
                    setDocuments(data.documents || []);
                } else if (!silent) {
                    toast.error("Failed to load documents");
                }
            } catch {
                if (!silent) {
                    toast.error("Network error loading documents");
                }
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [trackingCode, token]
    );

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            await Promise.resolve();
            if (isMounted) {
                await fetchDocs(refreshTrigger > 0);
            }
        };
        void load();
        return () => {
            isMounted = false;
        };
    }, [fetchDocs, refreshTrigger]);

    // Escape handler for Lightbox & Delete confirm sheet (capture phase so parent drawer stays open)
    useEffect(() => {
        if (!previewDoc && !confirmDeleteDoc) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                if (confirmDeleteDoc) setConfirmDeleteDoc(null);
                else if (previewDoc) setPreviewDoc(null);
            }
        };
        document.addEventListener("keydown", onKeyDown, true);
        return () => document.removeEventListener("keydown", onKeyDown, true);
    }, [previewDoc, confirmDeleteDoc]);

    const openLightbox = (doc: UploadedDocumentInfo) => {
        setPreviewDoc(doc);
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
        setLightboxRejectMode(false);
        setLightboxRejectReason(doc.feedback || "");
    };

    const handleVerifyStatus = async (
        fileName: string,
        status: DocumentVerificationStatus,
        feedback = ""
    ) => {
        const previousDocs = [...documents];
        setUpdatingName(fileName);

        setDocuments((prev) =>
            prev.map((doc) =>
                doc.name === fileName
                    ? {
                          ...doc,
                          status,
                          feedback,
                          updated_at: new Date().toISOString(),
                      }
                    : doc
            )
        );
        if (previewDoc?.name === fileName) {
            setPreviewDoc((prev) => (prev ? { ...prev, status, feedback } : null));
        }
        setRejectingDocName(null);
        setRejectFeedback("");
        setLightboxRejectMode(false);

        try {
            const res = await fetch("/api/admin/documents", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    trackingCode,
                    fileName,
                    status,
                    feedback,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                if (Array.isArray(data.documents)) {
                    setDocuments(data.documents);
                    if (previewDoc?.name === fileName) {
                        const refreshed = (data.documents as UploadedDocumentInfo[]).find(
                            (d) => d.name === fileName
                        );
                        if (refreshed) setPreviewDoc(refreshed);
                    }
                }
                if (data.application && onApplicationUpdated) {
                    onApplicationUpdated(data.application as Application);
                }
                toast.success(
                    status === "verified"
                        ? "Document verified!"
                        : status === "rejected"
                          ? "Document marked for re-upload."
                          : "Document status updated."
                );
            } else {
                setDocuments(previousDocs);
                toast.error(data.error || "Failed to update document status.");
            }
        } catch {
            setDocuments(previousDocs);
            toast.error("Network error updating document status.");
        } finally {
            setUpdatingName(null);
        }
    };

    const executeDeleteDoc = async (fileName: string) => {
        const previousDocs = [...documents];
        setDeletingName(fileName);
        setConfirmDeleteDoc(null);
        if (previewDoc?.name === fileName) {
            setPreviewDoc(null);
        }

        setDocuments((prev) => prev.filter((d) => d.name !== fileName));

        try {
            const res = await fetch("/api/admin/documents", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    trackingCode,
                    fileName,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                if (Array.isArray(data.documents)) {
                    setDocuments(data.documents);
                }
                if (data.application && onApplicationUpdated) {
                    onApplicationUpdated(data.application as Application);
                }
                toast.success("Document deleted.");
            } else {
                setDocuments(previousDocs);
                toast.error(data.error || "Failed to delete document.");
            }
        } catch {
            setDocuments(previousDocs);
            toast.error("Network error deleting document.");
        } finally {
            setDeletingName(null);
        }
    };

    // Touch pinch-zoom + drag-pan handlers for Lightbox images
    const handleImageTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            pinchStartDistRef.current = Math.hypot(dx, dy);
            pinchStartZoomRef.current = zoom;
            dragStartRef.current = null;
        } else if (e.touches.length === 1 && zoom > 1) {
            dragStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                panX: pan.x,
                panY: pan.y,
            };
        }
    };

    const handleImageTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && pinchStartDistRef.current) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.hypot(dx, dy);
            const nextZoom = Math.min(4, Math.max(1, pinchStartZoomRef.current * (dist / pinchStartDistRef.current)));
            setZoom(nextZoom);
            if (nextZoom <= 1.05) setPan({ x: 0, y: 0 });
        } else if (e.touches.length === 1 && dragStartRef.current && zoom > 1) {
            const dx = e.touches[0].clientX - dragStartRef.current.x;
            const dy = e.touches[0].clientY - dragStartRef.current.y;
            setPan({ x: dragStartRef.current.panX + dx, y: dragStartRef.current.panY + dy });
        }
    };

    const handleImageTouchEnd = () => {
        pinchStartDistRef.current = null;
        dragStartRef.current = null;
    };

    if (loading) {
        return (
            <div className="space-y-3" aria-busy="true" aria-label="Loading documents">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-border animate-pulse flex items-center justify-between gap-3"
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-accent/15 shrink-0" />
                            <div className="space-y-2 flex-1 max-w-[220px]">
                                <div className="h-3.5 bg-foreground/15 rounded w-3/4" />
                                <div className="h-2.5 bg-foreground/10 rounded w-1/2" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-10 w-16 rounded-lg bg-foreground/10" />
                            <div className="h-10 w-16 rounded-lg bg-foreground/10" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="text-center p-7 border border-dashed border-border rounded-xl">
                <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            </div>
        );
    }

    const activePreviewUrl = previewDoc?.viewUrl || previewDoc?.url || null;
    const activeDownloadUrl = previewDoc?.downloadUrl || previewDoc?.url || null;

    return (
        <>
            <div className="space-y-3">
                {documents.map((doc) => {
                    const status = doc.status || "pending";
                    const displayName = doc.originalName || doc.name;
                    const isRejecting = rejectingDocName === doc.name;
                    const isBusy = updatingName === doc.name || deletingName === doc.name;
                    const docViewUrl = doc.viewUrl || doc.url;
                    const docDownloadUrl = doc.downloadUrl || doc.url;

                    return (
                        <div
                            key={doc.id || doc.name}
                            className="p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-border/80 space-y-3"
                        >
                            {/* File Header */}
                            <div className="flex items-start gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <FileText className="w-4 h-4 text-accent" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <button
                                            type="button"
                                            disabled={!docViewUrl}
                                            onClick={() => docViewUrl && openLightbox(doc)}
                                            className="text-left text-sm font-semibold text-foreground hover:text-accent transition-colors break-words line-clamp-2 leading-snug disabled:cursor-default"
                                            title={displayName}
                                        >
                                            {displayName}
                                        </button>
                                        {status === "verified" && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Verified
                                            </span>
                                        )}
                                        {status === "rejected" && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25 shrink-0">
                                                <XCircle className="w-3 h-3" />
                                                Rejected
                                            </span>
                                        )}
                                        {status === "pending" && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
                                                <Clock className="w-3 h-3" />
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                    {doc.feedback && status === "rejected" && (
                                        <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 flex items-start gap-1 leading-snug">
                                            <MessageSquareWarning className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                            <span>Note: {doc.feedback}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Clean 2-Row Mobile Actions (Inline on sm+) */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                {/* Row 1: Primary Verify / Reject */}
                                <div className="grid grid-cols-2 sm:flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={isBusy}
                                        onClick={() => void handleVerifyStatus(doc.name, "verified", "")}
                                        className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 ${
                                            status === "verified"
                                                ? "bg-emerald-500 text-white"
                                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/25"
                                        }`}
                                    >
                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                        Verify
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isBusy}
                                        onClick={() => {
                                            if (isRejecting) {
                                                setRejectingDocName(null);
                                            } else {
                                                setRejectingDocName(doc.name);
                                                setRejectFeedback(doc.feedback || "");
                                            }
                                        }}
                                        className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 ${
                                            status === "rejected" || isRejecting
                                                ? "bg-red-500 text-white"
                                                : "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/25"
                                        }`}
                                    >
                                        <XCircle className="w-4 h-4 shrink-0" />
                                        Reject
                                    </button>
                                </div>

                                {/* Row 2: Preview, Download, Delete */}
                                <div className="grid grid-cols-3 sm:flex items-center gap-1.5">
                                    {docViewUrl && (
                                        <button
                                            type="button"
                                            onClick={() => openLightbox(doc)}
                                            className="min-h-[44px] px-3 rounded-xl border border-border bg-background/70 hover:border-accent/50 text-foreground hover:text-accent text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                            title="Preview Document"
                                        >
                                            <Eye className="w-4 h-4 shrink-0" />
                                            <span>Preview</span>
                                        </button>
                                    )}
                                    {docDownloadUrl && (
                                        <a
                                            href={docDownloadUrl}
                                            download={displayName}
                                            className="min-h-[44px] px-3 rounded-xl border border-border bg-background/70 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                                            title="Download Document"
                                            aria-label="Download Document"
                                        >
                                            <Download className="w-4 h-4 shrink-0" />
                                            <span className="sm:hidden">Save</span>
                                        </a>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setConfirmDeleteDoc({ fileName: doc.name, displayName })
                                        }
                                        disabled={isBusy}
                                        className="min-h-[44px] px-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-500 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                                        title="Delete Document"
                                        aria-label="Delete Document"
                                    >
                                        {deletingName === doc.name ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4 shrink-0" />
                                                <span className="sm:hidden">Delete</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Inline Reject Form with Quick-Reject Chips */}
                            {isRejecting && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        void handleVerifyStatus(
                                            doc.name,
                                            "rejected",
                                            rejectFeedback.trim() ||
                                                "Please re-upload a clearer copy of this document."
                                        );
                                    }}
                                    className="pt-3 border-t border-border/70 space-y-2.5"
                                >
                                    <div className="flex flex-wrap gap-1.5">
                                        {QUICK_REJECT_REASONS.map((reason) => (
                                            <button
                                                key={reason}
                                                type="button"
                                                onClick={() => setRejectFeedback(reason)}
                                                className={`min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                                                    rejectFeedback === reason
                                                        ? "bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-300"
                                                        : "bg-background/70 border-border text-muted-foreground hover:text-foreground"
                                                }`}
                                            >
                                                {reason}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            enterKeyHint="send"
                                            value={rejectFeedback}
                                            onChange={(e) => setRejectFeedback(e.target.value)}
                                            placeholder="Reason for rejection..."
                                            className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl text-base sm:text-sm bg-background border border-border text-foreground outline-none focus:border-red-500/60"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                                            >
                                                Confirm Reject
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRejectingDocName(null)}
                                                className="min-h-[44px] px-4 py-2 rounded-xl border border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Portaled Overlays: Lightbox (z-[70]) + Delete Confirm (z-[75]) rendered directly into
                document.body so ancestor backdrop-blur / Framer Motion drag transforms never trap fixed inset-0 */}
            {mounted
                ? createPortal(
                      <>
                          {/* In-App Mobile Document Lightbox (z-[70]) */}
                          <AnimatePresence>
                              {previewDoc && activePreviewUrl && (
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Document preview: ${previewDoc.originalName || previewDoc.name}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-slate-950/95 backdrop-blur-md flex flex-col overscroll-contain"
                        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
                    >
                        {/* Lightbox Top Toolbar */}
                        <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-3 border-b border-white/10 text-white shrink-0">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate">
                                    {previewDoc.originalName || previewDoc.name}
                                </p>
                                <p className="text-[11px] text-white/60 capitalize">
                                    Status: {previewDoc.status || "pending"}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                {!isPdfDocument(previewDoc) && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = Math.max(1, Number((zoom - 0.5).toFixed(1)));
                                                setZoom(next);
                                                if (next === 1) setPan({ x: 0, y: 0 });
                                            }}
                                            aria-label="Zoom out"
                                            className="w-11 h-11 rounded-full hover:bg-white/10 flex items-center justify-center"
                                        >
                                            <ZoomOut className="w-5 h-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setZoom((z) => Math.min(4, Number((z + 0.5).toFixed(1))))}
                                            aria-label="Zoom in"
                                            className="w-11 h-11 rounded-full hover:bg-white/10 flex items-center justify-center"
                                        >
                                            <ZoomIn className="w-5 h-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRotation((r) => (r + 90) % 360)}
                                            aria-label="Rotate 90 degrees"
                                            className="w-11 h-11 rounded-full hover:bg-white/10 flex items-center justify-center"
                                        >
                                            <RotateCw className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                                {activeDownloadUrl && (
                                    <a
                                        href={activeDownloadUrl}
                                        download={previewDoc.originalName || previewDoc.name}
                                        aria-label="Download file"
                                        className="w-11 h-11 rounded-full hover:bg-white/10 flex items-center justify-center"
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setPreviewDoc(null)}
                                    aria-label="Close document preview"
                                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Lightbox Main Canvas */}
                        <div className="flex-1 overflow-hidden relative flex items-center justify-center p-2 sm:p-4">
                            {isPdfDocument(previewDoc) ? (
                                <div className="w-full h-full max-w-4xl flex flex-col gap-2">
                                    <iframe
                                        src={activePreviewUrl}
                                        title={previewDoc.originalName || previewDoc.name}
                                        className="w-full flex-1 rounded-xl bg-white border border-white/15"
                                    />
                                    <div className="flex items-center justify-center gap-3 text-xs text-white/75">
                                        <a
                                            href={activePreviewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Open PDF in Browser
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onTouchStart={handleImageTouchStart}
                                    onTouchMove={handleImageTouchMove}
                                    onTouchEnd={handleImageTouchEnd}
                                    onDoubleClick={() => {
                                        if (zoom > 1) {
                                            setZoom(1);
                                            setPan({ x: 0, y: 0 });
                                        } else {
                                            setZoom(2);
                                        }
                                    }}
                                    className="w-full h-full flex items-center justify-center overflow-hidden touch-none select-none"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={activePreviewUrl}
                                        alt={previewDoc.originalName || previewDoc.name}
                                        draggable={false}
                                        style={{
                                            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom}) rotate(${rotation}deg)`,
                                        }}
                                        className="max-h-full max-w-full object-contain transition-transform duration-150 ease-out rounded-lg"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Lightbox Inline Verify / Reject Footer */}
                        <div
                            className="px-4 pt-3 border-t border-white/10 bg-slate-900/90 text-white shrink-0 space-y-2.5"
                            style={{ paddingBottom: "calc(0.85rem + env(safe-area-inset-bottom, 0px))" }}
                        >
                            {lightboxRejectMode ? (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        void handleVerifyStatus(
                                            previewDoc.name,
                                            "rejected",
                                            lightboxRejectReason.trim() ||
                                                "Please re-upload a clearer copy of this document."
                                        );
                                    }}
                                    className="space-y-2 max-w-2xl mx-auto"
                                >
                                    <div className="flex flex-wrap gap-1.5">
                                        {QUICK_REJECT_REASONS.map((reason) => (
                                            <button
                                                key={reason}
                                                type="button"
                                                onClick={() => setLightboxRejectReason(reason)}
                                                className={`min-h-[36px] px-2.5 rounded-lg text-[11px] font-medium border ${
                                                    lightboxRejectReason === reason
                                                        ? "bg-red-500/25 border-red-400 text-white"
                                                        : "bg-white/5 border-white/15 text-white/75"
                                                }`}
                                            >
                                                {reason}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={lightboxRejectReason}
                                            onChange={(e) => setLightboxRejectReason(e.target.value)}
                                            placeholder="Rejection feedback for student..."
                                            className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-white/10 border border-white/15 text-base sm:text-sm text-white placeholder:text-white/50 outline-none focus:border-red-400"
                                        />
                                        <button
                                            type="submit"
                                            disabled={updatingName === previewDoc.name}
                                            className="min-h-[44px] px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shrink-0"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setLightboxRejectMode(false)}
                                            className="min-h-[44px] px-3 rounded-xl bg-white/10 text-xs font-medium shrink-0"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
                                    <button
                                        type="button"
                                        disabled={updatingName === previewDoc.name}
                                        onClick={() => void handleVerifyStatus(previewDoc.name, "verified", "")}
                                        className="min-h-[46px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        {previewDoc.status === "verified" ? "Verified" : "Verify Document"}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={updatingName === previewDoc.name}
                                        onClick={() => setLightboxRejectMode(true)}
                                        className="min-h-[46px] px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-red-200 text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* In-App Delete Confirmation Bottom Sheet (z-[75]) */}
            <AnimatePresence>
                {confirmDeleteDoc && (
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Confirm document deletion"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setConfirmDeleteDoc(null)}
                        className="fixed inset-0 z-[75] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
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
                                <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-base font-bold text-foreground">Delete Document?</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                                        Are you sure you want to permanently delete &ldquo;
                                        {confirmDeleteDoc.displayName}&rdquo;? This cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setConfirmDeleteDoc(null)}
                                    className="min-h-[46px] rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void executeDeleteDoc(confirmDeleteDoc.fileName)}
                                    className="min-h-[46px] rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
                      </>,
                      document.body
                  )
                : null}
        </>
    );
}
