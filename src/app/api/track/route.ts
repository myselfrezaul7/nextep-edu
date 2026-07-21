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
        const { trackingCode, phone } = body as {
            trackingCode: string;
            phone: string;
        };

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
            .eq("tracking_code", trackingCode.toUpperCase())
            .eq("phone", phone)
            .single();

        if (error || !data) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Application not found. Please check your tracking code and phone number.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data });
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
