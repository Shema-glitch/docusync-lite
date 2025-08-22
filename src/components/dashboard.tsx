
'use client';

import { TimelineView } from '@/components/timeline-view';
import { DocumentList } from '@/components/document-list';
import { useDocuments } from '@/hooks/use-documents.tsx';
import type { Document } from '@/lib/types';

interface DashboardProps {
  searchQuery: string;
}

export function Dashboard({ searchQuery }: DashboardProps) {
  const { documents } = useDocuments();

  const activeDocuments = documents.filter((doc) => doc.status === 'active');

  const filteredDocuments = activeDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const recentDocuments = [...filteredDocuments].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0,10);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Timeline</h1>
        <TimelineView documents={recentDocuments} />
      </section>
      <section>
        <h1 className="text-3xl font-bold tracking-tight mb-4">All Documents</h1>
        <DocumentList documents={filteredDocuments} />
      </section>
    </div>
  );
}
