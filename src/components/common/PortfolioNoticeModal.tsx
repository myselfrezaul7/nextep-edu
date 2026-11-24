"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, ShieldAlert, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/lib/use-mounted";
import { useTranslation } from "@/i18n/LanguageContext";

const STORAGE_KEY = "nextep_portfolio_notice_dismissed";
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function PortfolioNoticeModal() {
    const mounted = useMounted();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!mounted) return;

        let alreadyDismissed = false;
        try {
            alreadyDismissed = sessionStorage.getItem(STORAGE_KEY) === "1";
        } catch {
            alreadyDismissed = false;
        }
        if (alreadyDismissed) return;

        const timer = window.setTimeout(() => {
            setIsOpen(true);
        }, 450);

        return () => window.clearTimeout(timer);
    }, [mounted]);

    const handleDismiss = () => {
        setIsOpen(false);
        try {
            sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {
            // Ignore storage errors in restricted webviews
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleDismiss();
            }
        };
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="portfolio-notice-title"
                    aria-describedby="portfolio-notice-desc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) handleDismiss();
                    }}
                    className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-md p-0 sm:p-4 overscroll-contain"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 36, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.97 }}
                        transition={{ duration: 0.42, ease: EASE_OUT_EXPO }}
                        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-200/80 dark:border-white/15 bg-white/95 dark:bg-[#0F172A]/95 shadow-2xl overflow-hidden overscroll-contain"
                        style={{
                            paddingBottom: "env(safe-area-inset-bottom, 0px)",
                        }}
                    >
                        {/* Top Gold Accent Hairline */}
                        <div
                            aria-hidden="true"
                            className="h-[2px] w-full bg-gradient-to-r from-transparent via-accent/70 to-transparent"
                        />

                        {/* Subtle Ambient Glow */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full bg-accent/12 blur-3xl"
                        />

                        {/* Mobile Sheet Handle */}
                        <div className="sm:hidden flex justify-center pt-3">
                            <span className="w-10 h-1 rounded-full bg-border/80" aria-hidden="true" />
                        </div>

                        {/* Close Button (44x44px touch target) */}
                        <button
                            type="button"
                            onClick={handleDismiss}
                            aria-label={t("common.portfolioNotice.close", undefined, "Close notice")}
                            className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="relative z-10 p-6 sm:p-7 pt-5 sm:pt-7 text-center">
                            {/* Icon Badge */}
                            <div className="w-14 h-14 rounded-2xl bg-accent/12 border border-accent/25 text-accent flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <FlaskConical className="w-6 h-6" />
                            </div>

                            {/* Pill Label */}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-[11px] font-bold tracking-wider uppercase mb-3">
                                <Sparkles className="w-3 h-3" />
                                {t("common.portfolioNotice.badge", undefined, "Portfolio & Prototype Notice")}
                            </span>

                            {/* Title */}
                            <h2
                                id="portfolio-notice-title"
                                className="text-xl sm:text-2xl font-bold font-heading text-primary leading-snug mb-2.5"
                            >
                                {t(
                                    "common.portfolioNotice.title",
                                    undefined,
                                    "Non-Commercial Student Portfolio / Prototype Project"
                                )}
                            </h2>

                            {/* Highlight Pill */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-3.5">
                                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                    {t("common.portfolioNotice.notCommercial", undefined, "Not a commercial service")}
                                </span>
                            </div>

                            {/* Body */}
                            <p
                                id="portfolio-notice-desc"
                                className="text-sm text-muted-foreground leading-relaxed mb-6"
                            >
                                {t(
                                    "common.portfolioNotice.description",
                                    undefined,
                                    "This website is an independent student portfolio and software engineering prototype built for educational and demonstration purposes only. No commercial consultancy, paid services, or official visa processing are offered here."
                                )}
                            </p>

                            {/* Primary Action */}
                            <Button
                                type="button"
                                variant="accent"
                                size="lg"
                                onClick={handleDismiss}
                                className="w-full min-h-[48px] rounded-xl font-bold text-sm sm:text-base shadow-[0_8px_24px_rgba(212,175,55,0.25)]"
                            >
                                {t("common.portfolioNotice.cta", undefined, "I Understand - Explore Prototype")}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
