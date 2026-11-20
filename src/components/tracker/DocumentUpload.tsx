"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    UploadCloud,
    FileText,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Clock,
    Camera,
    FolderOpen,
    RefreshCw,
    RotateCcw,
    WifiOff,
    Eye,
} from "lucide-react";
import type { UploadedDocumentInfo } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/use-mounted";
import { useTranslation } from "@/i18n/LanguageContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const COMPRESS_THRESHOLD = 1.2 * 1024 * 1024; // 1.2 MB
const MAX_IMAGE_DIMENSION = 2000;
const ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
]);
const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png"]);

type UploadStatus = "queued" | "uploading" | "done" | "failed";

interface QueuedUploadItem {
    id: string;
    file: File;
    originalSize: number;
    compressed: boolean;
    previewUrl: string | null;
    status: UploadStatus;
    progress: number;
    error?: string;
}

interface DocumentUploadProps {
    trackingCode: string;
    initialDocuments?: UploadedDocumentInfo[];
    onDocumentsUpdated?: (docs: UploadedDocumentInfo[]) => void;
    canUpload?: boolean;
}

function getFileExtension(name: string): string {
    const idx = name.lastIndexOf(".");
    if (idx <= 0) return "";
    return name.slice(idx + 1).toLowerCase();
}

function formatMB(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function isHeicFile(file: File): boolean {
    const ext = getFileExtension(file.name);
    const mime = (file.type || "").toLowerCase();
    return ext === "heic" || ext === "heif" || mime.includes("heic") || mime.includes("heif");
}

function isWebpImage(file: File): boolean {
    const ext = getFileExtension(file.name);
    const mime = (file.type || "").toLowerCase();
    return ext === "webp" || mime === "image/webp";
}

function resolveMimeType(file: File): string {
    const mime = (file.type || "").toLowerCase();
    if (mime === "image/jpg") return "image/jpeg";
    if (ALLOWED_MIME_TYPES.has(mime)) return mime;
    const ext = getFileExtension(file.name);
    if (ext === "pdf") return "application/pdf";
    if (ext === "jpg" || ext === "jpeg" || ext === "jfif") return "image/jpeg";
    if (ext === "png") return "image/png";
    return mime;
}

function isImageFile(file: File): boolean {
    const mime = resolveMimeType(file);
    return mime === "image/jpeg" || mime === "image/png" || isWebpImage(file);
}

function ensureAllowedFilenameExtension(file: File, resolvedMime: string): File {
    const ext = getFileExtension(file.name);
    if (ALLOWED_EXTENSIONS.has(ext)) return file;
    const targetExt =
        resolvedMime === "application/pdf"
            ? "pdf"
            : resolvedMime === "image/png"
              ? "png"
              : resolvedMime === "image/jpeg"
                ? "jpg"
                : "";
    if (!targetExt) return file;
    const baseName = (file.name.replace(/\.[^.]+$/, "").trim() || "document").slice(0, 100);
    return new File([file], `${baseName}.${targetExt}`, {
        type: resolvedMime,
        lastModified: file.lastModified || Date.now(),
    });
}

async function compressImageIfNeeded(file: File): Promise<{ file: File; compressed: boolean }> {
    const mustConvertWebp = isWebpImage(file);
    if (!isImageFile(file) || (!mustConvertWebp && file.size <= COMPRESS_THRESHOLD)) {
        return { file, compressed: false };
    }

    return new Promise((resolve) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            try {
                let { width, height } = img;
                if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
                    const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    URL.revokeObjectURL(objectUrl);
                    resolve({ file, compressed: false });
                    return;
                }

                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        URL.revokeObjectURL(objectUrl);
                        if (!blob || (!mustConvertWebp && blob.size >= file.size)) {
                            resolve({ file, compressed: false });
                            return;
                        }
                        const baseName = file.name.replace(/\.[^.]+$/, "").trim() || "photo";
                        const compressedFile = new File([blob], `${baseName}.jpg`, {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                        });
                        resolve({ file: compressedFile, compressed: blob.size < file.size });
                    },
                    "image/jpeg",
                    0.82
                );
            } catch {
                URL.revokeObjectURL(objectUrl);
                resolve({ file, compressed: false });
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({ file, compressed: false });
        };
        img.src = objectUrl;
    });
}

function uploadFileViaXHR(
    signedUrl: string,
    file: File,
    onProgress: (percent: number) => void
): Promise<void> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl, true);
        xhr.setRequestHeader("x-upsert", "false");
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (anonKey) {
            xhr.setRequestHeader("apikey", anonKey);
        }

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && event.total > 0) {
                const pct = Math.min(99, Math.round((event.loaded / event.total) * 100));
                onProgress(pct);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                onProgress(100);
                resolve();
            } else {
                let message = `Upload failed (${xhr.status})`;
                try {
                    const parsed = JSON.parse(xhr.responseText);
                    if (parsed?.message || parsed?.error) {
                        message = parsed.message || parsed.error;
                    }
                } catch {
                    // Use default message
                }
                reject(new Error(message));
            }
        };

        xhr.onerror = () => reject(new Error("Network connection dropped during upload."));
        xhr.onabort = () => reject(new Error("Upload was cancelled."));

        const formData = new FormData();
        formData.append("cacheControl", "3600");
        formData.append("", file);
        xhr.send(formData);
    });
}

export function DocumentUpload({
    trackingCode,
    initialDocuments = [],
    onDocumentsUpdated,
    canUpload = true,
}: DocumentUploadProps) {
    const { t } = useTranslation();
    const mounted = useMounted();
    const [isDragging, setIsDragging] = useState(false);
    const [queue, setQueue] = useState<QueuedUploadItem[]>([]);
    const [localDocs, setLocalDocs] = useState<UploadedDocumentInfo[] | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isPreparing, setIsPreparing] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inspectPreview, setInspectPreview] = useState<{ url: string; name: string } | null>(null);

    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const uploadSectionRef = useRef<HTMLDivElement>(null);
    const previewUrlsRef = useRef<Set<string>>(new Set());

    const existingDocs = onDocumentsUpdated ? initialDocuments : (localDocs ?? initialDocuments);

    // Revoke all object URLs on unmount to avoid mobile memory leaks
    useEffect(() => {
        const tracked = previewUrlsRef.current;
        return () => {
            tracked.forEach((url) => URL.revokeObjectURL(url));
            tracked.clear();
        };
    }, []);

    // Escape key closes full-screen preview modal
    useEffect(() => {
        if (!inspectPreview) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setInspectPreview(null);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [inspectPreview]);

    const revokePreview = useCallback((url: string | null) => {
        if (!url) return;
        URL.revokeObjectURL(url);
        previewUrlsRef.current.delete(url);
    }, []);

    const handleFiles = async (selectedFiles: FileList | File[]) => {
        setError(null);
        setUploadSuccess(false);
        setIsPreparing(true);

        const nextItems: QueuedUploadItem[] = [];
        const issues: string[] = [];

        try {
            for (const rawFile of Array.from(selectedFiles)) {
                if (isHeicFile(rawFile)) {
                    issues.push(
                        `"${rawFile.name}" is HEIC format. Tap "Take Photo" above or save as JPG/PDF before uploading.`
                    );
                    continue;
                }

                const ext = getFileExtension(rawFile.name);
                const resolvedMime = resolveMimeType(rawFile);
                const isAllowedType =
                    ALLOWED_EXTENSIONS.has(ext) ||
                    ALLOWED_MIME_TYPES.has(resolvedMime) ||
                    isWebpImage(rawFile);

                if (!isAllowedType) {
                    issues.push(`"${rawFile.name}" is unsupported. Please use PDF, JPG, or PNG.`);
                    continue;
                }

                const originalSize = rawFile.size;
                const { file: maybeCompressed, compressed } = await compressImageIfNeeded(rawFile);
                const processedMime = resolveMimeType(maybeCompressed);
                const processedFile = ensureAllowedFilenameExtension(maybeCompressed, processedMime);

                if (processedFile.size > MAX_FILE_SIZE) {
                    issues.push(
                        `"${rawFile.name}" is ${formatMB(processedFile.size)} (max 5 MB). Please compress or scan at lower resolution.`
                    );
                    continue;
                }

                let previewUrl: string | null = null;
                if (isImageFile(processedFile)) {
                    previewUrl = URL.createObjectURL(processedFile);
                    previewUrlsRef.current.add(previewUrl);
                }

                nextItems.push({
                    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                    file: processedFile,
                    originalSize,
                    compressed,
                    previewUrl,
                    status: "queued",
                    progress: 0,
                });
            }
        } finally {
            setIsPreparing(false);
        }

        if (issues.length > 0) {
            setError(issues[0]);
        }

        if (nextItems.length > 0) {
            setQueue((prev) => [...prev, ...nextItems]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (isUploading || isPreparing) return;
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (isUploading || isPreparing) return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            void handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            void handleFiles(e.target.files);
        }
        if (e.target) e.target.value = "";
    };

    const removeQueueItem = (id: string) => {
        setQueue((prev) => {
            const found = prev.find((item) => item.id === id);
            if (found?.previewUrl) revokePreview(found.previewUrl);
            return prev.filter((item) => item.id !== id);
        });
    };

    const handleReuploadTrigger = () => {
        setUploadSuccess(false);
        setError(null);
        uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
            galleryInputRef.current?.click();
        }, 250);
    };

    const handleUpload = async () => {
        const pendingItems = queue.filter((item) => item.status === "queued" || item.status === "failed");
        if (pendingItems.length === 0) return;

        if (typeof navigator !== "undefined" && !navigator.onLine) {
            setError("You appear to be offline. Reconnect to mobile data or Wi-Fi and tap Retry.");
            return;
        }

        setIsUploading(true);
        setError(null);

        let latestServerDocs: UploadedDocumentInfo[] | null = null;
        let hadFailure = false;
        const newlyUploadedFallback: UploadedDocumentInfo[] = [];

        for (const item of pendingItems) {
            setQueue((prev) =>
                prev.map((q) =>
                    q.id === item.id ? { ...q, status: "uploading", progress: 5, error: undefined } : q
                )
            );

            try {
                const fileType = resolveMimeType(item.file) || "application/octet-stream";
                const res = await fetch("/api/documents/upload-url", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        trackingCode,
                        fileName: item.file.name,
                        fileType,
                        fileSize: item.file.size,
                    }),
                });

                const creds = await res.json();
                if (!res.ok || !creds.success || !creds.signedUrl || !creds.fileName) {
                    throw new Error(creds.error || "Failed to authorize upload.");
                }

                await uploadFileViaXHR(creds.signedUrl, item.file, (pct) => {
                    setQueue((prev) =>
                        prev.map((q) => (q.id === item.id ? { ...q, progress: pct } : q))
                    );
                });

                // Confirm upload so server creates pending review metadata & broadcasts live update
                const confirmPayload = JSON.stringify({
                    trackingCode,
                    fileName: creds.fileName,
                    originalName: item.file.name,
                });
                let confirmRes = await fetch("/api/documents/upload-url", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: confirmPayload,
                });
                if (!confirmRes.ok) {
                    await new Promise((r) => setTimeout(r, 400));
                    confirmRes = await fetch("/api/documents/upload-url", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: confirmPayload,
                    });
                }
                const confirmJson = await confirmRes.json();
                if (confirmRes.ok && confirmJson.success && Array.isArray(confirmJson.documents)) {
                    latestServerDocs = confirmJson.documents;
                } else {
                    newlyUploadedFallback.push({
                        name: creds.fileName,
                        originalName: item.file.name,
                        created_at: new Date().toISOString(),
                        status: "pending",
                    });
                }

                setQueue((prev) =>
                    prev.map((q) => (q.id === item.id ? { ...q, status: "done", progress: 100 } : q))
                );
            } catch (err: unknown) {
                hadFailure = true;
                const message =
                    err instanceof Error ? err.message : "Upload failed. Tap Retry to try again.";
                setQueue((prev) =>
                    prev.map((q) =>
                        q.id === item.id ? { ...q, status: "failed", error: message } : q
                    )
                );
            }
        }

        if (latestServerDocs) {
            setLocalDocs(latestServerDocs);
            onDocumentsUpdated?.(latestServerDocs);
        } else if (newlyUploadedFallback.length > 0) {
            const next = [...existingDocs, ...newlyUploadedFallback];
            setLocalDocs(next);
            onDocumentsUpdated?.(next);
        }

        setIsUploading(false);

        if (hadFailure) {
            setError(
                "Some files could not be uploaded. Successfully uploaded files are saved; tap Retry Failed to upload the remaining file(s)."
            );
        } else {
            // Revoke preview URLs from latest queue state and clear queue on full success
            setQueue((prev) => {
                prev.forEach((item) => revokePreview(item.previewUrl));
                return [];
            });
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 5000);
        }
    };

    const hasFailedItems = queue.some((q) => q.status === "failed");
    const pendingCount = queue.filter((q) => q.status === "queued" || q.status === "failed").length;

    const getStatusBadge = (status?: UploadedDocumentInfo["status"]) => {
        if (status === "verified") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    {t("track.docs.verified", undefined, "Verified")}
                </span>
            );
        }
        if (status === "rejected") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25 shrink-0">
                    <AlertCircle className="w-3 h-3" />
                    {t("track.docs.rejected", undefined, "Re-upload Needed")}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
                <Clock className="w-3 h-3" />
                {t("track.docs.pending", undefined, "Pending Review")}
            </span>
        );
    };

    return (
        <div id="documents-section" ref={uploadSectionRef} className="mt-7 pt-7 border-t border-border scroll-mt-24">
            <div className="mb-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    {t("track.docs.title", undefined, "Application Documents")}
                </h3>
                {canUpload && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {t(
                            "track.docs.hint",
                            undefined,
                            "Supported: PDF, JPG, PNG (max 5 MB each). Large phone photos are automatically compressed for faster upload."
                        )}
                    </p>
                )}
            </div>

            {/* Existing Submitted Documents (no nested scroll trap on mobile) */}
            {existingDocs.length > 0 && (
                <div className="mb-5 space-y-2.5 text-left">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("track.docs.submitted", undefined, "Submitted Documents")} ({existingDocs.length})
                    </p>
                    <div className="space-y-2 sm:max-h-72 sm:overflow-y-auto sm:pr-1">
                        {existingDocs.map((doc, idx) => {
                            const status = doc.status || "pending";
                            const displayName = doc.originalName || doc.name;
                            return (
                                <div
                                    key={doc.id || `${doc.name}-${idx}`}
                                    className={cn(
                                        "rounded-xl px-3 py-2.5 border text-xs transition-all",
                                        status === "verified"
                                            ? "bg-emerald-500/5 border-emerald-500/20"
                                            : status === "rejected"
                                              ? "bg-red-500/5 border-red-500/25"
                                              : "bg-accent/5 border-accent/20"
                                    )}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-start gap-2 min-w-0 flex-1">
                                            <FileText className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                            <span
                                                className="font-medium text-foreground break-words line-clamp-2 leading-snug"
                                                title={displayName}
                                            >
                                                {displayName}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-6 sm:pl-0">
                                            {getStatusBadge(status)}
                                            <span className="text-[11px] text-muted-foreground font-mono">
                                                {new Date(doc.created_at).toLocaleDateString("en-GB", {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {status === "rejected" && (
                                        <div className="mt-2.5 space-y-2">
                                            {doc.feedback && (
                                                <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs flex items-start gap-2">
                                                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                    <div className="leading-relaxed">
                                                        <span className="font-semibold">
                                                            {t("track.docs.feedback", undefined, "Counselor Feedback:")}{" "}
                                                        </span>
                                                        <span>{doc.feedback}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {canUpload && (
                                                <button
                                                    type="button"
                                                    onClick={handleReuploadTrigger}
                                                    className="w-full sm:w-auto min-h-[44px] px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                    <span>{t("track.docs.reuploadCta", undefined, "Re-upload Clear Copy")}</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Upload Area */}
            {canUpload && (
                <div
                    className={cn(
                        "relative border-2 border-dashed rounded-2xl p-4 sm:p-6 transition-all duration-200 text-center",
                        isDragging
                            ? "border-accent bg-accent/5"
                            : "border-border bg-muted/20",
                        error && "border-red-500/50 bg-red-500/5"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {/* Hidden Inputs: Camera Capture + PDF/Gallery Picker */}
                    <input
                        type="file"
                        ref={cameraInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                    />
                    <input
                        type="file"
                        multiple
                        ref={galleryInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                        className="hidden"
                    />

                    <AnimatePresence mode="wait">
                        {uploadSuccess ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-3"
                            >
                                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                </div>
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    {t("track.docs.uploadSuccess", undefined, "Document uploaded successfully!")}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t("track.docs.uploadSuccessNote", undefined, "Our counselor team will review it shortly.")}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setUploadSuccess(false)}
                                    className="mt-3 min-h-[44px] px-4 rounded-xl text-xs font-semibold text-accent hover:bg-accent/10 transition-colors"
                                >
                                    {t("track.docs.uploadMore", undefined, "Upload another document")}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="picker"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                {/* Dual Explicit Mobile-First Capture Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        disabled={isUploading || isPreparing}
                                        onClick={() => cameraInputRef.current?.click()}
                                        className="min-h-[48px] px-4 py-3 rounded-xl bg-accent/12 hover:bg-accent/20 border border-accent/30 text-accent font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <Camera className="w-4 h-4 shrink-0" />
                                        <span>{t("track.docs.takePhoto", undefined, "Take Photo (Camera)")}</span>
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isUploading || isPreparing}
                                        onClick={() => galleryInputRef.current?.click()}
                                        className="min-h-[48px] px-4 py-3 rounded-xl bg-background hover:bg-muted/60 border border-border text-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <FolderOpen className="w-4 h-4 text-accent shrink-0" />
                                        <span>{t("track.docs.uploadGallery", undefined, "Upload PDF / Gallery")}</span>
                                    </button>
                                </div>

                                {isPreparing && (
                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-1">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                                        <span>Optimizing image size for fast upload...</span>
                                    </div>
                                )}

                                {queue.length === 0 && !isPreparing && (
                                    <p className="hidden sm:block text-xs text-muted-foreground">
                                        {t("track.docs.dragHint", undefined, "Or drag and drop PDF, JPG, or PNG files right here.")}
                                    </p>
                                )}

                                {/* Queued Files List with Thumbnails & Real Progress */}
                                {queue.length > 0 && (
                                    <div className="space-y-2.5 text-left pt-1">
                                        {queue.map((item) => (
                                            <div
                                                key={item.id}
                                                className={cn(
                                                    "p-3 rounded-xl bg-background border shadow-2xs space-y-2",
                                                    item.status === "failed"
                                                        ? "border-red-500/40"
                                                        : item.status === "done"
                                                          ? "border-emerald-500/35"
                                                          : "border-border"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Thumbnail Preview or PDF Icon */}
                                                    {item.previewUrl ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setInspectPreview({
                                                                    url: item.previewUrl!,
                                                                    name: item.file.name,
                                                                })
                                                            }
                                                            className="relative w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0 group"
                                                            aria-label={`Preview ${item.file.name}`}
                                                        >
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={item.previewUrl}
                                                                alt={item.file.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <span className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                                <Eye className="w-4 h-4" />
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                                                            <FileText className="w-5 h-5 text-accent" />
                                                        </div>
                                                    )}

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                                                            {item.file.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 flex-wrap mt-0.5 text-[11px] text-muted-foreground">
                                                            {item.compressed ? (
                                                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                                    Optimized {formatMB(item.originalSize)} -&gt;{" "}
                                                                    {formatMB(item.file.size)}
                                                                </span>
                                                            ) : (
                                                                <span>{formatMB(item.file.size)}</span>
                                                            )}
                                                            {item.status === "done" && (
                                                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    Uploaded
                                                                </span>
                                                            )}
                                                            {item.status === "uploading" && (
                                                                <span className="text-accent font-semibold tabular-nums">
                                                                    {item.progress}%
                                                                </span>
                                                            )}
                                                            {item.status === "failed" && (
                                                                <span className="text-red-500 font-semibold">
                                                                    Failed
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {!isUploading && item.status !== "done" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeQueueItem(item.id)}
                                                            className="w-11 h-11 flex items-center justify-center hover:bg-muted rounded-lg transition-colors shrink-0"
                                                            aria-label={`Remove ${item.file.name}`}
                                                        >
                                                            <X className="w-4 h-4 text-muted-foreground" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Per-file XHR Upload Progress Bar */}
                                                {(item.status === "uploading" || item.status === "done") && (
                                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-[width] duration-150",
                                                                item.status === "done" ? "bg-emerald-500" : "bg-accent"
                                                            )}
                                                            style={{ width: `${item.progress}%` }}
                                                        />
                                                    </div>
                                                )}

                                                {item.error && (
                                                    <p className="text-[11px] text-red-500 leading-snug">
                                                        {item.error}
                                                    </p>
                                                )}
                                            </div>
                                        ))}

                                        {pendingCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => void handleUpload()}
                                                disabled={isUploading}
                                                className="w-full min-h-[48px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-bold hover:brightness-110 transition-all disabled:opacity-60 mt-2"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>{t("track.docs.uploading", undefined, "Uploading...")}</span>
                                                    </>
                                                ) : hasFailedItems ? (
                                                    <>
                                                        <RefreshCw className="w-4 h-4" />
                                                        <span>Retry Failed ({pendingCount})</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UploadCloud className="w-4 h-4" />
                                                        <span>
                                                            {t("track.docs.confirmUpload", undefined, "Confirm Upload")} ({pendingCount})
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Error Banner */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3.5 flex items-start gap-2 text-xs sm:text-sm text-red-500 bg-red-500/10 rounded-xl px-3.5 py-3 border border-red-500/20 text-left"
                    >
                        {error.toLowerCase().includes("offline") ? (
                            <WifiOff className="w-4 h-4 mt-0.5 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        )}
                        <span className="leading-relaxed">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Full-screen Tap-to-Inspect Image Preview Modal (portaled to document.body) */}
            {mounted
                ? createPortal(
                      <AnimatePresence>
                          {inspectPreview && (
                              <motion.div
                                  role="dialog"
                                  aria-modal="true"
                                  aria-label={`Preview ${inspectPreview.name}`}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  onClick={() => setInspectPreview(null)}
                                  className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4"
                              >
                                  <div className="w-full max-w-xl flex items-center justify-between gap-2 mb-3 text-white">
                                      <p className="text-sm font-medium truncate">{inspectPreview.name}</p>
                                      <button
                                          type="button"
                                          onClick={() => setInspectPreview(null)}
                                          aria-label="Close preview"
                                          className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0"
                                      >
                                          <X className="w-5 h-5" />
                                      </button>
                                  </div>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                      src={inspectPreview.url}
                                      alt={inspectPreview.name}
                                      onClick={(e) => e.stopPropagation()}
                                      className="max-h-[78dvh] max-w-full object-contain rounded-xl shadow-2xl"
                                  />
                              </motion.div>
                          )}
                      </AnimatePresence>,
                      document.body
                  )
                : null}
        </div>
    );
}
