"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { DESTINATIONS_META } from "@/data/destinations-meta";
import { X, MessageCircle, ArrowRight } from "lucide-react";
import { useNavVisible } from "@/lib/scroll-store";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const subscribeMobileOrTablet = (callback: () => void) => {
    const mq = window.matchMedia("(max-width: 1023px)");
    mq.addEventListener("change", callback);
    return () => mq.removeEventListener("change", callback);
};

export function WhatsAppFAB() {
    const pathname = usePathname();
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showNudge, setShowNudge] = useState(false);
    const tabBarVisible = useNavVisible();
    const isMobileOrTablet = useSyncExternalStore(
        subscribeMobileOrTablet,
        () => window.matchMedia("(max-width: 1023px)").matches,
        () => false
    );

    // Idle timer for calm one-time nudge (only reset on intentional interactions, not mousemove/scroll)
    useEffect(() => {
        if (pathname.startsWith("/admin")) return;
        let hasSeenNudge = false;
        try {
            hasSeenNudge = Boolean(sessionStorage.getItem("wa_nudge_seen"));
        } catch {
            return;
        }
        if (hasSeenNudge) return;

        let idleTimer: ReturnType<typeof setTimeout>;
        let hideTimer: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                setShowNudge(true);
                try {
                    sessionStorage.setItem("wa_nudge_seen", "true");
                } catch {
                    // Ignore storage errors in restricted webviews
                }

                hideTimer = setTimeout(() => {
                    setShowNudge(false);
                }, 5000);
            }, 30000);
        };

        resetTimer();

        const events = ["pointerdown", "keydown", "touchstart"];
        events.forEach((e) => document.addEventListener(e, resetTimer, { passive: true }));

        return () => {
            clearTimeout(idleTimer);
            clearTimeout(hideTimer);
            events.forEach((e) => document.removeEventListener(e, resetTimer));
        };
    }, [pathname]);

    // Dismiss expanded card on Escape
    useEffect(() => {
        if (!isExpanded) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsExpanded(false);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isExpanded]);

    const normalizedPath = pathname.replace(/\/+$/, "") || "/";
    const isCountryDetailPage =
        normalizedPath.startsWith("/destinations/") && normalizedPath !== "/destinations";

    // On mobile/tablet (<lg), when scrolling down on Country Detail pages,
    // the Country Action Dock provides a dedicated WhatsApp CTA, so hide the FAB cleanly.
    const hideOnMobileDock = isMobileOrTablet && isCountryDetailPage && !tabBarVisible;

    // Auto-collapse expanded card & backdrop on route change or when hidden by Country Action Dock
    useEffect(() => {
        if (!hideOnMobileDock && !isExpanded) return;
        if (hideOnMobileDock && isExpanded) {
            const frame = requestAnimationFrame(() => setIsExpanded(false));
            return () => cancelAnimationFrame(frame);
        }
    }, [hideOnMobileDock, isExpanded]);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setIsExpanded(false));
        return () => cancelAnimationFrame(frame);
    }, [normalizedPath]);

    if (pathname.startsWith("/admin")) {
        return null;
    }

    const showExpanded = isExpanded && !hideOnMobileDock;

    const getMessage = () => {
        if (normalizedPath === "/") {
            return "Hi! I'd like to learn about studying abroad from Bangladesh.";
        }

        if (normalizedPath.startsWith("/destinations/")) {
            const slug = normalizedPath.split("/").pop() || "";
            const country = DESTINATIONS_META[slug];
            if (country) {
                return `Hi! I'm interested in studying in ${country.name}. Can you help?`;
            }
        }

        if (normalizedPath.startsWith("/track")) {
            return "Hi! I'm checking my application status on the NexTep Edu tracker and have a quick question.";
        }

        return "Hi! I have a question about studying abroad.";
    };

    const phoneNumber = "4915147483493";
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(getMessage())}`;

    return (
        <>
            {/* Backdrop click-to-dismiss when card is expanded */}
            {showExpanded && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsExpanded(false)}
                    aria-hidden="true"
                />
            )}

            <div
                className={cn(
                    "fixed right-4 sm:right-5 z-50 flex flex-col items-end will-change-transform transition-[transform,opacity] duration-300 ease-out lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto",
                    hideOnMobileDock
                        ? "translate-y-4 opacity-0 pointer-events-none"
                        : tabBarVisible
                            ? "-translate-y-[5.5rem] opacity-100"
                            : "translate-y-0 opacity-100"
                )}
                style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
            >
                <AnimatePresence>
                    {/* Expanded Card */}
                    {showExpanded && (
                        <motion.div
                            role="dialog"
                            aria-label={t("common.whatsapp.title", undefined, "NexTep Edu Support")}
                            initial={{ opacity: 0, scale: 0.95, y: 12, transformOrigin: "bottom right" }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="mb-3.5 w-72 max-w-[calc(100vw-2rem)] bg-card dark:bg-[#0F172A] border border-border/70 rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="bg-[#0F172A] border-b border-white/10 p-3.5 flex items-center justify-between gap-2 text-white">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center shrink-0">
                                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-sm truncate">
                                            {t("common.whatsapp.title", undefined, "NexTep Edu Support")}
                                        </h4>
                                        <p className="text-[11px] text-white/65 truncate">
                                            {t("common.whatsapp.replyTime", undefined, "Typically replies within 5 mins")}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(false)}
                                    className="w-11 h-11 flex items-center justify-center text-white/75 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
                                    aria-label={t("common.whatsapp.close", undefined, "Close chat preview")}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-4 bg-surface/50 dark:bg-slate-900/60">
                                <div className="bg-background rounded-xl p-3 border border-border/60 shadow-xs mb-3.5">
                                    <p className="text-xs leading-relaxed text-foreground/90">
                                        {t(
                                            "common.whatsapp.greeting",
                                            undefined,
                                            "Hello! Need help shortlisting universities or checking visa requirements?"
                                        )}
                                    </p>
                                </div>
                                <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsExpanded(false)}
                                    className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                                >
                                    <span>{t("common.whatsapp.cta", undefined, "Continue on WhatsApp")}</span>
                                    <ArrowRight className="w-4 h-4 shrink-0" />
                                </a>
                            </div>
                        </motion.div>
                    )}

                    {/* Calm Idle Nudge Tooltip */}
                    {!showExpanded && showNudge && (
                        <motion.div
                            initial={{ opacity: 0, x: 12, scale: 0.96 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 8, scale: 0.96 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="absolute right-[3.75rem] bottom-0.5 surface-card rounded-xl pl-3.5 pr-1 py-1 flex items-center gap-1 max-w-[calc(100vw-6rem)]"
                        >
                            <p className="text-xs font-medium text-foreground truncate">
                                {t("common.whatsapp.nudge", undefined, "Questions? Chat with a counselor")}
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowNudge(false)}
                                className="w-11 h-11 -my-1 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0"
                                aria-label={t("common.whatsapp.dismiss", undefined, "Dismiss message")}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main FAB Button */}
                <motion.button
                    type="button"
                    onClick={() => {
                        if (showNudge) setShowNudge(false);
                        setIsExpanded(!isExpanded);
                    }}
                    initial={{ opacity: 0, scale: 0.85, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="relative flex items-center justify-center w-12 h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_24px_rgba(37,211,102,0.4)] transition-colors duration-200 z-10"
                    aria-label={t("common.whatsapp.fabLabel", undefined, "Chat with us on WhatsApp")}
                >
                    <AnimatePresence mode="wait">
                        {showExpanded ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <X className="w-5 h-5" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="wa"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M20.52 3.44C18.24 1.15 15.19 0 12.04 0 5.46 0 .11 5.35.11 11.93c0 2.1.55 4.15 1.59 5.95L0 24l6.3-1.65c1.74.96 3.73 1.47 5.74 1.47 6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.19-3.45-8.45zm-8.48 18.25c-1.78 0-3.52-.48-5.05-1.38l-.36-.21-3.76.99.99-3.66-.23-.37a9.88 9.88 0 0 1-1.51-5.14c0-5.46 4.45-9.91 9.93-9.91 2.65 0 5.14 1.03 7.01 2.91 1.87 1.88 2.91 4.38 2.91 7.04 0 5.46-4.45 9.91-9.93 9.91zM17.48 14.5c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.77-1.65-2.07-.17-.3 0-.46.15-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2 0-.37-.05-.52-.05-.15-.67-1.62-.92-2.22-.24-.59-.49-.51-.67-.52-.18-.01-.38-.01-.58-.01-.2 0-.52.07-.8.37-.28.3-1.05 1.02-1.05 2.5 0 1.48 1.07 2.91 1.22 3.11.15.2 2.12 3.24 5.14 4.54 2.16.93 2.87.87 4 .77 1.12-.1 2.37-.97 2.7-1.9.32-.93.32-1.73.22-1.9-.1-.17-.3-.27-.6-.42z" />
                                </svg>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </>
    );
}
