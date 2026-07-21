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
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const documentsWithUrls = await Promise.all(
            data.map(async (file) => {
                const { data: urlData, error: urlError } = await supabaseAdmin.storage
                    .from("documents")
                    .createSignedUrl(`${trackingCode}/${file.name}`, 60 * 60);

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
