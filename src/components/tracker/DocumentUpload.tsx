"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

interface DocumentUploadProps {
    trackingCode: string;
}

export function DocumentUpload({ trackingCode }: DocumentUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const validateFile = (selectedFile: File) => {
        setError(null);
        setUploadSuccess(false);

        if (!ALLOWED_TYPES.includes(selectedFile.type)) {
            setError("Invalid file type. Please upload a PDF, JPG, or PNG.");
            setFile(null);
            return false;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError("File is too large. Maximum size is 5 MB.");
            setFile(null);
            return false;
        }

        setFile(selectedFile);
        return true;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${trackingCode}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            setUploadSuccess(true);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            
            // Reset success message after 5 seconds
            setTimeout(() => setUploadSuccess(false), 5000);
        } catch (err: unknown) {
            console.error("Upload failed:", err);
            setError("Upload failed. Please try again or check your connection.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="mt-8 pt-8 border-t border-border">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Submit Documents
                </h3>
                <p className="text-xs text-muted-foreground font-medium mt-1">
                    Maximum file size: 5 MB. Supported formats: PDF, JPG, PNG.
                </p>
            </div>

            <div
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 text-center",
                    isDragging 
                        ? "border-accent bg-accent/5" 
                        : "border-border bg-muted/20 hover:bg-muted/40",
                    error && "border-red-500/50 bg-red-500/5"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && !isUploading && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                />

                <AnimatePresence mode="wait">
                    {!file && !uploadSuccess ? (
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
                                Click to upload or drag and drop
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
                    ) : file ? (
                        <motion.div
                            key="file"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-full max-w-sm flex items-center gap-4 p-3 rounded-xl bg-background border shadow-sm mb-6 relative">
                                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                    <File className="w-5 h-5 text-accent" />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                {!isUploading && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                        className="p-1.5 hover:bg-muted rounded-md transition-colors"
                                    >
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpload();
                                }}
                                disabled={isUploading}
                                className="w-full max-w-sm flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
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
