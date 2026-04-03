"use client";
import { useTranslation } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function LanguageToggle() {
    const { locale, setLocale } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-[42px] h-8" />; // Placeholder to prevent layout shift
    }

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setLocale(locale === "en" ? "bn" : "en")}
            className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold tracking-wide",
                "hover:bg-muted transition-colors text-primary shrink-0",
                "border border-border/50 flex items-center justify-center min-w-[42px] h-8"
            )}
            aria-label={locale === "en" ? "Switch to Bangla" : "Switch to English"}
        >
            {locale === "en" ? "বাং" : "EN"}
        </motion.button>
    );
}
