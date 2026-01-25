"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 py-16">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Brand */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-md overflow-hidden bg-white p-0.5">
                            <Image src="/assets/logo.png" alt="Logo" fill className="object-contain" />
                        </div>
                        <span className="font-heading font-bold text-xl text-white">NexTep Edu</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-400">
                        Your trusted partner for global education. We simplify the journey from application to admission.
                    </p>
                    <div className="flex gap-4 pt-2">
                        <a href="https://facebook.com/nextepbd" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><Facebook className="w-5 h-5" /></a>
                        <a href="https://instagram.com/nextepedu" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><Instagram className="w-5 h-5" /></a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-white font-bold mb-6">Quick Links</h4>
                    <ul className="space-y-3 text-sm">
                        <li><Link href="/" className="hover:text-accent transition-colors">Home</Link></li>
                        <li><Link href="/#services" className="hover:text-accent transition-colors">Services</Link></li>
                        <li><Link href="/#about" className="hover:text-accent transition-colors">About Us</Link></li>
                        <li><Link href="/destinations" className="hover:text-accent transition-colors">Destinations</Link></li>
                    </ul>
                </div>

                {/* Destinations */}
                <div>
                    <h4 className="text-white font-bold mb-6">Popular Destinations</h4>
                    <ul className="space-y-3 text-sm">
                        <li><Link href="/destinations/uk" className="hover:text-accent transition-colors">United Kingdom</Link></li>
                        <li><Link href="/destinations/usa" className="hover:text-accent transition-colors">USA</Link></li>
                        <li><Link href="/destinations/canada" className="hover:text-accent transition-colors">Canada</Link></li>
                        <li><Link href="/destinations/australia" className="hover:text-accent transition-colors">Australia</Link></li>
                        <li><Link href="/destinations/germany" className="hover:text-accent transition-colors">Germany</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-white font-bold mb-6">Contact Us</h4>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-start gap-3">
                            <Phone className="w-4 h-4 mt-1 text-accent" />
                            <span>+49 157 73855748</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Mail className="w-4 h-4 mt-1 text-accent" />
                            <span>info@nextepedu.com</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 mt-1 text-accent" />
                            <span>Dhaka, Bangladesh</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
                &copy; {new Date().getFullYear()} NexTep Edu. All rights reserved.
            </div>
        </footer>
    );
}
