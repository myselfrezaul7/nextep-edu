import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { BookingButton } from "@/components/common/BookingButton";
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
    // Fix key mismatch for canada if it exists as 'canvas' in data vs 'canada' in param
    const destination = destinations[country] || (country === 'canada' ? destinations['canvas'] : undefined);

    if (!destination) {
        return notFound();
    }

    const { hero, benefits, universities, heroImage } = destination;

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={heroImage}
                        alt={`${destination.name} Scenery`}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <h1 className="text-4xl md:text-7xl font-bold font-heading mb-6 drop-shadow-md">{hero.title}</h1>
                    <p className="text-xl md:text-2xl max-w-2xl mx-auto text-white/90 leading-relaxed font-light drop-shadow">
                        {hero.description}
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <BookingButton size="lg" className="text-lg px-8 py-6 shadow-xl shadow-primary/20">
                            Apply Now
                        </BookingButton>
                        <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white/10 text-white hover:bg-white/20 border-white/20 backdrop-blur-md" asChild>
                            <a href="#universities">View Universities</a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 -mt-32 relative z-20">
                        {benefits.map((benefit, i) => (
                            <div key={i} className="bg-card p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6 text-accent">
                                    <benefit.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-primary">{benefit.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Universities Section */}
            <section id="universities" className="py-24 bg-surface">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-primary">Top Universities in {destination.name}</h2>
                        <p className="text-muted-foreground">We help you apply to these world-class institutions.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {universities.map((uni, i) => (
                            <div key={uni.name} className="group bg-card p-6 rounded-xl border border-border hover:border-accent/50 hover:shadow-md transition-all flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-5 h-5 text-primary" />
                                </div>
                                <span className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                                    {uni.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section (Glassmorphism) */}
            <section className="py-24 relative overflow-hidden flex items-center justify-center">
                {/* Background Image (Blurred) */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src={heroImage}
                        alt="Background"
                        fill
                        className="object-cover opacity-30 blur-xl"
                    />
                    <div className="absolute inset-0 bg-background/60" />
                </div>

                <div className="container mx-auto px-4 relative z-10 w-full max-w-4xl">
                    {/* Glass Card */}
                    <div className="bg-white/20 dark:bg-black/40 backdrop-blur-xl border border-white/30 dark:border-white/10 p-12 rounded-3xl text-center shadow-2xl">
                        <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-foreground">Ready to start your journey?</h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Your dream university in {destination.name} is just a click away. Book a free consultation with our experts today.
                        </p>
                        <BookingButton size="lg" className="text-lg px-8 py-6 shadow-xl">
                            Book Free Consultation
                        </BookingButton>
                    </div>
                </div>
            </section>
        </div>
    );
}
