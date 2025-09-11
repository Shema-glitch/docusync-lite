
'use client';

import { DocumentTable } from '@/components/document-table';
import { PinnedDocuments } from '@/components/dashboard/pinned-documents';
import { SummaryPanel } from '@/components/dashboard/summary-panel';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DocumentCardSkeleton } from '@/components/document-card-skeleton';

export default function DashboardPage() {
  const { documents, loading } = useDocuments();

  const activeDocuments = documents.filter((doc) => doc.status === 'active');
  const favoriteDocuments = activeDocuments.filter((doc) => doc.isFavorite);

  return (
    <div className="flex flex-col gap-6">
      <SummaryPanel documents={activeDocuments} />
      <PinnedDocuments documents={favoriteDocuments} loading={loading} />
      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
        </CardHeader>
        <CardContent>
        {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
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
