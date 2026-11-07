"use client";

import { Button } from "@/components/ui/button";
import { type ReactNode } from "react";
import { useBookingModal, type BookingModalPrefill } from "@/context/BookingModalContext";

interface BookingButtonProps {
    children: ReactNode;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "accent";
    size?: "default" | "sm" | "lg" | "icon";
    prefill?: BookingModalPrefill;
}

export function BookingButton({
    children,
    className = "",
    variant = "default",
    size = "default",
    prefill,
}: BookingButtonProps) {
    const { openModal } = useBookingModal();

    return (
        <div className="relative group inline-block">
            <Button
                variant={variant}
                size={size}
                className={`relative ${className}`}
                onClick={() => openModal(prefill)}
            >
                {children}
            </Button>
        </div>
    );
}
