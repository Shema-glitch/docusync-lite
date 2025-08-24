
'use client';

import { useDocuments } from '@/hooks/use-documents.tsx';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export default function DocumentDetailsPage({ params }: { params: { id: string } }) {
  const { documents } = useDocuments();
  const router = useRouter();
  const document = documents.find((doc) => doc.id === params.id);

  const openFullscreen = () => {
    if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
        const iframe = window.document.getElementById('doc-iframe') as HTMLIFrameElement | null;
        if (iframe?.requestFullscreen) {
            iframe.requestFullscreen();
        }
    }
  }

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

  const renderContent = () => {
    if (!document.content) {
        return <p className="text-muted-foreground">No content available for this document.</p>;
    }
    if (document.fileType === 'application/pdf' || document.fileType === 'text/plain') {
        return <iframe id="doc-iframe" src={document.content} className="w-full h-full border-0" title={document.title} />;
    }
    return <p className="text-muted-foreground">This file type cannot be previewed.</p>;
  }

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
       <div className="flex-shrink-0">
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
            <CardContent>
                <p className="text-muted-foreground">{document.description || 'No description provided.'}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                    {document.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                        {tag}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
        <Separator className="my-6" />
       </div>
       <div className="flex-grow min-h-0">
        <Card className="h-full flex flex-col">
            <CardHeader className='flex-row items-center justify-between'>
                <CardTitle>Document Preview</CardTitle>
                <Button variant="outline" size="sm" onClick={openFullscreen}>
                    <Maximize className="mr-2 h-4 w-4"/>
                    Fullscreen
                </Button>
            </CardHeader>
            <CardContent className="flex-grow p-0">
                {renderContent()}
            </CardContent>
        </Card>
       </div>
    </div>
  );
}
