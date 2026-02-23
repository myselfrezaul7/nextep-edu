"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
    return (
        <footer className="relative z-10 bg-background transition-colors duration-300">
            {/* CTA Banner */}
            <div className="relative overflow-hidden">
                {/* Solid opaque dark background — no bleed-through in light mode */}
                <div className="absolute inset-0 bg-[#0F172A] pointer-events-none" />
                {/* Frosted glass inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(212,175,55,0.15)_0%,_transparent_60%)] pointer-events-none" />
                <div className="container mx-auto px-4 py-12 md:py-16 relative z-10 text-center">
                    <h3 className="text-2xl md:text-3xl font-bold font-heading text-white mb-3">
                        Ready to Start Your Journey?
                    </h3>
                    <p className="text-white/70 mb-6 max-w-lg mx-auto text-sm md:text-base">
                        Book a free consultation and take the first step toward studying abroad.
                    </p>
                    <Button
                        size="lg"
                        className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-base px-8 shadow-lg"
                        onClick={() => document.getElementById('booking-modal')?.classList.remove('hidden')}
                    >
                        Book Free Consultation
                    </Button>
                </div>
            </div>

            {/* Gold gradient divider */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

            {/* Main Footer Content */}
            <div className="bg-background/75 backdrop-blur-lg py-16 border-t border-border/30">
                <div className="container mx-auto px-4">
                    {/* Brand */}
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative w-8 h-8 rounded-md overflow-hidden bg-white/50 p-0.5 border border-gray-200 dark:border-transparent">
                                <Image src="/assets/logo.png" alt="Logo" fill className="object-contain" />
                            </div>
                            <span className="font-heading font-bold text-xl text-foreground">NexTep Edu</span>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground max-w-md">
                            Your trusted partner for global education. We simplify the journey from application to admission.
                        </p>
                    </div>

                    {/* Links Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                        {/* Quick Links */}
                        <div>
                            <h4 className="text-foreground font-bold mb-6">Quick Links</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/" className="text-muted-foreground hover:text-accent hover:translate-x-1 transition-all duration-200 inline-block">Home</Link></li>
                                <li><Link href="/#services" className="text-muted-foreground hover:text-accent hover:translate-x-1 transition-all duration-200 inline-block">Services</Link></li>
                                <li><Link href="/#about" className="text-muted-foreground hover:text-accent hover:translate-x-1 transition-all duration-200 inline-block">About Us</Link></li>
                                <li><Link href="/destinations" className="text-muted-foreground hover:text-accent hover:translate-x-1 transition-all duration-200 inline-block">Destinations</Link></li>
                            </ul>
                        </div>

                        {/* Destinations */}
                        <div>
                            <h4 className="text-foreground font-bold mb-6">Popular Destinations</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/destinations/uk" className="text-muted-foreground hover:text-accent hover:translate-x-1 transition-all duration-200 inline-block">United Kingdom</Link></li>
                                <li><Link href="/destinations/usa" className="text-muted-foreground hover:text-accent hover:translate-x-1 transition-all duration-200 inline-block">USA</Link></li>
                                <li><Link href="/destinations/canada" className="text-muted-foreground hover:text-accent hover:translate-x-1 transition-all duration-200 inline-block">Canada</Link></li>
                                <li><Link href="/destinations/australia" className="text-muted-foreground hover:text-accent hover:translate-x-1 transition-all duration-200 inline-block">Australia</Link></li>
                                <li><Link href="/destinations/germany" className="text-muted-foreground hover:text-accent hover:translate-x-1 transition-all duration-200 inline-block">Germany</Link></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="col-span-2 md:col-span-1 flex flex-col items-start">
                            <h4 className="text-foreground font-bold mb-6">Contact Us</h4>
                            <ul className="space-y-4 text-sm">
                                <li className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 mt-1 text-accent" />
                                    <a href="https://wa.me/4915147483493" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">+49 151 47483493</a>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Mail className="w-4 h-4 mt-1 text-accent" />
                                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=info@nextepedu.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">info@nextepedu.com</a>
                                </li>
                                <li className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 mt-1 text-accent" />
                                    <span className="text-muted-foreground">1500, Munshiganj, Dhaka, Bangladesh</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border/30">
                <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} NexTep Edu. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://facebook.com/nextepbd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-[#1877F2] hover:scale-110 transition-all duration-300"
                        >
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a
                            href="https://instagram.com/nextepedu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-[#E1306C] hover:scale-110 transition-all duration-300"
                        >
                            <Instagram className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
