"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, GraduationCap, CheckCircle, Globe2, Trophy, Clock, Users, BookOpen, Wallet, Sun, Coffee, MapPin, Landmark, Train, Building2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "@/i18n/LanguageContext";

interface SerializedDestination {
    slug: string;
    name: string;
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

export function DestinationPageClient({ destination, relatedDestinations = [] }: DestinationPageClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const { t } = useTranslation();

    const filteredUniversities = destination.universities.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <article className="min-h-screen">
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

                <div className="container mx-auto px-4 pb-12 md:pb-16 relative z-10">
                    <Link
                        href="/destinations"
                        className="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-white/80 hover:text-accent mb-6 transition-colors bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>All Destinations</span>
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-heading text-white mb-4">
                            {t(`destinations.countries.${destination.slug}.heroTitle`, undefined, destination.heroTitle)}
                        </h1>
                        <p className="text-base md:text-xl text-white/85 max-w-2xl leading-relaxed">
                            {t(`destinations.countries.${destination.slug}.heroDescription`, undefined, destination.heroDescription)}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 md:py-24 bg-background">
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
            <section className="py-16 md:py-24 bg-surface/60 dark:bg-card/40 border-y border-border/50">
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
                            We partner with leading universities to help Bangladeshi students achieve their academic goals.
                        </p>
                    </motion.div>

                    {destination.universities.length >= 5 && (
                        <div className="max-w-md mx-auto mb-10 relative">
                            <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder={`Search ${destination.universities.length} universities...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-10 py-3 rounded-full border border-border bg-background/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
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
                                <motion.div
                                    key={university.name}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.04 }}
                                    className="surface-card flex items-center gap-3.5 p-4 rounded-xl"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium text-sm md:text-base text-primary">{university.name}</span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Related Destinations Section */}
            {relatedDestinations.length > 0 && (
                <section className="py-16 md:py-24 bg-background">
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
                                    onClick={() => window.dispatchEvent(new CustomEvent("open-booking-modal"))}
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
        </article>
    );
}
