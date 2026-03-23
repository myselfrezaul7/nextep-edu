"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function WhatsAppFAB() {
    return (
        <AnimatePresence>
            <motion.a
                href="https://wa.me/4915147483493"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-6 right-6 mb-20 md:mb-0 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-2xl hover:shadow-[#25D366]/40 transition-all duration-300 before:absolute before:inset-0 before:rounded-full before:bg-[#25D366] before:animate-[ping_3s_ease-in-out_infinite] before:opacity-20 flex"
                aria-label="Chat with us on WhatsApp"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M20.52 3.44C18.24 1.15 15.19 0 12.04 0 5.46 0 .11 5.35.11 11.93c0 2.1.55 4.15 1.59 5.95L0 24l6.3-1.65c1.74.96 3.73 1.47 5.74 1.47 6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.19-3.45-8.45zm-8.48 18.25c-1.78 0-3.52-.48-5.05-1.38l-.36-.21-3.76.99.99-3.66-.23-.37a9.88 9.88 0 0 1-1.51-5.14c0-5.46 4.45-9.91 9.93-9.91 2.65 0 5.14 1.03 7.01 2.91 1.87 1.88 2.91 4.38 2.91 7.04 0 5.46-4.45 9.91-9.93 9.91zM17.48 14.5c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.77-1.65-2.07-.17-.3 0-.46.15-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2 0-.37-.05-.52-.05-.15-.67-1.62-.92-2.22-.24-.59-.49-.51-.67-.52-.18-.01-.38-.01-.58-.01-.2 0-.52.07-.8.37-.28.3-1.05 1.02-1.05 2.5 0 1.48 1.07 2.91 1.22 3.11.15.2 2.12 3.24 5.14 4.54 2.16.93 2.87.87 4 .77 1.12-.1 2.37-.97 2.7-1.9.32-.93.32-1.73.22-1.9-.1-.17-.3-.27-.6-.42z"
                    />
                </svg>
            </motion.a>
        </AnimatePresence>
    );
}
