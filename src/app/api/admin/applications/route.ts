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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);
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
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ applications: data, total: count });
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
            return NextResponse.json(
                { error: error.message },
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
            const newStep = Math.min(currentApp.current_step + 1, 7);
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
                .select()
                .single();

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                );
            }

            // Try to send an email notification if they have an email
            if (currentApp.email && process.env.RESEND_API_KEY) {
                try {
                    const stepName = updatedNotes[newStep - 1].label;
                    await resend.emails.send({
                        from: 'NexTep Edu <onboarding@nextepedu.com>',
                        to: currentApp.email,
                        subject: `Status Update: ${stepName} - NexTep Edu`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                <h2 style="color: #0F172A;">Great news, ${escapeHtml(currentApp.name)}!</h2>
                                <p style="font-size: 16px; color: #333;">Your application has advanced to the next step:</p>
                                <div style="background-color: #f8fafc; border-left: 4px solid #D4AF37; padding: 16px; margin: 20px 0;">
                                    <h3 style="margin: 0; color: #0F172A;">${escapeHtml(stepName)}</h3>
                                    ${note ? `<p style="margin: 8px 0 0; color: #64748b;"><em>"${escapeHtml(note)}"</em></p>` : ''}
                                </div>
                                <p style="font-size: 16px; color: #333;">You can track your full progress anytime using your tracking code: <strong>${escapeHtml(currentApp.tracking_code)}</strong></p>
                                <p style="font-size: 14px; color: #64748b; margin-top: 30px;">Best regards,<br>The NexTep Team</p>
                            </div>
                        `
                    });
                } catch (e) {
                    console.error("Failed to send email:", e);
                }
            }

            return NextResponse.json({ application: data });
        } else if (action === "undo") {
            const newStep = Math.max(currentApp.current_step - 1, 1);
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
                .select()
                .single();

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
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
                .select()
                .single();

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
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
            return NextResponse.json(
                { error: error.message },
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
