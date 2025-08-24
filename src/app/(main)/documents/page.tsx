
'use client';

import { DocumentTable } from '@/components/document-table';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { FolderNavigation } from '@/components/folder-navigation';
import { useState } from 'react';
import type { Document } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DocumentsPage() {
  const { documents } = useDocuments();
  const [selectedCategory, setSelectedCategory] = useState<Document['category'] | 'all'>('all');

  const activeDocuments = documents.filter((doc) => doc.status === 'active');
  
  const filteredDocuments = selectedCategory === 'all' 
    ? activeDocuments
    : activeDocuments.filter(doc => doc.category === selectedCategory);

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
        />
        <Card>
            <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                    {selectedCategory === 'all' ? 'All documents' : `Documents in ${selectedCategory}`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DocumentTable documents={filteredDocuments} />
            </CardContent>
        </Card>
    </div>
  );
}
