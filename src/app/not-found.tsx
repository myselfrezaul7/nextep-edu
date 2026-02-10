import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Page Not Found | NexTep Edu",
    description: "The page you are looking for could not be found.",
};

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="mb-8">
                    <h1 className="text-8xl font-bold text-accent mb-4 font-heading">404</h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-accent to-yellow-400 mx-auto rounded-full" />
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-heading">
                    Page Not Found
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                    Looks like this page took a study break! Let&apos;s get you back on track.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/destinations"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-border text-primary font-bold hover:bg-muted transition-colors"
                    >
                        Explore Destinations
                    </Link>
                </div>
            </div>
        </div>
    );
}
