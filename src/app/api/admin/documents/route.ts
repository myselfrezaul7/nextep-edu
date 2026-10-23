import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { isAuthorized } from "@/lib/auth";

export async function GET(request: NextRequest) {
    if (!isAuthorized(request.headers.get("Authorization"))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const trackingCode = searchParams.get("trackingCode");

    if (!trackingCode) {
        return NextResponse.json({ error: "trackingCode is required" }, { status: 400 });
    }

    try {
        const { data, error } = await supabaseAdmin.storage
            .from("documents")
            .list(trackingCode);

        if (error) {
            console.error("Storage list error:", error);
            return NextResponse.json({ error: "Failed to load documents." }, { status: 500 });
        }

        const documentsWithUrls = await Promise.all(
            data.map(async (file) => {
                const { data: urlData, error: urlError } = await supabaseAdmin.storage
                    .from("documents")
                    .createSignedUrl(`${trackingCode}/${file.name}`, 60 * 60, { download: true });

                return {
                    name: file.name,
                    id: file.id,
                    created_at: file.created_at,
                    url: urlError ? null : urlData.signedUrl,
                };
            })
        );

        return NextResponse.json({ documents: documentsWithUrls });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    if (!isAuthorized(request.headers.get("Authorization"))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { trackingCode, fileName } = body || {};

        if (!trackingCode || !fileName || typeof trackingCode !== "string" || typeof fileName !== "string") {
            return NextResponse.json({ error: "trackingCode and fileName are required" }, { status: 400 });
        }

        const cleanCode = trackingCode.trim().toUpperCase();
        const cleanFile = fileName.trim().replace(/^.*[\\/]/, "");
        if (!/^NX-[A-Z0-9]{8}$/.test(cleanCode) || !cleanFile) {
            return NextResponse.json({ error: "Invalid document path" }, { status: 400 });
        }

        const filePath = `${cleanCode}/${cleanFile}`;
        const { error: removeError } = await supabaseAdmin.storage
            .from("documents")
            .remove([filePath]);

        if (removeError) {
            console.error("Storage delete error:", removeError);
            return NextResponse.json({ error: "Failed to delete document." }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
