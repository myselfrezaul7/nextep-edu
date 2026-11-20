"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, X, Trash2, Sparkles, ArrowRight } from "lucide-react";
import { useShortlist } from "@/lib/shortlist-store";
import { DESTINATIONS_META } from "@/data/destinations-meta";
import { useBookingModal } from "@/context/BookingModalContext";
import { useNavVisible } from "@/lib/scroll-store";
import { useMounted } from "@/lib/use-mounted";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageContext";

interface ShortlistCompareDrawerProps {
    /** True on country detail page where bottom dock appears when tabBarVisible is false */
    hasBottomDockWhenScrolled?: boolean;
}

export function ShortlistCompareDrawer({
    hasBottomDockWhenScrolled = false,
}: ShortlistCompareDrawerProps) {
    const { slugs, removeFromShortlist, clearShortlist } = useShortlist();
    const { openModal } = useBookingModal();
    const { t } = useTranslation();
    const tabBarVisible = useNavVisible();
    const mounted = useMounted();
    const [isOpen, setIsOpen] = useState(false);

    const drawerOpen = isOpen && slugs.length > 0;

    useEffect(() => {
        if (!drawerOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = prev;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [drawerOpen]);

    if (slugs.length === 0) return null;

    const items = slugs.map((s) => DESTINATIONS_META[s]).filter(Boolean);
    const shiftUpOnMobile = tabBarVisible || hasBottomDockWhenScrolled;

    const handleRemove = (slug: string) => {
        if (items.length <= 1) {
            setIsOpen(false);
        }
        removeFromShortlist(slug);
    };

    const handleReviewShortlist = () => {
        const names = items.map((d) => d.name).join(", ");
        setIsOpen(false);
        openModal({
            destination: items[0]?.name,
            topic: `Compare Shortlist: ${names}`,
        });
    };

    return (
        <>
            {/* Floating Compare Pill - Left bottom on mobile (clear of WhatsAppFAB on right) */}
            <div
                className={cn(
                    "fixed left-4 sm:left-5 z-40 will-change-transform transition-[transform,opacity] duration-300 ease-out lg:translate-y-0 lg:left-20",
                    shiftUpOnMobile ? "-translate-y-[5.5rem]" : "translate-y-0"
                )}
                style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
            >
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="min-h-[46px] pl-3.5 pr-4 rounded-full bg-primary text-primary-foreground dark:bg-accent dark:text-slate-950 shadow-xl border border-accent/35 flex items-center gap-2 text-xs font-bold active:scale-95 transition-transform"
                    aria-label={`Compare ${items.length} shortlisted countries`}
                >
                    <Scale className="w-4 h-4 shrink-0" />
                    <span>
                        {t("destinations.compare.button", undefined, "Compare")} ({items.length})
                    </span>
                    <span className="flex -space-x-1 ml-0.5 text-sm leading-none">
                        {items.map((item) => (
                            <span key={item.slug}>{item.flag}</span>
                        ))}
                    </span>
                </button>
            </div>

            {/* Bottom-Sheet Comparison Matrix (portaled to document.body) */}
            {mounted
                ? createPortal(
                      <AnimatePresence>
                          {drawerOpen && (
                              <motion.div
                                  role="dialog"
                                  aria-modal="true"
                                  aria-label="Compare shortlisted countries"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4"
                                  onClick={(e) => {
                                      if (e.target === e.currentTarget) setIsOpen(false);
                                  }}
                              >
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ type: "spring", damping: 30, stiffness: 320 }}
                            className="w-full max-w-3xl max-h-[88dvh] bg-card dark:bg-[#0F172A] border border-border/70 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between gap-3 shrink-0">
                                <div className="min-w-0">
                                    <h3 className="text-lg sm:text-xl font-bold font-heading text-primary flex items-center gap-2">
                                        <Scale className="w-5 h-5 text-accent shrink-0" />
                                        <span className="truncate">
                                            {t("destinations.compare.title", undefined, "Country Shortlist Comparison")}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {items.length} / 3 {t("destinations.compare.selected", undefined, "countries shortlisted")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            clearShortlist();
                                            setIsOpen(false);
                                        }}
                                        className="min-h-[44px] px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">
                                            {t("destinations.compare.clear", undefined, "Clear")}
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        aria-label="Close comparison"
                                        className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-muted text-foreground/80 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Comparison Table / Cards */}
                            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
                                <div className="overflow-x-auto -mx-2 px-2">
                                    <table className="w-full min-w-[460px] text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-border/60">
                                                <th className="py-2.5 pr-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-28">
                                                    {t("destinations.compare.metric", undefined, "Factor")}
                                                </th>
                                                {items.map((item) => (
                                                    <th key={item.slug} className="py-2.5 px-2.5 align-top">
                                                        <div className="flex items-center justify-between gap-1.5 bg-surface/80 dark:bg-white/[0.04] rounded-xl px-2.5 py-2 border border-border/60">
                                                            <Link
                                                                href={`/destinations/${item.slug}`}
                                                                onClick={() => setIsOpen(false)}
                                                                className="font-bold text-sm text-primary hover:text-accent flex items-center gap-1.5 truncate"
                                                            >
                                                                <span>{item.flag}</span>
                                                                <span className="truncate">{item.name}</span>
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemove(item.slug)}
                                                                aria-label={`Remove ${item.name}`}
                                                                className="w-10 h-10 -mr-1.5 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40 text-xs sm:text-sm">
                                            <tr>
                                                <td className="py-3 pr-3 font-semibold text-muted-foreground">
                                                    {t("destinations.compare.region", undefined, "Region")}
                                                </td>
                                                {items.map((item) => (
                                                    <td key={item.slug} className="py-3 px-2.5 font-medium text-foreground">
                                                        {item.region}
                                                        {item.isSchengen ? " (Schengen)" : ""}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="py-3 pr-3 font-semibold text-muted-foreground">
                                                    {t("destinations.compare.tuition", undefined, "Tuition")}
                                                </td>
                                                {items.map((item) => (
                                                    <td key={item.slug} className="py-3 px-2.5 text-foreground leading-snug">
                                                        {item.tuitionRange}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="py-3 pr-3 font-semibold text-muted-foreground">
                                                    {t("destinations.compare.intakes", undefined, "Intakes")}
                                                </td>
                                                {items.map((item) => (
                                                    <td key={item.slug} className="py-3 px-2.5 text-foreground leading-snug">
                                                        {item.intakes}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="py-3 pr-3 font-semibold text-muted-foreground">
                                                    {t("destinations.compare.workRights", undefined, "Work Rights")}
                                                </td>
                                                {items.map((item) => (
                                                    <td key={item.slug} className="py-3 px-2.5 text-foreground leading-snug">
                                                        {item.workRights}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="py-3 pr-3 font-semibold text-muted-foreground">
                                                    {t("destinations.compare.visaTime", undefined, "Visa Time")}
                                                </td>
                                                {items.map((item) => (
                                                    <td key={item.slug} className="py-3 px-2.5 text-foreground leading-snug">
                                                        {item.visaTime}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="py-3 pr-3 font-semibold text-muted-foreground">
                                                    {t("destinations.compare.guide", undefined, "Guide")}
                                                </td>
                                                {items.map((item) => (
                                                    <td key={item.slug} className="py-3 px-2.5">
                                                        <Link
                                                            href={`/destinations/${item.slug}`}
                                                            onClick={() => setIsOpen(false)}
                                                            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                                                        >
                                                            <span>{t("destinations.compare.openGuide", undefined, "Open Guide")}</span>
                                                            <ArrowRight className="w-3 h-3" />
                                                        </Link>
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Footer CTA */}
                            <div className="px-5 pt-3.5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:p-5 border-t border-border/60 bg-surface/50 dark:bg-slate-900/60 shrink-0">
                                <Button
                                    size="lg"
                                    onClick={handleReviewShortlist}
                                    className="w-full min-h-[48px] rounded-xl font-bold gap-2"
                                >
                                    <Sparkles className="w-4 h-4 shrink-0" />
                                    <span>
                                        {t("destinations.compare.reviewCta", undefined, "Get Shortlist Reviewed Free")}
                                    </span>
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>,
            document.body
        )
        : null}
        </>
    );
}
