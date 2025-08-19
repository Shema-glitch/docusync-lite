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
import { MoreVertical, Calendar, Bell, FileText, Sheet, FileImage, FileSignature } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';

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
  const timeAgo = formatDistanceToNow(new Date(document.updatedAt), {
    addSuffix: true,
  });

  const Icon = iconMap[document.icon as keyof typeof iconMap] || FileText;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="flex-row items-start gap-4 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
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
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Download</DropdownMenuItem>
            <DropdownMenuItem>Set Reminder</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
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
  );
}
