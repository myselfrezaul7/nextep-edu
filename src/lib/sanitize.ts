/**
 * Escapes HTML special characters to prevent XSS in email templates.
 */
export function escapeHtml(str: unknown): string {
    if (typeof str !== "string") return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Normalizes phone numbers by removing spaces, hyphens, parentheses, and dots.
 * Converts Bangladeshi country prefixes (+8801... or 8801...) to local standard (01...).
 * Preserves international formats (e.g. +49...) cleanly.
 */
export function normalizePhone(raw: unknown): string {
    if (typeof raw !== "string") return "";
    const compact = raw.trim().replace(/[\s\-().]/g, "");
    if (/^\+?8801\d{9}$/.test(compact)) {
        return compact.replace(/^\+?88/, "");
    }
    return compact;
}

/**
 * Returns an array of phone representations for backward-compatible database lookups.
 * Ensures numbers typed as "017...", "+88017...", "88017...", or formatted with spaces/hyphens
 * match any existing records in the database.
 */
export function getPhoneVariants(raw: unknown): string[] {
    if (typeof raw !== "string") return [];
    const trimmed = raw.trim();
    if (!trimmed) return [];
    const compact = trimmed.replace(/[\s\-().]/g, "");
    const normalized = normalizePhone(trimmed);
    const variants = new Set<string>([trimmed, compact, normalized]);
    if (/^01\d{9}$/.test(normalized)) {
        variants.add(`+88${normalized}`);
        variants.add(`88${normalized}`);
    }
    return Array.from(variants).filter(Boolean);
}
