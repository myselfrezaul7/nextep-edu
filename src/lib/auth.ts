import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string {
    const secret = process.env.ADMIN_SECRET;
    if (!secret) {
        throw new Error("ADMIN_SECRET environment variable is required. Set it in .env.local and Vercel.");
    }
    return secret;
}
const SECRET = getSecret();
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface TokenPayload {
    role: string;
    iat: number;
    exp: number;
}

/**
 * Signs a token with HMAC-SHA256. Returns a Base64-encoded payload + signature.
 */
export function signToken(payload: Omit<TokenPayload, "iat" | "exp">): string {
    const now = Date.now();
    const fullPayload: TokenPayload = {
        ...payload,
        iat: now,
        exp: now + TOKEN_EXPIRY_MS,
    };

    const payloadStr = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
    const signature = createHmac("sha256", SECRET)
        .update(payloadStr)
        .digest("base64url");

    return `${payloadStr}.${signature}`;
}

/**
 * Verifies a token's signature and expiry.
 * Returns the decoded payload if valid, or null if invalid/expired.
 */
export function verifyToken(token: string): TokenPayload | null {
    try {
        if (!token || typeof token !== "string") return null;
        const [payloadStr, signature] = token.split(".");
        if (!payloadStr || !signature) return null;

        // Verify signature with constant-time comparison
        const expectedSignature = createHmac("sha256", SECRET)
            .update(payloadStr)
            .digest("base64url");

        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSignature);
        if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
            return null;
        }

        // Decode and check expiry
        const payload: TokenPayload = JSON.parse(
            Buffer.from(payloadStr, "base64url").toString("utf-8")
        );

        if (!payload || typeof payload.exp !== "number" || Date.now() > payload.exp) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

/**
 * Extracts and verifies a Bearer token from an Authorization header.
 * Returns true if the token is valid and has admin role.
 */
export function isAuthorized(authHeader: string | null): boolean {
    if (!authHeader) return false;

    // Support both "Bearer <token>" and raw token formats
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

    const payload = verifyToken(token);
    return payload !== null && payload.role === "admin";
}
