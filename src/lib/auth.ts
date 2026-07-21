import { createHmac } from "crypto";

const SECRET = process.env.ADMIN_SECRET || "fallback-secret-change-me";
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
        const [payloadStr, signature] = token.split(".");
        if (!payloadStr || !signature) return null;

        // Verify signature
        const expectedSignature = createHmac("sha256", SECRET)
            .update(payloadStr)
            .digest("base64url");

        if (signature !== expectedSignature) return null;

        // Decode and check expiry
        const payload: TokenPayload = JSON.parse(
            Buffer.from(payloadStr, "base64url").toString("utf-8")
        );

        if (Date.now() > payload.exp) return null;

        return payload;
    } catch {
        return null;
    }
}

/**
 * Extracts and verifies a Bearer token from an Authorization header.
 * Returns true if the token is valid.
 */
export function isAuthorized(authHeader: string | null): boolean {
    if (!authHeader) return false;

    // Support both "Bearer <token>" and raw token formats
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

    return verifyToken(token) !== null;
}
