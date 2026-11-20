"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Check, Calendar, FileCheck, Building2, Mail, Stamp, BadgeCheck, Luggage, Clock } from "lucide-react";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import type { ApplicationStep } from "@/lib/supabase";
import { useTranslation } from "@/i18n/LanguageContext";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const STEP_ICONS: Record<number, React.ElementType> = {
    1: Calendar,
    2: FileCheck,
    3: Building2,
    4: Mail,
    5: Stamp,
    6: BadgeCheck,
    7: Luggage,
};

interface ApplicationTimelineProps {
    steps: ApplicationStep[];
    currentStep: number;
    className?: string;
}

export function ApplicationTimeline({ steps, currentStep, className }: ApplicationTimelineProps) {
    const { resolvedTheme } = useTheme();
    const mounted = useMounted();
    const { t } = useTranslation();

    const isDark = mounted && resolvedTheme === "dark";
    const totalSteps = Math.max(1, steps.length);
    const safeStep = Math.min(totalSteps, Math.max(1, currentStep));
    const percentage = Math.round((safeStep / totalSteps) * 100);

    return (
        <div className={cn("relative", className)}>
            {/* Progress Header */}
            <div className="surface-card mb-6 p-3.5 sm:p-5 rounded-2xl">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-sm font-semibold text-foreground">
                        {t("track.timeline.progress", undefined, "Application Progress")}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-accent tabular-nums">
                        {t(
                            "track.timeline.stepCounter",
                            { step: String(safeStep), total: String(totalSteps) },
                            `Step ${safeStep} of ${totalSteps}`
                        )}{" "}
                        ({percentage}%)
                    </span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.85, ease: EASE_OUT_EXPO }}
                        className="absolute top-0 left-0 bottom-0 bg-accent rounded-full"
                    />
                </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isFinalCompleted = stepNum === totalSteps && currentStep >= totalSteps;
                    const isCompleted = stepNum < currentStep || isFinalCompleted;
                    const isActive = stepNum === currentStep && !isFinalCompleted;
                    const Icon = STEP_ICONS[stepNum] || Clock;

                    return (
                        <motion.div
                            key={step.step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.4,
                                delay: Math.min(index * 0.04, 0.35),
                                ease: EASE_OUT_EXPO,
                            }}
                            className={cn(
                                "flex gap-3 sm:gap-4 relative p-3 sm:p-5 rounded-2xl transition-all duration-300 group",
                                isDark
                                    ? "bg-white/[0.03] border-white/[0.06] border"
                                    : "bg-black/[0.02] border-black/[0.05] border",
                                (isActive || isFinalCompleted) &&
                                    (isDark
                                        ? "bg-white/[0.08] shadow-lg shadow-black/20 border-accent/30"
                                        : "bg-white shadow-md border-accent/35"),
                                "hover:border-accent/30"
                            )}
                        >
                            {/* Vertical line connector aligned to center of 40px (mobile) / 48px (md) icon */}
                            {index < steps.length - 1 && (
                                <div className="absolute left-[31px] sm:left-[39px] md:left-[43px] top-[56px] sm:top-[64px] bottom-[-18px] sm:bottom-[-22px] w-0.5 bg-border z-0 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: isCompleted ? 1 : 0 }}
                                        transition={{
                                            duration: 0.7,
                                            delay: index * 0.08 + 0.2,
                                            ease: EASE_OUT_EXPO,
                                        }}
                                        className="w-full h-full bg-accent origin-top"
                                    />
                                </div>
                            )}

                            {/* Step icon wrapper */}
                            <div className="relative z-10 shrink-0 mt-0.5">
                                <div
                                    className={cn(
                                        "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative bg-background shadow-2xs",
                                        isCompleted
                                            ? "border-accent text-accent bg-accent/10"
                                            : isActive
                                              ? "border-accent bg-accent/15 text-accent shadow-accent/20 shadow-md"
                                              : "border-border text-muted-foreground bg-muted/30"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                                    ) : isActive ? (
                                        <Icon className="w-4 h-4 md:w-5 md:h-5" />
                                    ) : (
                                        <Icon className="w-4 h-4 md:w-5 md:h-5 opacity-60" />
                                    )}
                                </div>
                            </div>

                            {/* Step content */}
                            <div className="flex-1 pt-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3
                                        className={cn(
                                            "font-semibold text-sm sm:text-base md:text-lg tracking-tight leading-snug",
                                            isCompleted
                                                ? "text-foreground"
                                                : isActive
                                                  ? "text-accent"
                                                  : "text-muted-foreground"
                                        )}
                                    >
                                        {step.label}
                                    </h3>
                                    {isCompleted && (
                                        <span className="text-[10px] uppercase tracking-wider bg-green-500/12 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">
                                            {t("track.timeline.done", undefined, "Done")}
                                        </span>
                                    )}
                                    {isActive && (
                                        <span className="text-[10px] uppercase tracking-wider bg-accent/15 text-accent px-2 py-0.5 rounded-full font-bold">
                                            {t("track.timeline.current", undefined, "Current")}
                                        </span>
                                    )}
                                </div>

                                {step.date && (
                                    <p className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3 opacity-70 shrink-0" />
                                        {new Date(step.date).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>
                                )}

                                {step.note && (isCompleted || isActive) && (
                                    <div
                                        className={cn(
                                            "mt-2.5 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border relative overflow-hidden leading-relaxed",
                                            isDark
                                                ? "bg-white/[0.04] border-white/10 text-foreground/90"
                                                : "bg-black/[0.02] border-black/10 text-foreground/80"
                                        )}
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/70" />
                                        {step.note}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
