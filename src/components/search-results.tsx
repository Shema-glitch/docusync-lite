
'use client';

import type { Document } from '@/lib/types';
import { DocumentList } from './document-list';
import { UploadButton } from './upload-button';
import { SearchX, FilterX } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { DocumentCardSkeleton } from './document-card-skeleton';

interface SearchResultsProps {
    query: string;
    documents: Document[];
    isLoading: boolean;
}

export function SearchResults({ query, documents, isLoading }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilters = Array.from(searchParams.keys()).filter(key => key !== 'q');

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    if (query) newParams.set('q', query);
    router.push(`/search?${newParams.toString()}`);
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <DocumentCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!query && activeFilters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg p-12 text-center h-full border-2 border-dashed">
        <h3 className="text-xl font-semibold">Search for Documents</h3>
        <p className="text-muted-foreground mt-2">
          Use the search bar above and filters to find exactly what you need.
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
          Try adjusting your search or filters, or upload a new document.
        </p>
        <UploadButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
       <div>
         <h1 className="text-2xl font-bold tracking-tight">
            Search Results
        </h1>
        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            {query && <p>For: <Badge variant="secondary">{query}</Badge></p>}
            <span>|</span>
            <p>{documents.length} document{documents.length !== 1 && 's'} found</p>
             {activeFilters.length > 0 && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary hover:text-primary">
                    <FilterX className="mr-2 h-4 w-4" />
                    Clear {activeFilters.length} filter{activeFilters.length > 1 && 's'}
                  </Button>
                </>
             )}
        </div>
       </div>
      <DocumentList documents={documents} />
    </div>
  );
}
