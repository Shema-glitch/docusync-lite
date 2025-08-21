
'use client';

import type { Document } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from './ui/button';
import { MoreVertical, FileText, Sheet, FileImage, FileSignature } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatDistanceToNow } from 'date-fns';
import React, { useState } from 'react';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { useToast } from '@/hooks/use-toast';


interface DocumentCardProps {
  document: Document;
}

const iconMap = {
  FileText: FileText,
  Sheet: Sheet,
  FileImage: FileImage,
  FileSignature: FileSignature,
};

export function DocumentCard({ document }: DocumentCardProps) {
  const { deleteDocument } = useDocuments();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(document.updatedAt), {
    addSuffix: true,
  });

  const Icon = iconMap[document.icon as keyof typeof iconMap] || FileText;

  const handleDelete = () => {
    deleteDocument(document.id);
    toast({
        title: 'Document Deleted',
        description: `"${document.title}" has been moved to the trash.`,
    })
    setIsDeleteDialogOpen(false);
  }

  return (
    <>
    <Card className="flex flex-col h-full overflow-hidden transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="flex-row items-start gap-4 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base font-semibold leading-tight mb-1 truncate">
            {document.title}
          </CardTitle>
          <CardDescription className="text-xs">
            Updated {timeAgo}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast({ title: 'Feature coming soon!', description: 'Detailed view is not yet available.'})}>
                View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: 'Feature coming soon!', description: 'Download is not yet available.'})}>
                Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: 'Feature coming soon!', description: 'Reminders are not yet available.'})}>
                Set Reminder
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {document.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary">{document.category}</Badge>
          {document.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
          {document.tags.length > 2 && (
             <Badge variant="outline">+{document.tags.length - 2}</Badge>
          )}
        </div>
      </CardFooter>
    </Card>

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            document "{document.title}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
