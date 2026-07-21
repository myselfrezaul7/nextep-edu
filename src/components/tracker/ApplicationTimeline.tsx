"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Check, Calendar, FileCheck, Building2, Mail, Stamp, BadgeCheck, Luggage, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApplicationStep } from "@/lib/supabase";

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const isDark = mounted && resolvedTheme === "dark";
    const percentage = Math.round(((currentStep - 1) / steps.length) * 100);

    return (
        <div className={cn("relative", className)}>
            {/* Progress Header */}
            <div className={cn(
                "mb-8 p-4 md:p-5 rounded-2xl backdrop-blur-xl border transition-all duration-300",
                isDark ? "bg-white/5 border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]" : "bg-white border-black/5 shadow-sm"
            )}>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">Application Progress</span>
                    <span className="text-sm font-bold text-accent">{currentStep - 1}/{steps.length} Steps</span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden relative">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: EASE_OUT_EXPO }}
                        className="absolute top-0 left-0 bottom-0 bg-accent rounded-full"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isCompleted = stepNum < currentStep;
                    const isActive = stepNum === currentStep;
                    const isPending = stepNum > currentStep;
                    const Icon = STEP_ICONS[stepNum] || Clock;

                    return (
                        <motion.div
                            key={step.step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: Math.min(index * 0.05, 0.5),
                                ease: EASE_OUT_EXPO,
                            }}
                            className={cn(
                                "flex gap-4 relative p-4 md:p-5 rounded-2xl transition-all duration-300 group",
                                isDark ? "bg-white/[0.03] border-white/[0.06] border" : "bg-black/[0.02] border-black/[0.04] border",
                                isActive && (isDark ? "bg-white/[0.08] shadow-lg shadow-black/20" : "bg-white shadow-md border-black/10"),
                                "hover:border-accent/30"
                            )}
                        >
                            {/* Vertical line connector */}
                            {index < steps.length - 1 && (
                                <div className="absolute left-[35px] md:left-[39px] top-[60px] bottom-[-20px] w-0.5 bg-border z-0 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: isCompleted ? 1 : 0 }}
                                        transition={{ duration: 0.8, delay: index * 0.1 + 0.3, ease: EASE_OUT_EXPO }}
                                        className="w-full h-full bg-accent origin-top"
                                    />
                                </div>
                            )}

                            {/* Step icon wrapper */}
                            <div className="relative z-10 flex-shrink-0 mt-1">
                                {/* Completion pulse effect */}
                                {isCompleted && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0.5 }}
                                        animate={{ scale: 1.5, opacity: 0 }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                        className="absolute inset-0 rounded-full border-2 border-accent/60"
                                    />
                                )}
                                
                                <div
                                    className={cn(
                                        "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative bg-background shadow-sm",
                                        isCompleted
                                            ? "border-accent text-accent"
                                            : isActive
                                            ? "border-accent bg-accent/10 text-accent shadow-accent/20 shadow-lg"
                                            : "border-border text-muted-foreground bg-muted/30"
                                    )}
                                >
                                    {isCompleted ? (
                                        <div className="relative flex items-center justify-center">
                                            <Check className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                                        </div>
                                    ) : isActive ? (
                                        <Icon className="w-5 h-5 md:w-5 md:h-5 animate-pulse" />
                                    ) : (
                                        <Icon className="w-4 h-4 md:w-5 md:h-5 opacity-60" />
                                    )}
                                </div>
                            </div>

                            {/* Step content */}
                            <div className="flex-1 pt-1.5 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h3
                                        className={cn(
                                            "font-semibold text-base md:text-lg tracking-tight",
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
                                        <span className="text-[10px] uppercase tracking-wider bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">
                                            Done
                                        </span>
                                    )}
                                    {isActive && (
                                        <span className="text-[10px] uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                                            Current
                                        </span>
                                    )}
                                </div>

                                {step.date && (
                                    <p className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3 opacity-70" />
                                        {new Date(step.date).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>
                                )}

                                {step.note && (isCompleted || isActive) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className={cn(
                                            "mt-3 text-sm rounded-xl px-4 py-3 border relative overflow-hidden",
                                            isDark ? "bg-white/[0.04] border-white/10 text-foreground/90" : "bg-black/[0.02] border-black/10 text-foreground/80"
                                        )}
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/70" />
                                        {step.note}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
