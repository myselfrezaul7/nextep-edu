"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { destinations } from "@/data/destinations";
import { X, MessageCircle, ArrowRight } from "lucide-react";

export function WhatsAppFAB() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showNudge, setShowNudge] = useState(false);
    const [bottomOffset, setBottomOffset] = useState("6.25rem");

    useEffect(() => {
        const handleTabBar = (e: Event) => {
            const customEvent = e as CustomEvent<{ visible: boolean }>;
            setBottomOffset(customEvent.detail?.visible ? "6.25rem" : "1.5rem");
        };
        window.addEventListener("tabbar-visibility", handleTabBar);
        return () => window.removeEventListener("tabbar-visibility", handleTabBar);
    }, []);

    // Idle timer for calm one-time nudge
    useEffect(() => {
        const hasSeenNudge = sessionStorage.getItem("wa_nudge_seen");
        if (hasSeenNudge) return;

        let idleTimer: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                setShowNudge(true);
                sessionStorage.setItem("wa_nudge_seen", "true");

                setTimeout(() => {
                    setShowNudge(false);
                }, 5000);
            }, 30000);
        };

        resetTimer();

        const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
        events.forEach(e => document.addEventListener(e, resetTimer));

        return () => {
            clearTimeout(idleTimer);
            events.forEach(e => document.removeEventListener(e, resetTimer));
        };
    }, []);

    const getMessage = () => {
        if (pathname === "/") {
            return "Hi! I'd like to learn about studying abroad from Bangladesh.";
        }

        if (pathname.startsWith("/destinations/")) {
            const slug = pathname.split("/").pop() || "";
            const country = Object.values(destinations).find(d => d.slug === slug);
            if (country) {
                return `Hi! I'm interested in studying in ${country.name}. Can you help?`;
            }
        }

        return "Hi! I have a question about studying abroad.";
    };

    const phoneNumber = "4915147483493";
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(getMessage())}`;

    return (
        <div className="fixed right-5 z-50 flex flex-col items-end md:!bottom-6 transition-[bottom] duration-300" style={{ bottom: bottomOffset }}>
            <AnimatePresence>
                {/* Expanded Card */}
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 12, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="mb-3.5 w-72 bg-card dark:bg-[#0F172A] border border-border/70 rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="bg-[#0F172A] border-b border-white/10 p-4 flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">NexTep Edu Support</h4>
                                    <p className="text-[11px] text-white/65">Typically replies within 5 mins</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                aria-label="Close chat preview"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 bg-surface/50 dark:bg-slate-900/60">
                            <div className="bg-background rounded-xl p-3 border border-border/60 shadow-xs mb-3.5">
                                <p className="text-xs leading-relaxed text-foreground/90">
                                    Hello! Need help shortlisting universities or checking visa requirements?
                                </p>
                            </div>
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsExpanded(false)}
                                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                            >
                                Continue on WhatsApp <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </motion.div>
                )}

                {/* Calm Idle Nudge Tooltip */}
                {!isExpanded && showNudge && (
                    <motion.div
                        initial={{ opacity: 0, x: 12, scale: 0.96 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 8, scale: 0.96 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="absolute right-[3.75rem] bottom-1.5 surface-card rounded-xl px-3.5 py-2.5 whitespace-nowrap"
                    >
                        <p className="text-xs font-medium text-foreground">Questions? Chat with a counselor</p>
                        <button
                            onClick={() => setShowNudge(false)}
                            className="absolute -top-1.5 -right-1.5 bg-muted rounded-full p-0.5 border border-border shadow-xs hover:bg-accent hover:text-slate-950 transition-colors"
                            aria-label="Dismiss message"
                        >
                            <X className="w-2.5 h-2.5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main FAB Button */}
            <motion.button
                onClick={() => {
                    if (showNudge) setShowNudge(false);
                    setIsExpanded(!isExpanded);
                }}
                initial={{ opacity: 0, scale: 0.85, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="relative flex items-center justify-center w-12 h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_24px_rgba(37,211,102,0.4)] transition-all duration-200 z-10"
                aria-label="Chat with us on WhatsApp"
            >
                <AnimatePresence mode="wait">
                    {isExpanded ? (
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
    );
}
