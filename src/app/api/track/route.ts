import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const rateLimitResult = rateLimit("track", ip, { maxRequests: 10, windowMs: 60000 });
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { success: false, error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        const body = await request.json();
        const trackingCode = typeof body?.trackingCode === "string" ? body.trackingCode.trim().toUpperCase() : "";
        const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

        if (!trackingCode || !phone) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Tracking code and phone number are required.",
                },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from("applications")
            .select("*")
            .eq("tracking_code", trackingCode)
            .eq("phone", phone)
            .maybeSingle();

        if (error || !data) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Application not found. Please check your tracking code and phone number.",
                },
                { status: 404 }
            );
        }

        // Retrieve uploaded document filenames for this authenticated student
        let uploadedDocuments: { name: string; created_at: string }[] = [];
        try {
            const { data: files } = await supabaseAdmin.storage
                .from("documents")
                .list(trackingCode);
            if (files && files.length > 0) {
                uploadedDocuments = files.map((f) => ({
                    name: f.name,
                    created_at: f.created_at || new Date().toISOString(),
                }));
            }
        } catch (storageErr) {
            console.error("Failed to list student documents:", storageErr);
        }

        return NextResponse.json({ success: true, data, uploadedDocuments });
    } catch {
        return NextResponse.json(
            {
                success: false,
                error: "Something went wrong. Please try again.",
            },
            { status: 500 }
        );
    }
}
