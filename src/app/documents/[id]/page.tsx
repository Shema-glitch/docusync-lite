
'use client';

import { useDocuments } from '@/hooks/use-documents.tsx';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function DocumentDetailsPage({ params }: { params: { id: string } }) {
  const { documents } = useDocuments();
  const router = useRouter();
  const document = documents.find((doc) => doc.id === params.id);

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold">Document not found</h2>
        <p className="text-muted-foreground mt-2">The document you are looking for does not exist or has been deleted.</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4"/>
            Back
       </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{document.title}</CardTitle>
          <CardDescription>
            Last updated on {format(new Date(document.updatedAt), 'PPP p')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <h3 className="font-semibold text-lg">Description</h3>
                <p className="text-muted-foreground">{document.description || 'No description provided.'}</p>
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold text-lg">Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Category:</div>
                    <div><Badge variant="secondary">{document.category}</Badge></div>
                    
                    <div className="text-muted-foreground">Type:</div>
                    <div>{document.type}</div>

                    <div className="text-muted-foreground">Version:</div>
                    <div>{document.version}</div>

                    <div className="text-muted-foreground">Created:</div>
                    <div>{format(new Date(document.createdAt), 'PPP')}</div>
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold text-lg">Tags</h3>
                <div className="flex flex-wrap gap-2">
                {document.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                    {tag}
                    </Badge>
                ))}
                </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
