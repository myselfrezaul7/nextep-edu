"use client";

import { motion } from "framer-motion";
import { Check, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApplicationStep } from "@/lib/supabase";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface ApplicationTimelineProps {
    steps: ApplicationStep[];
    currentStep: number;
    className?: string;
}

export function ApplicationTimeline({ steps, currentStep, className }: ApplicationTimelineProps) {
    return (
        <div className={cn("relative", className)}>
            {steps.map((step, index) => {
                const stepNum = index + 1;
                const isCompleted = stepNum < currentStep;
                const isActive = stepNum === currentStep;
                const isPending = stepNum > currentStep;

                return (
                    <motion.div
                        key={step.step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: EASE_OUT_EXPO,
                        }}
                        className="flex gap-4 relative"
                    >
                        {/* Vertical line connector */}
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    "absolute left-[19px] top-10 bottom-0 w-0.5",
                                    isCompleted
                                        ? "bg-accent"
                                        : isActive
                                        ? "bg-gradient-to-b from-accent to-border"
                                        : "bg-border border-dashed"
                                )}
                            />
                        )}

                        {/* Step icon */}
                        <div
                            className={cn(
                                "relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                isCompleted
                                    ? "bg-accent border-accent text-primary-foreground"
                                    : isActive
                                    ? "bg-accent/10 border-accent text-accent"
                                    : "bg-muted border-border text-muted-foreground"
                            )}
                        >
                            {isCompleted ? (
                                <Check className="w-5 h-5" />
                            ) : isActive ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Clock className="w-4 h-4" />
                            )}
                        </div>

                        {/* Step content */}
                        <div className={cn("flex-1 pb-8", index === steps.length - 1 && "pb-0")}>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h3
                                    className={cn(
                                        "font-semibold text-sm md:text-base",
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
                                    <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                                        Completed
                                    </span>
                                )}
                                {isActive && (
                                    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium animate-pulse">
                                        In Progress
                                    </span>
                                )}
                            </div>

                            {step.date && (
                                <p className="text-xs text-muted-foreground mt-1">
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
                                    className="mt-2 text-sm text-muted-foreground bg-muted/50 dark:bg-muted/30 rounded-lg px-3 py-2 border border-border/50"
                                >
                                    💬 {step.note}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
