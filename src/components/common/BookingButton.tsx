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
            {/* Glow Effect Layer */}
            <div className="absolute -inset-1 bg-gradient-to-r from-accent via-primary to-accent rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <Button
                variant={variant}
                size={size}
                className={`relative ${className}`}
                onClick={() => document.getElementById('booking-modal')?.classList.remove('hidden')}
            >
                {children}
            </Button>
        </div>
    );
}
