
'use client';

import { DocumentTable } from '@/components/document-table';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const { documents } = useDocuments();
  const [searchQuery, setSearchQuery] = useState(''); // This state is now local to the dashboard

  const activeDocuments = documents.filter((doc) => doc.status === 'active');

  const filteredDocuments = activeDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  

  return (
     <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>
            Browse and manage all your documents in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <DocumentTable documents={filteredDocuments} />
        </CardContent>
      </Card>
  );
}
