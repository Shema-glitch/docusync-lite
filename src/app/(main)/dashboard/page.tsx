
'use client';

import { DocumentTable } from '@/components/document-table';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { useState } from 'react';

export default function DashboardPage() {
  const { documents } = useDocuments();
  const [searchQuery, setSearchQuery] = useState(''); // This state is now local to the dashboard

  const activeDocuments = documents.filter((doc) => doc.status === 'active');

  const filteredDocuments = activeDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight mb-4">All Documents</h1>
        <DocumentTable documents={filteredDocuments} />
      </section>
    </div>
  );
}
