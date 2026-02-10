"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative z-10 bg-background/75 backdrop-blur-lg border-t border-border text-foreground py-16 transition-colors duration-300">
            <div className="container mx-auto px-4">
                {/* Brand - Full width on all devices */}
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

                {/* Quick Links and Destinations - Side by side on mobile, part of 3-col on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                    {/* Quick Links */}
                    <div>
                        <h4 className="text-foreground font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/" className="hover:text-accent transition-colors">Home</Link></li>
                            <li><Link href="/#services" className="hover:text-accent transition-colors">Services</Link></li>
                            <li><Link href="/#about" className="hover:text-accent transition-colors">About Us</Link></li>
                            <li><Link href="/destinations" className="hover:text-accent transition-colors">Destinations</Link></li>
                        </ul>
                    </div>

                    {/* Destinations */}
                    <div>
                        <h4 className="text-foreground font-bold mb-6">Popular Destinations</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/destinations/uk" className="hover:text-accent transition-colors">United Kingdom</Link></li>
                            <li><Link href="/destinations/usa" className="hover:text-accent transition-colors">USA</Link></li>
                            <li><Link href="/destinations/canada" className="hover:text-accent transition-colors">Canada</Link></li>
                            <li><Link href="/destinations/australia" className="hover:text-accent transition-colors">Australia</Link></li>
                            <li><Link href="/destinations/germany" className="hover:text-accent transition-colors">Germany</Link></li>
                        </ul>
                    </div>

                    {/* Contact - Left aligned on all screen sizes */}
                    <div className="col-span-2 md:col-span-1 flex flex-col items-start">
                        <h4 className="text-foreground font-bold mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <Phone className="w-4 h-4 mt-1 text-accent" />
                                <a href="https://wa.me/4915773855748" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">+49 157 73855748</a>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="w-4 h-4 mt-1 text-accent" />
                                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=info@nextepedu.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">info@nextepedu.com</a>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 mt-1 text-accent" />
                                <span>Dhaka, Bangladesh</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-200 dark:border-slate-800 text-center">
                <div className="flex justify-center gap-4 mb-4">
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
                        className="text-muted-foreground hover:text-transparent hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:bg-clip-text hover:scale-110 transition-all duration-300"
                    >
                        <Instagram className="w-5 h-5" />
                    </a>
                </div>
                <p className="text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} NexTep Edu. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
