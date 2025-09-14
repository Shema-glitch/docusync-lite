
'use client';

import { DocumentTable } from '@/components/document-table';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { useAuth } from '@/hooks/use-auth';
import { Users } from 'lucide-react';

export default function SharedPage() {
  const { documents } = useDocuments();
  const { user } = useAuth();
  
  const sharedDocuments = documents.filter((doc) => {
    if (doc.status !== 'active' || !user) return false;
    const isOwner = doc.members[user.id]?.role === 'owner';
    return !isOwner;
  });

  return (
    <div className="flex flex-col h-full">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Shared with Me</h1>
         {sharedDocuments.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No documents have been shared with you</h3>
                <p className="text-muted-foreground mt-2">When someone shares a document with you, it will appear here.</p>
            </div>
        ) : (
            <DocumentTable documents={sharedDocuments} />
        )}
    </div>
  );
}
