
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { UploadDialog } from './upload-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface UploadButtonProps {
    isIcon?: boolean;
}

export function UploadButton({ isIcon = false }: UploadButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isIcon) {
    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="icon"
                        className="rounded-full h-10 w-10 bg-primary text-primary-foreground"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Upload Document</TooltipContent>
            </Tooltip>
            <UploadDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </>
    );
  }

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} className="rounded-full shrink-0">
        <Upload className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Upload</span>
      </Button>
      <UploadDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
