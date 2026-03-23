"use client";

import { useState, useEffect } from "react";
import { Home, BookOpen, CalendarCheck, Info } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function MobileTabBar() {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const [activeHash, setActiveHash] = useState("");

    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = mounted && currentTheme === "dark";

    useEffect(() => {
        setMounted(true);
        
        // Track intersection or hash changes to update active tab
        const handleHashChange = () => {
            setActiveHash(window.location.hash);
        };
        
        window.addEventListener("hashchange", handleHashChange);
        handleHashChange(); // Init
        
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    // Determine active tab based on activeHash and pathname
    // If we're on a child page (e.g. /destinations/uk), the Home icon should take us back or we can just not highlight it if we're not on home
    const isHomeActive = pathname === "/" && (!activeHash || activeHash === "");
    const isServicesActive = pathname === "/" && activeHash === "#services";
    const isAboutActive = pathname === "/" && activeHash === "#about";
    // For BOOK, we don't really have a hash, it's a modal, but we can highlight it on click momentarily or leave it stateless
    
    const handleNavClick = (hash: string) => {
        if (pathname !== "/") {
            window.location.href = `/${hash}`;
        } else {
            if (hash === "") {
                window.scrollTo({ top: 0, behavior: "smooth" });
                // Strip hash without scrolling jump
                history.replaceState(null, "", " ");
                setActiveHash("");
            } else {
                const element = document.querySelector(hash);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                    history.pushState(null, "", hash);
                    setActiveHash(hash);
                }
            }
        }
    };

    return (
        <nav
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 md:hidden",
                "pb-safe pt-2 px-4 rounded-t-2xl border-t glass-nav transition-all duration-300",
                isDark
                    ? "bg-[rgba(15,23,42,0.85)] border-white/10 shadow-[0_-4px_30px_rgba(0,0,0,0.3)]"
                    : "bg-white/85 border-black/5 shadow-[0_-4px_30px_rgba(0,0,0,0.1)]"
            )}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="flex justify-between items-center mb-1">
                {/* HOME */}
                <button
                    onClick={() => handleNavClick("")}
                    className={cn(
                        "flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-200",
                        isHomeActive
                            ? "bg-accent/15 text-accent"
                            : isDark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Home className={cn("w-6 h-6 mb-1", isHomeActive && "fill-accent/20")} strokeWidth={isHomeActive ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
                </button>

                {/* SERVICES */}
                <button
                    onClick={() => handleNavClick("#services")}
                    className={cn(
                        "flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-200",
                        isServicesActive
                            ? "bg-accent/15 text-accent"
                            : isDark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <BookOpen className={cn("w-6 h-6 mb-1", isServicesActive && "fill-accent/20")} strokeWidth={isServicesActive ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Services</span>
                </button>

                {/* BOOK */}
                <button
                    onClick={() => document.getElementById('booking-modal')?.classList.remove('hidden')}
                    className={cn(
                        "flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-200",
                        isDark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <CalendarCheck className={"w-6 h-6 mb-1"} strokeWidth={2} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Book</span>
                </button>

                {/* ABOUT */}
                <button
                    onClick={() => handleNavClick("#about")}
                    className={cn(
                        "flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-200",
                        isAboutActive
                            ? "bg-accent/15 text-accent"
                            : isDark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Info className={cn("w-6 h-6 mb-1", isAboutActive && "fill-accent/20")} strokeWidth={isAboutActive ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">About</span>
                </button>
            </div>
        </nav>
    );
}
