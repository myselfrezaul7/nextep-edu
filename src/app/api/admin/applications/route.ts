import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
    supabase,
    DEFAULT_STEPS,
    generateTrackingCode,
} from "@/lib/supabase";
import type { Application } from "@/lib/supabase";

function isAuthorized(request: NextRequest): boolean {
    const auth = request.headers.get("Authorization");
    return auth === "admin-authenticated";
}

const resend = new Resend(process.env.RESEND_API_KEY);

// GET: Fetch all applications
export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("updated_at", { ascending: false });

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ applications: data });
}

// POST: Create a new application
export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
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

        const trackingCode = generateTrackingCode();
        const now = new Date().toISOString();

        // Set step 1's date to today
        const steps = DEFAULT_STEPS.map((step, index) =>
            index === 0
                ? { ...step, date: now.split("T")[0] }
                : { ...step }
        );

        const { data, error } = await supabase
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
    if (!isAuthorized(request)) {
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
        const { data: app, error: fetchError } = await supabase
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
                        date: now.split("T")[0],
                        note: note || step.note,
                    };
                }
                return step;
            });

            const { data, error } = await supabase
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
                        from: 'NexTep Edu <onboarding@resend.dev>',
                        to: currentApp.email,
                        subject: `Status Update: ${stepName} - NexTep Edu`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                <h2 style="color: #0F172A;">Great news, ${currentApp.name}!</h2>
                                <p style="font-size: 16px; color: #333;">Your application has advanced to the next step:</p>
                                <div style="background-color: #f8fafc; border-left: 4px solid #D4AF37; padding: 16px; margin: 20px 0;">
                                    <h3 style="margin: 0; color: #0F172A;">${stepName}</h3>
                                    ${note ? `<p style="margin: 8px 0 0; color: #64748b;"><em>"${note}"</em></p>` : ''}
                                </div>
                                <p style="font-size: 16px; color: #333;">You can track your full progress anytime using your tracking code: <strong>${currentApp.tracking_code}</strong></p>
                                <p style="font-size: 14px; color: #64748b; margin-top: 30px;">Best regards,<br>The NexTep Team</p>
                            </div>
                        `
                    });
                } catch (e) {
                    console.error("Failed to send email:", e);
                }
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
