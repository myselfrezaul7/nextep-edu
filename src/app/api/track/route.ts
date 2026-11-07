import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getPhoneVariants } from "@/lib/sanitize";
import { getApplicationDocumentsWithMeta } from "@/lib/realtime-broadcast";

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const rateLimitResult = rateLimit("track", ip, {
            maxRequests: 15,
            windowMs: 60000,
        });
        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Too many requests. Please try again later.",
                },
                { status: 429 }
            );
        }

        const body = await request.json();
        const trackingCode =
            typeof body?.trackingCode === "string"
                ? body.trackingCode.trim().toUpperCase()
                : "";
        const phone =
            typeof body?.phone === "string" ? body.phone.trim() : "";

        if (!trackingCode && !phone) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Please enter your tracking code or registered phone number.",
                },
                { status: 400 }
            );
        }

        let query = supabaseAdmin.from("applications").select("*");

        if (trackingCode && phone) {
            const phoneVariants = getPhoneVariants(phone);
            query = query
                .eq("tracking_code", trackingCode)
                .in("phone", phoneVariants);
        } else if (trackingCode) {
            if (!/^NX-[A-Z0-9]{8}$/.test(trackingCode)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Invalid tracking code format. Expected format: NX-XXXXXXXX.",
                    },
                    { status: 400 }
                );
            }
            query = query.eq("tracking_code", trackingCode);
        } else {
            const cleanDigits = phone.replace(/[^0-9]/g, "");
            if (cleanDigits.length < 6) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Please enter a valid phone number.",
                    },
                    { status: 400 }
                );
            }
            const phoneVariants = getPhoneVariants(phone);
            query = query
                .in("phone", phoneVariants)
                .order("updated_at", { ascending: false })
                .limit(1);
        }

        const { data, error } = await query.maybeSingle();

        if (error || !data) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Application not found. Please check your tracking code or phone number.",
                },
                { status: 404 }
            );
        }

        // Retrieve uploaded document metadata (including verification status and feedback)
        const uploadedDocuments = await getApplicationDocumentsWithMeta(
            data.tracking_code,
            false
        );

        return NextResponse.json({
            success: true,
            data,
            uploadedDocuments,
        });
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
