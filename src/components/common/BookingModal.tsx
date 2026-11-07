"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import {
    X,
    Calendar,
    Clock,
    BookOpen,
    User,
    Mail,
    Phone,
    GraduationCap,
    CheckCircle,
    ChevronLeft,
    Copy,
    Check,
    Globe2,
    Sparkles,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
    motion,
    AnimatePresence,
    useMotionValue,
    useTransform,
    useDragControls,
} from "framer-motion";
import { useTranslation } from "@/i18n/LanguageContext";
import { useMounted } from "@/lib/use-mounted";
import { destinations } from "@/data/destinations";
import {
    useBookingModal,
    resolveDestinationName,
    inferDestinationFromText,
} from "@/context/BookingModalContext";

type FormData = {
    name: string;
    email: string;
    phone: string;
    destination: string;
    date: string;
    time: string;
    education_level: string;
    topic: string;
    website_url?: string; // Honeypot
};

const DESTINATION_LIST = Object.values(destinations);

const STANDARD_TOPICS = [
    "General_Inquiry",
    "University_Admission",
    "Visa_Processing",
    "Scholarship_Help",
    "LOM_SOP_Writing",
] as const;

const TIME_SLOTS = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
] as const;

function formatLocalIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatShortMonthDay(date: Date): string {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getQuickDateOptions() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const thisSaturday = new Date(today);
    thisSaturday.setDate(today.getDate() + daysUntilSaturday);

    const daysUntilMonday = (1 - dayOfWeek + 7) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);

    return [
        {
            id: "tomorrow",
            label: "Tomorrow",
            sublabel: formatShortMonthDay(tomorrow),
            value: formatLocalIsoDate(tomorrow),
        },
        {
            id: "saturday",
            label: "This Saturday",
            sublabel: formatShortMonthDay(thisSaturday),
            value: formatLocalIsoDate(thisSaturday),
        },
        {
            id: "monday",
            label: "Next Monday",
            sublabel: formatShortMonthDay(nextMonday),
            value: formatLocalIsoDate(nextMonday),
        },
    ];
}

function mapTopicPrefill(rawTopic?: string): string {
    if (!rawTopic || !rawTopic.trim()) return "General_Inquiry";
    const trimmed = rawTopic.trim();
    if ((STANDARD_TOPICS as readonly string[]).includes(trimmed)) {
        return trimmed;
    }
    const lower = trimmed.toLowerCase();
    if (lower === "general inquiry") return "General_Inquiry";
    if (lower === "university admission" || lower === "university selection" || lower === "offer letter") {
        return "University_Admission";
    }
    if (lower === "visa processing" || lower === "visa support" || lower === "visa assistance") {
        return "Visa_Processing";
    }
    if (lower === "scholarship help" || lower === "scholarship hunting" || lower === "scholarship search") {
        return "Scholarship_Help";
    }
    if (lower === "lom/sop writing" || lower === "lom / sop solution") {
        return "LOM_SOP_Writing";
    }
    return trimmed;
}

function mapEducationPrefill(rawLevel?: string): string {
    if (!rawLevel || !rawLevel.trim()) return "";
    const lower = rawLevel.trim().toLowerCase();
    if (lower.includes("bachelor")) return "Bachelors";
    if (lower.includes("master")) return "Masters";
    if (lower.includes("phd") || lower.includes("doctor")) return "PhD";
    if (lower.includes("lang")) return "Language_Course";
    if (lower.includes("found")) return "Foundation_Year";
    return rawLevel.trim();
}

function ConfettiExplosion() {
    const particles = Array.from({ length: 50 });
    const colors = ["#D4AF37", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6", "#F59E0B", "#EC4899"];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
            {particles.map((_, i) => {
                const angle = i * 2.399963;
                const distance = 50 + ((i * 31) % 200) + (i / 50) * 50;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                const color = colors[i % colors.length];
                const shape = i % 2 === 0 ? "rounded-full" : "rounded-sm";
                const size = 4 + (i % 8);
                const rotate = (i * 45) % 360;
                const scale = 0.5 + (i % 5) * 0.1;
                const duration = 1 + (i % 5) * 0.16;

                return (
                    <motion.div
                        key={i}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                        animate={{ x: tx, y: ty, scale, opacity: 0, rotate }}
                        transition={{ duration, ease: "easeOut" }}
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
    const { isOpen, prefill, closeModal: closeContextModal } = useBookingModal();
    const [isSuccess, setIsSuccess] = useState(false);
    const [trackingCode, setTrackingCode] = useState<string | null>(null);
    const [isExistingApp, setIsExistingApp] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

    const {
        register,
        handleSubmit,
        trigger,
        reset,
        setValue,
        control,
        formState: { errors, dirtyFields, touchedFields, isSubmitting },
    } = useForm<FormData>({
        mode: "onTouched",
        reValidateMode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            destination: "",
            date: "",
            time: "",
            education_level: "",
            topic: "General_Inquiry",
            website_url: "",
        },
    });

    const watchedDate = useWatch({ control, name: "date" });
    const watchedTime = useWatch({ control, name: "time" });
    const watchedDestination = useWatch({ control, name: "destination" });
    const watchedTopic = useWatch({ control, name: "topic" });

    const [minDate] = useState(() => formatLocalIsoDate(new Date()));
    const quickDates = useMemo(() => getQuickDateOptions(), []);
    const modalRef = useRef<HTMLDivElement>(null);
    const firstInputRef = useRef<HTMLInputElement | null>(null);
    const dragControls = useDragControls();

    const { theme, systemTheme } = useTheme();
    const mounted = useMounted();
    const { t } = useTranslation();

    const closeModal = useCallback(() => {
        closeContextModal();
        setTimeout(() => {
            setIsSuccess(false);
            setTrackingCode(null);
            setIsExistingApp(false);
            setCodeCopied(false);
            setStep(1);
            setDirection(1);
            reset({
                name: "",
                email: "",
                phone: "",
                destination: "",
                date: "",
                time: "",
                education_level: "",
                topic: "General_Inquiry",
                website_url: "",
            });
        }, 300);
    }, [closeContextModal, reset]);

    // Apply contextual prefill whenever modal opens or prefill changes
    useEffect(() => {
        if (!isOpen) return;

        const resolvedDest =
            resolveDestinationName(prefill?.destination) ||
            inferDestinationFromText(prefill?.topic) ||
            "";
        const resolvedTopic = mapTopicPrefill(
            prefill?.topic || (resolvedDest ? "University_Admission" : "General_Inquiry")
        );
        const resolvedLevel = mapEducationPrefill(prefill?.educationLevel);

        setValue("destination", resolvedDest, { shouldDirty: Boolean(resolvedDest) });
        setValue("topic", resolvedTopic, { shouldDirty: Boolean(prefill?.topic) });
        if (resolvedLevel) {
            setValue("education_level", resolvedLevel, { shouldDirty: true });
        }
    }, [isOpen, prefill, setValue]);

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

        const focusTimer = setTimeout(() => {
            if (window.innerWidth >= 640) {
                firstInputRef.current?.focus();
            }
        }, 120);

        return () => {
            clearTimeout(focusTimer);
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, closeModal]);

    const handleNextStep = async (currentStep: number) => {
        let fieldsToValidate: (keyof FormData)[] = [];
        if (currentStep === 1) fieldsToValidate = ["name", "email", "phone"];
        if (currentStep === 2) fieldsToValidate = ["date", "time"];

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setDirection(1);
            setStep((prev) => prev + 1);
        }
    };

    const handlePrevStep = () => {
        setDirection(-1);
        setStep((prev) => prev - 1);
    };

    const onSubmit = async (data: FormData) => {
        if (data.website_url) return; // Honeypot trap

        const resolvedDestination =
            resolveDestinationName(data.destination) ||
            resolveDestinationName(prefill?.destination) ||
            inferDestinationFromText(data.topic) ||
            "";

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });
        if (resolvedDestination) {
            formData.set("destination", resolvedDestination);
        }

        const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "";
        if (accessKey) {
            formData.append("access_key", accessKey);
            formData.append(
                "subject",
                resolvedDestination
                    ? `New Consultation Request (${resolvedDestination}): ${data.name}`
                    : `New Consultation Request: ${data.name}`
            );
        } else {
            console.warn(
                "[BookingModal] NEXT_PUBLIC_WEB3FORMS_KEY is not configured; relying on database registration."
            );
        }

        try {
            const registerPromise = fetch("/api/applications/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    destination: resolvedDestination || undefined,
                    date: data.date,
                    time: data.time,
                    education_level: data.education_level,
                    topic: data.topic,
                    website_url: data.website_url,
                }),
            }).then(async (res) => {
                const regData = (await res.json()) as {
                    success: boolean;
                    trackingCode?: string;
                    isExisting?: boolean;
                    error?: string;
                };
                if (!res.ok || !regData.success) {
                    throw new Error(regData.error || "Registration failed");
                }
                return regData;
            });

            const web3Promise = accessKey
                ? fetch("https://api.web3forms.com/submit", {
                      method: "POST",
                      body: formData,
                  }).then(async (res) => {
                      const result = await res.json();
                      if (!result.success) {
                          throw new Error(result.message || "Web3Forms submission failed");
                      }
                      return result;
                  })
                : Promise.resolve(null);

            const [regResult, web3Result] = await Promise.allSettled([registerPromise, web3Promise]);

            const regSuccess = regResult.status === "fulfilled" && regResult.value.success;
            const web3Success = web3Result.status === "fulfilled" && web3Result.value !== null;

            if (!regSuccess && !web3Success) {
                toast.error("Something went wrong. Please try again.");
                return;
            }

            setIsSuccess(true);

            if (regResult.status === "fulfilled" && regResult.value.success) {
                if (regResult.value.trackingCode) {
                    const newCode = regResult.value.trackingCode;
                    setTrackingCode(newCode);
                    try {
                        const raw = localStorage.getItem("nextep_recent_tracks");
                        const parsed = raw ? JSON.parse(raw) : [];
                        const prev = Array.isArray(parsed) ? parsed : [];
                        const next = [
                            {
                                code: newCode,
                                name: data.name,
                                phone: data.phone,
                                destination: resolvedDestination || null,
                                updatedAt: new Date().toISOString(),
                            },
                            ...prev.filter((item: { code?: string }) => item?.code !== newCode),
                        ].slice(0, 5);
                        localStorage.setItem("nextep_recent_tracks", JSON.stringify(next));
                    } catch {
                        // Ignore localStorage write errors
                    }
                } else if (regResult.value.isExisting) {
                    setIsExistingApp(true);
                }
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        }
    };

    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = mounted && currentTheme === "dark";
    const isMobile = mounted && window.innerWidth < 640;

    const activeDestinationObj = useMemo(() => {
        if (!watchedDestination) return null;
        return (
            DESTINATION_LIST.find(
                (d) =>
                    d.name.toLowerCase() === watchedDestination.toLowerCase() ||
                    d.slug.toLowerCase() === watchedDestination.toLowerCase()
            ) || null
        );
    }, [watchedDestination]);

    const isCustomTopic =
        Boolean(watchedTopic) && !(STANDARD_TOPICS as readonly string[]).includes(watchedTopic);

    const getFieldClass = (fieldName: keyof FormData) => {
        const hasError = Boolean(errors[fieldName]);
        const isValid = Boolean(
            (touchedFields[fieldName] || dirtyFields[fieldName]) && !errors[fieldName]
        );
        return cn(
            "w-full min-h-[48px] md:min-h-[52px] px-3.5 py-3 rounded-xl border outline-none transition-all duration-200",
            "focus:ring-2 focus:ring-accent/40 focus:border-accent/60",
            "placeholder:text-muted-foreground/50 text-base sm:text-sm md:text-base bg-background/60",
            hasError
                ? isDark
                    ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/30 text-white"
                    : "border-red-500/70 focus:border-red-500 focus:ring-red-500/25 text-foreground"
                : isValid
                  ? isDark
                      ? "border-emerald-400/50 text-white"
                      : "border-emerald-500/50 text-foreground"
                  : isDark
                    ? "border-white/10 text-white hover:border-white/20"
                    : "border-black/10 text-foreground hover:border-black/20"
        );
    };

    const labelClass = cn(
        "text-sm font-semibold flex items-center justify-between gap-2 mb-1.5",
        isDark ? "text-white/85" : "text-foreground/85"
    );

    const errorClass = cn(
        "text-xs mt-1.5 font-medium flex items-center gap-1.5",
        isDark ? "text-red-400" : "text-red-600"
    );

    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 40 : -40,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir: number) => ({
            x: dir < 0 ? 40 : -40,
            opacity: 0,
        }),
    };

    const nameRegistration = register("name", {
        required: t("common.validation.nameRequired", undefined, "Name is required"),
        minLength: {
            value: 2,
            message: "Please enter at least 2 characters",
        },
    });

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
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: isMobile ? "100%" : 20,
                            scale: isMobile ? 1 : 0.96,
                        }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{
                            opacity: 0,
                            y: isMobile ? "100%" : 20,
                            scale: isMobile ? 1 : 0.96,
                        }}
                        transition={{ type: "spring", damping: 30, stiffness: 320 }}
                        drag={isMobile ? "y" : false}
                        dragControls={dragControls}
                        dragListener={false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.45 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 90 || info.velocity.y > 450) {
                                closeModal();
                            }
                        }}
                        ref={modalRef}
                        className={cn(
                            "relative backdrop-blur-2xl w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border flex flex-col max-h-[92dvh] sm:max-h-[88vh] min-h-[460px] overflow-hidden",
                            isDark
                                ? "bg-[rgba(15,23,42,0.95)] border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.55)]"
                                : "bg-white/95 border-black/5 shadow-[0_8px_40px_rgba(0,0,0,0.14)]"
                        )}
                    >
                        {/* Glowing Top Accent Line */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent rounded-t-3xl pointer-events-none" />

                        {/* Mobile Drag Handle Bar */}
                        <div
                            onPointerDown={(e) => {
                                if (isMobile) dragControls.start(e);
                            }}
                            className="sm:hidden flex flex-col items-center justify-center pt-2.5 pb-1 cursor-grab active:cursor-grabbing touch-none select-none"
                            aria-hidden="true"
                        >
                            <div
                                className={cn(
                                    "w-11 h-1.5 rounded-full transition-colors",
                                    isDark ? "bg-white/25" : "bg-slate-400/40"
                                )}
                            />
                        </div>

                        {/* Header */}
                        <div
                            onPointerDown={(e) => {
                                if (isMobile && (e.target as HTMLElement).tagName !== "BUTTON") {
                                    dragControls.start(e);
                                }
                            }}
                            className={cn(
                                "px-5 py-4 md:p-6 border-b flex justify-between items-center z-10 shrink-0",
                                isDark ? "border-white/10 bg-accent/5" : "border-black/5 bg-accent/5"
                            )}
                        >
                            <div className="flex items-center gap-3.5 min-w-0">
                                {!isSuccess && <StepIndicator step={step} totalSteps={3} />}
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3
                                            id="booking-modal-title"
                                            className="text-lg sm:text-xl md:text-2xl font-bold font-heading text-primary truncate"
                                        >
                                            {isSuccess
                                                ? t("common.modal.bookingConfirmed", undefined, "Booking Confirmed")
                                                : t("common.modal.title", undefined, "Free Consultation")}
                                        </h3>
                                        {!isSuccess && watchedDestination && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent/15 text-accent border border-accent/25">
                                                {activeDestinationObj?.flag ? (
                                                    <span>{activeDestinationObj.flag}</span>
                                                ) : (
                                                    <Sparkles className="w-3 h-3" />
                                                )}
                                                <span className="truncate max-w-[130px]">{watchedDestination}</span>
                                            </span>
                                        )}
                                    </div>
                                    {!isSuccess && (
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {step > 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={handlePrevStep}
                                                    className={cn(
                                                        "min-h-[36px] pr-2 text-xs md:text-sm inline-flex items-center hover:text-accent transition-colors font-medium",
                                                        isDark ? "text-white/70" : "text-foreground/75"
                                                    )}
                                                >
                                                    <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back to Step {step - 1}
                                                </button>
                                            ) : (
                                                <p
                                                    className={cn(
                                                        "text-xs md:text-sm truncate",
                                                        isDark ? "text-white/60" : "text-foreground/70"
                                                    )}
                                                >
                                                    {t(
                                                        "common.modal.subtitle",
                                                        undefined,
                                                        "Let's plan your future together."
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.92 }}
                                onClick={closeModal}
                                className={cn(
                                    "w-11 h-11 rounded-full transition-colors flex items-center justify-center flex-shrink-0 -mr-1",
                                    isDark ? "hover:bg-white/10 text-white/80" : "hover:bg-black/5 text-foreground/80"
                                )}
                                aria-label="Close booking modal"
                            >
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                            </motion.button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
                            {isSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", duration: 0.55 }}
                                    className="flex-1 flex flex-col items-center text-center p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] justify-center overflow-y-auto"
                                >
                                    <ConfettiExplosion />
                                    <div
                                        className={cn(
                                            "w-20 h-20 rounded-full flex items-center justify-center mb-4 relative z-10",
                                            isDark ? "bg-green-500/15 text-green-400" : "bg-green-100 text-green-600"
                                        )}
                                    >
                                        <CheckCircle className="w-10 h-10" />
                                    </div>
                                    <h4 className="text-2xl sm:text-3xl font-bold font-heading text-primary relative z-10">
                                        {t("common.modal.successTitle", undefined, "We Got Your Request!")}
                                    </h4>
                                    <p className="text-muted-foreground text-base sm:text-lg max-w-sm mx-auto mt-2 relative z-10">
                                        {t(
                                            "common.modal.successSubtitle",
                                            undefined,
                                            "Our team will reach out within 24 hours."
                                        )}
                                    </p>

                                    {trackingCode && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.25, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                            className="w-full max-w-xs mt-5 relative z-10 space-y-2.5"
                                        >
                                            <div
                                                className={cn(
                                                    "flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border",
                                                    "bg-accent/10 border-accent/20"
                                                )}
                                            >
                                                <span className="text-accent font-bold text-lg tracking-wider">
                                                    {trackingCode}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(trackingCode);
                                                        setCodeCopied(true);
                                                        setTimeout(() => setCodeCopied(false), 2000);
                                                    }}
                                                    className={cn(
                                                        "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                                                        isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                                                    )}
                                                    aria-label="Copy tracking code"
                                                >
                                                    {codeCopied ? (
                                                        <Check className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-accent" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-muted-foreground text-sm">
                                                Your tracking code is{" "}
                                                <span className="font-semibold text-accent">{trackingCode}</span>. Use
                                                this to check your progress anytime.
                                            </p>
                                            <Link
                                                href={`/track?code=${encodeURIComponent(trackingCode)}`}
                                                onClick={closeModal}
                                                className="inline-flex items-center justify-center min-h-[44px] px-4 gap-1 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
                                            >
                                                Track Your Application &rarr;
                                            </Link>
                                        </motion.div>
                                    )}

                                    {isExistingApp && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.25, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                            className="w-full max-w-xs mt-5 relative z-10 space-y-2 p-4 rounded-xl bg-accent/10 border border-accent/20 text-center"
                                        >
                                            <p className="text-muted-foreground text-sm">
                                                An application with this phone number already exists. Your tracking code
                                                was previously emailed to you.
                                            </p>
                                            <Link
                                                href="/track"
                                                onClick={closeModal}
                                                className="inline-flex items-center justify-center min-h-[44px] px-4 gap-1 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
                                            >
                                                Track Your Application &rarr;
                                            </Link>
                                        </motion.div>
                                    )}

                                    <motion.div
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full max-w-xs mt-6 relative z-10"
                                    >
                                        <Button
                                            type="button"
                                            onClick={closeModal}
                                            size="lg"
                                            className="w-full h-12 rounded-xl text-base font-bold"
                                        >
                                            {t("common.modal.closeWindow", undefined, "Close Window")}
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    noValidate
                                    className="flex-1 flex flex-col min-h-0"
                                >
                                    <input
                                        type="text"
                                        className="hidden"
                                        {...register("website_url")}
                                        autoComplete="off"
                                        tabIndex={-1}
                                    />

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
                                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                                    className="space-y-4"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-base sm:text-lg font-bold text-primary">
                                                            Contact Details
                                                        </h4>
                                                        <span className="text-xs text-muted-foreground">
                                                            Step 1 of 3
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <label htmlFor="booking-name" className={labelClass}>
                                                            <span className="flex items-center gap-2">
                                                                <User className="w-4 h-4 text-accent" />
                                                                {t("common.form.fullName", undefined, "Full Name")}
                                                            </span>
                                                            {touchedFields.name && !errors.name && (
                                                                <Check className="w-4 h-4 text-emerald-500" />
                                                            )}
                                                        </label>
                                                        <input
                                                            id="booking-name"
                                                            type="text"
                                                            autoComplete="name"
                                                            autoCapitalize="words"
                                                            enterKeyHint="next"
                                                            aria-invalid={Boolean(errors.name)}
                                                            {...nameRegistration}
                                                            ref={(e) => {
                                                                nameRegistration.ref(e);
                                                                firstInputRef.current = e;
                                                            }}
                                                            className={getFieldClass("name")}
                                                            placeholder={t(
                                                                "common.form.namePlaceholder",
                                                                undefined,
                                                                "e.g. Rahim Ahmed"
                                                            )}
                                                        />
                                                        {errors.name && (
                                                            <p className={errorClass} role="alert">
                                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                                <span>{errors.name.message}</span>
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label htmlFor="booking-email" className={labelClass}>
                                                            <span className="flex items-center gap-2">
                                                                <Mail className="w-4 h-4 text-accent" />
                                                                {t("common.form.email", undefined, "Email")}
                                                            </span>
                                                            {touchedFields.email && !errors.email && (
                                                                <Check className="w-4 h-4 text-emerald-500" />
                                                            )}
                                                        </label>
                                                        <input
                                                            id="booking-email"
                                                            type="email"
                                                            inputMode="email"
                                                            autoComplete="email"
                                                            autoCapitalize="none"
                                                            spellCheck={false}
                                                            enterKeyHint="next"
                                                            aria-invalid={Boolean(errors.email)}
                                                            {...register("email", {
                                                                required: t(
                                                                    "common.validation.emailRequired",
                                                                    undefined,
                                                                    "Email is required"
                                                                ),
                                                                pattern: {
                                                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                                    message: t(
                                                                        "common.validation.invalidEmail",
                                                                        undefined,
                                                                        "Invalid email"
                                                                    ),
                                                                },
                                                            })}
                                                            className={getFieldClass("email")}
                                                            placeholder={t(
                                                                "common.form.emailPlaceholder",
                                                                undefined,
                                                                "hello@example.com"
                                                            )}
                                                        />
                                                        {errors.email && (
                                                            <p className={errorClass} role="alert">
                                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                                <span>{errors.email.message}</span>
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label htmlFor="booking-phone" className={labelClass}>
                                                            <span className="flex items-center gap-2">
                                                                <Phone className="w-4 h-4 text-accent" />
                                                                {t("common.form.phone", undefined, "Phone")}
                                                            </span>
                                                            {touchedFields.phone && !errors.phone && (
                                                                <Check className="w-4 h-4 text-emerald-500" />
                                                            )}
                                                        </label>
                                                        <input
                                                            id="booking-phone"
                                                            type="tel"
                                                            inputMode="tel"
                                                            autoComplete="tel"
                                                            autoCapitalize="none"
                                                            spellCheck={false}
                                                            enterKeyHint="done"
                                                            aria-invalid={Boolean(errors.phone)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    void handleNextStep(1);
                                                                }
                                                            }}
                                                            {...register("phone", {
                                                                required: t(
                                                                    "common.validation.phoneRequired",
                                                                    undefined,
                                                                    "Phone is required"
                                                                ),
                                                                pattern: {
                                                                    value: /^[+\d][\d\s\-()]{5,24}$/,
                                                                    message: "Enter a valid phone number (e.g. 017...)",
                                                                },
                                                            })}
                                                            className={getFieldClass("phone")}
                                                            placeholder={t(
                                                                "common.form.phonePlaceholder",
                                                                undefined,
                                                                "017..."
                                                            )}
                                                        />
                                                        {errors.phone && (
                                                            <p className={errorClass} role="alert">
                                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                                <span>{errors.phone.message}</span>
                                                            </p>
                                                        )}
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
                                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                                    className="space-y-4"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-base sm:text-lg font-bold text-primary">
                                                            Schedule Time
                                                        </h4>
                                                        <span className="text-xs text-muted-foreground">
                                                            Step 2 of 3
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <label htmlFor="booking-date" className={labelClass}>
                                                            <span className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-accent" />
                                                                {t("common.form.date", undefined, "Date")}
                                                            </span>
                                                            {watchedDate && !errors.date && (
                                                                <Check className="w-4 h-4 text-emerald-500" />
                                                            )}
                                                        </label>

                                                        {/* 1-Tap Quick-Date Pills */}
                                                        <div
                                                            className="grid grid-cols-3 gap-2 mb-2.5"
                                                            role="group"
                                                            aria-label="Quick date options"
                                                        >
                                                            {quickDates.map((pill) => {
                                                                const isSelected = watchedDate === pill.value;
                                                                return (
                                                                    <button
                                                                        key={pill.id}
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setValue("date", pill.value, {
                                                                                shouldValidate: true,
                                                                                shouldDirty: true,
                                                                                shouldTouch: true,
                                                                            })
                                                                        }
                                                                        className={cn(
                                                                            "min-h-[44px] px-2.5 py-1.5 rounded-xl border text-left transition-all flex flex-col justify-center active:scale-[0.98]",
                                                                            isSelected
                                                                                ? "bg-accent/15 border-accent text-accent font-semibold shadow-sm"
                                                                                : isDark
                                                                                  ? "bg-white/[0.03] border-white/10 text-white/80 hover:border-white/25"
                                                                                  : "bg-slate-500/[0.04] border-black/10 text-foreground/80 hover:border-black/25"
                                                                        )}
                                                                    >
                                                                        <span className="text-xs font-semibold leading-tight truncate">
                                                                            {pill.label}
                                                                        </span>
                                                                        <span className="text-[11px] opacity-75 leading-tight mt-0.5">
                                                                            {pill.sublabel}
                                                                        </span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>

                                                        <input
                                                            id="booking-date"
                                                            type="date"
                                                            min={minDate}
                                                            aria-invalid={Boolean(errors.date)}
                                                            {...register("date", {
                                                                required: t(
                                                                    "common.validation.dateRequired",
                                                                    undefined,
                                                                    "Date is required"
                                                                ),
                                                            })}
                                                            className={cn(getFieldClass("date"), "cursor-pointer")}
                                                        />
                                                        {errors.date && (
                                                            <p className={errorClass} role="alert">
                                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                                <span>{errors.date.message}</span>
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label htmlFor="booking-time" className={labelClass}>
                                                            <span className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-accent" />
                                                                {t("common.form.time", undefined, "Time")}
                                                            </span>
                                                            {watchedTime && !errors.time && (
                                                                <Check className="w-4 h-4 text-emerald-500" />
                                                            )}
                                                        </label>

                                                        {/* Quick 1-Tap Time Slot Chips for Mobile & Desktop */}
                                                        <div
                                                            className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2.5"
                                                            role="group"
                                                            aria-label="Available time slots"
                                                        >
                                                            {TIME_SLOTS.map((slot) => {
                                                                const isSelected = watchedTime === slot;
                                                                return (
                                                                    <button
                                                                        key={slot}
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setValue("time", slot, {
                                                                                shouldValidate: true,
                                                                                shouldDirty: true,
                                                                                shouldTouch: true,
                                                                            })
                                                                        }
                                                                        className={cn(
                                                                            "min-h-[44px] px-2 py-2 rounded-xl border text-xs font-semibold transition-all active:scale-[0.98]",
                                                                            isSelected
                                                                                ? "bg-accent/15 border-accent text-accent shadow-sm"
                                                                                : isDark
                                                                                  ? "bg-white/[0.03] border-white/10 text-white/80 hover:border-white/25"
                                                                                  : "bg-slate-500/[0.04] border-black/10 text-foreground/80 hover:border-black/25"
                                                                        )}
                                                                    >
                                                                        {slot}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>

                                                        <select
                                                            id="booking-time"
                                                            aria-invalid={Boolean(errors.time)}
                                                            {...register("time", {
                                                                required: t(
                                                                    "common.validation.timeRequired",
                                                                    undefined,
                                                                    "Time is required"
                                                                ),
                                                            })}
                                                            className={cn(
                                                                getFieldClass("time"),
                                                                "appearance-none cursor-pointer"
                                                            )}
                                                        >
                                                            <option value="">
                                                                {t(
                                                                    "common.form.selectTime",
                                                                    undefined,
                                                                    "Select Time"
                                                                )}
                                                            </option>
                                                            {TIME_SLOTS.map((slot) => (
                                                                <option key={slot} value={slot}>
                                                                    {slot}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errors.time && (
                                                            <p className={errorClass} role="alert">
                                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                                <span>{errors.time.message}</span>
                                                            </p>
                                                        )}
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
                                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                                    className="space-y-4"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-base sm:text-lg font-bold text-primary">
                                                            Study Goals
                                                        </h4>
                                                        <span className="text-xs text-muted-foreground">
                                                            Step 3 of 3
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <label htmlFor="booking-destination" className={labelClass}>
                                                            <span className="flex items-center gap-2">
                                                                <Globe2 className="w-4 h-4 text-accent" />
                                                                Preferred Destination
                                                            </span>
                                                            {watchedDestination && (
                                                                <Check className="w-4 h-4 text-emerald-500" />
                                                            )}
                                                        </label>
                                                        <select
                                                            id="booking-destination"
                                                            {...register("destination")}
                                                            className={cn(
                                                                getFieldClass("destination"),
                                                                "appearance-none cursor-pointer"
                                                            )}
                                                        >
                                                            <option value="">Undecided / Open to Advice</option>
                                                            {DESTINATION_LIST.map((dest) => (
                                                                <option key={dest.slug} value={dest.name}>
                                                                    {dest.flag} {dest.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label htmlFor="booking-education" className={labelClass}>
                                                            <span className="flex items-center gap-2">
                                                                <GraduationCap className="w-4 h-4 text-accent" />
                                                                {t(
                                                                    "common.form.educationLevel",
                                                                    undefined,
                                                                    "Education Level"
                                                                )}
                                                            </span>
                                                            {touchedFields.education_level &&
                                                                !errors.education_level && (
                                                                    <Check className="w-4 h-4 text-emerald-500" />
                                                                )}
                                                        </label>
                                                        <select
                                                            id="booking-education"
                                                            aria-invalid={Boolean(errors.education_level)}
                                                            {...register("education_level", {
                                                                required: t(
                                                                    "common.validation.educationRequired",
                                                                    undefined,
                                                                    "Education level is required"
                                                                ),
                                                            })}
                                                            className={cn(
                                                                getFieldClass("education_level"),
                                                                "appearance-none cursor-pointer"
                                                            )}
                                                        >
                                                            <option value="">
                                                                {t(
                                                                    "common.form.selectLevel",
                                                                    undefined,
                                                                    "Select Level"
                                                                )}
                                                            </option>
                                                            <option value="Bachelors">
                                                                {t("common.form.bachelors", undefined, "Bachelor's")}
                                                            </option>
                                                            <option value="Masters">
                                                                {t("common.form.masters", undefined, "Master's")}
                                                            </option>
                                                            <option value="PhD">
                                                                {t("common.form.phd", undefined, "PhD")}
                                                            </option>
                                                            <option value="Language_Course">
                                                                {t(
                                                                    "common.form.languageCourse",
                                                                    undefined,
                                                                    "Language Course"
                                                                )}
                                                            </option>
                                                            <option value="Foundation_Year">
                                                                {t(
                                                                    "common.form.foundationYear",
                                                                    undefined,
                                                                    "Foundation Year"
                                                                )}
                                                            </option>
                                                        </select>
                                                        {errors.education_level && (
                                                            <p className={errorClass} role="alert">
                                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                                <span>{errors.education_level.message}</span>
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label htmlFor="booking-topic" className={labelClass}>
                                                            <span className="flex items-center gap-2">
                                                                <BookOpen className="w-4 h-4 text-accent" />
                                                                {t(
                                                                    "common.form.interestedIn",
                                                                    undefined,
                                                                    "Interested In"
                                                                )}
                                                            </span>
                                                        </label>
                                                        <select
                                                            id="booking-topic"
                                                            {...register("topic")}
                                                            className={cn(
                                                                getFieldClass("topic"),
                                                                "appearance-none cursor-pointer"
                                                            )}
                                                        >
                                                            {isCustomTopic && (
                                                                <option value={watchedTopic}>
                                                                    {watchedTopic.replace(/_/g, " ")}
                                                                </option>
                                                            )}
                                                            <option value="General_Inquiry">
                                                                {t(
                                                                    "common.form.generalInquiry",
                                                                    undefined,
                                                                    "General Inquiry"
                                                                )}
                                                            </option>
                                                            <option value="University_Admission">
                                                                {t(
                                                                    "common.form.universityAdmission",
                                                                    undefined,
                                                                    "University Admission"
                                                                )}
                                                            </option>
                                                            <option value="Visa_Processing">
                                                                {t(
                                                                    "common.form.visaProcessing",
                                                                    undefined,
                                                                    "Visa Processing"
                                                                )}
                                                            </option>
                                                            <option value="Scholarship_Help">
                                                                {t(
                                                                    "common.form.scholarshipHelp",
                                                                    undefined,
                                                                    "Scholarship Help"
                                                                )}
                                                            </option>
                                                            <option value="LOM_SOP_Writing">
                                                                {t(
                                                                    "common.form.lomSopWriting",
                                                                    undefined,
                                                                    "LOM/SOP Writing"
                                                                )}
                                                            </option>
                                                        </select>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div
                                        className={cn(
                                            "px-5 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:p-6 border-t mt-auto shrink-0",
                                            isDark ? "border-white/10" : "border-black/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {step > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handlePrevStep}
                                                    className="h-12 sm:h-14 px-5 rounded-xl font-semibold shrink-0"
                                                >
                                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                                    Back
                                                </Button>
                                            )}
                                            <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
                                                {step < 3 ? (
                                                    <Button
                                                        type="button"
                                                        onClick={() => void handleNextStep(step)}
                                                        className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                                    >
                                                        Next Step
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="submit"
                                                        className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                <span>
                                                                    {t("common.modal.booking", undefined, "Booking...")}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            t(
                                                                "common.modal.confirmBooking",
                                                                undefined,
                                                                "Confirm Booking"
                                                            )
                                                        )}
                                                    </Button>
                                                )}
                                            </motion.div>
                                        </div>
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
