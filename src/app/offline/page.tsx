"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, Home, Globe2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
    return (
        <section className="min-h-[75vh] flex items-center justify-center px-4 py-12">
            <div className="surface-card max-w-md w-full rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/25 text-accent flex items-center justify-center mx-auto">
                    <WifiOff className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-heading text-primary">
                        You&apos;re Currently Offline
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Your internet connection dropped. Reconnect to mobile data or Wi-Fi to load the latest country guides, application status, and document uploads.
                    </p>
                </div>

                <div className="space-y-2.5 pt-2">
                    <Button
                        size="lg"
                        className="w-full min-h-[48px] rounded-xl font-bold gap-2"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Try Again</span>
                    </Button>

                    <div className="grid grid-cols-2 gap-2.5">
                        <Button
                            variant="outline"
                            className="min-h-[44px] rounded-xl text-xs font-semibold gap-1.5"
                            asChild
                        >
                            <Link href="/">
                                <Home className="w-4 h-4" />
                                <span>Home</span>
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="min-h-[44px] rounded-xl text-xs font-semibold gap-1.5"
                            asChild
                        >
                            <Link href="/destinations">
                                <Globe2 className="w-4 h-4" />
                                <span>Destinations</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/60 text-xs text-muted-foreground space-y-1.5">
                    <p>Need urgent counselor support once back online?</p>
                    <a
                        href="https://wa.me/4915147483493"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp: +49 151 47483493</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
