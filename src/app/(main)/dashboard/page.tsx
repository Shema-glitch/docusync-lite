
'use client';

import { DocumentTable } from '@/components/document-table';
import { PinnedDocuments } from '@/components/dashboard/pinned-documents';
import { SummaryPanel } from '@/components/dashboard/summary-panel';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentCardSkeleton } from '@/components/document-card-skeleton';

export default function DashboardPage() {
  const { documents, loading } = useDocuments();

  const activeDocuments = documents.filter((doc) => doc.status === 'active');
  const favoriteDocuments = activeDocuments.filter((doc) => doc.isFavorite);

  return (
    <div className="flex flex-col gap-6">
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[109px] w-full" />
          ))}
        </div>
      ) : (
        <SummaryPanel documents={activeDocuments} />
      )}

      {loading ? (
         <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <DocumentCardSkeleton key={i} />
                  ))}
                </div>
            </CardContent>
        </Card>
      ) : (
        <PinnedDocuments documents={favoriteDocuments} />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
        </CardHeader>
        <CardContent>
           {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                  <DocumentCardSkeleton key={i} />
                ))}
            </div>
           ) : (
             <DocumentTable documents={activeDocuments} />
           )}
        </CardContent>
      </Card>
    </div>
  );
}
