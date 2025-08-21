
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Home,
  FileClock,
  Files,
  Star,
  Settings,
  Briefcase,
  User,
  Heart,
  Wallet,
  Scale,
  Sparkles,
  PanelLeft,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { UploadButton } from '../upload-button';

interface AppHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function AppHeader({ searchQuery, setSearchQuery }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b bg-background px-4 py-2 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Sparkles className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">DocuSync Lite</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link href="#" className="flex items-center gap-4 px-2.5 text-foreground">
              <FileClock className="h-5 w-5" />
              Timeline
            </Link>
            <Link
              href="#"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Files className="h-5 w-5" />
              All Files
            </Link>
            <Link
              href="#"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Star className="h-5 w-5" />
              Favorites
            </Link>
            <Link
              href="#"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search documents..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <UploadButton />
      </div>
    </header>
  );
}
