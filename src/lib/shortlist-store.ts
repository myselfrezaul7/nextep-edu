"use client";

import { useSyncExternalStore } from "react";
import { DESTINATIONS_META } from "@/data/destinations-meta";

const STORAGE_KEY = "nextep_country_shortlist";
const CHANGE_EVENT = "nextep-shortlist-change";
const MAX_SHORTLIST = 3;

const EMPTY_SLUGS: string[] = [];
let cachedRaw: string | null = null;
let cachedParsed: string[] = EMPTY_SLUGS;

function readSlugs(): string[] {
    if (typeof window === "undefined") return EMPTY_SLUGS;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === cachedRaw) return cachedParsed;
        cachedRaw = raw;
        if (!raw) {
            cachedParsed = EMPTY_SLUGS;
            return cachedParsed;
        }
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            cachedParsed = parsed
                .filter((s): s is string => typeof s === "string" && Boolean(DESTINATIONS_META[s]))
                .slice(0, MAX_SHORTLIST);
            return cachedParsed;
        }
    } catch {
        // Ignore storage errors
    }
    cachedParsed = EMPTY_SLUGS;
    return cachedParsed;
}

function writeSlugs(next: string[]) {
    if (typeof window === "undefined") return;
    const cleaned = Array.from(new Set(next.filter((s) => Boolean(DESTINATIONS_META[s])))).slice(
        0,
        MAX_SHORTLIST
    );
    const raw = JSON.stringify(cleaned);
    cachedRaw = raw;
    cachedParsed = cleaned;
    try {
        localStorage.setItem(STORAGE_KEY, raw);
    } catch {
        // Ignore storage quota errors
    }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function subscribe(listener: () => void) {
    if (typeof window === "undefined") return () => {};
    const onStorage = (e: StorageEvent) => {
        if (!e.key || e.key === STORAGE_KEY) {
            cachedRaw = null;
            listener();
        }
    };
    window.addEventListener(CHANGE_EVENT, listener);
    window.addEventListener("storage", onStorage);
    return () => {
        window.removeEventListener(CHANGE_EVENT, listener);
        window.removeEventListener("storage", onStorage);
    };
}

export function useShortlist() {
    const slugs = useSyncExternalStore(subscribe, readSlugs, () => EMPTY_SLUGS);

    const toggleShortlist = (slug: string): "added" | "removed" | "full" => {
        const current = readSlugs();
        if (current.includes(slug)) {
            writeSlugs(current.filter((s) => s !== slug));
            return "removed";
        }
        if (current.length >= MAX_SHORTLIST) {
            return "full";
        }
        writeSlugs([...current, slug]);
        return "added";
    };

    const removeFromShortlist = (slug: string) => {
        writeSlugs(readSlugs().filter((s) => s !== slug));
    };

    const clearShortlist = () => {
        writeSlugs([]);
    };

    return {
        slugs,
        maxShortlist: MAX_SHORTLIST,
        isShortlisted: (slug: string) => slugs.includes(slug),
        toggleShortlist,
        removeFromShortlist,
        clearShortlist,
    };
}
