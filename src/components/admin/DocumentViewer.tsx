import { useState, useEffect, useCallback } from "react";
import {
    File,
    Download,
    Loader2,
    ExternalLink,
    Trash2,
    CheckCircle2,
    XCircle,
    Clock,
    MessageSquareWarning,
} from "lucide-react";
import toast from "react-hot-toast";
import type {
    Application,
    DocumentVerificationStatus,
    UploadedDocumentInfo,
} from "@/lib/supabase";

interface DocumentViewerProps {
    trackingCode: string;
    token: string;
    refreshTrigger?: number;
    onApplicationUpdated?: (app: Application) => void;
}

export function DocumentViewer({
    trackingCode,
    token,
    refreshTrigger = 0,
    onApplicationUpdated,
}: DocumentViewerProps) {
    const [documents, setDocuments] = useState<UploadedDocumentInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingName, setDeletingName] = useState<string | null>(null);
    const [updatingName, setUpdatingName] = useState<string | null>(null);
    const [rejectingDocName, setRejectingDocName] = useState<string | null>(
        null
    );
    const [rejectFeedback, setRejectFeedback] = useState("");

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

    const handleVerifyStatus = async (
        fileName: string,
        status: DocumentVerificationStatus,
        feedback = ""
    ) => {
        const previousDocs = [...documents];
        setUpdatingName(fileName);

        // Optimistic UI update
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
        setRejectingDocName(null);
        setRejectFeedback("");

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

    const handleDeleteDoc = async (fileName: string, displayName?: string) => {
        if (
            !window.confirm(
                `Are you sure you want to delete "${displayName || fileName}"? This cannot be undone.`
            )
        ) {
            return;
        }

        const previousDocs = [...documents];
        setDeletingName(fileName);

        // Optimistic UI removal
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

    if (loading) {
        return (
            <div className="space-y-3" aria-busy="true" aria-label="Loading documents">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 animate-pulse flex items-center justify-between gap-3"
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
            <div className="text-center p-8 border border-dashed border-white/20 rounded-xl">
                <p className="text-sm text-muted-foreground">
                    No documents uploaded yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {documents.map((doc) => {
                const status = doc.status || "pending";
                const displayName = doc.originalName || doc.name;
                const isRejecting = rejectingDocName === doc.name;
                const isBusy =
                    updatingName === doc.name || deletingName === doc.name;

                return (
                    <div
                        key={doc.id || doc.name}
                        className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-2.5"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-3 min-w-0">
                                <File className="w-4 h-4 text-accent shrink-0" />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                            className="text-sm font-medium text-foreground truncate"
                                            title={displayName}
                                        >
                                            {displayName}
                                        </span>
                                        {status === "verified" && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Verified
                                            </span>
                                        )}
                                        {status === "rejected" && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-500 border border-red-500/25">
                                                <XCircle className="w-3 h-3" />
                                                Rejected
                                            </span>
                                        )}
                                        {status === "pending" && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/25">
                                                <Clock className="w-3 h-3" />
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                    {doc.feedback && status === "rejected" && (
                                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                            <MessageSquareWarning className="w-3 h-3 shrink-0" />
                                            <span>Note: {doc.feedback}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                        handleVerifyStatus(
                                            doc.name,
                                            "verified",
                                            ""
                                        )
                                    }
                                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 ${
                                        status === "verified"
                                            ? "bg-emerald-500 text-white"
                                            : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20"
                                    }`}
                                    title="Mark as Verified"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
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
                                            setRejectFeedback(
                                                doc.feedback || ""
                                            );
                                        }
                                    }}
                                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 ${
                                        status === "rejected" || isRejecting
                                            ? "bg-red-500 text-white"
                                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                                    }`}
                                    title="Reject and request re-upload"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </button>

                                {doc.url && (
                                    <>
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors"
                                            title="View Document"
                                            aria-label="View Document"
                                        >
                                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                        </a>
                                        <a
                                            href={doc.url}
                                            download
                                            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors"
                                            title="Download Document"
                                            aria-label="Download Document"
                                        >
                                            <Download className="w-4 h-4 text-muted-foreground" />
                                        </a>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleDeleteDoc(doc.name, displayName)}
                                    disabled={isBusy}
                                    className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-xl transition-colors disabled:opacity-50"
                                    title="Delete Document"
                                    aria-label="Delete Document"
                                >
                                    {deletingName === doc.name ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {isRejecting && (
                            <div className="pt-2.5 border-t border-black/5 dark:border-white/10 flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    enterKeyHint="send"
                                    value={rejectFeedback}
                                    onChange={(e) =>
                                        setRejectFeedback(e.target.value)
                                    }
                                    placeholder="Reason for rejection (e.g. Blurry scan, please re-upload clear PDF)..."
                                    className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-foreground outline-none focus:border-red-500/50"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleVerifyStatus(
                                                doc.name,
                                                "rejected",
                                                rejectFeedback.trim() ||
                                                    "Please re-upload a clearer copy of this document."
                                            )
                                        }
                                        className="min-h-[44px] px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                                    >
                                        Confirm Reject
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setRejectingDocName(null)
                                        }
                                        className="min-h-[44px] px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
