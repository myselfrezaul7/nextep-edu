import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <div className="mb-6 relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-50 animate-pulse"></div>
                <MapPinOff className="w-24 h-24 text-primary relative z-10" />
            </div>
            <h1 className="text-6xl font-black text-primary mb-2 font-heading">404</h1>
            <h2 className="text-3xl font-bold mb-4">Destination Unknown</h2>
            <p className="text-muted-foreground max-w-md mb-8 text-lg">
                Looks like this route hasn't been mapped yet. Don't worry, we can help you find your way back to your dream university.
            </p>
            <div className="flex gap-4">
                <Button size="lg" asChild className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                    <Link href="/">Return to Base</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <Link href="/destinations">Explore Countries</Link>
                </Button>
            </div>
        </div>
    );
}
