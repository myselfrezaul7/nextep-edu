"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";

export function NotFoundContent() {
    const { t } = useTranslation();

    return (
        <div className="relative min-h-[70vh] flex items-center justify-center px-4 overflow-hidden">
            {/* Particle Dots */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-accent rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 text-center max-w-md">
                <div className="mb-8">
                    <motion.h1 
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="text-8xl font-bold text-accent mb-4 font-heading"
                    >
                        404
                    </motion.h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-accent to-yellow-400 dark:to-yellow-600 mx-auto rounded-full" />
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-heading">
                    {t("common.error.notFoundTitle", undefined, "Page Not Found")}
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                    {t("common.error.notFoundDesc", undefined, "Looks like this page took a study break! Let's get you back on track.")}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
                    >
                        {t("common.error.goHome", undefined, "Go Home")}
                    </Link>
                    <Link
                        href="/destinations"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-border text-primary font-bold hover:bg-muted transition-colors"
                    >
                        {t("common.error.exploreDestinations", undefined, "Explore Destinations")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
