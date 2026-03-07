"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function WhatsAppFAB() {
    const [isVisible, setIsVisible] = useState(false);

    // Show after scrolling down a bit
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.a
                    href="https://wa.me/4915147483493"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-2xl hover:shadow-[#25D366]/40 transition-all duration-300 before:absolute before:inset-0 before:rounded-full before:bg-[#25D366] before:animate-ping before:opacity-20 hidden sm:flex"
                    aria-label="Chat with us on WhatsApp"
                >
                    <MessageCircle className="w-7 h-7" />
                </motion.a>
            )}
        </AnimatePresence>
    );
}
