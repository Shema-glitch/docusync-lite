
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
  PanelLeft,
  Search,
  Trash2,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';
import { UploadButton } from '../upload-button';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '../ui/dropdown-menu';
import { LogOut, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/documents', label: 'All Files', icon: Files },
    { href: '/favorites', label: 'Favorites', icon: Star },
    { href: '/timeline', label: 'Timeline', icon: FileClock },
    { href: '/trash', label: 'Trash', icon: Trash2 },
  ];

export function AppHeader({ searchQuery, setSearchQuery }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30 backdrop-blur-sm">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
           <nav className="grid gap-2 text-lg font-medium">
            <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold mb-4"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary">
                    <path d="M12.378 1.602a.75.75 0 00-.756 0L3 7.232V18a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V7.232l-8.622-5.63zM12 7.5a.75.75 0 01.75.75v3.69l3.44-2.293a.75.75 0 01.912 1.214l-4.25 2.833a.75.75 0 01-.912 0L7.898 11.16a.75.75 0 01.912-1.213L11.25 11.94V8.25A.75.75 0 0112 7.5z" />
                </svg>
                <span>DocuSync Lite</span>
            </Link>
            {navItems.map(item => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                        "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                        pathname === item.href && "bg-muted text-foreground"
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
            ))}
          </nav>
          <div className="mt-auto">
            <UploadButton />
          </div>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <form>
            <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            </div>
        </form>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name ?? ''} data-ai-hint="profile picture" />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
        </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className='w-56'>
        <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                </p>
            </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
            <Heart className="mr-2 h-4 w-4" />
            <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
        </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
