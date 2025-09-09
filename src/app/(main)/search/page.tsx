
'use client';

import { useSearchParams } from 'next/navigation';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { DocumentList } from '@/components/document-list';
import { SearchResults } from '@/components/search-results';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const { documents } = useDocuments();
    
    const activeDocuments = documents.filter((doc) => doc.status === 'active');

    const filteredDocuments = activeDocuments.filter(
        (doc) =>
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.description.toLowerCase().includes(query.toLowerCase()) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );

    return (
        <SearchResults query={query} documents={filteredDocuments} />
    );
}
