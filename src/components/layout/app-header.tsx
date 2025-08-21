
'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload } from 'lucide-react';
import { UploadButton } from '@/components/upload-button';
import { useSidebar } from '../ui/sidebar';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { isMobile } = useSidebar();
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 backdrop-blur-sm md:px-6 lg:px-8">
      <SidebarTrigger className={cn('block md:hidden', isMobile && 'block')} />
      <div className="relative flex-1 max-w-xl md:max-w">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents by content or tags..."
          className="h-10 w-full rounded-full bg-background pl-10 shadow-none"
        />
      </div>
      <div className="hidden md:block">
        <UploadButton />
      </div>
    </header>
  );
}
