import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for the applications table
export interface ApplicationStep {
    step: number;
    label: string;
    note: string;
    date: string | null;
}

export interface Application {
    id: string;
    tracking_code: string;
    name: string;
    phone: string;
    email: string | null;
    destination: string | null;
    current_step: number;
    notes: ApplicationStep[];
    created_at: string;
    updated_at: string;
}

// Default pipeline steps
export const DEFAULT_STEPS: ApplicationStep[] = [
    { step: 1, label: "Consultation Booked", note: "", date: null },
    { step: 2, label: "Documents Reviewed", note: "", date: null },
    { step: 3, label: "University Shortlisted", note: "", date: null },
    { step: 4, label: "Offer Letter", note: "", date: null },
    { step: 5, label: "Visa Application", note: "", date: null },
    { step: 6, label: "Visa Approved", note: "", date: null },
    { step: 7, label: "Pre-Departure Briefing", note: "", date: null },
];

// Generate a unique tracking code like "NX-A7K2M9X1" (8-char alphanumeric)
export function generateTrackingCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `NX-${code}`;
}
