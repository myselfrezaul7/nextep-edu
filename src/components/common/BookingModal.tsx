"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { X, Calendar, Clock, BookOpen, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

type FormData = {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    education_level: string;
    topic: string;
    website_url?: string; // Honeypot
};

export function BookingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>();
    const [minDate, setMinDate] = useState("");
    const modalRef = useRef<HTMLDivElement>(null);
    const firstInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setMinDate(new Date().toISOString().split("T")[0]);
    }, []);

    // Expose global open function for other components to call
    useEffect(() => {
        const openModal = () => setIsOpen(true);
        window.__openBookingModal = openModal;

        // Legacy support: listen for DOM class changes on #booking-modal
        const modal = document.getElementById("booking-modal");
        if (!modal) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    if (!modal.classList.contains("hidden")) {
                        setIsOpen(true);
                    }
                }
            });
        });

        observer.observe(modal, { attributes: true });

        return () => {
            delete window.__openBookingModal;
            observer.disconnect();
        };
    }, []);

    // Focus trap & ESC to close
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeModal();
                return;
            }

            // Focus trap
            if (e.key === "Tab" && modalRef.current) {
                const focusable = modalRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        // Focus first input on open
        setTimeout(() => firstInputRef.current?.focus(), 100);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => setIsSuccess(false), 300); // Reset success state after animation
        // Also update DOM class for legacy compatibility
        const modal = document.getElementById("booking-modal");
        if (modal) modal.classList.add("hidden");
        reset();
    }, [reset]);

    const onSubmit = async (data: FormData) => {
        if (data.website_url) return; // Honeypot trap

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => formData.append(key, value));

        // Use environment variable for access key, fallback to placeholder
        const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "0bb2085c-f181-4e50-986e-c4c62cfdfc75";
        formData.append("access_key", accessKey);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || "Submission failed");
            }

            setIsSuccess(true);
            // toast.success("Booking confirmed! We'll contact you shortly.");
        } catch {
            toast.error("Something went wrong. Please try again.");
        }
    };

    if (!isOpen) {
        return <div id="booking-modal" className="hidden" />;
    }

    return (
        <div
            id="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300"
            onClick={(e) => {
                if (e.target === e.currentTarget) closeModal();
            }}
        >
            <div
                ref={modalRef}
                className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-accent/5">
                    <div>
                        <h3 id="booking-modal-title" className="text-xl font-bold font-heading text-primary">
                            {isSuccess ? "Booking Confirmed" : "Book Your Free Consultation"}
                        </h3>
                        {!isSuccess && <p className="text-sm text-muted-foreground">Let&apos;s plan your future together.</p>}
                    </div>
                    <button
                        onClick={closeModal}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Close booking modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6">
                    {isSuccess ? (
                        <div className="flex flex-col items-center text-center py-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                                <svg
                                    className="w-10 h-10 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h4 className="text-2xl font-bold text-foreground">Thank You!</h4>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                Your appointment has been booked. We will have a nice conversation soon!
                            </p>
                            <Button onClick={closeModal} className="mt-6 w-full max-w-xs">
                                Close
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {/* Honeypot */}
                            <input type="text" className="hidden" {...register("website_url")} autoComplete="off" tabIndex={-1} />

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2"><User className="w-4 h-4 text-accent" /> Full Name</label>
                                <input
                                    {...register("name", { required: "Name is required" })}
                                    ref={(e) => {
                                        register("name").ref(e);
                                        firstInputRef.current = e;
                                    }}
                                    className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                                    placeholder="e.g. Rahim Ahmed"
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2"><Mail className="w-4 h-4 text-accent" /> Email</label>
                                    <input
                                        {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
                                        className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                                        placeholder="hello@example.com"
                                    />
                                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2"><Phone className="w-4 h-4 text-accent" /> Phone</label>
                                    <input
                                        {...register("phone", { required: "Phone is required" })}
                                        className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                                        placeholder="017..."
                                    />
                                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" /> Date</label>
                                    <input
                                        type="date"
                                        min={minDate}
                                        {...register("date", { required: "Date is required" })}
                                        className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                                    />
                                    {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-accent" /> Time</label>
                                    <select
                                        {...register("time", { required: "Time is required" })}
                                        className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                                    >
                                        <option value="">Select Time</option>
                                        <option value="10:00 AM">10:00 AM</option>
                                        <option value="11:00 AM">11:00 AM</option>
                                        <option value="12:00 PM">12:00 PM</option>
                                        <option value="02:00 PM">02:00 PM</option>
                                        <option value="03:00 PM">03:00 PM</option>
                                        <option value="04:00 PM">04:00 PM</option>
                                        <option value="05:00 PM">05:00 PM</option>
                                    </select>
                                    {errors.time && <p className="text-xs text-red-500">{errors.time.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2"><BookOpen className="w-4 h-4 text-accent" /> Interested In</label>
                                <select
                                    {...register("topic")}
                                    className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                                >
                                    <option value="General_Inquiry">General Inquiry</option>
                                    <option value="University_Admission">University Admission</option>
                                    <option value="Visa_Processing">Visa Processing</option>
                                    <option value="Scholarship_Help">Scholarship Help</option>
                                    <option value="LOM_SOP_Writing">LOM/SOP Writing</option>
                                </select>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isSubmitting}>
                                    {isSubmitting ? "Booking..." : "Confirm Booking"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

// Type augmentation for window
declare global {
    interface Window {
        __openBookingModal?: () => void;
    }
}
