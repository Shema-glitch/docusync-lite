
'use client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { Document } from '@/lib/types';
import { DocumentCard } from '../document-card';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Star } from 'lucide-react';

interface PinnedDocumentsProps {
  documents: Document[];
}

export function PinnedDocuments({ documents }: PinnedDocumentsProps) {
  if (documents.length === 0) {
    return null;
  }
  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Pinned Documents
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Carousel
                opts={{
                align: 'start',
                loop: false,
                }}
                className="w-full"
            >
                <CarouselContent>
                {documents.map((doc) => (
                    <CarouselItem key={doc.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                        <DocumentCard document={doc} />
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
            </Carousel>
        </CardContent>
    </Card>
  );
}
