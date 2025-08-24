
'use client';

import { DocumentTable } from '@/components/document-table';
import { useDocuments } from '@/hooks/use-documents.tsx';

export default function FavoritesPage() {
  const { documents } = useDocuments();
  const favoriteDocuments = documents.filter((doc) => doc.status === 'active' && doc.isFavorite);

  return (
    <div className="flex flex-col h-full">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Favorites</h1>
         {favoriteDocuments.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <h3 className="text-xl font-semibold">No favorite documents</h3>
                <p className="text-muted-foreground mt-2">Click the star on a document to mark it as a favorite.</p>
            </div>
        ) : (
            <DocumentTable documents={favoriteDocuments} />
        )}
    </div>
  );
}
