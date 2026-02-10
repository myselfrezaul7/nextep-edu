export default function DestinationLoading() {
    return (
        <div className="min-h-screen animate-pulse">
            {/* Hero Skeleton */}
            <div className="relative h-[60vh] md:h-[70vh] bg-muted" />

            {/* Benefits Skeleton */}
            <div className="py-16 md:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="h-10 w-80 bg-muted rounded-lg mx-auto mb-4" />
                        <div className="h-5 w-96 bg-muted rounded-lg mx-auto" />
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-card/95 p-6 rounded-2xl border border-border/30">
                                <div className="w-12 h-12 rounded-xl bg-muted mb-4" />
                                <div className="h-5 w-32 bg-muted rounded mb-2" />
                                <div className="h-4 w-full bg-muted rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Universities Skeleton */}
            <div className="py-16 md:py-24 bg-surface dark:bg-card/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="h-10 w-72 bg-muted rounded-lg mx-auto mb-4" />
                        <div className="h-5 w-80 bg-muted rounded-lg mx-auto" />
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-card/95 rounded-xl border border-border/30">
                                <div className="w-10 h-10 rounded-lg bg-muted" />
                                <div className="h-5 w-40 bg-muted rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
