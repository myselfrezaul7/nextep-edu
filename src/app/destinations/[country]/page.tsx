import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { destinations } from "@/data/destinations";
import { CheckCircle, ChevronDown, Check } from "lucide-react";

type Props = {
    params: Promise<{ country: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { country } = await params;
    const destination = destinations[country];

    if (!destination) {
        return {
            title: "Destination Not Found",
        };
    }

    return {
        title: `Study in ${destination.name} | NexTep Edu`,
        description: destination.hero.description,
    };
}

export default async function DestinationPage({ params }: Props) {
    const { country } = await params;
    const destination = destinations[country];

    if (!destination) {
        return notFound();
    }

    const { hero, benefits, universities } = destination;
    const Icon = hero.icon;

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 bg-surface dark:bg-card overflow-hidden">
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h1 className="text-4xl md:text-6xl font-bold font-heading text-primary">{hero.title}</h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">{hero.description}</p>
                        <div className="flex gap-4 pt-4">
                            <Button
                                size="lg"
                                onClick={() => document.getElementById('booking-modal')?.classList.remove('hidden')} // DOM-based trigger as per quick-port
                            >
                                Let's Talk
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <a href="#why">Why {destination.name}?</a>
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="w-full max-w-sm aspect-square bg-accent/10 rounded-3xl flex items-center justify-center p-12 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Icon className="w-32 h-32 text-accent" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="why" className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-primary">Why Students Love {destination.name}</h2>
                        <p className="text-muted-foreground">Beyond the stereotypes, here's what actually makes {destination.name} great for studying.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {benefits.map((benefit, i) => (
                            <div key={i} className="bg-surface dark:bg-slate-800/50 p-8 rounded-2xl border border-border/50 hover:border-accent hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 text-accent">
                                    <benefit.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-primary">{benefit.title}</h3>
                                <p className="text-sm text-muted-foreground">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Universities Section */}
            <section className="py-24 bg-surface dark:bg-card">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-primary">Universities We Work With</h2>
                        <p className="text-muted-foreground">From historic institutions to cutting-edge research hubs — take your pick.</p>
                    </div>

                    <div className="grid gap-4 max-w-3xl mx-auto">
                        {universities.map((uni, i) => (
                            <details key={uni.name} className="group bg-background border border-border rounded-xl open:ring-2 open:ring-accent/20 transition-all">
                                <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-lg md:text-xl text-primary marker:bg-none">
                                    <span className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-accent" />
                                        {uni.name}
                                    </span>
                                    <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="px-6 pb-6 pt-2 border-t border-border/50">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Campus</span>
                                            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                                                <Image src={uni.campusImage} alt={`${uni.name} Campus`} fill className="object-cover" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Atmosphere</span>
                                            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                                                <Image src={uni.atmosphereImage} alt={`${uni.name} Atmosphere`} fill className="object-cover" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-primary text-primary-foreground text-center relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">Fancy Studying in {destination.name}?</h2>
                    <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                        Drop us a message. We'll chat about your options, answer your questions, and help you figure out if {destination.name} is the right fit for you.
                    </p>
                    <Button size="lg" variant="secondary" onClick={() => document.getElementById('booking-modal')?.classList.remove('hidden')}>
                        Book a Free Chat
                    </Button>
                </div>
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-accent/10 pointer-events-none" />
            </section>
        </div>
    );
}
