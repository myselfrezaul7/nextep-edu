import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
    broadcastApplicationEvent,
    broadcastDocumentsUpdated,
    getApplicationDocumentsWithMeta,
    updateDocumentReviewMeta,
} from "@/lib/realtime-broadcast";
import crypto from "crypto";

const ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
]);

const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const STORED_FILE_REGEX = /^\d+_[a-f0-9]{12}\.(pdf|jpg|jpeg|png)$/i;

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const rateLimitResult = rateLimit("upload-url", ip, {
            maxRequests: 20,
            windowMs: 60000,
        });
        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Too many upload requests. Please wait a moment.",
                },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { trackingCode, fileName, fileType, fileSize } = body || {};

        if (!trackingCode || typeof trackingCode !== "string") {
            return NextResponse.json(
                { success: false, error: "Valid tracking code is required." },
                { status: 400 }
            );
        }

        const cleanTrackingCode = trackingCode.trim().toUpperCase();
        if (!/^NX-[A-Z0-9]{8}$/.test(cleanTrackingCode)) {
            return NextResponse.json(
                { success: false, error: "Invalid tracking code format." },
                { status: 400 }
            );
        }

        // Validate that this tracking code exists in database
        const { data: application, error: lookupError } = await supabaseAdmin
            .from("applications")
            .select("id")
            .eq("tracking_code", cleanTrackingCode)
            .maybeSingle();

        if (lookupError || !application) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Application not found for this tracking code.",
                },
                { status: 404 }
            );
        }

        // Validate file metadata
        if (
            typeof fileSize !== "number" ||
            fileSize <= 0 ||
            fileSize > MAX_FILE_SIZE
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "File size exceeds the 5 MB limit or is invalid.",
                },
                { status: 400 }
            );
        }

        if (
            typeof fileType !== "string" ||
            !ALLOWED_MIME_TYPES.has(fileType.toLowerCase())
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid file type. Only PDF, JPG, and PNG are allowed.",
                },
                { status: 400 }
            );
        }

        if (typeof fileName !== "string" || !fileName.trim()) {
            return NextResponse.json(
                { success: false, error: "File name is required." },
                { status: 400 }
            );
        }

        const rawExt = fileName.split(".").pop()?.toLowerCase() || "";
        if (!ALLOWED_EXTENSIONS.has(rawExt)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid file extension. Only .pdf, .jpg, .jpeg, and .png are allowed.",
                },
                { status: 400 }
            );
        }

        // Generate server-controlled safe path
        const randomSuffix = crypto.randomBytes(6).toString("hex");
        const storedFileName = `${Date.now()}_${randomSuffix}.${rawExt}`;
        const safePath = `${cleanTrackingCode}/${storedFileName}`;

        // Create signed upload URL
        const { data: signedData, error: signedError } =
            await supabaseAdmin.storage
                .from("documents")
                .createSignedUploadUrl(safePath);

        if (signedError || !signedData) {
            console.error(
                "Supabase signed upload URL generation error:",
                signedError
            );
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to generate secure upload credentials.",
                },
                { status: 500 }
            );
        }

        // Record initial pending review metadata with original filename
        const cleanOriginalName = fileName
            .trim()
            .replace(/^.*[\\/]/, "")
            .slice(0, 120);
        await updateDocumentReviewMeta(cleanTrackingCode, storedFileName, {
            status: "pending",
            originalName: cleanOriginalName,
        });

        return NextResponse.json({
            success: true,
            path: signedData.path,
            fileName: storedFileName,
            originalName: cleanOriginalName,
            token: signedData.token,
            signedUrl: signedData.signedUrl,
        });
    } catch (err) {
        console.error("Upload-url POST route error:", err);
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const rateLimitResult = rateLimit("upload-confirm", ip, {
            maxRequests: 30,
            windowMs: 60000,
        });
        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Too many requests. Please wait a moment.",
                },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { trackingCode, fileName, originalName } = body || {};

        if (!trackingCode || typeof trackingCode !== "string") {
            return NextResponse.json(
                { success: false, error: "Valid tracking code is required." },
                { status: 400 }
            );
        }

        const cleanTrackingCode = trackingCode.trim().toUpperCase();
        if (!/^NX-[A-Z0-9]{8}$/.test(cleanTrackingCode)) {
            return NextResponse.json(
                { success: false, error: "Invalid tracking code format." },
                { status: 400 }
            );
        }

        let updatedApp = null;
        if (typeof fileName === "string" && fileName.trim()) {
            const cleanStoredFile = fileName.trim().replace(/^.*[\\/]/, "");
            if (STORED_FILE_REGEX.test(cleanStoredFile)) {
                const cleanOriginal =
                    typeof originalName === "string" && originalName.trim()
                        ? originalName
                              .trim()
                              .replace(/^.*[\\/]/, "")
                              .slice(0, 120)
                        : cleanStoredFile;

                updatedApp = await updateDocumentReviewMeta(
                    cleanTrackingCode,
                    cleanStoredFile,
                    {
                        originalName: cleanOriginal,
                    }
                );
            }
        }

        const documents = await getApplicationDocumentsWithMeta(
            cleanTrackingCode,
            false
        );

        void broadcastDocumentsUpdated(
            cleanTrackingCode,
            documents,
            "uploaded"
        );
        if (updatedApp) {
            void broadcastApplicationEvent("application-updated", updatedApp);
        }

        return NextResponse.json({
            success: true,
            documents,
        });
    } catch (err) {
        console.error("Upload-url PUT route error:", err);
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
