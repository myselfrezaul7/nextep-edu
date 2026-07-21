/**
 * Lightweight in-memory rate limiter.
 * Uses a Map to track request counts per identifier (usually IP address).
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const limiters = new Map<string, Map<string, RateLimitEntry>>();

interface RateLimitOptions {
    /** Maximum number of requests allowed in the window */
    maxRequests: number;
    /** Time window in milliseconds */
    windowMs: number;
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
}

/**
 * Check if a request should be rate-limited.
 * @param namespace - A unique name for this limiter (e.g., "login", "track")
 * @param identifier - The requester's identity (e.g., IP address)
 * @param options - Rate limit configuration
 */
export function rateLimit(
    namespace: string,
    identifier: string,
    options: RateLimitOptions
): RateLimitResult {
    if (!limiters.has(namespace)) {
        limiters.set(namespace, new Map());
    }

    const store = limiters.get(namespace)!;
    const now = Date.now();
    const entry = store.get(identifier);

    // Clean up expired entries periodically (every 100 checks)
    if (Math.random() < 0.01) {
        for (const [key, val] of store) {
            if (now > val.resetTime) store.delete(key);
        }
    }

    if (!entry || now > entry.resetTime) {
        // First request or window expired — start fresh
        store.set(identifier, {
            count: 1,
            resetTime: now + options.windowMs,
        });
        return { success: true, remaining: options.maxRequests - 1 };
    }

    if (entry.count >= options.maxRequests) {
        return { success: false, remaining: 0 };
    }

    entry.count++;
    return { success: true, remaining: options.maxRequests - entry.count };
}

/**
 * Extract IP address from request headers.
 * Works on Vercel (x-forwarded-for) and locally.
 */
export function getClientIp(headers: Headers): string {
    return (
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headers.get("x-real-ip") ||
        "unknown"
    );
}
