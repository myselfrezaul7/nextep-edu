import { Suspense } from "react";
import { Metadata } from "next";
import { TrackPageClient } from "./TrackPageClient";

export const metadata: Metadata = {
    title: "Track Your Application | NexTep Edu",
    description:
        "Track your study abroad application status in real-time. Enter your tracking code or phone number to see the latest updates on your NexTep Edu application.",
    alternates: {
        canonical: "https://www.nextepedu.com/track",
    },
};

export default function TrackPage() {
    return (
        <Suspense
            fallback={
                <section className="relative min-h-[80vh] flex items-center justify-center py-16 md:py-24 px-4">
                    <div className="w-full max-w-md rounded-2xl p-8 border border-black/5 dark:border-white/10 bg-white/60 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg animate-pulse space-y-5">
                        <div className="h-7 w-2/3 mx-auto rounded-lg bg-muted-foreground/15" />
                        <div className="h-4 w-4/5 mx-auto rounded-lg bg-muted-foreground/10" />
                        <div className="h-11 w-full rounded-xl bg-muted-foreground/10" />
                        <div className="h-11 w-full rounded-xl bg-muted-foreground/10" />
                        <div className="h-12 w-full rounded-xl bg-accent/20" />
                    </div>
                </section>
            }
        >
            <TrackPageClient />
        </Suspense>
    );
}
