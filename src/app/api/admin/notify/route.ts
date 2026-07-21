import { NextRequest, NextResponse } from "next/server";
import type { Application } from "@/lib/supabase";
import { isAuthorized } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { escapeHtml } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
    if (!isAuthorized(request.headers.get("Authorization"))) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { applicationId, type } = await request.json();

        if (!applicationId || type !== "email") {
            return NextResponse.json(
                { error: "applicationId and type='email' are required" },
                { status: 400 }
            );
        }

        // Fetch the application
        const { data: app, error: fetchError } = await supabaseAdmin
            .from("applications")
            .select("*")
            .eq("id", applicationId)
            .single();

        if (fetchError || !app) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        const application = app as Application;

        if (!application.email) {
            return NextResponse.json(
                { success: false, error: "No email address on file" },
                { status: 400 }
            );
        }

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json(
                { success: false, error: "Email not configured" },
                { status: 500 }
            );
        }

        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const currentStepData = application.notes.find(
            (s) => s.step === application.current_step
        );
        const currentStepLabel =
            currentStepData?.label || `Step ${application.current_step}`;

        const { error: emailError } = await resend.emails.send({
            from: "NexTep Edu <onboarding@nextepedu.com>",
            to: application.email,
            subject: `Application Update - ${currentStepLabel}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0F172A; color: #F8FAFC; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 32px; text-align: center; border-bottom: 2px solid #D4AF37;">
                        <h1 style="margin: 0; font-size: 24px; color: #D4AF37;">🎓 NexTep Edu</h1>
                        <p style="margin: 8px 0 0; font-size: 14px; color: #94A3B8;">Application Status Update</p>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; margin: 0 0 16px;">Hi <strong>${escapeHtml(application.name)}</strong>,</p>
                        <p style="font-size: 14px; color: #CBD5E1; margin: 0 0 24px;">
                            Great news! Your application <strong style="color: #D4AF37;">${escapeHtml(application.tracking_code)}</strong> has been updated.
                        </p>
                        <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px;">
                            <p style="margin: 0 0 8px; font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">Current Stage</p>
                            <p style="margin: 0; font-size: 20px; font-weight: bold; color: #D4AF37;">${escapeHtml(currentStepLabel)}</p>
                            <p style="margin: 8px 0 0; font-size: 14px; color: #CBD5E1;">Step ${application.current_step} of 7</p>
                        </div>
                        ${currentStepData?.note ? `<div style="background: #1E293B; border-radius: 8px; padding: 16px; margin: 0 0 24px;">
                            <p style="margin: 0 0 4px; font-size: 12px; color: #94A3B8;">Note from your counselor:</p>
                            <p style="margin: 0; font-size: 14px; color: #F8FAFC;">${escapeHtml(currentStepData.note)}</p>
                        </div>` : ""}
                        <p style="font-size: 14px; color: #CBD5E1; margin: 0 0 8px;">
                            If you have any questions, don't hesitate to reach out to us.
                        </p>
                        <p style="font-size: 14px; color: #94A3B8; margin: 0;">
                            — The NexTep Edu Team
                        </p>
                    </div>
                    <div style="background: #1E293B; padding: 16px; text-align: center; border-top: 1px solid rgba(212, 175, 55, 0.2);">
                        <p style="margin: 0; font-size: 12px; color: #64748B;">© ${new Date().getFullYear()} NexTep Edu. All rights reserved.</p>
                    </div>
                </div>
            `,
        });

        if (emailError) {
            return NextResponse.json(
                { success: false, error: emailError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { success: false, error: "Failed to send notification" },
            { status: 500 }
        );
    }
}
