import type { Document } from '@/lib/types';
import { DocumentCard } from './document-card';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';

interface DocumentListProps {
  documents: Document[];
}

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
        <h3 className="text-xl font-semibold">Your document vault is empty</h3>
        <p className="text-muted-foreground mt-2 mb-4">Get started by uploading your first file.</p>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}
