
'use client';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Dashboard } from '@/components/dashboard';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DocumentsProvider } from '@/hooks/use-documents.tsx';

function AuthenticatedApp() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <AppSidebar />
        <div className="flex flex-col min-w-0">
          <AppHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <Dashboard searchQuery={searchQuery} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DocumentsProvider>
      <AuthenticatedApp />
    </DocumentsProvider>
  );
}
