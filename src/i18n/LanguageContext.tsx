"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type Locale = "en" | "bn";
type Dictionary = Record<string, any>;

interface LanguageContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, replacements?: Record<string, string>, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Lazy-load dictionaries
const dictionaries: Record<Locale, Record<string, () => Promise<Dictionary>>> = {
    en: {
        common: () => import("./dictionaries/en/common.json").then(m => m.default),
        home: () => import("./dictionaries/en/home.json").then(m => m.default),
        destinations: () => import("./dictionaries/en/destinations.json").then(m => m.default),
    },
    bn: {
        common: () => import("./dictionaries/bn/common.json").then(m => m.default),
        home: () => import("./dictionaries/bn/home.json").then(m => m.default),
        destinations: () => import("./dictionaries/bn/destinations.json").then(m => m.default),
    },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("en");
    const [dict, setDict] = useState<Dictionary>({});

    // Load dictionaries when locale changes
    useEffect(() => {
        const loaders = dictionaries[locale];
        Promise.all(
            Object.entries(loaders).map(async ([ns, load]) => {
                const data = await load();
                return [ns, data] as const;
            })
        ).then(entries => {
            const merged: Dictionary = {};
            entries.forEach(([ns, data]) => { merged[ns] = data; });
            setDict(merged);
        });
    }, [locale]);

    // Persist to localStorage
    const setLocale = useCallback((l: Locale) => {
        setLocaleState(l);
        localStorage.setItem("nextepedu-lang", l);
        document.documentElement.lang = l;
    }, []);

    // Restore from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("nextepedu-lang") as Locale | null;
        if (saved && (saved === "en" || saved === "bn")) {
            setLocaleState(saved);
            document.documentElement.lang = saved;
        }
    }, []);

    // t("home.hero.title") → looks up dict.home.hero.title
    // t("common.nav.services")
    // Supports {{variable}} replacement: t("key", { name: "UK" })
    const t = useCallback((key: string, replacements?: Record<string, string>, fallback?: string): string => {
        const parts = key.split(".");
        let value: any = dict;
        for (const part of parts) {
            value = value?.[part];
            if (value === undefined) return fallback ?? key; // Fallback: show the fallback or key itself
        }
        if (typeof value !== "string") return fallback ?? key;
        if (replacements) {
            return Object.entries(replacements).reduce(
                (str, [k, v]) => str.replace(new RegExp(`{{${k}}}`, "g"), v),
                value
            );
        }
        return value;
    }, [dict]);

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
