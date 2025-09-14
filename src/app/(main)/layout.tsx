
'use client';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { OnboardingGuide } from '@/components/onboarding-guide';
import { OnboardingProvider } from '@/hooks/use-onboarding';
import { useSessionTimeout } from '@/hooks/use-session-timeout';

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
              {children}
            </main>
          </div>
        </div>
        <OnboardingGuide />
      </OnboardingProvider>
  );
}
