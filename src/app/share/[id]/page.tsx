
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import type { Document } from '@/lib/types';
import { Loader2, FileText, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Members } from '@/components/document/members';

export default function SharePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // If user is logged in, just redirect them to the actual document page
      router.replace(`/documents/${id}`);
      return;
    }

    const fetchDocument = async () => {
      try {
        const docRef = doc(db, 'documents', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setDocument({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
          } as Document);
        } else {
          setError('This document does not exist or has been deleted.');
        }
      } catch (e) {
        setError('Failed to fetch document details.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && !user) {
      fetchDocument();
    }
  }, [id, user, authLoading, router]);

  const handleSignIn = () => {
    router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
  };

  const handleSignUp = () => {
    router.push(`/signup?redirect=${encodeURIComponent(pathname)}`);
  }

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex h-screen items-center justify-center p-4">
         <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <CardTitle className="text-2xl text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
            </CardContent>
            <CardFooter>
                <Button onClick={() => router.push('/')} className="w-full">Go to Homepage</Button>
            </CardFooter>
         </Card>
      </div>
    );
  }

  if (!document) {
    return null; // Should be handled by error state
  }
  
  const owner = Object.values(document.members).find(m => m.role === 'owner');

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
            <div className="flex items-center gap-4 mb-4">
                <FileText className="h-10 w-10 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold">{document.title}</CardTitle>
                    <CardDescription>Shared by {owner?.name || 'a user'}</CardDescription>
                </div>
            </div>
            <p className="text-muted-foreground pt-2">{document.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="flex items-center justify-between rounded-lg border bg-background p-4">
                <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-muted-foreground"/>
                    <p className="font-semibold">This is a private document</p>
                </div>
                <Members members={document.members} />
             </div>
             <div className="flex flex-wrap gap-2">
                {document.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
             </div>
             <p className="text-sm text-muted-foreground">Last updated: {format(new Date(document.updatedAt), 'PPP')}</p>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={handleSignIn} className="w-full sm:w-auto flex-1">Sign In to View</Button>
          <Button onClick={handleSignUp} variant="secondary" className="w-full sm:w-auto flex-1">Create Account</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
