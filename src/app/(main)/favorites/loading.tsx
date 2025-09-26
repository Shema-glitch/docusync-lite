
import { Skeleton } from '@/components/ui/skeleton';

export default function FavoritesLoading() {
    return (
        <div className="flex flex-col h-full">
            <Skeleton className="h-9 w-48 mb-4" />
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );
}
