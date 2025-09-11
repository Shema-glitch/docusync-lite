
'use client';

import { useDocuments } from '@/hooks/use-documents.tsx';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize, Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';

const loadingMessages = [
    "Opening document...",
    "Parsing content...",
    "Rendering preview...",
    "Almost there..."
];

export default function DocumentDetailsPage({ params }: { params: { id: string } }) {
  const { documents } = useDocuments();
  const router = useRouter();
  const { id } = params;
  const document = documents.find((doc) => doc.id === id);

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (!document) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [document]);


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
      <div className="flex flex-1 items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">{loadingMessages[loadingMessageIndex]}</h2>
            <p className="text-muted-foreground max-w-md">
                Please wait a moment. If the document takes too long to load, it might have been moved or deleted.
            </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const isOfficeDoc = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(document.fileType || '');

    if (document.fileType === 'application/pdf' || document.fileType === 'text/plain') {
        return <iframe id="doc-iframe" src={document.content} className="w-full h-full border-0" title={document.title} />;
    }
    
    if (isOfficeDoc) {
        if (!document.content) {
             return (
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center justify-center text-center p-8">
                        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                        <h3 className="text-xl font-semibold">Live Preview Unavailable</h3>
                        <p className="text-muted-foreground mt-2">This document type requires a link to an online file for preview.</p>
                    </div>
                </div>
            );
        }
        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(document.content)}&embedded=true`;
        return <iframe id="doc-iframe" src={viewerUrl} className="w-full h-full border-0" title={document.title} />;
    }

    // Fallback for unsupported or missing file types
    return (
        <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center justify-center text-center p-8">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-xl font-semibold">Unsupported File Type</h3>
                <p className="text-muted-foreground mt-2">A preview is not available for this file. You can download it to view.</p>
            </div>
        </div>
    );
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
                <div className="w-full h-[70vh] bg-muted rounded-b-lg">
                    {renderContent()}
                </div>
            </CardContent>
        </Card>
       </div>
    </div>
  );
}
