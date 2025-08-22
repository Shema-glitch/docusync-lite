
'use client';

import * as React from 'react';
import type { Document } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { DocumentCard } from './document-card';

interface TimelineViewProps {
  documents: Document[];
}

export function TimelineView({ documents }: TimelineViewProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = (api: CarouselApi) => {
        setCanScrollPrev(api.canScrollPrev());
        setCanScrollNext(api.canScrollNext());
    }

    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

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
      setApi={setApi}
      opts={{
        align: 'start',
      }}
      className="w-full relative"
    >
      <CarouselContent className="-ml-4">
        {documents.map((doc, index) => (
          <CarouselItem key={index} className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
            <DocumentCard document={doc} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {canScrollPrev && <CarouselPrevious className="hidden sm:flex bg-background/50 hover:bg-background" />}
      {canScrollNext && <CarouselNext className="hidden sm:flex bg-background/50 hover:bg-background" />}
    </Carousel>
  );
}
