
'use client';

import * as React from 'react';
import type { Document } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { DocumentCard } from './document-card';

interface TimelineViewProps {
  documents: Document[];
}

export function TimelineView({ documents }: TimelineViewProps) {
  if (documents.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
        <div>
          <h3 className="text-xl font-semibold">No recent documents</h3>
          <p className="text-muted-foreground mt-2">Upload a file to see your timeline.</p>
        </div>
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: 'start',
      }}
      className="w-full relative"
    >
      <CarouselContent className="-ml-4">
        {documents.map((doc, index) => (
          <CarouselItem key={index} className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <DocumentCard document={doc} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex bg-white/50 hover:bg-white" />
      <CarouselNext className="hidden sm:flex bg-white/50 hover:bg-white" />
    </Carousel>
  );
}
