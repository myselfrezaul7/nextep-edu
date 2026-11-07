import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { isAuthorized } from "@/lib/auth";
import type { DocumentVerificationStatus } from "@/lib/supabase";
import {
    broadcastApplicationEvent,
    broadcastDocumentsUpdated,
    getApplicationDocumentsWithMeta,
    updateDocumentReviewMeta,
} from "@/lib/realtime-broadcast";

const VALID_STATUSES = new Set<DocumentVerificationStatus>([
    "pending",
    "verified",
    "rejected",
]);

export async function GET(request: NextRequest) {
    if (!isAuthorized(request.headers.get("Authorization"))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawCode = searchParams.get("trackingCode");

    if (!rawCode || typeof rawCode !== "string") {
        return NextResponse.json(
            { error: "trackingCode is required" },
            { status: 400 }
        );
    }

    const trackingCode = rawCode.trim().toUpperCase();
    if (!/^NX-[A-Z0-9]{8}$/.test(trackingCode)) {
        return NextResponse.json(
            { error: "Invalid tracking code format" },
            { status: 400 }
        );
    }

    try {
        const documentsWithUrls = await getApplicationDocumentsWithMeta(
            trackingCode,
            true
        );
        return NextResponse.json({ documents: documentsWithUrls });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    if (!isAuthorized(request.headers.get("Authorization"))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { trackingCode, fileName, status, feedback } = body || {};

        if (
            !trackingCode ||
            !fileName ||
            typeof trackingCode !== "string" ||
            typeof fileName !== "string"
        ) {
            return NextResponse.json(
                { error: "trackingCode and fileName are required" },
                { status: 400 }
            );
        }

        const cleanCode = trackingCode.trim().toUpperCase();
        const cleanFile = fileName.trim().replace(/^.*[\\/]/, "");
        if (!/^NX-[A-Z0-9]{8}$/.test(cleanCode) || !cleanFile) {
            return NextResponse.json(
                { error: "Invalid document path" },
                { status: 400 }
            );
        }

        if (
            typeof status !== "string" ||
            !VALID_STATUSES.has(status as DocumentVerificationStatus)
        ) {
            return NextResponse.json(
                { error: "Invalid verification status" },
                { status: 400 }
            );
        }

        const cleanFeedback =
            typeof feedback === "string" ? feedback.trim().slice(0, 500) : "";

        const updatedApp = await updateDocumentReviewMeta(cleanCode, cleanFile, {
            status: status as DocumentVerificationStatus,
            feedback: cleanFeedback,
        });

        if (!updatedApp) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        const documentsWithUrls = await getApplicationDocumentsWithMeta(
            cleanCode,
            true
        );

        void broadcastDocumentsUpdated(cleanCode, documentsWithUrls, status);
        void broadcastApplicationEvent("application-updated", updatedApp);

        return NextResponse.json({
            success: true,
            documents: documentsWithUrls,
            application: updatedApp,
        });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    if (!isAuthorized(request.headers.get("Authorization"))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { trackingCode, fileName } = body || {};

        if (
            !trackingCode ||
            !fileName ||
            typeof trackingCode !== "string" ||
            typeof fileName !== "string"
        ) {
            return NextResponse.json(
                { error: "trackingCode and fileName are required" },
                { status: 400 }
            );
        }

        const cleanCode = trackingCode.trim().toUpperCase();
        const cleanFile = fileName.trim().replace(/^.*[\\/]/, "");
        if (!/^NX-[A-Z0-9]{8}$/.test(cleanCode) || !cleanFile) {
            return NextResponse.json(
                { error: "Invalid document path" },
                { status: 400 }
            );
        }

        const filePath = `${cleanCode}/${cleanFile}`;
        const { error: removeError } = await supabaseAdmin.storage
            .from("documents")
            .remove([filePath]);

        if (removeError) {
            console.error("Storage delete error:", removeError);
            return NextResponse.json(
                { error: "Failed to delete document." },
                { status: 500 }
            );
        }

        const updatedApp = await updateDocumentReviewMeta(
            cleanCode,
            cleanFile,
            null
        );
        const documentsWithUrls = await getApplicationDocumentsWithMeta(
            cleanCode,
            true
        );

        void broadcastDocumentsUpdated(cleanCode, documentsWithUrls, "deleted");
        if (updatedApp) {
            void broadcastApplicationEvent("application-updated", updatedApp);
        }

        return NextResponse.json({
            success: true,
            documents: documentsWithUrls,
            application: updatedApp,
        });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
