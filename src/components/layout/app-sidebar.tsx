
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
  MoreHorizontal,
  Users,
  Tag,
  FileText,
  UploadCloud,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UploadButton } from '../upload-button';
import { useAuth } from '@/hooks/use-auth';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from 'react';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/documents', label: 'All Files', icon: Files },
  { href: '/favorites', label: 'Favorites', icon: Star },
  { href: '/shared', label: 'Shared with Me', icon: Users },
  { href: '/archive', label: 'Archive', icon: Archive },
  { href: '/trash', label: 'Trash', icon: Trash2 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { tags: allTags } = useDocuments();
  const { isGuideVisible, currentStep, completeOnboarding, steps } = useOnboarding();
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);

  const totalSteps = steps.length;
  const onboardingProgress = isGuideVisible ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2 fixed w-[220px] lg:w-[280px]">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-3 font-semibold">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-primary">
                        <path d="M12.378 1.602a.75.75 0 00-.756 0L3 7.232V18a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V7.232l-8.622-5.63zM12 7.5a.75.75 0 01.75.75v3.69l3.44-2.293a.75.75 0 01.912 1.214l-4.25 2.833a.75.75 0 01-.912 0L7.898 11.16a.75.75 0 01.912-1.213L11.25 11.94V8.25A.75.75 0 0112 7.5z" />
                    </svg>
                    <div>
                        <span className="font-bold text-lg">DocuSync Lite</span>
                        {user?.organizationName && (
                            <p className="text-xs text-muted-foreground">{user.organizationName}</p>
                        )}
                    </div>
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
                             <Button variant="ghost" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary justify-start" disabled>
                                <FileText className="h-4 w-4" />
                                Templates
                            </Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary justify-start">
                                        <UploadCloud className="h-4 w-4" />
                                        Upload Queue
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 ml-4" align="start">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Upload Queue</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Files currently being uploaded.
                                            </p>
                                        </div>
                                        <div className="text-center text-sm text-muted-foreground py-4">
                                            No active uploads.
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
                 <div className="px-2 text-sm font-medium lg:px-4 mt-4">
                     <Collapsible open={isTagsOpen} onOpenChange={setIsTagsOpen}>
                        <CollapsibleTrigger className="w-full">
                            <div className='flex items-center justify-between px-3 py-2'>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</h3>
                                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isTagsOpen && "rotate-180")} />
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="grid items-start max-h-48 overflow-y-auto">
                            {allTags.map(tag => (
                                <Link
                                    key={tag}
                                    href={`/documents?tag=${tag}`}
                                    prefetch={false}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                        // TODO: Add active state based on search param
                                    )}
                                >
                                    <Tag className="h-4 w-4" />
                                    {tag}
                                </Link>
                            ))}
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </div>
             <div className="mt-auto p-4 space-y-4">
                <div data-onboarding-id="step-1-upload">
                    <UploadButton />
                </div>
                <div className="border-t pt-4">
                   {isGuideVisible && (
                       <div className="mb-4 space-y-2">
                           <div className="flex justify-between items-center">
                             <p className="text-xs text-muted-foreground">Onboarding Progress</p>
                             {!isLastStep && (
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={completeOnboarding}>Skip</Button>
                             )}
                           </div>
                           <Progress value={onboardingProgress} className="h-2" />
                       </div>
                   )}
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
