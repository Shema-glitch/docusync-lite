
'use client';

import type { Document } from '@/lib/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from './ui/button';
import { MoreHorizontal, FileText, Sheet, FileImage, FileSignature, Trash2, RotateCcw, Star, Presentation, FileSpreadsheet } from 'lucide-react';
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
import { format, formatDistanceToNow } from 'date-fns';
import React, { useState } from 'react';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback } from './ui/avatar';
import { UploadButton } from './upload-button';
import { Card, CardContent } from './ui/card';
import { useRouter } from 'next/navigation';
import { Input } from './ui/input';

interface DocumentTableProps {
  documents: Document[];
}

const iconMap = {
  FileText: FileText,
  Sheet: Sheet,
  FileImage: FileImage,
  FileSignature: FileSignature,
  Presentation: Presentation,
  FileSpreadsheet: FileSpreadsheet,
};

export function DocumentTable({ documents }: DocumentTableProps) {
    if (documents.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <h3 className="text-xl font-semibold">No documents found</h3>
            <p className="text-muted-foreground mt-2 mb-4">Try adjusting your filters or upload a new document.</p>
            <UploadButton />
          </div>
        );
      }
    

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]">
            <Checkbox />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="hidden md:table-cell">Category</TableHead>
          <TableHead className="hidden md:table-cell">Updated</TableHead>
          <TableHead className="hidden lg:table-cell">Tags</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <DocumentRow key={doc.id} document={doc} />
        ))}
      </TableBody>
    </Table>
  );
}


function DocumentRow({ document }: { document: Document }) {
    const { deleteDocument, restoreDocument, permanentlyDeleteDocument, updateDocument } = useDocuments();
    const { toast } = useToast();
    const router = useRouter();
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
      if (date) {
        const newDate = new Date(date);
        if (reminderDate) {
            newDate.setHours(reminderDate.getHours());
            newDate.setMinutes(reminderDate.getMinutes());
        } else {
            newDate.setHours(12);
            newDate.setMinutes(0);
        }
        setReminderDate(newDate);
        updateDocument(document.id, { reminderDate: newDate.toISOString() });
        toast({
            title: "Reminder Updated",
            description: `Reminder for "${document.title}" has been set to ${format(newDate, 'PPP p')}.`
        });
      } else {
        setReminderDate(undefined);
        updateDocument(document.id, { reminderDate: undefined });
        toast({
            title: "Reminder Cleared",
            description: `Reminder for "${document.title}" has been cleared.`
        });
      }
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = e.target.value;
        if (reminderDate && time) {
            const [hours, minutes] = time.split(':').map(Number);
            const newDate = new Date(reminderDate);
            newDate.setHours(hours);
            newDate.setMinutes(minutes);
            setReminderDate(newDate);
            updateDocument(document.id, { reminderDate: newDate.toISOString() });
            toast({
                title: "Reminder Updated",
                description: `Reminder for "${document.title}" has been set to ${format(newDate, 'PPP p')}.`
            });
        }
    }
    
    const toggleFavorite = () => {
      updateDocument(document.id, { isFavorite: !document.isFavorite });
       toast({
          title: document.isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
          description: `"${document.title}" has been ${document.isFavorite ? 'removed from' : 'added to'} your favorites.`,
      })
    }
  
    return (
        <>
        <TableRow className="group transition-all hover:bg-muted/10">
            <TableCell>
                <Checkbox />
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="grid gap-0.5">
                        <Link href={`/documents/${document.id}`} className="font-medium hover:underline">
                            {document.title}
                        </Link>
                        <p className="text-xs text-muted-foreground hidden sm:block">{document.type}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <Badge variant="outline">{document.category}</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">{timeAgo}</TableCell>
            <TableCell className="hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                    {document.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary/20" onClick={() => router.push(`/documents?tag=${tag}`)}>
                          {tag}
                        </Badge>
                    ))}
                    {document.tags.length > 2 && (
                        <Badge variant="secondary">+{document.tags.length - 2}</Badge>
                    )}
                </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={toggleFavorite}>
                    <Star className={cn("h-4 w-4", document.isFavorite ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                </Button>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
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
                                    {reminderDate && (
                                        <div className="p-2 border-t">
                                            <Input type="time" onChange={handleTimeChange} defaultValue={format(reminderDate, "HH:mm")} />
                                        </div>
                                    )}
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
              </div>
            </TableCell>
        </TableRow>
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
