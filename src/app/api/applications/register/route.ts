import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_STEPS, generateTrackingCode } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { escapeHtml } from "@/lib/sanitize";

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
        const name = typeof body?.name === "string" ? body.name.trim() : "";
        const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
        const email = typeof body?.email === "string" ? body.email.trim() : "";

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
        if (retries >= 5) {
            return NextResponse.json(
                { success: false, error: "Failed to generate a unique tracking code. Please try again." },
                { status: 500 }
            );
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

        // Try to send the welcome email
        if (process.env.RESEND_API_KEY) {
            try {
                const { Resend } = await import("resend");
                const resend = new Resend(process.env.RESEND_API_KEY);
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nextepedu.com";
                const trackingUrl = `${baseUrl}/track?code=${trackingCode}`;
                
                await resend.emails.send({
                    from: "NexTep Edu <onboarding@nextepedu.com>",
                    to: email,
                    subject: "Your NexTep Edu Tracking Code",
                    html: `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0F172A; color: #F8FAFC; border-radius: 12px; overflow: hidden;">
                            <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 32px; text-align: center; border-bottom: 2px solid #D4AF37;">
                                <h1 style="margin: 0; font-size: 24px; color: #D4AF37;">🎓 NexTep Edu</h1>
                                <p style="margin: 8px 0 0; font-size: 14px; color: #94A3B8;">Consultation Request Received</p>
                            </div>
                            <div style="padding: 32px;">
                                <p style="font-size: 16px; margin: 0 0 16px;">Hi <strong>${escapeHtml(name)}</strong>,</p>
                                <p style="font-size: 14px; color: #CBD5E1; margin: 0 0 24px;">
                                    Thank you for booking a free consultation with NexTep Edu! We've received your request and our team will contact you shortly.
                                </p>
                                <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px;">
                                    <p style="margin: 0 0 8px; font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">Your Tracking Code</p>
                                    <p style="margin: 0; font-size: 24px; font-weight: bold; color: #D4AF37; letter-spacing: 2px;">${trackingCode}</p>
                                </div>
                                <p style="font-size: 14px; color: #CBD5E1; margin: 0 0 16px;">
                                    You can track the progress of your application at any time by clicking the button below:
                                </p>
                                <div style="text-align: center; margin: 32px 0;">
                                    <a href="${trackingUrl}" style="background-color: #D4AF37; color: #0F172A; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Track My Application</a>
                                </div>
                                <p style="font-size: 14px; color: #94A3B8; margin: 0;">
                                    — The NexTep Edu Team
                                </p>
                            </div>
                        </div>
                    `,
                });
            } catch (emailError) {
                console.error("Failed to send welcome email:", emailError);
            }
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
