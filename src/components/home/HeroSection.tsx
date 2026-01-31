"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden py-16 md:py-32">
            {/* Background Blur Effect */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(212,175,55,0.2)_0%,_transparent_70%)] -z-10 pointer-events-none" />

            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className="space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-6xl font-bold font-heading text-primary leading-tight"
                    >
                        That Uni You've Been Dreaming About? <span className="text-accent underline decoration-4 underline-offset-4">Let's Make It Happen.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-xl md:text-2xl font-medium italic text-accent"
                    >
                        One step, no limits.
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg text-muted-foreground max-w-lg leading-relaxed"
                    >
                        Look, we get it. Applying abroad feels overwhelming. So many forms, so many questions, so many "what ifs." That's exactly why we're here. We've walked this path ourselves, and now we help students like you navigate it. No fancy jargon. No hidden costs. Just real people giving you real guidance.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-wrap gap-4 pt-4"
                    >
                        <Button
                            size="lg"
                            className="rounded-full text-base"
                            onClick={() => document.getElementById('booking-modal')?.classList.remove('hidden')}
                        >
                            Let's Talk
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full text-base"
                            asChild
                        >
                            <Link href="/#services">
                                See What We Do
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                {/* Hero Image */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{
                        opacity: 1,
                        x: 0,
                        y: [0, -15, 0] // Floating breathing effect
                    }}
                    transition={{
                        opacity: { duration: 0.8, delay: 0.2 },
                        x: { duration: 0.8, delay: 0.2 },
                        y: {
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }
                    }}
                    className="relative group perspective-1000"
                >
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:rotate-y-0 -rotate-y-6 bg-white p-2 border border-white/20">
                        <Image
                            src="/assets/hero-library.png"
                            alt="Students studying in a modern library"
                            width={600}
                            height={400}
                            className="rounded-xl w-full h-auto object-cover"
                            priority
                        />
                    </div>
                    {/* Decorative element behind image */}
                    <div className="absolute -inset-4 bg-accent/10 rounded-3xl -z-10 blur-xl opacity-70" />
                </motion.div>
            </div>
        </section>
    );
}
