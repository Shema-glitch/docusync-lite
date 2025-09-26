
'use client';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { OnboardingGuide } from '@/components/onboarding-guide';
import { OnboardingProvider } from '@/hooks/use-onboarding';
import { useSessionTimeout } from '@/hooks/use-session-timeout';
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function FullPageLoader() {
    return (
        <div className="flex flex-1 items-center justify-center h-full">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    )
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useSessionTimeout();

  return (
      <OnboardingProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <AppSidebar />
          <div className="flex flex-col">
            <AppHeader />
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto bg-muted/20">
              <Suspense fallback={<FullPageLoader />}>
                {children}
              </Suspense>
            </main>
          </div>
        </div>
        <OnboardingGuide />
      </OnboardingProvider>
  );
}
