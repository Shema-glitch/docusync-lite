
'use client';

import type { Document } from '@/lib/types';
import { DocumentList } from './document-list';
import { UploadButton } from './upload-button';
import { SearchX } from 'lucide-react';

interface SearchResultsProps {
    query: string;
    documents: Document[];
}

export function SearchResults({ query, documents }: SearchResultsProps) {
  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg p-12 text-center h-full">
        <h3 className="text-xl font-semibold">Search for Documents</h3>
        <p className="text-muted-foreground mt-2">
          Use the search bar above to find documents by title, description, or tag.
        </p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-full">
        <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold">No results for "{query}"</h3>
        <p className="text-muted-foreground mt-2 mb-4">
          Try searching for something else, or upload a new document.
        </p>
        <UploadButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
       <div>
         <h1 className="text-2xl font-bold tracking-tight">
            Search results for "{query}"
        </h1>
        <p className="text-muted-foreground mt-1">
            Found {documents.length} matching document{documents.length !== 1 && 's'}.
        </p>
       </div>
      <DocumentList documents={documents} />
    </div>
  );
}
