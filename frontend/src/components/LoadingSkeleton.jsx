/**
 * LoadingSkeleton – shimmer-animated skeleton placeholders
 * matching the actual ProductCard layout so there's no layout shift (CLS = 0).
 */
export const LoadingSkeleton = ({ type = 'product' }) => {
    if (type === 'product') {
        return (
            <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-slate-100 h-full" aria-hidden="true">
                {/* Image placeholder – matches aspect-square */}
                <div className="aspect-square w-full bg-slate-100 animate-pulse" />
                {/* Content placeholder */}
                <div className="p-3 sm:p-4 flex flex-col gap-3 flex-grow">
                    <div className="h-4 bg-slate-100 rounded animate-pulse w-4/5" />
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-3/5" />
                    <div className="h-5 bg-slate-100 rounded animate-pulse w-2/5" />
                    <div className="mt-auto h-9 bg-slate-100 rounded-lg animate-pulse w-full" />
                </div>
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className="space-y-4" aria-hidden="true">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 w-full bg-slate-100 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    return <div className="h-64 w-full bg-slate-100 rounded-lg animate-pulse" aria-hidden="true" />;
};
