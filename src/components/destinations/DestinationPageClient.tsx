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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import { useBookingModal } from "@/context/BookingModalContext";
import { cn } from "@/lib/utils";

interface SerializedDestination {
    slug: string;
    name: string;
    flag?: string;
    heroImage: string;
    heroTitle: string;
    heroDescription: string;
    benefits: { title: string; description: string }[];
    universities: { name: string }[];
}

interface RelatedDestination {
    slug: string;
    name: string;
    heroImage: string;
    flag: string;
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
};

const CHECKLIST_ITEMS = [
    { id: "passport", label: "Valid Passport (12+ Months Validity)", category: "Identity" },
    { id: "transcripts", label: "Academic Transcripts & Certificates (SSC/HSC/Bachelor)", category: "Academic" },
    { id: "english", label: "IELTS / PTE / Duolingo / MOI Certificate", category: "Language" },
    { id: "sop", label: "Tailored SOP / Letter of Motivation (LOM)", category: "Application" },
    { id: "cv", label: "Updated Academic CV / Europass Resume", category: "Application" },
    { id: "lor", label: "2 Academic or Professional Recommendation Letters", category: "Academic" },
    { id: "solvency", label: "Bank Solvency / Blocked Account / Sponsor Proof", category: "Financial" },
    { id: "visa_forms", label: "Embassy Appointment & Visa Checklist Verification", category: "Visa" },
];

const COUNTRY_SNAPSHOTS: Record<string, { tuition: string; intakes: string; workRights: string; visaTimeline: string }> = {
    germany: { tuition: "Public: Tuition-Free (Semester contribution only)", intakes: "Winter (Sep/Oct) & Summer (Mar/Apr)", workRights: "20 hrs/wk + 18-Month Job Seeker Visa", visaTimeline: "4 - 10 Weeks after appointment" },
    uk: { tuition: "GBP 12,000 - 22,000 / year (Scholarships available)", intakes: "September, January & May", workRights: "20 hrs/wk + 2-Year Graduate Route PSW", visaTimeline: "3 - 4 Weeks standard processing" },
    usa: { tuition: "USD 15,000 - 35,000 / year (Merit aid available)", intakes: "Fall (Aug/Sep) & Spring (Jan)", workRights: "On-campus + Up to 3 Years STEM OPT", visaTimeline: "F-1 Interview + 2 - 6 Weeks" },
    canada: { tuition: "CAD 16,000 - 28,000 / year", intakes: "Fall (Sep), Winter (Jan) & May", workRights: "Part-time + Up to 3 Years PGWP", visaTimeline: "6 - 12 Weeks SDS/Regular" },
    australia: { tuition: "AUD 22,000 - 36,000 / year", intakes: "February, July & November", workRights: "48 hrs/fortnight + 2 - 4 Years PSW", visaTimeline: "4 - 8 Weeks Subclass 500" },
};

const DEFAULT_SNAPSHOT = {
    tuition: "EUR 2,500 - 8,500 / year (Scholarships available)",
    intakes: "Autumn (Sep/Oct) & Spring (Feb/Mar)",
    workRights: "20 hrs/week during study + Post-study options",
    visaTimeline: "4 - 8 Weeks embassy processing",
};

export function DestinationPageClient({ destination, relatedDestinations = [] }: DestinationPageClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSection, setActiveSection] = useState("overview");
    const storageKey = `nextep_checklist_${destination.slug}`;
    const [checkedDocs, setCheckedDocs] = useState<string[]>(() => {
        if (typeof window === "undefined") return [];
        try {
            const saved = localStorage.getItem(`nextep_checklist_${destination.slug}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    return parsed.filter((item): item is string => typeof item === "string");
                }
            }
        } catch {
            // ignore
        }
        return [];
    });
    const [tabBarVisible, setTabBarVisible] = useState(true);
    const { t } = useTranslation();
    const { openModal } = useBookingModal();

    const snapshot = COUNTRY_SNAPSHOTS[destination.slug] || DEFAULT_SNAPSHOT;

    useEffect(() => {
        const handleTabBar = (e: Event) => {
            const customEvent = e as CustomEvent<{ visible: boolean }>;
            setTabBarVisible(Boolean(customEvent.detail?.visible));
        };
        window.addEventListener("tabbar-visibility", handleTabBar);
        return () => window.removeEventListener("tabbar-visibility", handleTabBar);
    }, []);

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

    const toggleDoc = (id: string) => {
        setCheckedDocs((prev) => {
            const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
            try {
                localStorage.setItem(storageKey, JSON.stringify(next));
            } catch {
                // ignore storage quota errors
            }
            return next;
        });
    };

    const resetChecklist = () => {
        setCheckedDocs([]);
        try {
            localStorage.removeItem(storageKey);
        } catch {
            // ignore
        }
    };

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const filteredUniversities = destination.universities.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const readinessPercent = Math.round((checkedDocs.length / CHECKLIST_ITEMS.length) * 100);

    const jumpLinks = [
        { id: "overview", label: "Why Study Here" },
        { id: "universities", label: `Universities (${destination.universities.length})` },
        { id: "costs-visa", label: "Costs & Visa" },
        { id: "checklist", label: `Checklist (${checkedDocs.length}/${CHECKLIST_ITEMS.length})` },
        ...(relatedDestinations.length > 0 ? [{ id: "related", label: "Similar Countries" }] : []),
    ];

    return (
        <article className="min-h-screen pb-16 md:pb-0">
            {/* Hero Section */}
            <section className="relative h-[55vh] md:h-[65vh] flex items-end overflow-hidden">
                <Image
                    src={destination.heroImage}
                    alt={`Study in ${destination.name} - Campus life and education opportunities for Bangladeshi students`}
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent" />

                <div className="container mx-auto px-4 pb-10 md:pb-16 relative z-10">
                    <Link
                        href="/destinations"
                        className="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-white/80 hover:text-accent mb-5 transition-colors bg-white/10 backdrop-blur-md border border-white/15 px-3.5 min-h-[38px] rounded-full"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>All Destinations</span>
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-heading text-white mb-3 flex items-center gap-3">
                            {destination.flag && <span>{destination.flag}</span>}
                            <span>{t(`destinations.countries.${destination.slug}.heroTitle`, undefined, destination.heroTitle)}</span>
                        </h1>
                        <p className="text-base md:text-xl text-white/85 max-w-2xl leading-relaxed">
                            {t(`destinations.countries.${destination.slug}.heroDescription`, undefined, destination.heroDescription)}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Sticky Horizontal Section Jump-Bar */}
            <div className="sticky top-[4.5rem] z-30 bg-background/85 backdrop-blur-xl border-b border-border/60">
                <div className="container mx-auto px-4 flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-2 px-2 snap-x">
                        {jumpLinks.map((item) => {
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => scrollToSection(item.id)}
                                    className={cn(
                                        "px-3.5 min-h-[38px] rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 snap-start border",
                                        isActive
                                            ? "bg-accent text-slate-950 border-accent shadow-2xs"
                                            : "bg-card/70 text-muted-foreground border-border/60 hover:text-foreground hover:border-accent/40"
                                    )}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                    <Button
                        size="sm"
                        className="hidden md:inline-flex rounded-full px-4 h-9 text-xs font-semibold shrink-0 gap-1.5"
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

            {/* Benefits Section */}
            <section id="overview" className="py-16 md:py-24 bg-background scroll-mt-28">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-4">
                            {t("destinations.page.whyStudy", { country: t(`destinations.countries.${destination.slug}.name`, undefined, destination.name) }, `Why Study in ${destination.name}?`)}
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            {t("destinations.page.whyStudySubtitle", { country: t(`destinations.countries.${destination.slug}.name`, undefined, destination.name) }, `Discover the advantages that make ${destination.name} an ideal destination for Bangladeshi students.`)}
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {destination.benefits.map((benefit, index) => {
                            const BenefitIcon = iconMap[benefit.title] || Globe2;
                            return (
                                <motion.div
                                    key={benefit.title}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="surface-card p-6 rounded-2xl"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
                                        <BenefitIcon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold font-heading text-primary mb-2">
                                        {t(`destinations.benefits.${benefit.title}.title`, undefined, benefit.title)}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {t(`destinations.benefits.${benefit.title}.desc`, undefined, benefit.description)}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Universities Section */}
            <section id="universities" className="py-16 md:py-24 bg-surface/60 dark:bg-card/40 border-y border-border/50 scroll-mt-28">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-4">
                            Top Universities in {destination.name}
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Tap any university below to request a free eligibility check and admission roadmap for {destination.name}.
                        </p>
                    </motion.div>

                    {destination.universities.length >= 4 && (
                        <div className="max-w-md mx-auto mb-10 relative">
                            <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="search"
                                inputMode="search"
                                enterKeyHint="search"
                                placeholder={`Search ${destination.universities.length} universities...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full min-h-[46px] pl-11 pr-10 py-2.5 rounded-full border border-border bg-background/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    )}

                    {filteredUniversities.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            No universities matching &ldquo;{searchQuery}&rdquo;.
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                            {filteredUniversities.map((university, index) => (
                                <motion.button
                                    type="button"
                                    key={university.name}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.04 }}
                                    onClick={() =>
                                        openModal({
                                            destination: destination.name,
                                            topic: `University Admission - ${university.name}`,
                                        })
                                    }
                                    className="surface-card flex items-center justify-between gap-3.5 p-4 rounded-xl text-left group hover:border-accent/40 transition-all cursor-pointer active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-slate-950 transition-colors">
                                            <GraduationCap className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-sm md:text-base text-primary group-hover:text-accent transition-colors truncate">
                                            {university.name}
                                        </span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Key Costs, Intakes & Visa Snapshot Section */}
            <section id="costs-visa" className="py-16 md:py-24 bg-background scroll-mt-28">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="inline-block px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold tracking-wider uppercase mb-3">
                            Key Facts for Bangladeshi Students
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-3">
                            Tuition, Intakes & Visa Guide
                        </h2>
                        <p className="text-sm md:text-base text-muted-foreground">
                            Essential planning benchmarks for studying in {destination.name}.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
                        <div className="surface-card p-6 rounded-2xl flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                    Estimated Tuition
                                </p>
                                <h3 className="text-base font-bold text-primary leading-snug">
                                    {snapshot.tuition}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => openModal({ destination: destination.name, topic: `${destination.name} Tuition & Scholarships` })}
                                className="mt-4 pt-3 border-t border-border/40 text-xs font-semibold text-accent flex items-center gap-1 hover:underline text-left"
                            >
                                <span>Check scholarship options</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="surface-card p-6 rounded-2xl flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                    Primary Intakes
                                </p>
                                <h3 className="text-base font-bold text-primary leading-snug">
                                    {snapshot.intakes}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => openModal({ destination: destination.name, topic: `${destination.name} Next Intake Application` })}
                                className="mt-4 pt-3 border-t border-border/40 text-xs font-semibold text-accent flex items-center gap-1 hover:underline text-left"
                            >
                                <span>Apply for upcoming intake</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="surface-card p-6 rounded-2xl flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                    Work & Stay-Back Rights
                                </p>
                                <h3 className="text-base font-bold text-primary leading-snug">
                                    {snapshot.workRights}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => openModal({ destination: destination.name, topic: `${destination.name} Career & Work Visa Pathways` })}
                                className="mt-4 pt-3 border-t border-border/40 text-xs font-semibold text-accent flex items-center gap-1 hover:underline text-left"
                            >
                                <span>Explore career pathways</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="surface-card p-6 rounded-2xl flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                    Visa Processing Time
                                </p>
                                <h3 className="text-base font-bold text-primary leading-snug">
                                    {snapshot.visaTimeline}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => openModal({ destination: destination.name, topic: `${destination.name} Student Visa Support` })}
                                className="mt-4 pt-3 border-t border-border/40 text-xs font-semibold text-accent flex items-center gap-1 hover:underline text-left"
                            >
                                <span>Get visa file guidance</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Document Readiness Checklist Section */}
            <section id="checklist" className="py-16 md:py-24 bg-surface/60 dark:bg-card/40 border-y border-border/50 scroll-mt-28">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto surface-card rounded-3xl p-6 sm:p-8 md:p-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-2.5">
                                    <FileCheck className="w-3.5 h-3.5" />
                                    Interactive Preparation Tracker
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-primary">
                                    {destination.name} Admission & Visa Checklist
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Tap items you already have ready. Your progress is saved automatically on this device.
                                </p>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-3 bg-background/70 border border-border/60 rounded-2xl px-4 py-3 shrink-0">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Readiness Score</p>
                                    <p className="text-lg font-bold text-primary">
                                        {checkedDocs.length} / {CHECKLIST_ITEMS.length}{" "}
                                        <span className="text-xs font-semibold text-accent">({readinessPercent}%)</span>
                                    </p>
                                </div>
                                {checkedDocs.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={resetChecklist}
                                        className="p-2 min-w-[40px] min-h-[40px] rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
                                        aria-label="Reset checklist"
                                        title="Reset checklist"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mb-6">
                            <motion.div
                                initial={false}
                                animate={{ width: `${readinessPercent}%` }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                                className="h-full bg-accent rounded-full"
                            />
                        </div>

                        {/* Checklist Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                            {CHECKLIST_ITEMS.map((doc) => {
                                const isChecked = checkedDocs.includes(doc.id);
                                return (
                                    <button
                                        key={doc.id}
                                        type="button"
                                        onClick={() => toggleDoc(doc.id)}
                                        className={cn(
                                            "flex items-center justify-between gap-3 p-3.5 min-h-[54px] rounded-2xl border text-left transition-all active:scale-[0.99]",
                                            isChecked
                                                ? "bg-accent/12 border-accent/50 text-foreground"
                                                : "bg-background/60 border-border/60 text-muted-foreground hover:border-accent/30 hover:text-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className={cn(
                                                    "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                                                    isChecked
                                                        ? "bg-accent border-accent text-slate-950"
                                                        : "border-border bg-card"
                                                )}
                                            >
                                                {isChecked && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                                            </div>
                                            <span className={cn("text-xs sm:text-sm font-medium leading-snug", isChecked && "font-semibold text-primary")}>
                                                {doc.label}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground shrink-0">
                                            {doc.category}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-border/50">
                            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                                {checkedDocs.length === CHECKLIST_ITEMS.length
                                    ? "Awesome! Your core documents are ready for immediate university application."
                                    : "Missing a few documents or SOP/Bank Solvency? Our counselors will help you prepare them."}
                            </p>
                            <Button
                                className="rounded-full min-h-[46px] px-6 w-full sm:w-auto gap-2 shrink-0"
                                onClick={() =>
                                    openModal({
                                        destination: destination.name,
                                        topic: `${destination.name} Document Review (${checkedDocs.length}/${CHECKLIST_ITEMS.length} Ready)`,
                                    })
                                }
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Review My Checklist with a Counselor</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Destinations Section */}
            {relatedDestinations.length > 0 && (
                <section id="related" className="py-16 md:py-24 bg-background scroll-mt-28">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-4">
                                You Might Also Like
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Explore other popular destinations chosen by Bangladeshi students.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
                            {relatedDestinations.map((related, index) => (
                                <motion.div
                                    key={related.slug}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="h-full"
                                >
                                    <Link href={`/destinations/${related.slug}`} className="group block h-full">
                                        <div className="surface-card relative h-full overflow-hidden rounded-2xl hover:-translate-y-1 flex flex-col">
                                            {/* Image Wrapper */}
                                            <div className="relative h-48 overflow-hidden bg-slate-200/50 dark:bg-slate-800/50">
                                                <Image
                                                    src={related.heroImage}
                                                    alt={related.name}
                                                    fill
                                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                                                <div className="absolute bottom-4 left-4 text-white z-10">
                                                    <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                                                        <span>{related.flag}</span> {related.name}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="p-5 flex-grow flex flex-col justify-between">
                                                <div className="space-y-3 mb-5">
                                                    {related.benefits.slice(0, 2).map((benefit, i) => {
                                                        const BenefitIcon = iconMap[benefit.title] || Globe2;
                                                        return (
                                                            <div key={i} className="flex items-start gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 text-accent mt-0.5">
                                                                    <BenefitIcon className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-sm text-foreground">{benefit.title}</h4>
                                                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{benefit.description}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-accent group-hover:text-accent/80 transition-colors pt-3 border-t border-border/40">
                                                    <span>View Country Guide</span>
                                                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative p-8 md:p-12 rounded-3xl overflow-hidden border border-white/10 shadow-xl"
                    >
                        <div className="absolute inset-0 bg-[#0F172A]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(212,175,55,0.12)_0%,_transparent_65%)]" />

                        <div className="relative z-10 text-center max-w-2xl mx-auto">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-white mb-4">
                                Ready to Start Your Journey to {destination.name}?
                            </h2>
                            <p className="text-white/75 mb-8 text-sm md:text-base">
                                Book a free consultation with our expert counselors who specialize in {destination.name} admissions for Bangladeshi students.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                                <Button
                                    size="lg"
                                    variant="accent"
                                    className="rounded-full font-bold px-8"
                                    onClick={() =>
                                        openModal({
                                            destination: destination.name,
                                            topic: "University_Admission",
                                        })
                                    }
                                >
                                    Book Free Consultation
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full border-white/25 bg-white/[0.06] text-white hover:bg-white/15 hover:text-white px-8"
                                    asChild
                                >
                                    <Link href="/#services">
                                        Explore Our Services
                                    </Link>
                                </Button>
                            </div>

                            <div className="mt-8 flex flex-wrap justify-center gap-6 text-white/70 text-xs md:text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                    <span>Free Consultation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                    <span>Expert Guidance</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                    <span>98% Visa Success</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Sticky Mobile Bottom Action Bar (< md) */}
            <div
                className="fixed left-3.5 right-3.5 z-40 md:hidden transition-[bottom] duration-300"
                style={{
                    bottom: `calc(${tabBarVisible ? "5.25rem" : "0.75rem"} + env(safe-area-inset-bottom, 0px))`,
                }}
            >
                <div className="surface-card rounded-2xl px-3.5 py-2.5 border border-accent/35 shadow-xl flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-primary truncate flex items-center gap-1.5">
                            {destination.flag && <span>{destination.flag}</span>}
                            <span>Study in {destination.name}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                            {checkedDocs.length}/{CHECKLIST_ITEMS.length} checklist ready - Free evaluation
                        </p>
                    </div>
                    <Button
                        size="sm"
                        className="rounded-xl px-4 min-h-[40px] text-xs font-bold shrink-0 gap-1.5"
                        onClick={() =>
                            openModal({
                                destination: destination.name,
                                topic: `Study in ${destination.name}`,
                            })
                        }
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Free Assessment</span>
                    </Button>
                </div>
            </div>
        </article>
    );
}
