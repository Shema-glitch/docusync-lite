
'use client';

import { useDocuments } from '@/hooks/use-documents.tsx';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize, Loader2, AlertTriangle, Share2, Copy, Sparkles, FileText, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState, useMemo } from 'react';
import type { Document } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Members } from '@/components/document/members';
import { ShareDialog } from '@/components/document/share-dialog';
import { useToast } from '@/hooks/use-toast';
import { getAiSummary, getAiExplanation } from '@/app/actions';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { AlertDialogCancel } from '@radix-ui/react-alert-dialog';

const loadingMessages = [
    "Opening document...",
    "Verifying permissions...",
    "Rendering preview...",
    "Almost there..."
];

export default function DocumentDetailsPage({ params }: { params: { id: string } }) {
  const { documents } = useDocuments();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { id } = params;
  
  const [document, setDocument] = useState<Document | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isShareOpen, setShareOpen] = useState(false);

  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

  const [isExplainLoading, setIsExplainLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isExplainDialogOpen, setIsExplainDialogOpen] = useState(false);


  useEffect(() => {
    const foundDoc = documents.find((doc) => doc.id === id);
    if (foundDoc) {
      setDocument(foundDoc);
    }
  }, [id, documents]);

  useEffect(() => {
    const cinematicTimer = setTimeout(() => {
        setIsLoading(false);
    }, 1000); 

    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 1500);

    return () => {
      clearTimeout(cinematicTimer);
      clearInterval(messageInterval);
    };
  }, [id]);

  const userRole = useMemo(() => {
    if (!document || !user) return undefined;
    return document.members[user.id]?.role;
  }, [document, user]);

  const isOwner = userRole === 'owner';

  const openFullscreen = () => {
    if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
        const iframe = window.document.getElementById('doc-iframe') as HTMLIFrameElement | null;
        if (iframe?.requestFullscreen) {
            iframe.requestFullscreen();
        }
    }
  }

  const copyShareLink = () => {
    const url = `${window.location.origin}/share/${document?.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied", description: "Share link has been copied to your clipboard." });
  }

  const handleAiFeature = async (type: 'summarize' | 'explain') => {
    if (!document) return;
  
    if (document.fileType !== 'text/plain') {
      const featureName = type === 'summarize' ? 'AI summary' : 'AI explanation';
      toast({
        variant: 'destructive',
        title: `Unsupported for ${type === 'summarize' ? 'Summarization' : 'Explanation'}`,
        description: `${featureName} is currently only available for plain text (.txt) files.`,
      });
      return;
    }
  
    if (type === 'summarize') setIsSummaryLoading(true);
    if (type === 'explain') setIsExplainLoading(true);
  
    try {
      const response = await fetch(document.content);
      if (!response.ok) throw new Error('Could not fetch document content.');
      const documentText = await response.text();
      
      const commonPayload = {
        documentText: documentText.slice(0, 15000), // Truncate for performance & cost
        documentTitle: document.title,
      };
  
      if (type === 'summarize') {
        const result = await getAiSummary(commonPayload);
        if (result.error) {
          toast({ variant: 'destructive', title: 'Summarization Failed', description: result.error });
        } else {
          setSummary(result.summary);
          setIsSummaryDialogOpen(true);
        }
      } else if (type === 'explain') {
        const result = await getAiExplanation(commonPayload);
        if (result.error) {
          toast({ variant: 'destructive', title: 'Explanation Failed', description: result.error });
        } else {
          setExplanation(result.explanation);
          setIsExplainDialogOpen(true);
        }
      }
  
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Failed to generate response.' });
    } finally {
      if (type === 'summarize') setIsSummaryLoading(false);
      if (type === 'explain') setIsExplainLoading(false);
    }
  };


  if (isLoading || !document) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-center">
            {isLoading ? (
                <>
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <h2 className="text-2xl font-bold tracking-tight">{loadingMessages[loadingMessageIndex]}</h2>
                    <p className="text-muted-foreground max-w-md">
                        Please wait a moment. If the document takes too long to load, you might not have access to it.
                    </p>
                </>
            ) : (
                 <div className="flex flex-col items-center gap-4 text-center">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                    <h2 className="text-2xl font-bold tracking-tight">Document Not Found</h2>
                    <p className="text-muted-foreground max-w-md">
                        The document you are looking for does not exist, has been moved, or you do not have permission to view it.
                    </p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            )}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const isOfficeDoc = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(document.fileType || '');

    if (!document.content) {
        return (
           <div className="w-full h-full flex items-center justify-center">
               <div className="flex flex-col items-center justify-center text-center p-8">
                   <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                   <h3 className="text-xl font-semibold">No Preview Available</h3>
                   <p className="text-muted-foreground mt-2">This document does not have any content to display.</p>
               </div>
           </div>
       );
   }
    
    if (isOfficeDoc) {
        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(document.content)}&embedded=true`;
        return <iframe id="doc-iframe" src={viewerUrl} className="w-full h-full border-0" title={document.title} />;
    }

    if (document.fileType === 'application/pdf') {
        return <iframe id="doc-iframe" src={document.content} className="w-full h-full border-0" title={document.title} />;
    }

    if (document.fileType === 'text/plain') {
        return <iframe id="doc-iframe" src={document.content} className="w-full h-full border-0" title={document.title} />;
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center p-8">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-xl font-semibold">Unsupported File Type</h3>
                <p className="text-muted-foreground mt-2">A preview is not available for this file. You can download it to view.</p>
            </div>
        </div>
    );
  }

  return (
    <>
    <div className="flex flex-col h-full p-4 md:p-6">
       <div className="flex-shrink-0">
        <div className='flex justify-between items-center mb-4'>
            <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back
            </Button>
            <div className='flex items-center gap-2'>
                <Button variant="outline" onClick={() => handleAiFeature('explain')} disabled={isExplainLoading}>
                    {isExplainLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    ) : (
                        <BookOpen className="mr-2 h-4 w-4"/>
                    )}
                    Explain
                </Button>
                <Button variant="outline" onClick={() => handleAiFeature('summarize')} disabled={isSummaryLoading}>
                    {isSummaryLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4"/>
                    )}
                    Summarize
                </Button>
                <Button variant="outline" onClick={copyShareLink}>
                    <Copy className="mr-2 h-4 w-4"/>
                    Copy Link
                </Button>
                {isOwner && (
                    <Button onClick={() => setShareOpen(true)}>
                        <Share2 className="mr-2 h-4 w-4"/>
                        Share
                    </Button>
                )}
            </div>
        </div>
        <Card>
            <CardHeader>
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="text-3xl font-bold">{document.title}</CardTitle>
                    <CardDescription className='mt-2'>
                        Last updated on {format(new Date(document.updatedAt), 'PPP p')}
                    </CardDescription>
                </div>
                <Members members={document.members} />
            </div>
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
    <ShareDialog 
        isOpen={isShareOpen} 
        onOpenChange={setShareOpen}
        document={document}
    />
    <AlertDialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Summary of "{document.title}"
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                    <div className="pt-4 text-sm text-foreground space-y-2">
                        <ul className="list-disc pl-5 space-y-2">
                            {summary.split('- ').filter(s => s.trim()).map((item, index) => (
                                <li key={index}>{item.trim()}</li>
                            ))}
                        </ul>
                    </div>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    <AlertDialog open={isExplainDialogOpen} onOpenChange={setIsExplainDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Explanation of "{document.title}"
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                     <div 
                        className="pt-4 text-sm text-foreground space-y-4 prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br />') }}
                    />
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
