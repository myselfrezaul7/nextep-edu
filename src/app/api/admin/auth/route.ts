import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const rateLimitResult = rateLimit("login", ip, { maxRequests: 5, windowMs: 60000 });
        
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { success: false, error: "Too many login attempts. Please try again later." },
                { status: 429 }
            );
        }

        const { password } = await request.json();

        if (!password) {
            return NextResponse.json(
                { success: false, error: "Password is required" },
                { status: 400 }
            );
        }

        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            return NextResponse.json(
                { success: false, error: "Admin password not configured" },
                { status: 500 }
            );
        }

        if (password === adminPassword) {
            return NextResponse.json({
                success: true,
                token: signToken({ role: "admin" }),
            });
        }

        return NextResponse.json(
            { success: false, error: "Invalid password" },
            { status: 401 }
        );
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid request" },
            { status: 400 }
        );
    }
}
