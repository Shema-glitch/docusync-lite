
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentCardSkeleton } from '@/components/document-card-skeleton';

export default function SearchLoading() {
    return (
        <div className="flex flex-col gap-6">
            {/* Filter Skeleton */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <Skeleton className="h-10 w-full md:w-48" />
                <Skeleton className="h-10 w-full md:w-48" />
                <Skeleton className="h-10 w-full md:w-64" />
                <Skeleton className="h-10 w-24" />
            </div>

            {/* Results Header Skeleton */}
            <div>
                <Skeleton className="h-8 w-80 mb-2" />
                <Skeleton className="h-5 w-48" />
            </div>

            {/* Document List Skeleton */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {[...Array(10)].map((_, i) => (
                    <DocumentCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
