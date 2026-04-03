"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, ArrowRight, Heart, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/LanguageContext";

export function Footer() {
    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [openSection, setOpenSection] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const { t, locale } = useTranslation();
    const currentTheme = theme === "system" ? systemTheme : theme;

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleSection = (section: string) => {
        if (!isMobile) return;
        setOpenSection(openSection === section ? null : section);
    };

    const currentYear = new Date().getFullYear();
    return (
        <footer className="relative z-10 bg-background transition-colors duration-300">
            {/* CTA Banner */}
            <div className="relative overflow-hidden">
                {/* Solid opaque dark background — no bleed-through in light mode */}
                <div className="absolute inset-0 bg-[#0F172A] pointer-events-none" />
                {/* Frosted glass inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(212,175,55,0.15)_0%,_transparent_60%)] pointer-events-none" />
                <div className="container mx-auto px-4 py-12 md:py-16 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h3 className="text-2xl md:text-3xl font-bold font-heading text-white mb-3">
                            {t("common.footer.ctaTitle")}
                        </h3>
                        <p className="text-white/70 mb-6 max-w-lg mx-auto text-sm md:text-base">
                            {t("common.footer.ctaSubtitle")}
                        </p>
                        <motion.div whileTap={{ scale: 0.95 }} className="inline-block">
                            <Button
                                size="lg"
                                className="rounded-full font-bold text-base px-8"
                                onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                            >
                                {t("common.footer.ctaButton")}
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Gold gradient divider */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

            {/* Main Footer Content */}
            <div className={cn(
                "backdrop-blur-xl py-16 border-t",
                mounted && currentTheme === "dark" ? "bg-[rgba(15,23,42,0.85)] border-white/10" : "bg-white/60 border-black/5"
            )}>
                <div className="container mx-auto px-4">
                    {/* Brand */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className={cn(
                                "relative w-10 h-10 md:w-8 md:h-8 rounded-md overflow-hidden p-0.5 border shrink-0",
                                mounted && currentTheme === "dark" ? "bg-white/10 border-white/10" : "bg-white/50 border-black/5"
                            )}>
                                <Image src="/assets/logo.png" alt="Logo" fill className="object-contain" />
                            </div>
                            <span className="font-heading font-bold text-2xl md:text-xl text-foreground">NexTep Edu</span>
                        </div>
                        <p className={cn(
                            "text-sm leading-relaxed max-w-md",
                            mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground"
                        )}>
                            Your trusted partner for global education. We simplify the journey from application to admission.
                        </p>
                    </motion.div>

                    {/* Links Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-12">
                        {/* Quick Links */}
                        <div className="border-b md:border-none border-border/30">
                            <button 
                                onClick={() => toggleSection("quick-links")}
                                className="w-full flex items-center justify-between py-4 md:py-0 md:mb-6 text-foreground font-bold hover:text-accent transition-colors"
                            >
                                <span>{t("common.footer.quickLinks")}</span>
                                <ChevronDown className={cn("w-4 h-4 md:hidden transition-transform duration-300", openSection === "quick-links" && "rotate-180")} />
                            </button>
                            <AnimatePresence initial={false}>
                                {(!isMobile || openSection === "quick-links") && (
                                    <motion.ul 
                                        initial={isMobile ? { height: 0, opacity: 0 } : undefined}
                                        animate={isMobile ? { height: "auto", opacity: 1 } : undefined}
                                        exit={isMobile ? { height: 0, opacity: 0 } : undefined}
                                        className="space-y-1 md:space-y-3 text-sm pb-4 md:pb-0 overflow-hidden"
                                    >
                                        <li><Link href="/" className={cn("py-2.5 md:py-0 block hover:text-accent transition-colors", mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground")}>{t("common.footer.home")}</Link></li>
                                        <li><Link href="/#services" className={cn("py-2.5 md:py-0 block hover:text-accent transition-colors", mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground")}>{t("common.footer.services")}</Link></li>
                                        <li><Link href="/#about" className={cn("py-2.5 md:py-0 block hover:text-accent transition-colors", mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground")}>{t("common.footer.aboutUs")}</Link></li>
                                        <li><Link href="/destinations" className={cn("py-2.5 md:py-0 block hover:text-accent transition-colors", mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground")}>{t("common.footer.destinations")}</Link></li>
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Destinations */}
                        <div className="border-b md:border-none border-border/30">
                            <button 
                                onClick={() => toggleSection("destinations")}
                                className="w-full flex items-center justify-between py-4 md:py-0 md:mb-6 text-foreground font-bold hover:text-accent transition-colors"
                            >
                                <span>{t("common.footer.popularDestinations")}</span>
                                <ChevronDown className={cn("w-4 h-4 md:hidden transition-transform duration-300", openSection === "destinations" && "rotate-180")} />
                            </button>
                            <AnimatePresence initial={false}>
                                {(!isMobile || openSection === "destinations") && (
                                    <motion.ul 
                                        initial={isMobile ? { height: 0, opacity: 0 } : undefined}
                                        animate={isMobile ? { height: "auto", opacity: 1 } : undefined}
                                        exit={isMobile ? { height: 0, opacity: 0 } : undefined}
                                        className="space-y-1 md:space-y-3 text-sm pb-4 md:pb-0 overflow-hidden"
                                    >
                                        <li><Link href="/destinations/uk" className={cn("py-2.5 md:py-0 block hover:text-accent transition-colors", mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground")}>United Kingdom</Link></li>
                                        <li><Link href="/destinations/usa" className={cn("py-2.5 md:py-0 block hover:text-accent transition-colors", mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground")}>USA</Link></li>
                                        <li><Link href="/destinations/canada" className={cn("py-2.5 md:py-0 block hover:text-accent transition-colors", mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground")}>Canada</Link></li>
                                        <li><Link href="/destinations/australia" className={cn("py-2.5 md:py-0 block hover:text-accent transition-colors", mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground")}>Australia</Link></li>
                                        <li><Link href="/destinations/germany" className={cn("py-2.5 md:py-0 block hover:text-accent transition-colors", mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground")}>Germany</Link></li>
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Contact */}
                        <div className="border-b md:border-none border-border/30">
                            <button 
                                onClick={() => toggleSection("contact")}
                                className="w-full flex items-center justify-between py-4 md:py-0 md:mb-6 text-foreground font-bold hover:text-accent transition-colors"
                            >
                                <span>{t("common.footer.contactUs")}</span>
                                <ChevronDown className={cn("w-4 h-4 md:hidden transition-transform duration-300", openSection === "contact" && "rotate-180")} />
                            </button>
                            <AnimatePresence initial={false}>
                                {(!isMobile || openSection === "contact") && (
                                    <motion.ul 
                                        initial={isMobile ? { height: 0, opacity: 0 } : undefined}
                                        animate={isMobile ? { height: "auto", opacity: 1 } : undefined}
                                        exit={isMobile ? { height: 0, opacity: 0 } : undefined}
                                        className="space-y-1 md:space-y-4 text-sm pb-4 md:pb-0 overflow-hidden"
                                    >
                                        <li>
                                            <a href="https://wa.me/4915147483493" target="_blank" rel="noopener noreferrer" className={cn("flex items-start gap-3 py-2.5 md:py-0 hover:text-accent transition-colors", mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground")}>
                                                <Phone className="w-4 h-4 mt-1 text-accent shrink-0" />
                                                +49 151 47483493
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=info@nextepedu.com" target="_blank" rel="noopener noreferrer" className={cn("flex items-start gap-3 py-2.5 md:py-0 hover:text-accent transition-colors", mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground")}>
                                                <Mail className="w-4 h-4 mt-1 text-accent shrink-0" />
                                                info@nextepedu.com
                                            </a>
                                        </li>
                                        <li>
                                            <span className={cn("flex items-start gap-3 py-2.5 md:py-0", mounted && currentTheme === "dark" ? "text-white/70" : "text-muted-foreground")}>
                                                <MapPin className="w-4 h-4 mt-1 text-accent shrink-0" />
                                                1500, Munshiganj, Dhaka, Bangladesh
                                            </span>
                                        </li>
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border/30 pb-28 md:pb-0">
                <div className="container mx-auto px-4 py-8 flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-4">
                    <p className={cn(
                        "text-xs md:text-sm text-center md:text-left",
                        mounted && currentTheme === "dark" ? "text-white/50" : "text-muted-foreground"
                    )}>
                        &copy; {new Date().getFullYear()} NexTep Edu. All rights reserved.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <motion.a
                            whileTap={{ scale: 0.9 }}
                            href="https://facebook.com/nextepbd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "flex items-center justify-center w-10 h-10 md:w-8 md:h-8 rounded-full transition-all duration-300",
                                mounted && currentTheme === "dark" 
                                    ? "bg-white/5 hover:bg-white/10 text-white/70 hover:text-[#1877F2]" 
                                    : "bg-black/5 hover:bg-black/10 text-muted-foreground hover:text-[#1877F2]"
                            )}
                        >
                            <Facebook className="w-5 h-5 md:w-4 md:h-4" />
                        </motion.a>
                        <motion.a
                            whileTap={{ scale: 0.9 }}
                            href="https://instagram.com/nextepedu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "flex items-center justify-center w-10 h-10 md:w-8 md:h-8 rounded-full transition-all duration-300",
                                mounted && currentTheme === "dark" 
                                    ? "bg-white/5 hover:bg-white/10 text-white/70 hover:text-[#E1306C]" 
                                    : "bg-black/5 hover:bg-black/10 text-muted-foreground hover:text-[#E1306C]"
                            )}
                        >
                            <Instagram className="w-5 h-5 md:w-4 md:h-4" />
                        </motion.a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
