
'use client';

import {
  FileClock,
  Files,
  Star,
  Trash2,
  Settings,
  LayoutGrid,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { UploadButton } from '../upload-button';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/documents', label: 'All Files', icon: Files },
  { href: '/favorites', label: 'Favorites', icon: Star },
  { href: '/timeline', label: 'Timeline', icon: FileClock },
  { href: '/trash', label: 'Trash', icon: Trash2 },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2 fixed w-[220px] lg:w-[280px]">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary">
                        <path d="M12.378 1.602a.75.75 0 00-.756 0L3 7.232V18a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V7.232l-8.622-5.63zM12 7.5a.75.75 0 01.75.75v3.69l3.44-2.293a.75.75 0 01.912 1.214l-4.25 2.833a.75.75 0 01-.912 0L7.898 11.16a.75.75 0 01.912-1.213L11.25 11.94V8.25A.75.75 0 0112 7.5z" />
                    </svg>
                    <span className="">DocuSync Lite</span>
                </Link>
            </div>
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {navItems.map((item) => (
                         <Link
                            key={item.label}
                            href={item.href}
                            prefetch={false}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                pathname === item.href && 'bg-muted text-primary'
                            )}
                            >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-4">
                <UploadButton />
            </div>
        </div>
    </aside>
  );
}
