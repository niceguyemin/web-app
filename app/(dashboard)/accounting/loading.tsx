export default function AccountingLoading() {
    return (
        <div className="p-4 md:p-8 space-y-4 md:space-y-8">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
                <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse"></div>
                <div className="h-6 w-40 bg-white/5 rounded-lg animate-pulse"></div>
            </div>

            {/* Summary Cards Skeleton */}
            <div className="grid gap-3 md:gap-4 grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="glass-card border-0 p-3 md:p-6 space-y-2">
                        <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
                        <div className="h-8 w-32 bg-white/10 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-white/5 rounded animate-pulse"></div>
                    </div>
                ))}
            </div>

            {/* Tabs Skeleton */}
            <div className="space-y-4">
                <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-10 w-24 bg-white/10 rounded-lg animate-pulse"></div>
                    ))}
                </div>

                {/* Content Skeleton */}
                <div className="glass-card border-0 p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
