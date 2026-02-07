"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, GraduationCap, CheckCircle, Globe2, Trophy, Clock, Users, BookOpen, Wallet, Sun, Coffee, MapPin, Landmark, Train, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SerializedDestination {
    slug: string;
    name: string;
    heroImage: string;
    heroTitle: string;
    heroDescription: string;
    benefits: { title: string; description: string }[];
    universities: { name: string }[];
}

interface DestinationPageClientProps {
    destination: SerializedDestination;
}

// Map benefit titles to icons
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

export function DestinationPageClient({ destination }: DestinationPageClientProps) {
    return (
        <article className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[60vh] md:h-[70vh] flex items-end overflow-hidden">
                <Image
                    src={destination.heroImage}
                    alt={`Study in ${destination.name} - Campus life and education opportunities for Bangladeshi students`}
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                <div className="container mx-auto px-4 pb-12 md:pb-16 relative z-10">
                    <Link
                        href="/#destinations"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Destinations
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-accent/20 backdrop-blur-sm flex items-center justify-center text-accent">
                                <Globe2 className="w-6 h-6" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold font-heading text-white mb-4">
                            {destination.heroTitle}
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                            {destination.heroDescription}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 md:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-4">
                            Why Study in {destination.name}?
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Discover the advantages that make {destination.name} an ideal destination for Bangladeshi students.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {destination.benefits.map((benefit, index) => {
                            const BenefitIcon = iconMap[benefit.title] || Globe2;
                            return (
                                <motion.div
                                    key={benefit.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-card/95 backdrop-blur-xl p-6 rounded-2xl border border-border/30 hover:border-accent/30 shadow-lg transition-all duration-300"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                                        <BenefitIcon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-primary mb-2">{benefit.title}</h3>
                                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Universities Section */}
            <section className="py-16 md:py-24 bg-surface dark:bg-card/50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary mb-4">
                            Top Universities in {destination.name}
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            We partner with leading universities to help Bangladeshi students achieve their academic goals.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {destination.universities.map((university, index) => (
                            <motion.div
                                key={university.name}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 p-4 bg-card/95 backdrop-blur-xl rounded-xl border border-border/30"
                            >
                                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-primary">{university.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative bg-gradient-to-br from-primary to-slate-800 dark:from-accent/20 dark:to-primary/20 p-8 md:p-12 rounded-3xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(212,175,55,0.1)_0%,_transparent_50%)]" />

                        <div className="relative z-10 text-center max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
                                Ready to Start Your Journey to {destination.name}?
                            </h2>
                            <p className="text-white/80 mb-8">
                                Book a free consultation with our expert counselors who specialize in {destination.name} admissions for Bangladeshi students.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    className="rounded-full bg-accent hover:bg-accent/90 text-slate-900"
                                    onClick={() => document.getElementById('booking-modal')?.classList.remove('hidden')}
                                >
                                    Book Free Consultation
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full border-white/30 text-white hover:bg-white/10"
                                    asChild
                                >
                                    <Link href="/#services">
                                        Explore Our Services
                                    </Link>
                                </Button>
                            </div>

                            <div className="mt-8 flex flex-wrap justify-center gap-6 text-white/70 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                    Free Consultation
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                    Expert Guidance
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                    98% Visa Success
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </article>
    );
}
