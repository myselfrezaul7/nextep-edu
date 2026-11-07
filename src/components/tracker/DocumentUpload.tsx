"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    UploadCloud,
    File,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { UploadedDocumentInfo } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

interface DocumentUploadProps {
    trackingCode: string;
    initialDocuments?: UploadedDocumentInfo[];
    onDocumentsUpdated?: (docs: UploadedDocumentInfo[]) => void;
    canUpload?: boolean;
}

export function DocumentUpload({
    trackingCode,
    initialDocuments = [],
    onDocumentsUpdated,
    canUpload = true,
}: DocumentUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [localDocs, setLocalDocs] = useState<UploadedDocumentInfo[] | null>(
        null
    );
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Prefer parent-controlled initialDocuments when onDocumentsUpdated is provided, otherwise fallback to localDocs
    const existingDocs = onDocumentsUpdated
        ? initialDocuments
        : (localDocs ?? initialDocuments);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFiles = (selectedFiles: FileList | File[]) => {
        setError(null);
        setUploadSuccess(false);

        const validFiles: File[] = [];

        Array.from(selectedFiles).forEach((f) => {
            if (!ALLOWED_TYPES.includes(f.type)) {
                setError(
                    "One or more files have an invalid type. Please upload PDF, JPG, or PNG."
                );
            } else if (f.size > MAX_FILE_SIZE) {
                setError(
                    "One or more files are too large. Maximum size is 5 MB each."
                );
            } else {
                validFiles.push(f);
            }
        });

        if (validFiles.length > 0) {
            setFiles((prev) => [...prev, ...validFiles]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
        // Reset so the same file can be re-selected after removal
        if (e.target) e.target.value = "";
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        setError(null);

        try {
            let latestServerDocs: UploadedDocumentInfo[] | null = null;

            for (const f of files) {
                const res = await fetch("/api/documents/upload-url", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        trackingCode,
                        fileName: f.name,
                        fileType: f.type,
                        fileSize: f.size,
                    }),
                });

                const creds = await res.json();
                if (!res.ok || !creds.success || !creds.path || !creds.token) {
                    throw new Error(
                        creds.error || "Failed to authorize upload."
                    );
                }

                const { error: uploadError } = await supabase.storage
                    .from("documents")
                    .uploadToSignedUrl(creds.path, creds.token, f, {
                        cacheControl: "3600",
                        upsert: false,
                    });

                if (uploadError) throw uploadError;

                // Confirm upload completion to trigger live broadcast to admin and student
                try {
                    const confirmRes = await fetch(
                        "/api/documents/upload-url",
                        {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                trackingCode,
                                fileName: creds.fileName,
                                originalName: f.name,
                            }),
                        }
                    );
                    const confirmJson = await confirmRes.json();
                    if (
                        confirmRes.ok &&
                        confirmJson.success &&
                        Array.isArray(confirmJson.documents)
                    ) {
                        latestServerDocs = confirmJson.documents;
                    }
                } catch {
                    // Non-blocking fallback if confirmation call fails
                }
            }

            setUploadSuccess(true);
            if (latestServerDocs) {
                setLocalDocs(latestServerDocs);
                onDocumentsUpdated?.(latestServerDocs);
            } else {
                const uploadedList: UploadedDocumentInfo[] = files.map((f) => ({
                    name: f.name,
                    originalName: f.name,
                    created_at: new Date().toISOString(),
                    status: "pending",
                }));
                const next = [...existingDocs, ...uploadedList];
                setLocalDocs(next);
                onDocumentsUpdated?.(next);
            }

            setFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = "";

            // Reset success message after 5 seconds
            setTimeout(() => setUploadSuccess(false), 5000);
        } catch (err: unknown) {
            console.error("Upload failed:", err);
            const message =
                err instanceof Error
                    ? err.message
                    : "Upload failed. Please try again.";
            setError(message);
        } finally {
            setIsUploading(false);
        }
    };

    const getStatusBadge = (status?: UploadedDocumentInfo["status"]) => {
        if (status === "verified") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                </span>
            );
        }
        if (status === "rejected") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25 shrink-0">
                    <AlertCircle className="w-3 h-3" />
                    Rejected
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 shrink-0">
                <Clock className="w-3 h-3" />
                Pending
            </span>
        );
    };

    return (
        <div className="mt-8 pt-8 border-t border-border">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Application Documents
                </h3>
                {canUpload && (
                    <>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                            You can add multiple files. Supported formats: PDF,
                            JPG, PNG.
                        </p>
                        <p className="text-xs text-red-500 font-bold mt-1">
                            Maximum file size: 5 MB each.
                        </p>
                    </>
                )}
            </div>

            {existingDocs.length > 0 && (
                <div className="mb-5 space-y-2.5 text-left">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Submitted Documents ({existingDocs.length})
                    </p>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {existingDocs.map((doc, idx) => {
                            const status = doc.status || "pending";
                            const displayName = doc.originalName || doc.name;
                            return (
                                <div
                                    key={doc.id || `${doc.name}-${idx}`}
                                    className={cn(
                                        "rounded-xl px-3.5 py-2.5 border text-xs transition-all",
                                        status === "verified"
                                            ? "bg-emerald-500/5 border-emerald-500/20"
                                            : status === "rejected"
                                            ? "bg-red-500/5 border-red-500/25"
                                            : "bg-accent/5 border-accent/20"
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <File className="w-3.5 h-3.5 text-accent shrink-0" />
                                            <span
                                                className="font-medium text-foreground truncate"
                                                title={displayName}
                                            >
                                                {displayName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {getStatusBadge(status)}
                                            <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                                                {new Date(
                                                    doc.created_at
                                                ).toLocaleDateString("en-GB", {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    {status === "rejected" && doc.feedback && (
                                        <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs flex items-start gap-2">
                                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="font-semibold">
                                                    Counselor Feedback:{" "}
                                                </span>
                                                <span>{doc.feedback}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {canUpload && (
                <div
                    className={cn(
                        "relative border-2 border-dashed rounded-2xl p-6 sm:p-8 transition-all duration-300 text-center",
                        isDragging
                            ? "border-accent bg-accent/5"
                            : "border-border bg-muted/20 hover:bg-muted/40",
                        error && "border-red-500/50 bg-red-500/5"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() =>
                        files.length === 0 &&
                        !isUploading &&
                        fileInputRef.current?.click()
                    }
                >
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                    />

                    <AnimatePresence mode="wait">
                        {files.length === 0 && !uploadSuccess ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-sm border mb-4">
                                    <UploadCloud className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium text-foreground">
                                    Tap to upload or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Secure upload to your application folder
                                </p>
                            </motion.div>
                        ) : uploadSuccess ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center"
                            >
                                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                </div>
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    Document uploaded successfully!
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Our team will review it shortly.
                                </p>
                            </motion.div>
                        ) : files.length > 0 ? (
                            <motion.div
                                key="file"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-full max-w-sm space-y-3 mb-6">
                                    {files.map((f, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-4 p-3 rounded-xl bg-background border shadow-sm relative"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                                <File className="w-5 h-5 text-accent" />
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {f.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(
                                                        f.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{" "}
                                                    MB
                                                </p>
                                            </div>
                                            {!isUploading && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFiles((prev) =>
                                                            prev.filter(
                                                                (_, index) =>
                                                                    index !== i
                                                            )
                                                        );
                                                    }}
                                                    className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-muted rounded-md transition-colors"
                                                    aria-label={`Remove ${f.name}`}
                                                >
                                                    <X className="w-4 h-4 text-muted-foreground" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {!isUploading && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                            className="w-full min-h-[44px] text-sm text-accent hover:underline mt-2 font-medium"
                                        >
                                            + Add more files
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpload();
                                    }}
                                    disabled={isUploading}
                                    className="w-full max-w-sm min-h-[44px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-4 h-4" />
                                            Confirm Upload
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>
            )}

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 flex items-start gap-2 text-sm text-red-500 bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20"
                    >
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
