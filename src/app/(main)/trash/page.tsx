
'use client';

import { DocumentList } from '@/components/document-list';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { Button } from '@/components/ui/button';

export default function TrashPage() {
  const { documents, permanentlyDeleteDocument } = useDocuments();
  const trashedDocuments = documents.filter((doc) => doc.status === 'trashed');

  const handleEmptyTrash = () => {
    trashedDocuments.forEach(d => permanentlyDeleteDocument(d.id));
  };

  return (
    <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Trash</h1>
            {trashedDocuments.length > 0 && (
                <Button variant="destructive" onClick={handleEmptyTrash}>
                    Empty Trash
                </Button>
            )}
        </div>
      
        {trashedDocuments.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <h3 className="text-xl font-semibold">The trash is empty</h3>
                <p className="text-muted-foreground mt-2">Deleted documents will appear here.</p>
            </div>
        ) : (
            <DocumentList documents={trashedDocuments} />
        )}
    </div>
  );
}
