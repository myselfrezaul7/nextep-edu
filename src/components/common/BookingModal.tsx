"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { X, Calendar, Clock, BookOpen, User, Mail, Phone, GraduationCap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMinDate(new Date().toISOString().split("T")[0]);
        setMounted(true);
    }, []);

    useEffect(() => {
        // Clean event-driven open
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-booking-modal', handleOpen);

        // Expose global open function for other components to call if needed
        window.__openBookingModal = handleOpen;

        return () => {
            window.removeEventListener('open-booking-modal', handleOpen);
            delete window.__openBookingModal;
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

    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = mounted && currentTheme === "dark";
    const isMobile = mounted && window.innerWidth < 640;

    const inputClass = cn(
        "w-full p-3 md:p-3.5 rounded-xl border outline-none transition-all duration-200",
        "focus:ring-2 focus:ring-accent/40 focus:border-accent/50",
        "placeholder:text-muted-foreground/50 text-sm md:text-base",
        isDark
            ? "bg-white/5 border-white/10 text-white hover:border-white/20"
            : "bg-black/[0.03] border-black/10 text-foreground hover:border-black/20"
    );

    const labelClass = cn(
        "text-sm font-semibold flex items-center gap-2 mb-1.5",
        isDark ? "text-white/80" : "text-foreground/80"
    );

    const errorClass = cn("text-xs mt-1 font-medium", isDark ? "text-red-400" : "text-red-500");

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="booking-modal-title"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: isMobile ? '100%' : 20, scale: isMobile ? 1 : 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: isMobile ? '100%' : 20, scale: isMobile ? 1 : 0.95 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        ref={modalRef}
                        className={cn(
                            "relative backdrop-blur-2xl w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]",
                            isDark
                                ? "bg-[rgba(15,23,42,0.92)] border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
                                : "bg-white/90 border-black/5 shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
                        )}
                    >
                            {/* Glowing Top Accent Line */}
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

                            {/* Header */}
                            <div className={cn(
                                "p-5 md:p-6 border-b flex justify-between items-center",
                                isDark ? "border-white/10 bg-accent/5" : "border-black/5 bg-accent/5"
                            )}>
                                <div>
                                    <h3 id="booking-modal-title" className="text-xl md:text-2xl font-bold font-heading text-primary">
                                        {isSuccess ? "Booking Confirmed" : "Free Consultation"}
                                    </h3>
                                    {!isSuccess && <p className={cn("text-xs md:text-sm mt-1", isDark ? "text-white/60" : "text-foreground/70")}>Let&apos;s plan your future together.</p>}
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={closeModal}
                                    className={cn(
                                        "p-2 rounded-full transition-colors flex-shrink-0",
                                        isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                                    )}
                                    aria-label="Close booking modal"
                                >
                                    <X className="w-5 h-5 md:w-6 md:h-6" />
                                </motion.button>
                            </div>

                            {/* Content */}
                            <div className="overflow-y-auto p-5 md:p-6 scrollbar-hide">
                                {isSuccess ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: "spring", duration: 0.6 }}
                                        className="flex flex-col items-center text-center py-8 space-y-4"
                                    >
                                        <div className={cn(
                                            "w-20 h-20 rounded-full flex items-center justify-center mb-4",
                                            isDark ? "bg-green-500/15 text-green-400" : "bg-green-100 text-green-600"
                                        )}>
                                            <CheckCircle className="w-10 h-10" />
                                        </div>
                                        <h4 className="text-3xl font-bold font-heading text-primary">We Got Your Request!</h4>
                                        <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                                            Our team will reach out within 24 hours.
                                        </p>
                                        <motion.div whileTap={{ scale: 0.97 }} className="w-full max-w-xs mt-8">
                                            <Button onClick={closeModal} size="lg" className="w-full rounded-xl text-lg font-bold">
                                                Close Window
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-5">
                                        {/* Honeypot */}
                                        <input type="text" className="hidden" {...register("website_url")} autoComplete="off" tabIndex={-1} />

                                        <div className="space-y-1 md:space-y-0">
                                            <label className={labelClass}><User className="w-4 h-4 text-accent" /> Full Name</label>
                                            <input
                                                {...register("name", { required: "Name is required" })}
                                                ref={(e) => {
                                                    register("name").ref(e);
                                                    firstInputRef.current = e;
                                                }}
                                                className={inputClass}
                                                placeholder="e.g. Rahim Ahmed"
                                            />
                                            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1 md:space-y-0">
                                                <label className={labelClass}><Mail className="w-4 h-4 text-accent" /> Email</label>
                                                <input
                                                    {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
                                                    className={inputClass}
                                                    placeholder="hello@example.com"
                                                />
                                                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                                            </div>
                                            <div className="space-y-1 md:space-y-0">
                                                <label className={labelClass}><Phone className="w-4 h-4 text-accent" /> Phone</label>
                                                <input
                                                    {...register("phone", { required: "Phone is required" })}
                                                    className={inputClass}
                                                    placeholder="017..."
                                                />
                                                {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1 md:space-y-0">
                                                <label className={labelClass}><Calendar className="w-4 h-4 text-accent" /> Date</label>
                                                <input
                                                    type="date"
                                                    min={minDate}
                                                    {...register("date", { required: "Date is required" })}
                                                    className={cn(inputClass, "min-h-[50px] md:min-h-[54px]")}
                                                />
                                                {errors.date && <p className={errorClass}>{errors.date.message}</p>}
                                            </div>
                                            <div className="space-y-1 md:space-y-0">
                                                <label className={labelClass}><Clock className="w-4 h-4 text-accent" /> Time</label>
                                                <select
                                                    {...register("time", { required: "Time is required" })}
                                                    className={cn(inputClass, "min-h-[50px] md:min-h-[54px] appearance-none cursor-pointer")}
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
                                                {errors.time && <p className={errorClass}>{errors.time.message}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-1 md:space-y-0">
                                            <label className={labelClass}><GraduationCap className="w-4 h-4 text-accent" /> Education Level</label>
                                            <select
                                                {...register("education_level", { required: "Education level is required" })}
                                                className={cn(inputClass, "min-h-[50px] md:min-h-[54px] appearance-none cursor-pointer")}
                                            >
                                                <option value="">Select Level</option>
                                                <option value="Bachelors">Bachelor&apos;s</option>
                                                <option value="Masters">Master&apos;s</option>
                                                <option value="PhD">PhD</option>
                                                <option value="Language_Course">Language Course</option>
                                                <option value="Foundation_Year">Foundation Year</option>
                                            </select>
                                            {errors.education_level && <p className={errorClass}>{errors.education_level.message}</p>}
                                        </div>

                                        <div className="space-y-1 md:space-y-0">
                                            <label className={labelClass}><BookOpen className="w-4 h-4 text-accent" /> Interested In</label>
                                            <select
                                                {...register("topic")}
                                                className={cn(inputClass, "min-h-[50px] md:min-h-[54px] appearance-none cursor-pointer")}
                                            >
                                                <option value="General_Inquiry">General Inquiry</option>
                                                <option value="University_Admission">University Admission</option>
                                                <option value="Visa_Processing">Visa Processing</option>
                                                <option value="Scholarship_Help">Scholarship Help</option>
                                                <option value="LOM_SOP_Writing">LOM/SOP Writing</option>
                                            </select>
                                        </div>

                                        <div className="pt-4 pb-2 md:pt-6">
                                            <motion.div whileTap={{ scale: 0.97 }}>
                                                <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2" disabled={isSubmitting}>
                                                    {isSubmitting ? (
                                                        <>
                                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            <span>Booking...</span>
                                                        </>
                                                    ) : "Confirm Booking"}
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
    );
}

// Type augmentation for window
declare global {
    interface Window {
        __openBookingModal?: () => void;
    }
}
