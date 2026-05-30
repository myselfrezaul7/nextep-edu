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

    // Idle timer for nudge
    useEffect(() => {
        const hasSeenNudge = sessionStorage.getItem("wa_nudge_seen");
        if (hasSeenNudge) return;

        let idleTimer: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                setShowNudge(true);
                sessionStorage.setItem("wa_nudge_seen", "true");
                
                // Auto dismiss nudge after 5 seconds
                setTimeout(() => {
                    setShowNudge(false);
                }, 5000);
            }, 30000); // 30 seconds idle
        };

        // Initialize timer
        resetTimer();

        // Activity events
        const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
        events.forEach(e => document.addEventListener(e, resetTimer));

        return () => {
            clearTimeout(idleTimer);
            events.forEach(e => document.removeEventListener(e, resetTimer));
        };
    }, []);

    // Generate context-aware message
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
        <div className="fixed bottom-[6.5rem] md:bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {/* Expanded Card */}
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="mb-4 w-72 bg-surface dark:bg-[#0F172A] border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="bg-[#25D366] p-4 flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">NexTep Edu</h4>
                                    <p className="text-xs text-white/80">Typically replies in 5 min</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsExpanded(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 bg-muted/30">
                            <div className="bg-background rounded-xl p-3 border border-border/50 shadow-sm mb-4 inline-block max-w-[85%] relative">
                                <p className="text-sm text-foreground/90">Hi there! 👋<br/>Need help finding the right destination?</p>
                                {/* Chat bubble tail */}
                                <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-transparent border-r-[10px] border-r-background border-b-[10px] border-b-transparent" />
                            </div>
                            <a 
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsExpanded(false)}
                                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold transition-colors shadow-md hover:shadow-lg"
                            >
                                Start Chat <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </motion.div>
                )}

                {/* Idle Nudge Tooltip */}
                {!isExpanded && showNudge && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.9 }}
                        className="absolute right-[4.5rem] bottom-2 bg-background border border-border/50 shadow-lg rounded-2xl rounded-br-sm px-4 py-3 whitespace-nowrap"
                    >
                        <p className="text-sm font-medium text-foreground">Need help choosing a country? 💬</p>
                        <button 
                            onClick={() => setShowNudge(false)}
                            className="absolute -top-2 -right-2 bg-muted rounded-full p-1 border shadow-sm hover:bg-accent hover:text-white transition-colors"
                        >
                            <X className="w-3 h-3" />
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
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-2xl hover:shadow-[#25D366]/40 transition-all duration-300 z-10"
                aria-label="Chat with us on WhatsApp"
            >
                {/* Ping effect behind the button */}
                <div className="absolute inset-0 rounded-full bg-[#25D366] animate-[ping_3s_ease-in-out_infinite] opacity-20 -z-10" />
                
                <AnimatePresence mode="wait">
                    {isExpanded ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="wa"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path fillRule="evenodd" clipRule="evenodd" d="M20.52 3.44C18.24 1.15 15.19 0 12.04 0 5.46 0 .11 5.35.11 11.93c0 2.1.55 4.15 1.59 5.95L0 24l6.3-1.65c1.74.96 3.73 1.47 5.74 1.47 6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.19-3.45-8.45zm-8.48 18.25c-1.78 0-3.52-.48-5.05-1.38l-.36-.21-3.76.99.99-3.66-.23-.37a9.88 9.88 0 0 1-1.51-5.14c0-5.46 4.45-9.91 9.93-9.91 2.65 0 5.14 1.03 7.01 2.91 1.87 1.88 2.91 4.38 2.91 7.04 0 5.46-4.45 9.91-9.93 9.91zM17.48 14.5c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.77-1.65-2.07-.17-.3 0-.46.15-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2 0-.37-.05-.52-.05-.15-.67-1.62-.92-2.22-.24-.59-.49-.51-.67-.52-.18-.01-.38-.01-.58-.01-.2 0-.52.07-.8.37-.28.3-1.05 1.02-1.05 2.5 0 1.48 1.07 2.91 1.22 3.11.15.2 2.12 3.24 5.14 4.54 2.16.93 2.87.87 4 .77 1.12-.1 2.37-.97 2.7-1.9.32-.93.32-1.73.22-1.9-.1-.17-.3-.27-.6-.42z" />
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
