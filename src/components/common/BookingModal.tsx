"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { X, Calendar, Clock, BookOpen, User, Mail, Phone, GraduationCap, CheckCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useTranslation } from "@/i18n/LanguageContext";

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

function ConfettiExplosion() {
    const particles = Array.from({ length: 50 });
    const colors = ['#D4AF37', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B', '#EC4899'];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
            {particles.map((_, i) => {
                const angle = Math.random() * Math.PI * 2;
                const distance = 50 + Math.random() * 250;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                const color = colors[Math.floor(Math.random() * colors.length)];
                const shape = Math.random() > 0.5 ? "rounded-full" : "rounded-sm";
                const size = Math.random() * 8 + 4;
                const rotate = Math.random() * 360;
                
                return (
                    <motion.div
                        key={i}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                        animate={{ x: tx, y: ty, scale: Math.random() * 0.5 + 0.5, opacity: 0, rotate }}
                        transition={{ duration: 1 + Math.random() * 0.8, ease: "easeOut" }}
                        className={`absolute ${shape}`}
                        style={{ backgroundColor: color, width: size, height: size }}
                    />
                );
            })}
        </div>
    );
}

function StepIndicator({ step, totalSteps }: { step: number; totalSteps: number }) {
    const progress = useMotionValue(0);
    const dashoffset = useTransform(progress, [0, 1], [100, 0]);

    useEffect(() => {
        progress.set(step / totalSteps);
    }, [step, totalSteps, progress]);

    return (
        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-accent/20" strokeWidth="3" />
                <motion.circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    className="stroke-accent" 
                    strokeWidth="3" 
                    strokeDasharray="100"
                    style={{ strokeDashoffset: dashoffset }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </svg>
            <span className="absolute text-xs font-bold text-primary">{step}</span>
        </div>
    );
}

export function BookingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
    
    const { register, handleSubmit, trigger, reset, formState: { errors, isSubmitting } } = useForm<FormData>();
    const [minDate, setMinDate] = useState("");
    const modalRef = useRef<HTMLDivElement>(null);
    const firstInputRef = useRef<HTMLInputElement | null>(null);

    const { theme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setMinDate(new Date().toISOString().split("T")[0]);
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-booking-modal', handleOpen);
        window.__openBookingModal = handleOpen;
        return () => {
            window.removeEventListener('open-booking-modal', handleOpen);
            delete window.__openBookingModal;
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeModal();
                return;
            }

            if (e.key === "Tab" && modalRef.current) {
                const focusable = modalRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusable.length === 0) return;
                
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

        setTimeout(() => firstInputRef.current?.focus(), 100);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => {
            setIsSuccess(false);
            setStep(1);
            setDirection(1);
            reset();
        }, 300);
    }, [reset]);

    const handleNextStep = async (currentStep: number) => {
        let fieldsToValidate: (keyof FormData)[] = [];
        if (currentStep === 1) fieldsToValidate = ["name", "email", "phone"];
        if (currentStep === 2) fieldsToValidate = ["date", "time"];

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setDirection(1);
            setStep(prev => prev + 1);
        }
    };

    const handlePrevStep = () => {
        setDirection(-1);
        setStep(prev => prev - 1);
    };

    const onSubmit = async (data: FormData) => {
        if (data.website_url) return; // Honeypot trap

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => formData.append(key, value));

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
        "placeholder:text-muted-foreground/50 text-sm md:text-base bg-background/50",
        isDark
            ? "border-white/10 text-white hover:border-white/20"
            : "border-black/10 text-foreground hover:border-black/20"
    );

    const labelClass = cn(
        "text-sm font-semibold flex items-center gap-2 mb-1.5",
        isDark ? "text-white/80" : "text-foreground/80"
    );

    const errorClass = cn("text-xs mt-1 font-medium", isDark ? "text-red-400" : "text-red-500");

    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir: number) => ({
            x: dir < 0 ? 50 : -50,
            opacity: 0,
        })
    };

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
                            "relative backdrop-blur-2xl w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border flex flex-col min-h-[450px]",
                            isDark
                                ? "bg-[rgba(15,23,42,0.92)] border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
                                : "bg-white/95 border-black/5 shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
                        )}
                    >
                            {/* Glowing Top Accent Line */}
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent rounded-t-3xl" />

                            {/* Header */}
                            <div className={cn(
                                "p-5 md:p-6 border-b flex justify-between items-center z-10",
                                isDark ? "border-white/10 bg-accent/5" : "border-black/5 bg-accent/5"
                            )}>
                                <div className="flex items-center gap-4">
                                    {!isSuccess && <StepIndicator step={step} totalSteps={3} />}
                                    <div>
                                        <h3 id="booking-modal-title" className="text-xl md:text-2xl font-bold font-heading text-primary">
                                            {isSuccess ? t("common.modal.bookingConfirmed", undefined, "Booking Confirmed") : t("common.modal.freeConsultation", undefined, "Free Consultation")}
                                        </h3>
                                        {!isSuccess && (
                                            <div className="flex items-center gap-2 mt-1">
                                                {step > 1 ? (
                                                    <button 
                                                        onClick={handlePrevStep}
                                                        className={cn("text-xs md:text-sm flex items-center hover:text-accent transition-colors", isDark ? "text-white/60" : "text-foreground/70")}
                                                    >
                                                        <ChevronLeft className="w-3 h-3 mr-1" /> Back
                                                    </button>
                                                ) : (
                                                    <p className={cn("text-xs md:text-sm", isDark ? "text-white/60" : "text-foreground/70")}>{t("common.modal.subtitle", undefined, "Let's plan your future together.")}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={closeModal}
                                    className={cn(
                                        "p-2 rounded-full transition-colors flex-shrink-0 self-start",
                                        isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                                    )}
                                    aria-label="Close booking modal"
                                >
                                    <X className="w-5 h-5 md:w-6 md:h-6" />
                                </motion.button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-hidden relative">
                                {isSuccess ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: "spring", duration: 0.6 }}
                                        className="absolute inset-0 flex flex-col items-center text-center p-6 justify-center h-full"
                                    >
                                        <ConfettiExplosion />
                                        <div className={cn(
                                            "w-20 h-20 rounded-full flex items-center justify-center mb-4 relative z-10",
                                            isDark ? "bg-green-500/15 text-green-400" : "bg-green-100 text-green-600"
                                        )}>
                                            <CheckCircle className="w-10 h-10" />
                                        </div>
                                        <h4 className="text-3xl font-bold font-heading text-primary relative z-10">{t("common.modal.successTitle", undefined, "We Got Your Request!")}</h4>
                                        <p className="text-muted-foreground text-lg max-w-sm mx-auto mt-2 relative z-10">
                                            {t("common.modal.successDesc", undefined, "Our team will reach out within 24 hours.")}
                                        </p>
                                        <motion.div whileTap={{ scale: 0.97 }} className="w-full max-w-xs mt-8 relative z-10">
                                            <Button onClick={closeModal} size="lg" className="w-full rounded-xl text-lg font-bold">
                                                {t("common.modal.closeWindow", undefined, "Close Window")}
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
                                        <input type="text" className="hidden" {...register("website_url")} autoComplete="off" tabIndex={-1} />

                                        <div className="flex-1 relative overflow-y-auto overflow-x-hidden p-5 md:p-6 scrollbar-hide">
                                            <AnimatePresence custom={direction} mode="wait">
                                                {step === 1 && (
                                                    <motion.div
                                                        key="step1"
                                                        custom={direction}
                                                        variants={slideVariants}
                                                        initial="enter"
                                                        animate="center"
                                                        exit="exit"
                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        className="space-y-4 md:space-y-5"
                                                    >
                                                        <h4 className="text-lg font-bold text-primary mb-2">Contact Details</h4>
                                                        <div className="space-y-1 md:space-y-0">
                                                            <label className={labelClass}><User className="w-4 h-4 text-accent" /> {t("common.modal.fullName", undefined, "Full Name")}</label>
                                                            <input
                                                                {...register("name", { required: t("common.modal.reqName", undefined, "Name is required") })}
                                                                ref={(e) => {
                                                                    register("name").ref(e);
                                                                    firstInputRef.current = e;
                                                                }}
                                                                className={inputClass}
                                                                placeholder={t("common.modal.phName", undefined, "e.g. Rahim Ahmed")}
                                                            />
                                                            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                                                        </div>

                                                        <div className="space-y-1 md:space-y-0">
                                                            <label className={labelClass}><Mail className="w-4 h-4 text-accent" /> {t("common.modal.email", undefined, "Email")}</label>
                                                            <input
                                                                {...register("email", { required: t("common.modal.reqEmail", undefined, "Email is required"), pattern: { value: /^\S+@\S+$/i, message: t("common.modal.reqEmailInvalid", undefined, "Invalid email") } })}
                                                                className={inputClass}
                                                                placeholder={t("common.modal.phEmail", undefined, "hello@example.com")}
                                                            />
                                                            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                                                        </div>

                                                        <div className="space-y-1 md:space-y-0">
                                                            <label className={labelClass}><Phone className="w-4 h-4 text-accent" /> {t("common.modal.phone", undefined, "Phone")}</label>
                                                            <input
                                                                {...register("phone", { required: t("common.modal.reqPhone", undefined, "Phone is required") })}
                                                                className={inputClass}
                                                                placeholder={t("common.modal.phPhone", undefined, "017...")}
                                                            />
                                                            {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {step === 2 && (
                                                    <motion.div
                                                        key="step2"
                                                        custom={direction}
                                                        variants={slideVariants}
                                                        initial="enter"
                                                        animate="center"
                                                        exit="exit"
                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        className="space-y-4 md:space-y-5"
                                                    >
                                                        <h4 className="text-lg font-bold text-primary mb-2">Schedule Time</h4>
                                                        <div className="space-y-1 md:space-y-0">
                                                            <label className={labelClass}><Calendar className="w-4 h-4 text-accent" /> {t("common.modal.date", undefined, "Date")}</label>
                                                            <input
                                                                type="date"
                                                                min={minDate}
                                                                {...register("date", { required: t("common.modal.reqDate", undefined, "Date is required") })}
                                                                className={cn(inputClass, "min-h-[50px] md:min-h-[54px]")}
                                                            />
                                                            {errors.date && <p className={errorClass}>{errors.date.message}</p>}
                                                        </div>
                                                        <div className="space-y-1 md:space-y-0">
                                                            <label className={labelClass}><Clock className="w-4 h-4 text-accent" /> {t("common.modal.time", undefined, "Time")}</label>
                                                            <select
                                                                {...register("time", { required: t("common.modal.reqTime", undefined, "Time is required") })}
                                                                className={cn(inputClass, "min-h-[50px] md:min-h-[54px] appearance-none cursor-pointer")}
                                                            >
                                                                <option value="">{t("common.modal.selectTime", undefined, "Select Time")}</option>
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
                                                    </motion.div>
                                                )}

                                                {step === 3 && (
                                                    <motion.div
                                                        key="step3"
                                                        custom={direction}
                                                        variants={slideVariants}
                                                        initial="enter"
                                                        animate="center"
                                                        exit="exit"
                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        className="space-y-4 md:space-y-5"
                                                    >
                                                        <h4 className="text-lg font-bold text-primary mb-2">Study Goals</h4>
                                                        <div className="space-y-1 md:space-y-0">
                                                            <label className={labelClass}><GraduationCap className="w-4 h-4 text-accent" /> {t("common.modal.educationLevel", undefined, "Education Level")}</label>
                                                            <select
                                                                {...register("education_level", { required: t("common.modal.reqEducationInfo", undefined, "Education level is required") })}
                                                                className={cn(inputClass, "min-h-[50px] md:min-h-[54px] appearance-none cursor-pointer")}
                                                            >
                                                                <option value="">{t("common.modal.selectLevel", undefined, "Select Level")}</option>
                                                                <option value="Bachelors">{t("common.modal.eduBachelors", undefined, "Bachelor's")}</option>
                                                                <option value="Masters">{t("common.modal.eduMasters", undefined, "Master's")}</option>
                                                                <option value="PhD">{t("common.modal.eduPhD", undefined, "PhD")}</option>
                                                                <option value="Language_Course">{t("common.modal.eduLang", undefined, "Language Course")}</option>
                                                                <option value="Foundation_Year">{t("common.modal.eduFoundation", undefined, "Foundation Year")}</option>
                                                            </select>
                                                            {errors.education_level && <p className={errorClass}>{errors.education_level.message}</p>}
                                                        </div>

                                                        <div className="space-y-1 md:space-y-0">
                                                            <label className={labelClass}><BookOpen className="w-4 h-4 text-accent" /> {t("common.modal.interestedIn", undefined, "Interested In")}</label>
                                                            <select
                                                                {...register("topic")}
                                                                className={cn(inputClass, "min-h-[50px] md:min-h-[54px] appearance-none cursor-pointer")}
                                                            >
                                                                <option value="General_Inquiry">{t("common.modal.topicGeneral", undefined, "General Inquiry")}</option>
                                                                <option value="University_Admission">{t("common.modal.topicAdmission", undefined, "University Admission")}</option>
                                                                <option value="Visa_Processing">{t("common.modal.topicVisa", undefined, "Visa Processing")}</option>
                                                                <option value="Scholarship_Help">{t("common.modal.topicScholarship", undefined, "Scholarship Help")}</option>
                                                                <option value="LOM_SOP_Writing">{t("common.modal.topicSOP", undefined, "LOM/SOP...")}</option>
                                                            </select>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className={cn("p-5 md:p-6 border-t mt-auto", isDark ? "border-white/10" : "border-black/5")}>
                                            <motion.div whileTap={{ scale: 0.97 }}>
                                                {step < 3 ? (
                                                    <Button 
                                                        type="button" 
                                                        onClick={() => handleNextStep(step)}
                                                        className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                                                    >
                                                        Next Step
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        type="submit" 
                                                        className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2" 
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                <span>{t("common.modal.submitLoading", undefined, "Booking...")}</span>
                                                            </>
                                                        ) : t("common.modal.submit", undefined, "Confirm Booking")}
                                                    </Button>
                                                )}
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

declare global {
    interface Window {
        __openBookingModal?: () => void;
    }
}
