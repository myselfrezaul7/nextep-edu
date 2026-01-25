import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <h1 className="text-6xl font-black text-primary mb-4 font-heading">404</h1>
            <h2 className="text-2xl font-bold mb-6">Page Not Found</h2>
            <p className="text-muted-foreground max-w-md mb-8">
                Oops! The page you're looking for doesn't exist. Maybe it went on a study abroad trip without telling us.
            </p>
            <div className="flex gap-4">
                <Button asChild>
                    <Link href="/">Back Home</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/destinations">Explore Destinations</Link>
                </Button>
            </div>
        </div>
    );
}
