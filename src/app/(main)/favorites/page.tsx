
'use client';

import { DocumentTable } from '@/components/document-table';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { Star } from 'lucide-react';

export default function FavoritesPage() {
  const { documents } = useDocuments();
  const favoriteDocuments = documents.filter((doc) => doc.status === 'active' && doc.isFavorite);

  return (
    <div className="flex flex-col h-full">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Favorites</h1>
         {favoriteDocuments.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <Star className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No favorite documents yet</h3>
                <p className="text-muted-foreground mt-2">Click the star icon on any document to add it to your favorites.</p>
            </div>
        ) : (
            <DocumentTable documents={favoriteDocuments} />
        )}
    </div>
  );
}
