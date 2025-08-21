
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { UploadDialog } from './upload-dialog';

export function UploadButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
