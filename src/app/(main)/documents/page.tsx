
'use client';

import { DocumentTable } from '@/components/document-table';
import { useDocuments } from '@/hooks/use-documents.tsx';

export default function DocumentsPage() {
  const { documents } = useDocuments();
  const activeDocuments = documents.filter((doc) => doc.status === 'active');

  return (
    <div className="flex flex-col h-full">
        <h1 className="text-3xl font-bold tracking-tight mb-4">All Documents</h1>
        <DocumentTable documents={activeDocuments} />
    </div>
  );
}
