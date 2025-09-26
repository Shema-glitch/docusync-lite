
'use client';

import { DocumentTable } from '@/components/document-table';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ArchivePage() {
  const { documents, updateDocument } = useDocuments();
  const archivedDocuments = documents.filter((doc) => doc.status === 'archived');

  const handleUnarchiveAll = () => {
    archivedDocuments.forEach(doc => {
      updateDocument(doc.id, { status: 'active' });
    });
  };

  return (
    <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Archive</h1>
             {archivedDocuments.length > 0 && (
                <Button variant="outline" onClick={handleUnarchiveAll}>
                    Unarchive All
                </Button>
            )}
        </div>
      
        {archivedDocuments.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Your archive is empty</h3>
                <p className="text-muted-foreground mt-2">Archived documents will appear here.</p>
            </div>
        ) : (
            <DocumentTable documents={archivedDocuments} />
        )}
    </div>
  );
}
