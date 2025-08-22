
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
import { MoreVertical, FileText, Sheet, FileImage, FileSignature, Download, Trash2, Edit, RotateCcw, Calendar as CalendarIcon } from 'lucide-react';
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
import { formatDistanceToNow, format } from 'date-fns';
import React, { useState } from 'react';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';


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
  const { deleteDocument, restoreDocument, permanentlyDeleteDocument, updateDocument } = useDocuments();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | undefined>(
    document.reminderDate ? new Date(document.reminderDate) : undefined
  );


  const timeAgo = formatDistanceToNow(new Date(document.updatedAt), {
    addSuffix: true,
  });

  const Icon = iconMap[document.icon as keyof typeof iconMap] || FileText;

  const handleDeleteClick = () => {
    setIsPermanentDelete(false);
    setIsDeleteDialogOpen(true);
  };
  
  const handlePermanentDeleteClick = () => {
      setIsPermanentDelete(true);
      setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (isPermanentDelete) {
        permanentlyDeleteDocument(document.id);
        toast({
            title: 'Document Permanently Deleted',
            description: `"${document.title}" has been permanently removed.`,
        });
    } else {
        deleteDocument(document.id);
        toast({
            title: 'Document Moved to Trash',
            description: `"${document.title}" has been moved to the trash.`,
        });
    }
    setIsDeleteDialogOpen(false);
  };
  
  const handleRestore = () => {
      restoreDocument(document.id);
      toast({
          title: 'Document Restored',
          description: `"${document.title}" has been restored.`,
      })
  }

  const handleSetReminder = (date: Date | undefined) => {
    setReminderDate(date);
    updateDocument(document.id, { reminderDate: date?.toISOString() });
    toast({
        title: "Reminder Updated",
        description: `Reminder for "${document.title}" has been ${date ? `set to ${format(date, 'PPP')}`: 'cleared'}.`
    })
  }

  return (
    <>
    <Card className="flex flex-col h-full overflow-hidden transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl bg-card">
      <CardHeader className="flex-row items-start gap-4 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base font-semibold leading-tight mb-1 truncate">
            <Link href={`/documents/${document.id}`} className="hover:underline">
              {document.title}
            </Link>
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
             {document.status === 'active' ? (
                <>
                    <DropdownMenuItem asChild>
                        <Link href={`/documents/${document.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast({ title: 'Feature coming soon!', description: 'Download is not yet available.'})}>
                        Download
                    </DropdownMenuItem>
                    <Popover>
                        <PopoverTrigger asChild>
                           <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                Set Reminder
                           </DropdownMenuItem>
                        </PopoverTrigger>
                         <PopoverContent className="w-auto p-0 mr-2" align="end">
                            <Calendar
                                mode="single"
                                selected={reminderDate}
                                onSelect={handleSetReminder}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={handleDeleteClick}
                    >
                      <Trash2 className="mr-2 h-4 w-4"/>
                      Delete
                    </DropdownMenuItem>
                </>
             ) : (
                <>
                    <DropdownMenuItem onClick={handleRestore}>
                       <RotateCcw className="mr-2 h-4 w-4"/>
                       Restore
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={handlePermanentDeleteClick}
                    >
                      <Trash2 className="mr-2 h-4 w-4"/>
                      Delete Permanently
                    </DropdownMenuItem>
                </>
             )}
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
            {isPermanentDelete 
                ? `This action cannot be undone. This will permanently delete the document "${document.title}".`
                : `This will move the document "${document.title}" to the trash.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
            {isPermanentDelete ? 'Delete Permanently' : 'Move to Trash'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
