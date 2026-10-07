import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
    DEFAULT_STEPS,
    generateTrackingCode,
} from "@/lib/supabase";
import type { Application } from "@/lib/supabase";
import { isAuthorized } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { escapeHtml } from "@/lib/sanitize";

const resend = new Resend(process.env.RESEND_API_KEY);

// GET: Fetch all applications
export async function GET(request: NextRequest) {
    if (!isAuthorized(request.headers.get("Authorization"))) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const rawPage = parseInt(searchParams.get("page") || "1", 10);
        const rawLimit = parseInt(searchParams.get("limit") || "25", 10);
        const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
        const limit = isNaN(rawLimit) || rawLimit < 1 ? 25 : Math.min(rawLimit, 100);
        const sortOrder = searchParams.get("sortOrder") || "newest";

        let query = supabaseAdmin
            .from("applications")
            .select("*", { count: "exact" });

        if (sortOrder === "newest") {
            query = query.order("updated_at", { ascending: false });
        } else if (sortOrder === "oldest") {
            query = query.order("updated_at", { ascending: true });
        } else if (sortOrder === "name-asc") {
            query = query.order("name", { ascending: true });
        } else if (sortOrder === "name-desc") {
            query = query.order("name", { ascending: false });
        } else {
            query = query.order("updated_at", { ascending: false });
        }

        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const { data, count, error } = await query.range(start, end);

        if (error) {
            console.error("Supabase query error:", error);
            return NextResponse.json(
                { error: "Failed to fetch applications" },
                { status: 500 }
            );
        }

        return NextResponse.json({ applications: data || [], total: count || 0 });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch applications" },
            { status: 500 }
        );
    }
}

// POST: Create a new application
export async function POST(request: NextRequest) {
    if (!isAuthorized(request.headers.get("Authorization"))) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { name, phone, email, destination } = body;

        if (!name || !phone) {
            return NextResponse.json(
                { error: "Name and phone are required" },
                { status: 400 }
            );
        }

        let trackingCode = generateTrackingCode();
        let retries = 0;
        while (retries < 5) {
            const { data: existing } = await supabaseAdmin
                .from("applications")
                .select("id")
                .eq("tracking_code", trackingCode)
                .maybeSingle();
            if (!existing) break;
            trackingCode = generateTrackingCode();
            retries++;
        }
        if (retries >= 5) {
            return NextResponse.json(
                { error: "Failed to generate a unique tracking code. Please try again." },
                { status: 500 }
            );
        }
        const now = new Date().toISOString();

        // Set step 1's date to today
        const steps = DEFAULT_STEPS.map((step, index) =>
            index === 0
                ? { ...step, date: now }
                : { ...step }
        );

        const { data, error } = await supabaseAdmin
            .from("applications")
            .insert({
                tracking_code: trackingCode,
                name,
                phone,
                email: email || null,
                destination: destination || null,
                current_step: 1,
                notes: steps,
                created_at: now,
                updated_at: now,
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            return NextResponse.json(
                { error: "Failed to create application" },
                { status: 500 }
            );
        }

        return NextResponse.json({ application: data }, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}

// PATCH: Advance application step or update notes
export async function PATCH(request: NextRequest) {
    if (!isAuthorized(request.headers.get("Authorization"))) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { id, action, note } = body;

        if (!id || !action) {
            return NextResponse.json(
                { error: "id and action are required" },
                { status: 400 }
            );
        }

        // Fetch current application
        const { data: app, error: fetchError } = await supabaseAdmin
            .from("applications")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !app) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        const currentApp = app as Application;

        if (action === "advance") {
            if (currentApp.current_step >= 7) {
                return NextResponse.json(
                    { error: "Application is already at the final step." },
                    { status: 400 }
                );
            }
            const newStep = currentApp.current_step + 1;
            const now = new Date().toISOString();

            // Update the step's date and optional note
            const updatedNotes = currentApp.notes.map((step, index) => {
                if (index === newStep - 1) {
                    return {
                        ...step,
                        date: now,
                        note: note || step.note,
                    };
                }
                return step;
            });

            const { data, error } = await supabaseAdmin
                .from("applications")
                .update({
                    current_step: newStep,
                    notes: updatedNotes,
                    updated_at: now,
                })
                .eq("id", id)
                .eq("updated_at", currentApp.updated_at)
                .select()
                .maybeSingle();

            if (error) {
                console.error("Supabase update error:", error);
                return NextResponse.json(
                    { error: "Failed to update step" },
                    { status: 500 }
                );
            }

            if (!data) {
                return NextResponse.json(
                    { error: "Data was modified by another user." },
                    { status: 409 }
                );
            }

            // Try to send an email notification if they have an email
            if (currentApp.email && process.env.RESEND_API_KEY) {
                try {
                    const stepName = updatedNotes[newStep - 1].label;
                    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.nextepedu.com";
                    const trackingUrl = `${baseUrl}/track?code=${currentApp.tracking_code}`;

                    await resend.emails.send({
                        from: "NexTep Edu <onboarding@nextepedu.com>",
                        to: currentApp.email,
                        subject: `Status Update: ${stepName} - NexTep Edu`,
                        html: `
                            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0F172A; color: #F8FAFC; border-radius: 12px; overflow: hidden;">
                                <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 32px; text-align: center; border-bottom: 2px solid #D4AF37;">
                                    <h1 style="margin: 0; font-size: 24px; color: #D4AF37;">🎓 NexTep Edu</h1>
                                    <p style="margin: 8px 0 0; font-size: 14px; color: #94A3B8;">Application Status Update</p>
                                </div>
                                <div style="padding: 32px;">
                                    <p style="font-size: 16px; margin: 0 0 16px;">Hi <strong>${escapeHtml(currentApp.name)}</strong>,</p>
                                    <p style="font-size: 14px; color: #CBD5E1; margin: 0 0 24px;">
                                        Great news! Your application <strong style="color: #D4AF37;">${escapeHtml(currentApp.tracking_code)}</strong> has advanced to the next step.
                                    </p>
                                    <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px;">
                                        <p style="margin: 0 0 8px; font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">Current Stage</p>
                                        <p style="margin: 0; font-size: 20px; font-weight: bold; color: #D4AF37;">${escapeHtml(stepName)}</p>
                                        <p style="margin: 8px 0 0; font-size: 14px; color: #CBD5E1;">Step ${newStep} of 7</p>
                                    </div>
                                    ${note ? `<div style="background: #1E293B; border-radius: 8px; padding: 16px; margin: 0 0 24px; border-left: 3px solid #D4AF37;">
                                        <p style="margin: 0 0 4px; font-size: 12px; color: #94A3B8;">Note from counselor:</p>
                                        <p style="margin: 0; font-size: 14px; color: #F8FAFC;">${escapeHtml(note)}</p>
                                    </div>` : ""}
                                    <p style="font-size: 14px; color: #CBD5E1; margin: 0 0 16px;">
                                        You can track your live application progress at any time:
                                    </p>
                                    <div style="text-align: center; margin: 28px 0;">
                                        <a href="${trackingUrl}" style="background-color: #D4AF37; color: #0F172A; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Track My Application →</a>
                                    </div>
                                    <p style="font-size: 14px; color: #94A3B8; margin: 0;">
                                        - The NexTep Edu Team
                                    </p>
                                </div>
                                <div style="background: #1E293B; padding: 16px; text-align: center; border-top: 1px solid rgba(212, 175, 55, 0.2);">
                                    <p style="margin: 0; font-size: 12px; color: #64748B;">© ${new Date().getFullYear()} NexTep Edu. All rights reserved.</p>
                                </div>
                            </div>
                        `,
                    });
                } catch (e) {
                    console.error("Failed to send email:", e);
                }
            }

            return NextResponse.json({ application: data });
        } else if (action === "undo") {
            if (currentApp.current_step <= 1) {
                return NextResponse.json(
                    { error: "Cannot undo past the first step." },
                    { status: 400 }
                );
            }
            const newStep = currentApp.current_step - 1;
            const now = new Date().toISOString();

            const updatedNotes = currentApp.notes.map((step, index) => {
                if (index === currentApp.current_step - 1 && currentApp.current_step > 1) {
                    return {
                        ...step,
                        date: null,
                        note: "",
                    };
                }
                return step;
            });

            const { data, error } = await supabaseAdmin
                .from("applications")
                .update({
                    current_step: newStep,
                    notes: updatedNotes,
                    updated_at: now,
                })
                .eq("id", id)
                .eq("updated_at", currentApp.updated_at)
                .select()
                .maybeSingle();

            if (error) {
                console.error("Supabase update error:", error);
                return NextResponse.json(
                    { error: "Failed to update notes" },
                    { status: 500 }
                );
            }

            if (!data) {
                return NextResponse.json(
                    { error: "Data was modified by another user." },
                    { status: 409 }
                );
            }

            return NextResponse.json({ application: data });
        } else if (action === "edit") {
            const { name, email, phone, destination } = body;
            const now = new Date().toISOString();
            
            const { data, error } = await supabaseAdmin
                .from("applications")
                .update({
                    name: name !== undefined ? name : currentApp.name,
                    email: email !== undefined ? (email || null) : currentApp.email,
                    phone: phone !== undefined ? phone : currentApp.phone,
                    destination: destination !== undefined ? (destination || null) : currentApp.destination,
                    updated_at: now,
                })
                .eq("id", id)
                .eq("updated_at", currentApp.updated_at)
                .select()
                .maybeSingle();

            if (error) {
                console.error("Supabase update error:", error);
                return NextResponse.json(
                    { error: "Failed to update application details" },
                    { status: 500 }
                );
            }

            if (!data) {
                return NextResponse.json(
                    { error: "Data was modified by another user." },
                    { status: 409 }
                );
            }

            return NextResponse.json({ application: data });
        }

        return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
        );
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}

// DELETE: Remove an application
export async function DELETE(request: NextRequest) {
    if (!isAuthorized(request.headers.get("Authorization"))) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { error: "id is required" },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin
            .from("applications")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Supabase delete error:", error);
            return NextResponse.json(
                { error: "Failed to delete application" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}
