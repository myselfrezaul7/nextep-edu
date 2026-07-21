import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_STEPS, generateTrackingCode } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

interface RegisterBody {
    name: string;
    phone: string;
    email: string;
}

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const rateLimitResult = rateLimit("register", ip, { maxRequests: 5, windowMs: 60000 });
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { success: false, error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        const body = (await request.json()) as RegisterBody;
        const { name, phone, email } = body;

        if (!name || !phone || !email) {
            return NextResponse.json(
                { success: false, error: "Name, phone, and email are required." },
                { status: 400 }
            );
        }

        // Check if an application already exists for this phone number
        const { data: existing, error: lookupError } = await supabaseAdmin
            .from("applications")
            .select("tracking_code")
            .eq("phone", phone)
            .maybeSingle();

        if (lookupError) {
            console.error("Supabase lookup error:", lookupError);
            return NextResponse.json(
                { success: false, error: "Failed to check existing applications." },
                { status: 500 }
            );
        }

        // If already exists, return the existing tracking code
        if (existing) {
            return NextResponse.json({
                success: true,
                trackingCode: existing.tracking_code,
            });
        }

        // Generate a new tracking code and create the application at Step 1
        let trackingCode = generateTrackingCode();
        let retries = 0;
        while (retries < 5) {
            const { data: existingCode } = await supabaseAdmin
                .from("applications")
                .select("id")
                .eq("tracking_code", trackingCode)
                .maybeSingle();
            if (!existingCode) break;
            trackingCode = generateTrackingCode();
            retries++;
        }
        const now = new Date().toISOString();

        const stepsWithFirstCompleted = DEFAULT_STEPS.map((s) =>
            s.step === 1 ? { ...s, date: now } : s
        );

        const { error: insertError } = await supabaseAdmin
            .from("applications")
            .insert({
                tracking_code: trackingCode,
                name,
                phone,
                email,
                current_step: 1,
                notes: stepsWithFirstCompleted,
            });

        if (insertError) {
            console.error("Supabase insert error:", insertError);
            return NextResponse.json(
                { success: false, error: "Failed to create application." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            trackingCode,
        });
    } catch (error) {
        console.error("Registration API error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
