"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppFAB() {
    return (
        <a
            href="https://wa.me/4915773855748?text=Hi%20NexTep%20Edu!%20I%20want%20to%20know%20about%20studying%20abroad."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 group"
            aria-label="Chat on WhatsApp"
        >
            <div className="relative">
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />

                {/* Button */}
                <div className="relative w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
                    <MessageCircle className="w-7 h-7 text-white fill-white" />
                </div>

                {/* Tooltip */}
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-card border border-border rounded-lg px-3 py-2 text-sm font-medium text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-lg">
                    Chat with us!
                </div>
            </div>
        </a>
    );
}
