import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createHash, timingSafeEqual } from "crypto";

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

        const hashInput = createHash("sha256").update(typeof password === "string" ? password : "").digest();
        const hashTarget = createHash("sha256").update(adminPassword).digest();
        const isValid = timingSafeEqual(hashInput, hashTarget);

        if (isValid) {
            const token = signToken({ role: "admin" });
            const response = NextResponse.json({
                success: true,
                token,
            });

            response.cookies.set("admin_session", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24, // 24 hours
            });

            return response;
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
