
'use client';

import { useSearchParams } from 'next/navigation';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { DocumentList } from '@/components/document-list';
import { SearchResults } from '@/components/search-results';
import { SearchFilters } from '@/components/search-filters';
import { useMemo } from 'react';
import type { Document } from '@/lib/types';
import { parse, isWithinInterval } from 'date-fns';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const { documents, loading } = useDocuments();
    
    // Extract search and filter params from URL
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type');
    const ownerId = searchParams.get('owner');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const activeDocuments = documents.filter((doc) => doc.status === 'active');

    const filteredDocuments = useMemo(() => {
        let docs = [...activeDocuments];

        // 1. Filter by search query (title, description, tags)
        if (query) {
            docs = docs.filter(
                (doc) =>
                doc.title.toLowerCase().includes(query.toLowerCase()) ||
                doc.description.toLowerCase().includes(query.toLowerCase()) ||
                doc.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
            );
        }

        // 2. Filter by document type
        if (type) {
            docs = docs.filter(doc => doc.type === type);
        }

        // 3. Filter by owner
        if (ownerId) {
            docs = docs.filter(doc => doc.members[ownerId]?.role === 'owner');
        }
        
        // 4. Filter by date range
        if (from && to) {
            try {
                const startDate = parse(from, 'yyyy-MM-dd', new Date());
                const endDate = parse(to, 'yyyy-MM-dd', new Date());
                docs = docs.filter(doc => {
                    const updatedAt = new Date(doc.updatedAt);
                    return isWithinInterval(updatedAt, { start: startDate, end: endDate });
                });
            } catch (e) {
                console.error("Invalid date format", e);
            }
        }

        return docs;

    }, [query, type, ownerId, from, to, activeDocuments]);

    const owners = useMemo(() => {
        const ownerMap = new Map<string, { id: string; name: string }>();
        documents.forEach(doc => {
            for (const id in doc.members) {
                if (doc.members[id].role === 'owner') {
                    ownerMap.set(id, { id, name: doc.members[id].name });
                }
            }
        });
        return Array.from(ownerMap.values());
    }, [documents]);

    return (
        <div className="flex flex-col gap-6">
            <SearchFilters owners={owners} />
            <SearchResults 
                query={query} 
                documents={filteredDocuments} 
                isLoading={loading} 
            />
        </div>
    );
}

