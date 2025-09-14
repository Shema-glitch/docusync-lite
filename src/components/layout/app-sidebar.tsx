
'use client';

import {
  FileClock,
  Files,
  Star,
  Trash2,
  Settings,
  Archive,
  Home,
  ChevronDown,
  LogOut,
  User as UserIcon,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UploadButton } from '../upload-button';
import { useAuth } from '@/hooks/use-auth';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from 'react';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/documents', label: 'All Files', icon: Files },
  { href: '/favorites', label: 'Favorites', icon: Star },
  { href: '/archive', label: 'Archive', icon: Archive },
  { href: '/trash', label: 'Trash', icon: Trash2 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(true);

  return (
    <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2 fixed w-[220px] lg:w-[280px]">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary">
                        <path d="M12.378 1.602a.75.75 0 00-.756 0L3 7.232V18a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V7.232l-8.622-5.63zM12 7.5a.75.75 0 01.75.75v3.69l3.44-2.293a.75.75 0 01.912 1.214l-4.25 2.833a.75.75 0 01-.912 0L7.898 11.16a.75.75 0 01.912-1.213L11.25 11.94V8.25A.75.75 0 0112 7.5z" />
                    </svg>
                    <span className="">{user?.organizationName || 'DocuSync Lite'}</span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Navigation</h3>
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
                 <div className="px-2 text-sm font-medium lg:px-4 mt-4">
                     <Collapsible open={isWorkflowOpen} onOpenChange={setIsWorkflowOpen}>
                        <CollapsibleTrigger className="w-full">
                            <div className='flex items-center justify-between px-3 py-2'>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workflow</h3>
                                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isWorkflowOpen && "rotate-180")} />
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="grid items-start">
                             <Link
                                href="/timeline"
                                prefetch={false}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                    pathname === '/timeline' && 'bg-muted text-primary'
                                )}
                                >
                                <FileClock className="h-4 w-4" />
                                Recent Activity
                            </Link>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </div>
             <div className="mt-auto p-4 space-y-4">
                <UploadButton />
                <div className="border-t pt-4">
                   <div className="flex justify-between items-center">
                        <Link href={`/profile/${user?.id}`} className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className='max-w-[120px]'>
                                <p className="text-sm font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">View Profile</p>
                            </div>
                        </Link>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" side="top" className="w-48">
                                 <DropdownMenuItem asChild>
                                    <Link href="/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                   </div>
                </div>
            </div>
        </div>
    </aside>
  );
}
