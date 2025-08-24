
'use client';

import { DocumentTable } from '@/components/document-table';
import { PinnedDocuments } from '@/components/dashboard/pinned-documents';
import { SummaryPanel } from '@/components/dashboard/summary-panel';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const { documents } = useDocuments();

  const activeDocuments = documents.filter((doc) => doc.status === 'active');
  const favoriteDocuments = activeDocuments.filter((doc) => doc.isFavorite);

  return (
    <div className="flex flex-col gap-6">
      <SummaryPanel documents={activeDocuments} />
      <PinnedDocuments documents={favoriteDocuments} />
      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentTable documents={activeDocuments} />
        </CardContent>
      </Card>
    </div>
  );
}
