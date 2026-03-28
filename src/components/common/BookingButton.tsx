"use client";

import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface BookingButtonProps {
    children: ReactNode;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

export function BookingButton({ children, className, variant = "default", size = "default" }: BookingButtonProps) {
    return (
        <div className="relative group inline-block">
            {/* Liquid Glass buttons have built-in luminous edges — no glow wrapper needed */}
            <Button
                variant={variant}
                size={size}
                className={`relative ${className}`}
                onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
            >
                {children}
            </Button>
        </div>
    );
}
