"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    GraduationCap,
    CheckCircle,
    CheckCircle2,
    Globe2,
    Trophy,
    Clock,
    Users,
    BookOpen,
    Wallet,
    Sun,
    Coffee,
    MapPin,
    Landmark,
    Train,
    Building2,
    Search,
    X,
    FileCheck,
    Sparkles,
    RotateCcw,
    Calendar,
    Briefcase,
    ShieldCheck,
    Share2,
    Bookmark,
    BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "@/i18n/LanguageContext";
import { useBookingModal } from "@/context/BookingModalContext";
import { useShortlist } from "@/lib/shortlist-store";
import { IMAGE_BLUR_PLACEHOLDERS } from "@/data/image-placeholders";
import type { ChecklistProfile, DestinationRegion, TuitionTier } from "@/data/destinations-meta";
import { cn } from "@/lib/utils";
import { useNavVisible } from "@/lib/scroll-store";

interface SerializedDestination {
    slug: string;
    name: string;
    flag?: string;
    heroImage: string;
    heroTitle: string;
    heroDescription: string;
    region: DestinationRegion;
    isSchengen: boolean;
    tuitionRange: string;
    tuitionShort: string;
    tuitionTier: TuitionTier;
    intakes: string;
    workRights: string;
    workRightsShort: string;
    visaTime: string;
    checklistProfile: ChecklistProfile;
    benefits: { title: string; description: string }[];
    universities: { name: string }[];
}

interface RelatedDestination {
    slug: string;
    name: string;
    heroImage: string;
    flag: string;
    region?: string;
    tuitionShort?: string;
    workRightsShort?: string;
    benefits: { title: string; description: string }[];
}

interface DestinationPageClientProps {
    destination: SerializedDestination;
    relatedDestinations?: RelatedDestination[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    "World-Class Education": Trophy,
    "Short Duration": Clock,
    "Work Opportunities": Users,
    "Cultural Hub": Globe2,
    "Academic Excellence": BookOpen,
    "Flexible Education": MapPin,
    "Career Growth": Wallet,
    "Innovation Hub": Sun,
    "High Quality of Life": Sun,
    "Post-Grad Work Permit": Wallet,
    "Affordable Education": Wallet,
    "Multicultural Society": Users,
    "Global Recognition": Globe2,
    "Work while Studying": Clock,
    "Post-Study Work": Wallet,
    "Great Lifestyle": Coffee,
    "Low/No Tuition": Wallet,
    "Strong Economy": Trophy,
    "Research Focus": BookOpen,
    "Central Europe": Train,
    "Cultural Heritage": Landmark,
    "Research & Innovation": BookOpen,
    "Language": Users,
    "Economic Powerhouse": Trophy,
    "Scholarships": Wallet,
    "Language & Culture": Users,
    "Modern Facilities": Building2,
    "English Programs": BookOpen,
    "Interactive Teaching": Users,
    "International Environment": Globe2,
    "Cycling Culture": Sun,
    "No Tuition Fees": Wallet,
    "Nature": MapPin,
    "Modern Society": Building2,
    "Affordable": Wallet,
    "Weather": Sun,
    "History": Landmark,
    "Safety": Trophy,
    "High Education Standards": BookOpen,
    "Music & Arts": Users,
    "Safe & Stable": Trophy,
    "Quality of Life": Sun,
    "International Hub": Globe2,
    "Multilingual": Users,
    "Central Location": Train,
    "Quality Education": BookOpen,
    "Technology Leader": Sun,
    "Culture": Users,
    "Affordability": Wallet,
    "Multicultural": Users,
    "English-Friendly": BookOpen,
    "Strategic Location": MapPin,
    "Culture & History": Landmark,
};

interface ChecklistItem {
    id: string;
    label: string;
    category: string;
}

function getTailoredChecklist(profile: ChecklistProfile): ChecklistItem[] {
    const commonCore: ChecklistItem[] = [
        { id: "passport", label: "Valid Passport (12+ Months Validity)", category: "Identity" },
        { id: "transcripts", label: "Academic Transcripts & Certificates (SSC/HSC/Bachelor)", category: "Academic" },
        { id: "english", label: "IELTS / PTE / Duolingo / MOI Certificate", category: "Language" },
        { id: "sop", label: "Tailored Statement of Purpose (SOP) / Motivation Letter", category: "Application" },
        { id: "lor", label: "2 Academic or Professional Recommendation Letters", category: "Academic" },
    ];

    switch (profile) {
        case "germany":
            return [
                ...commonCore,
                { id: "cv", label: "Updated Academic CV / Europass Resume", category: "Application" },
                { id: "solvency", label: "Blocked Account (Sperrkonto) & Health Insurance", category: "Financial" },
                { id: "visa_forms", label: "Uni-Assist / VPD & German Embassy Appointment File", category: "Visa" },
            ];
        case "uk":
            return [
                ...commonCore,
                { id: "cv", label: "Academic CV & Study Gap Explanation (if applicable)", category: "Application" },
                { id: "solvency", label: "28-Day Matured Bank Statement & Sponsor Letter", category: "Financial" },
                { id: "visa_forms", label: "CAS Letter, IOM TB Test Certificate & IHS Payment", category: "Visa" },
            ];
        case "usa":
            return [
                ...commonCore,
                { id: "cv", label: "Academic Resume + SAT / GRE / GMAT (if required)", category: "Application" },
                { id: "solvency", label: "Bank Solvency Certificate & Affidavit of Support", category: "Financial" },
                { id: "visa_forms", label: "Form I-20, SEVIS Fee Receipt & DS-160 F-1 Interview Prep", category: "Visa" },
            ];
        case "canada":
            return [
                ...commonCore,
                { id: "cv", label: "Academic CV & Detailed Study Plan (LOE)", category: "Application" },
                { id: "solvency", label: "Tuition Receipt, GIC / Bank Solvency & Sponsor Tax Docs", category: "Financial" },
                { id: "visa_forms", label: "LOA, Provincial Attestation Letter (PAL) & Biometrics", category: "Visa" },
            ];
        case "australia":
            return [
                ...commonCore,
                { id: "cv", label: "Genuine Student (GS) Statement & Updated CV", category: "Application" },
                { id: "solvency", label: "Financial Capacity Proof & Sponsor Income Documents", category: "Financial" },
                { id: "visa_forms", label: "Confirmation of Enrolment (CoE), OSHC & Medical Check", category: "Visa" },
            ];
        case "asia":
            return [
                ...commonCore,
                { id: "cv", label: "Updated Academic CV & Scholarship Essay (if applying)", category: "Application" },
                { id: "solvency", label: "Bank Solvency Certificate & Sponsor Affidavit", category: "Financial" },
                { id: "visa_forms", label: "Admission Notice, Medical Form & Embassy Visa File", category: "Visa" },
            ];
        case "schengen":
        default:
            return [
                ...commonCore,
                { id: "cv", label: "Updated Academic CV / Europass Format", category: "Application" },
                { id: "solvency", label: "Bank Solvency / Blocked Funds & Travel Insurance", category: "Financial" },
                { id: "visa_forms", label: "University Acceptance, Housing Proof & Schengen Visa File", category: "Visa" },
            ];
    }
}

// Hydration-safe localStorage checklist store via useSyncExternalStore
const EMPTY_CHECKLIST: string[] = [];
const CHECKLIST_EVENT = "nextep-checklist-change";
const checklistCache = new Map<string, { raw: string | null; parsed: string[] }>();

function readChecklistSnapshot(storageKey: string): string[] {
    if (typeof window === "undefined") return EMPTY_CHECKLIST;
    try {
        const raw = localStorage.getItem(storageKey);
        const existing = checklistCache.get(storageKey);
        if (existing && existing.raw === raw) return existing.parsed;
        if (!raw) {
            checklistCache.set(storageKey, { raw: null, parsed: EMPTY_CHECKLIST });
            return EMPTY_CHECKLIST;
        }
        const parsed = JSON.parse(raw);
        const cleaned = Array.isArray(parsed)
            ? parsed.filter((item): item is string => typeof item === "string")
            : EMPTY_CHECKLIST;
        checklistCache.set(storageKey, { raw, parsed: cleaned });
        return cleaned;
    } catch {
        return EMPTY_CHECKLIST;
    }
}

function writeChecklistSnapshot(storageKey: string, next: string[]) {
    if (typeof window === "undefined") return;
    const raw = JSON.stringify(next);
    checklistCache.set(storageKey, { raw, parsed: next });
    try {
        if (next.length === 0) {
            localStorage.removeItem(storageKey);
        } else {
            localStorage.setItem(storageKey, raw);
        }
    } catch {
        // Ignore storage errors
    }
    window.dispatchEvent(new CustomEvent(CHECKLIST_EVENT, { detail: storageKey }));
}

function useCountryChecklist(storageKey: string) {
    const checkedDocs = useSyncExternalStore(
        (listener) => {
            const onCustom = (e: Event) => {
                const ce = e as CustomEvent<string>;
                if (!ce.detail || ce.detail === storageKey) listener();
            };
            const onStorage = (e: StorageEvent) => {
                if (!e.key || e.key === storageKey) {
                    checklistCache.delete(storageKey);
                    listener();
                }
            };
            window.addEventListener(CHECKLIST_EVENT, onCustom);
            window.addEventListener("storage", onStorage);
            return () => {
                window.removeEventListener(CHECKLIST_EVENT, onCustom);
                window.removeEventListener("storage", onStorage);
            };
        },
        () => readChecklistSnapshot(storageKey),
        () => EMPTY_CHECKLIST
    );

    const toggleDoc = (id: string) => {
        const current = readChecklistSnapshot(storageKey);
        const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
        writeChecklistSnapshot(storageKey, next);
    };

    const resetChecklist = () => {
        writeChecklistSnapshot(storageKey, []);
    };

    return { checkedDocs, toggleDoc, resetChecklist };
}

export function DestinationPageClient({ destination, relatedDestinations = [] }: DestinationPageClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSection, setActiveSection] = useState("overview");
    const storageKey = `nextep_checklist_${destination.slug}`;
    const { checkedDocs, toggleDoc, resetChecklist } = useCountryChecklist(storageKey);
    const { isShortlisted, toggleShortlist } = useShortlist();
    const tabBarVisible = useNavVisible();
    const { t } = useTranslation();
    const { openModal } = useBookingModal();

    const jumpBarRef = useRef<HTMLDivElement>(null);
    const checklistItems = getTailoredChecklist(destination.checklistProfile);
    const saved = isShortlisted(destination.slug);

    const countryName = t(`destinations.countries.${destination.slug}.name`, undefined, destination.name);

    useEffect(() => {
        const sectionIds = ["overview", "universities", "costs-visa", "checklist", "related"];
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible[0]?.target?.id) {
                    setActiveSection(visible[0].target.id);
                }
            },
            { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.3, 0.6] }
        );

        sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [destination.slug]);

    // Auto-scroll active Jump-Bar pill into center
    useEffect(() => {
        const container = jumpBarRef.current;
        if (!container) return;
        const activeBtn = container.querySelector<HTMLElement>(`[data-jump-id="${activeSection}"]`);
        if (activeBtn) {
            const targetLeft =
                activeBtn.offsetLeft - container.clientWidth / 2 + activeBtn.clientWidth / 2;
            container.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
        }
    }, [activeSection]);

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleShare = async () => {
        const url = typeof window !== "undefined" ? window.location.href : `https://www.nextepedu.com/destinations/${destination.slug}`;
        const shareText = `Study in ${destination.name} from Bangladesh - Tuition: ${destination.tuitionShort}, Work Rights: ${destination.workRightsShort}. Explore guide on NexTep Edu:`;
        if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
            try {
                await navigator.share({
                    title: `Study in ${destination.name} | NexTep Edu`,
                    text: shareText,
                    url,
                });
                return;
            } catch (err) {
                if ((err as Error)?.name === "AbortError") return;
            }
        }
        try {
            await navigator.clipboard.writeText(`${shareText} ${url}`);
            toast.success(t("destinations.detail.linkCopied", undefined, "Country guide link copied!"));
        } catch {
            toast.error(t("destinations.detail.shareFailed", undefined, "Could not copy link automatically."));
        }
    };

    const handleToggleShortlist = () => {
        const result = toggleShortlist(destination.slug);
        if (result === "added") {
            toast.success(`${destination.name} added to Compare shortlist`);
        } else if (result === "removed") {
            toast(`${destination.name} removed from shortlist`);
        } else {
            toast.error("You can compare up to 3 countries at once. Remove one first.");
        }
    };

    const filteredUniversities = destination.universities.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const readinessPercent = Math.round((checkedDocs.length / checklistItems.length) * 100);

    const jumpLinks = [
        { id: "overview", label: t("destinations.detail.jumpOverview", undefined, "Why Study Here") },
        {
            id: "universities",
            label: `${t("destinations.detail.jumpUniversities", undefined, "Universities")} (${destination.universities.length})`,
        },
        { id: "costs-visa", label: t("destinations.detail.jumpCostsVisa", undefined, "Costs & Visa") },
        {
            id: "checklist",
            label: `${t("destinations.detail.jumpChecklist", undefined, "Checklist")} (${checkedDocs.length}/${checklistItems.length})`,
        },
        ...(relatedDestinations.length > 0
            ? [{ id: "related", label: t("destinations.detail.jumpRelated", undefined, "Similar Countries") }]
            : []),
    ];

    return (
        <article className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[52svh] sm:h-[55vh] md:h-[62vh] flex items-end overflow-hidden">
                <Image
                    src={destination.heroImage}
                    alt={`Study in ${destination.name} - Campus life and education opportunities for Bangladeshi students`}
                    fill
                    className="object-cover"
                    placeholder={IMAGE_BLUR_PLACEHOLDERS[destination.heroImage] ? "blur" : "empty"}
                    blurDataURL={IMAGE_BLUR_PLACEHOLDERS[destination.heroImage]}
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/50 to-slate-950/20" />

                <div className="container mx-auto px-4 pb-8 md:pb-14 relative z-10">
                    {/* Top Action Row: Back + Shortlist + Share */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                        <Link
                            href="/destinations"
                            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium text-white/90 hover:text-accent transition-colors bg-slate-950/45 backdrop-blur-md border border-white/15 px-3.5 min-h-[44px] rounded-full"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                            <span>{t("destinations.detail.allDestinations", undefined, "All Destinations")}</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleToggleShortlist}
                                aria-pressed={saved}
                                className={cn(
                                    "inline-flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-full text-xs font-semibold border backdrop-blur-md transition-colors",
                                    saved
                                        ? "bg-accent text-slate-950 border-accent"
                                        : "bg-slate-950/45 text-white border-white/15 hover:bg-slate-950/70"
                                )}
                            >
                                {saved ? (
                                    <BookmarkCheck className="w-4 h-4 shrink-0" />
                                ) : (
                                    <Bookmark className="w-4 h-4 shrink-0" />
                                )}
                                <span className="hidden sm:inline">
                                    {saved
                                        ? t("destinations.detail.shortlisted", undefined, "Shortlisted")
                                        : t("destinations.detail.shortlist", undefined, "Shortlist")}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleShare()}
                                aria-label={`Share ${destination.name} study guide`}
                                className="inline-flex items-center justify-center gap-1.5 px-3.5 min-h-[44px] rounded-full text-xs font-semibold bg-slate-950/45 text-white border border-white/15 hover:bg-slate-950/70 backdrop-blur-md transition-colors"
                            >
                                <Share2 className="w-4 h-4 shrink-0" />
                                <span className="hidden sm:inline">
                                    {t("destinations.detail.share", undefined, "Share")}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-heading text-white mb-2.5 flex items-center gap-2.5">
                            {destination.flag && <span>{destination.flag}</span>}
                            <span>{t(`destinations.countries.${destination.slug}.heroTitle`, undefined, destination.heroTitle)}</span>
                        </h1>
                        <p className="text-sm sm:text-base md:text-xl text-white/85 max-w-2xl leading-relaxed">
                            {t(`destinations.countries.${destination.slug}.heroDescription`, undefined, destination.heroDescription)}
                        </p>
                    </div>
                </div>
            </section>

            {/* Sticky Horizontal Section Jump-Bar (Synced with Header visibility) */}
            <div
                className={cn(
                    "sticky z-30 bg-background/92 backdrop-blur-xl border-b border-border/60 transition-[top] duration-300 ease-out",
                    tabBarVisible ? "top-[calc(4.75rem+env(safe-area-inset-top,0px))]" : "top-0"
                )}
            >
                <div className="container mx-auto px-4 flex items-center justify-between gap-3 py-2">
                    <div className="relative flex-1 min-w-0">
                        <div
                            ref={jumpBarRef}
                            className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-2 px-2 snap-x"
                        >
                            {jumpLinks.map((item) => {
                                const isActive = activeSection === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        data-jump-id={item.id}
                                        type="button"
                                        onClick={() => scrollToSection(item.id)}
                                        className={cn(
                                            "px-3.5 min-h-[44px] rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 snap-start border",
                                            isActive
                                                ? "bg-accent text-slate-950 border-accent shadow-2xs"
                                                : "bg-card/80 text-muted-foreground border-border/60 hover:text-foreground hover:border-accent/40"
                                        )}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                        <div
                            aria-hidden="true"
                            className="md:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent"
                        />
                    </div>
                    <Button
                        size="sm"
                        className="hidden md:inline-flex rounded-full px-4 min-h-[40px] text-xs font-semibold shrink-0 gap-1.5"
                        onClick={() =>
                            openModal({
                                destination: destination.name,
                                topic: `Study in ${destination.name}`,
                            })
                        }
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Free {destination.name} Assessment</span>
                    </Button>
                </div>
            </div>

            {/* Compact 2x2 Quick Facts KPI Strip immediately below Hero/Jump-Bar */}
            <section className="py-5 md:py-8 bg-surface/50 dark:bg-card/30 border-b border-border/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 max-w-6xl mx-auto">
                        <div className="surface-card p-3 sm:p-4 rounded-xl flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-accent/12 text-accent flex items-center justify-center shrink-0">
                                <Wallet className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {t("destinations.detail.kpiTuition", undefined, "Tuition")}
                                </p>
                                <p className="text-xs sm:text-sm font-bold text-primary leading-snug line-clamp-2 mt-0.5">
                                    {destination.tuitionShort}
                                </p>
                            </div>
                        </div>
                        <div className="surface-card p-3 sm:p-4 rounded-xl flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-accent/12 text-accent flex items-center justify-center shrink-0">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {t("destinations.detail.kpiIntakes", undefined, "Intakes")}
                                </p>
                                <p className="text-xs sm:text-sm font-bold text-primary leading-snug line-clamp-2 mt-0.5">
                                    {destination.intakes}
                                </p>
                            </div>
                        </div>
                        <div className="surface-card p-3 sm:p-4 rounded-xl flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-accent/12 text-accent flex items-center justify-center shrink-0">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {t("destinations.detail.kpiWork", undefined, "Work Rights")}
                                </p>
                                <p className="text-xs sm:text-sm font-bold text-primary leading-snug line-clamp-2 mt-0.5">
                                    {destination.workRightsShort}
                                </p>
                            </div>
                        </div>
                        <div className="surface-card p-3 sm:p-4 rounded-xl flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-accent/12 text-accent flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {t("destinations.detail.kpiVisa", undefined, "Visa Time")}
                                </p>
                                <p className="text-xs sm:text-sm font-bold text-primary leading-snug line-clamp-2 mt-0.5">
                                    {destination.visaTime}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="overview" className="py-10 md:py-20 bg-background scroll-mt-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8 md:mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-primary mb-3">
                            {t(
                                "destinations.page.whyStudy",
                                { country: countryName },
                                `Why Study in ${destination.name}?`
                            )}
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                            {t(
                                "destinations.page.whyStudySubtitle",
                                { country: countryName },
                                `Discover the advantages that make ${destination.name} an ideal destination for Bangladeshi students.`
                            )}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {destination.benefits.map((benefit) => {
                            const BenefitIcon = iconMap[benefit.title] || Globe2;
                            return (
                                <div key={benefit.title} className="surface-card p-5 md:p-6 rounded-2xl">
                                    <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-3.5">
                                        <BenefitIcon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold font-heading text-primary mb-1.5">
                                        {t(`destinations.benefits.${benefit.title}.title`, undefined, benefit.title)}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {t(`destinations.benefits.${benefit.title}.desc`, undefined, benefit.description)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Universities Section */}
            <section
                id="universities"
                className="py-10 md:py-20 bg-surface/60 dark:bg-card/40 border-y border-border/50 scroll-mt-24"
            >
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-primary mb-3">
                            {t(
                                "destinations.detail.topUniversitiesTitle",
                                { country: countryName },
                                `Top Universities in ${destination.name}`
                            )}
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                            {t(
                                "destinations.detail.topUniversitiesSubtitle",
                                { country: countryName },
                                `Tap any university below to request a free eligibility check and admission roadmap for ${destination.name}.`
                            )}
                        </p>
                    </div>

                    {/* Hide university search bar when < 8 universities */}
                    {destination.universities.length >= 8 && (
                        <div className="max-w-md mx-auto mb-8 relative">
                            <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="search"
                                inputMode="search"
                                enterKeyHint="search"
                                placeholder={`Search ${destination.universities.length} universities...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full min-h-[48px] pl-11 pr-11 py-2.5 rounded-full border border-border bg-background/85 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all [&::-webkit-search-cancel-button]:hidden"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    {filteredUniversities.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            No universities matching &ldquo;{searchQuery}&rdquo;.
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-4 max-w-6xl mx-auto">
                            {filteredUniversities.map((university) => (
                                <button
                                    type="button"
                                    key={university.name}
                                    onClick={() =>
                                        openModal({
                                            destination: destination.name,
                                            topic: `University Admission - ${university.name}`,
                                        })
                                    }
                                    className="surface-card flex items-center justify-between gap-3 p-4 min-h-[64px] rounded-xl text-left group hover:border-accent/40 transition-all cursor-pointer active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-slate-950 transition-colors">
                                            <GraduationCap className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-sm md:text-base text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                                            {university.name}
                                        </span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Detailed Costs, Intakes & Visa Snapshot Section */}
            <section id="costs-visa" className="py-10 md:py-20 bg-background scroll-mt-24">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
                        <span className="inline-block px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold tracking-wider uppercase mb-3">
                            {t("destinations.detail.factsBadge", undefined, "Key Facts for Bangladeshi Students")}
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-primary mb-2.5">
                            {t("destinations.detail.costsVisaTitle", undefined, "Tuition, Intakes & Visa Guide")}
                        </h2>
                        <p className="text-sm md:text-base text-muted-foreground">
                            {t(
                                "destinations.detail.costsVisaSubtitle",
                                { country: countryName },
                                `Essential planning benchmarks for studying in ${destination.name}.`
                            )}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 max-w-6xl mx-auto">
                        <div className="surface-card p-5 md:p-6 rounded-2xl flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-3.5">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                    {t("destinations.detail.estimatedTuition", undefined, "Estimated Tuition")}
                                </p>
                                <h3 className="text-base font-bold text-primary leading-snug">
                                    {destination.tuitionRange}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    openModal({
                                        destination: destination.name,
                                        topic: `${destination.name} Tuition & Scholarships`,
                                    })
                                }
                                className="mt-4 pt-3 border-t border-border/40 min-h-[40px] text-xs font-semibold text-accent flex items-center gap-1 hover:underline text-left"
                            >
                                <span>{t("destinations.detail.checkScholarships", undefined, "Check scholarship options")}</span>
                                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                            </button>
                        </div>

                        <div className="surface-card p-5 md:p-6 rounded-2xl flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-3.5">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                    {t("destinations.detail.primaryIntakes", undefined, "Primary Intakes")}
                                </p>
                                <h3 className="text-base font-bold text-primary leading-snug">
                                    {destination.intakes}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    openModal({
                                        destination: destination.name,
                                        topic: `${destination.name} Next Intake Application`,
                                    })
                                }
                                className="mt-4 pt-3 border-t border-border/40 min-h-[40px] text-xs font-semibold text-accent flex items-center gap-1 hover:underline text-left"
                            >
                                <span>{t("destinations.detail.applyUpcoming", undefined, "Apply for upcoming intake")}</span>
                                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                            </button>
                        </div>

                        <div className="surface-card p-5 md:p-6 rounded-2xl flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-3.5">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                    {t("destinations.detail.workStayBack", undefined, "Work & Stay-Back Rights")}
                                </p>
                                <h3 className="text-base font-bold text-primary leading-snug">
                                    {destination.workRights}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    openModal({
                                        destination: destination.name,
                                        topic: `${destination.name} Career & Work Visa Pathways`,
                                    })
                                }
                                className="mt-4 pt-3 border-t border-border/40 min-h-[40px] text-xs font-semibold text-accent flex items-center gap-1 hover:underline text-left"
                            >
                                <span>{t("destinations.detail.exploreCareers", undefined, "Explore career pathways")}</span>
                                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                            </button>
                        </div>

                        <div className="surface-card p-5 md:p-6 rounded-2xl flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-3.5">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                    {t("destinations.detail.visaProcessing", undefined, "Visa Processing Time")}
                                </p>
                                <h3 className="text-base font-bold text-primary leading-snug">
                                    {destination.visaTime}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    openModal({
                                        destination: destination.name,
                                        topic: `${destination.name} Student Visa Support`,
                                    })
                                }
                                className="mt-4 pt-3 border-t border-border/40 min-h-[40px] text-xs font-semibold text-accent flex items-center gap-1 hover:underline text-left"
                            >
                                <span>{t("destinations.detail.getVisaGuidance", undefined, "Get visa file guidance")}</span>
                                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Tailored Document Readiness Checklist Section */}
            <section
                id="checklist"
                className="py-10 md:py-20 bg-surface/60 dark:bg-card/40 border-y border-border/50 scroll-mt-24"
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto surface-card rounded-3xl p-5 sm:p-8 md:p-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-2">
                                    <FileCheck className="w-3.5 h-3.5" />
                                    {t("destinations.detail.checklistBadge", undefined, "Interactive Preparation Tracker")}
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-primary">
                                    {t(
                                        "destinations.detail.checklistTitle",
                                        { country: countryName },
                                        `${destination.name} Admission & Visa Checklist`
                                    )}
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                    {t(
                                        "destinations.detail.checklistSubtitle",
                                        undefined,
                                        "Tap items you already have ready. Your progress is saved automatically on this device."
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-3 bg-background/70 border border-border/60 rounded-2xl px-4 py-3 shrink-0">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        {t("destinations.detail.readinessScore", undefined, "Readiness Score")}
                                    </p>
                                    <p className="text-lg font-bold text-primary">
                                        {checkedDocs.length} / {checklistItems.length}{" "}
                                        <span className="text-xs font-semibold text-accent">({readinessPercent}%)</span>
                                    </p>
                                </div>
                                {checkedDocs.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={resetChecklist}
                                        className="w-11 h-11 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
                                        aria-label="Reset checklist"
                                        title="Reset checklist"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mb-5">
                            <motion.div
                                initial={false}
                                animate={{ width: `${readinessPercent}%` }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                                className="h-full bg-accent rounded-full"
                            />
                        </div>

                        {/* Checklist Grid (Mobile-friendly stacked badge) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
                            {checklistItems.map((doc) => {
                                const isChecked = checkedDocs.includes(doc.id);
                                return (
                                    <button
                                        key={doc.id}
                                        type="button"
                                        aria-pressed={isChecked}
                                        onClick={() => toggleDoc(doc.id)}
                                        className={cn(
                                            "flex items-start gap-3 p-3.5 min-h-[58px] rounded-2xl border text-left transition-all active:scale-[0.99]",
                                            isChecked
                                                ? "bg-accent/12 border-accent/50 text-foreground"
                                                : "bg-background/60 border-border/60 text-muted-foreground hover:border-accent/30 hover:text-foreground"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                                                isChecked
                                                    ? "bg-accent border-accent text-slate-950"
                                                    : "border-border bg-card"
                                            )}
                                        >
                                            {isChecked && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span
                                                className={cn(
                                                    "block text-xs sm:text-sm font-medium leading-snug",
                                                    isChecked && "font-semibold text-primary"
                                                )}
                                            >
                                                {doc.label}
                                            </span>
                                            <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted/85 text-muted-foreground">
                                                {doc.category}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-border/50">
                            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                                {checkedDocs.length === checklistItems.length
                                    ? t(
                                          "destinations.detail.checklistComplete",
                                          undefined,
                                          "Awesome! Your core documents are ready for immediate university application."
                                      )
                                    : t(
                                          "destinations.detail.checklistIncomplete",
                                          undefined,
                                          "Missing a few documents or SOP/financial proof? Our counselors will help you prepare them."
                                      )}
                            </p>
                            <Button
                                className="rounded-full min-h-[48px] px-6 w-full sm:w-auto gap-2 shrink-0"
                                onClick={() =>
                                    openModal({
                                        destination: destination.name,
                                        topic: `${destination.name} Document Review (${checkedDocs.length}/${checklistItems.length} Ready)`,
                                    })
                                }
                            >
                                <Sparkles className="w-4 h-4 shrink-0" />
                                <span>
                                    {t("destinations.detail.reviewChecklist", undefined, "Review My Checklist with a Counselor")}
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Destinations Section (Mobile Horizontal Snap-Carousel, Desktop 3-Col Grid) */}
            {relatedDestinations.length > 0 && (
                <section id="related" className="py-10 md:py-20 bg-background scroll-mt-24">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-8 md:mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-primary mb-2.5">
                                {t("destinations.detail.similarTitle", undefined, "Similar Countries to Consider")}
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                                {t(
                                    "destinations.detail.similarSubtitle",
                                    undefined,
                                    "Matched by region and tuition profile for Bangladeshi students."
                                )}
                            </p>
                        </div>

                        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-7 max-w-6xl mx-auto overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-pl-4 pb-3 md:pb-0 -mx-4 px-4 md:mx-auto md:px-0 scrollbar-hide">
                            {relatedDestinations.map((related) => (
                                <div
                                    key={related.slug}
                                    className="w-[82vw] sm:w-[340px] md:w-auto shrink-0 md:shrink snap-start h-full"
                                >
                                    <Link href={`/destinations/${related.slug}`} className="group block h-full">
                                        <div className="surface-card relative h-full overflow-hidden rounded-2xl hover:-translate-y-1 flex flex-col">
                                            <div className="relative h-44 overflow-hidden bg-slate-200/50 dark:bg-slate-800/50">
                                                <Image
                                                    src={related.heroImage}
                                                    alt={related.name}
                                                    fill
                                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                    sizes="(max-width: 768px) 82vw, 33vw"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                                                <div className="absolute bottom-3.5 left-4 text-white z-10">
                                                    <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                                                        <span>{related.flag}</span>{" "}
                                                        <span>
                                                            {t(`destinations.countries.${related.slug}.name`, undefined, related.name)}
                                                        </span>
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between gap-3">
                                                {(related.tuitionShort || related.workRightsShort) && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {related.tuitionShort && (
                                                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-accent/12 text-accent border border-accent/20">
                                                                {related.tuitionShort}
                                                            </span>
                                                        )}
                                                        {related.workRightsShort && (
                                                            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border/50">
                                                                {related.workRightsShort}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="space-y-2.5">
                                                    {related.benefits.slice(0, 2).map((benefit, i) => {
                                                        const BenefitIcon = iconMap[benefit.title] || Globe2;
                                                        return (
                                                            <div key={i} className="flex items-start gap-2.5">
                                                                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 text-accent mt-0.5">
                                                                    <BenefitIcon className="w-4 h-4" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h4 className="font-semibold text-sm text-foreground">
                                                                        {t(`destinations.benefits.${benefit.title}.title`, undefined, benefit.title)}
                                                                    </h4>
                                                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                                        {t(`destinations.benefits.${benefit.title}.desc`, undefined, benefit.description)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-accent group-hover:text-accent/80 transition-colors pt-2.5 border-t border-border/40">
                                                    <span>{t("destinations.detail.viewGuide", undefined, "View Country Guide")}</span>
                                                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Bottom CTA Banner */}
            <section className="py-10 md:py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="relative p-6 sm:p-8 md:p-12 rounded-3xl overflow-hidden border border-white/10 shadow-xl">
                        <div className="absolute inset-0 bg-[#0F172A]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(212,175,55,0.12)_0%,_transparent_65%)]" />

                        <div className="relative z-10 text-center max-w-2xl mx-auto">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-white mb-3">
                                {t(
                                    "destinations.detail.readyTitle",
                                    { country: countryName },
                                    `Ready to Start Your Journey to ${destination.name}?`
                                )}
                            </h2>
                            <p className="text-white/75 mb-7 text-sm md:text-base">
                                {t(
                                    "destinations.detail.readySubtitle",
                                    { country: countryName },
                                    `Book a free consultation with our expert counselors who specialize in ${destination.name} admissions for Bangladeshi students.`
                                )}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    size="lg"
                                    variant="accent"
                                    className="rounded-full font-bold px-8 min-h-[48px] w-full sm:w-auto"
                                    onClick={() =>
                                        openModal({
                                            destination: destination.name,
                                            topic: "University_Admission",
                                        })
                                    }
                                >
                                    {t("common.footer.ctaButton", undefined, "Book Free Consultation")}
                                </Button>
                            </div>

                            <div className="mt-7 flex flex-wrap justify-center gap-4 sm:gap-6 text-white/70 text-xs md:text-sm">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                    <span>{t("destinations.detail.trustFree", undefined, "Free Consultation")}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                    <span>{t("destinations.detail.trustExpert", undefined, "Expert Guidance")}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                    <span>{t("destinations.detail.trustVisa", undefined, "98% Visa Success")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Option A Compact Single-Row Country Action Dock (< lg):
                Hidden while MobileTabBar is visible; slides up smoothly via GPU translateY on scroll-down */}
            <div
                aria-label="Country quick actions"
                className={cn(
                    "fixed left-3.5 right-3.5 max-w-lg mx-auto z-40 lg:hidden will-change-transform transition-[transform,opacity] duration-300 ease-out",
                    tabBarVisible
                        ? "translate-y-[140%] opacity-0 pointer-events-none"
                        : "translate-y-0 opacity-100"
                )}
                style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
            >
                <div className="glass-nav bg-white/90 dark:bg-slate-900/90 border border-accent/35 rounded-2xl p-2 shadow-xl flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => void handleShare()}
                        aria-label={`Share ${destination.name} guide`}
                        className="w-11 h-11 rounded-xl border border-border/70 bg-card/80 text-foreground hover:text-accent hover:border-accent/40 flex items-center justify-center shrink-0 transition-colors"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                    <Button
                        size="sm"
                        className="flex-1 min-h-[44px] rounded-xl text-xs font-bold gap-1.5"
                        onClick={() =>
                            openModal({
                                destination: destination.name,
                                topic: `Study in ${destination.name} (${checkedDocs.length}/${checklistItems.length} Ready)`,
                            })
                        }
                    >
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>{t("destinations.card.freeAssessment", undefined, "Free Assessment")}</span>
                    </Button>
                </div>
            </div>
        </article>
    );
}
