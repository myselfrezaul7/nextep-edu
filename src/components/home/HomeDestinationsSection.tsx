"use client";

import { DestinationsGrid } from "@/components/destinations/DestinationsGrid";
import { useTranslation } from "@/i18n/LanguageContext";

export function HomeDestinationsSection() {
    const { t } = useTranslation();

    return (
        <section
            id="destinations"
            className="py-16 md:py-28 bg-surface/60 dark:bg-card/40 border-y border-border/50 cv-auto"
        >
            <div className="container mx-auto px-4">
                <div className="text-center mb-10 md:mb-14">
                    <span className="inline-block px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold tracking-wider uppercase mb-4">
                        {t("home.destinations.badge", undefined, "Study Abroad Destinations")}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold font-heading text-primary mb-4">
                        {t("home.destinations.title", undefined, "Where Do You Want to Study?")}
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t(
                            "home.destinations.subtitle",
                            undefined,
                            "Explore top study destinations for Bangladeshi students. Each country offers unique opportunities for your academic journey."
                        )}
                    </p>
                </div>
                <DestinationsGrid featuredOnly={true} />
            </div>
        </section>
    );
}
