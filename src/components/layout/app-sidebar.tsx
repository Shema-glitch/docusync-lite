
'use client';

import {
  Home,
  FileClock,
  Files,
  Star,
  Trash2,
  Settings,
  Plus,
  LayoutGrid,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { UploadButton } from '../upload-button';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/documents', label: 'All Files', icon: Files },
  { href: '/favorites', label: 'Favorites', icon: Star },
  { href: '/timeline', label: 'Timeline', icon: FileClock },
  { href: '/trash', label: 'Trash', icon: Trash2 },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-16 flex-col border-r bg-card md:flex">
        <TooltipProvider>
            <nav className="flex flex-col items-center gap-4 px-2 py-4">
                <Link
                href="/"
                className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M12.378 1.602a.75.75 0 00-.756 0L3 7.232V18a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V7.232l-8.622-5.63zM12 7.5a.75.75 0 01.75.75v3.69l3.44-2.293a.75.75 0 01.912 1.214l-4.25 2.833a.75.75 0 01-.912 0L7.898 11.16a.75.75 0 01.912-1.213L11.25 11.94V8.25A.75.75 0 0112 7.5z" />
                    </svg>
                    <span className="sr-only">DocuSync Lite</span>
                </Link>
                {navItems.map((item) => (
                    <Tooltip key={item.label}>
                        <TooltipTrigger asChild>
                            <Link
                            href={item.href}
                            className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                                pathname === item.href && 'bg-accent text-accent-foreground'
                            )}
                            >
                            <item.icon className="h-5 w-5" />
                            <span className="sr-only">{item.label}</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                ))}
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
                <UploadButton isIcon />
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Link
                        href="#"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Settings</span>
                    </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Settings</TooltipContent>
                </Tooltip>
            </nav>
      </TooltipProvider>
    </aside>
  );
}
