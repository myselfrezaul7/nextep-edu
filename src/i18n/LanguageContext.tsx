"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useSyncExternalStore,
    type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type Locale = "en" | "bn";
type Namespace = "common" | "home" | "destinations" | "track";
type TranslationValue = string | string[] | { [key: string]: TranslationValue };
type Dictionary = Record<string, TranslationValue>;

interface LanguageContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, replacements?: Record<string, string>, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const LANG_STORAGE_KEY = "nextepedu-lang";
const LANG_CHANGE_EVENT = "nextepedu-lang-change";

// In-memory cache per locale/namespace so toggling EN <-> BN or navigating never re-fetches
const namespaceCache: Record<Locale, Partial<Record<Namespace, Dictionary>>> = {
    en: {},
    bn: {},
};

const dictionaries: Record<Locale, Record<Namespace, () => Promise<Dictionary>>> = {
    en: {
        common: () => import("./dictionaries/en/common.json").then((m) => m.default as Dictionary),
        home: () => import("./dictionaries/en/home.json").then((m) => m.default as Dictionary),
        destinations: () => import("./dictionaries/en/destinations.json").then((m) => m.default as Dictionary),
        track: () => import("./dictionaries/en/track.json").then((m) => m.default as Dictionary),
    },
    bn: {
        common: () => import("./dictionaries/bn/common.json").then((m) => m.default as Dictionary),
        home: () => import("./dictionaries/bn/home.json").then((m) => m.default as Dictionary),
        destinations: () => import("./dictionaries/bn/destinations.json").then((m) => m.default as Dictionary),
        track: () => import("./dictionaries/bn/track.json").then((m) => m.default as Dictionary),
    },
};

function getRequiredNamespaces(pathname: string): Namespace[] {
    if (pathname.startsWith("/track")) {
        return ["common", "track"];
    }
    if (pathname.startsWith("/destinations")) {
        return ["common", "destinations"];
    }
    if (pathname === "/") {
        return ["common", "home", "destinations"];
    }
    return ["common"];
}

function readStoredLocale(): Locale {
    if (typeof window === "undefined") return "en";
    try {
        return localStorage.getItem(LANG_STORAGE_KEY) === "bn" ? "bn" : "en";
    } catch {
        return "en";
    }
}

function subscribeLocale(listener: () => void) {
    if (typeof window === "undefined") return () => {};
    const onStorage = (e: StorageEvent) => {
        if (!e.key || e.key === LANG_STORAGE_KEY) listener();
    };
    window.addEventListener(LANG_CHANGE_EVENT, listener);
    window.addEventListener("storage", onStorage);
    return () => {
        window.removeEventListener(LANG_CHANGE_EVENT, listener);
        window.removeEventListener("storage", onStorage);
    };
}

function buildMergedDict(locale: Locale): Dictionary {
    const merged: Dictionary = {};
    const cached = namespaceCache[locale];
    (Object.keys(cached) as Namespace[]).forEach((ns) => {
        if (cached[ns]) {
            merged[ns] = cached[ns]!;
        }
    });
    return merged;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname() || "/";
    // Hydration-safe locale store: SSR snapshot is always "en", client reads localStorage post-hydration
    const locale = useSyncExternalStore<Locale>(subscribeLocale, readStoredLocale, () => "en");
    const [dict, setDict] = useState<Dictionary>({});

    useEffect(() => {
        let cancelled = false;
        const needed = getRequiredNamespaces(pathname);

        const missing = needed.filter((ns) => !namespaceCache[locale][ns]);
        if (missing.length === 0) {
            const frame = requestAnimationFrame(() => {
                if (!cancelled) setDict(buildMergedDict(locale));
            });
            return () => {
                cancelled = true;
                cancelAnimationFrame(frame);
            };
        }

        Promise.allSettled(
            missing.map(async (ns) => {
                const data = await dictionaries[locale][ns]();
                namespaceCache[locale][ns] = data;
            })
        )
            .then(() => {
                if (!cancelled) {
                    setDict(buildMergedDict(locale));
                }
            })
            .catch(() => {
                // Offline / chunk load recovery: fall back gracefully to inline component fallbacks
            });

        return () => {
            cancelled = true;
        };
    }, [locale, pathname]);

    const setLocale = useCallback((nextLocale: Locale) => {
        try {
            localStorage.setItem(LANG_STORAGE_KEY, nextLocale);
        } catch {
            // Ignore storage errors in private or restricted webviews
        }
        document.documentElement.lang = nextLocale;
        window.dispatchEvent(new CustomEvent(LANG_CHANGE_EVENT));
    }, []);

    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    const t = useCallback(
        (key: string, replacements?: Record<string, string>, fallback?: string): string => {
            const parts = key.split(".");
            let value: TranslationValue | undefined = dict;
            for (const part of parts) {
                if (Array.isArray(value)) {
                    const idx = Number(part);
                    value = Number.isInteger(idx) && idx >= 0 ? value[idx] : undefined;
                } else if (value && typeof value === "object") {
                    value = (value as Record<string, TranslationValue>)[part];
                } else {
                    value = undefined;
                }
                if (value === undefined) return fallback ?? key;
            }
            if (typeof value !== "string") return fallback ?? key;
            if (replacements) {
                return Object.entries(replacements).reduce(
                    (str, [k, v]) => str.replace(new RegExp(`{{${k}}}`, "g"), v),
                    value
                );
            }
            return value;
        },
        [dict]
    );

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
    return ctx;
}
