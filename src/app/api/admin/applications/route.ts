import { NextRequest, NextResponse } from "next/server";
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
