
'use client';

import { DocumentTable } from '@/components/document-table';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { FolderNavigation } from '@/components/folder-navigation';
import { useState, useMemo } from 'react';
import type { Document } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { DocumentCardSkeleton } from '@/components/document-card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function DocumentsPage() {
  const { documents, loading } = useDocuments();
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get('tag');

  const [selectedCategory, setSelectedCategory] = useState<Document['category'] | 'all'>('all');

  const activeDocuments = documents.filter((doc) => doc.status === 'active');
  
  const filteredByCategory = selectedCategory === 'all' 
    ? activeDocuments
    : activeDocuments.filter(doc => doc.category === selectedCategory);

  const filteredDocuments = useMemo(() => {
    if (!tagFilter) {
      return filteredByCategory;
    }
    return filteredByCategory.filter(doc => doc.tags.includes(tagFilter));
  }, [tagFilter, filteredByCategory]);

  const categories = ['Work', 'Personal', 'Finance', 'Legal'] as const;
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = activeDocuments.filter(doc => doc.category === category).length;
    return acc;
  }, {} as Record<Document['category'], number>);


  return (
    <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] gap-6">
        <FolderNavigation 
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
            totalCount={activeDocuments.length}
            isLoading={loading}
        />
        <Card>
            <CardHeader>
                <CardTitle>
                  {tagFilter ? `Documents tagged "${tagFilter}"` : 'Documents'}
                </CardTitle>
                <CardDescription>
                    {selectedCategory === 'all' ? 'All documents' : `Documents in ${selectedCategory}`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : (
                    <DocumentTable documents={filteredDocuments} />
                )}
            </CardContent>
        </Card>
    </div>
  );
}
