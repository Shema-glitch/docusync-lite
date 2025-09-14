
'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Document } from "@/lib/types"
import { Folder, File, Users, Star, Trash2 } from "lucide-react"
import { Skeleton } from "./ui/skeleton";

interface FolderNavigationProps {
    selectedCategory: Document['category'] | 'all';
    onSelectCategory: (category: Document['category'] | 'all') => void;
    categoryCounts: Record<Document['category'], number>;
    totalCount: number;
    isLoading?: boolean;
}

const categoryIcons = {
    Work: Folder,
    Personal: Folder,
    Finance: Folder,
    Legal: Folder
};


export function FolderNavigation({ selectedCategory, onSelectCategory, categoryCounts, totalCount, isLoading }: FolderNavigationProps) {
  const categories = ['Work', 'Personal', 'Finance', 'Legal'] as const;

  if (isLoading) {
    return (
      <div className="hidden md:block bg-card p-4 rounded-lg shadow-sm sticky top-24">
        <div className="grid gap-2">
            <h3 className="font-semibold text-lg px-2 mb-2">Folders</h3>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
    )
  }

  return (
    <div className="hidden md:block bg-card p-4 rounded-lg shadow-sm sticky top-24">
        <nav className="grid gap-2">
            <h3 className="font-semibold text-lg px-2 mb-2">Folders</h3>
             <Button
                variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-3"
                onClick={() => onSelectCategory('all')}
              >
                <File className="h-5 w-5" />
                <span>All Files</span>
                <span className="ml-auto text-xs text-muted-foreground">{totalCount}</span>
            </Button>
            {categories.map((category) => {
                const Icon = categoryIcons[category];
                return (
                     <Button
                        key={category}
                        variant={selectedCategory === category ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-3"
                        onClick={() => onSelectCategory(category)}
                    >
                        <Icon className="h-5 w-5" />
                        <span>{category}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{categoryCounts[category]}</span>
                    </Button>
                )
            })}
        </nav>
    </div>
  )
}
