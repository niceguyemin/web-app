export default function ClientsLoading() {
    return (
        <div className="p-4 md:p-8 space-y-4 md:space-y-8">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse"></div>
                    <div className="h-4 w-64 bg-white/5 rounded-lg animate-pulse"></div>
                </div>
                <div className="h-10 w-full sm:w-40 bg-white/10 rounded-xl animate-pulse"></div>
            </div>

            {/* Search Skeleton */}
            <div className="h-10 w-full sm:w-64 bg-white/10 rounded-xl animate-pulse"></div>

            {/* Table Skeleton */}
            <div className="rounded-xl border border-white/10 glass-card overflow-hidden">
                <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="h-12 flex-1 bg-white/5 rounded-lg animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
