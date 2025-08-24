
'use client';

import { useDocuments } from '@/hooks/use-documents.tsx';
import type { Document } from '@/lib/types';
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TimelinePage() {
  const { documents } = useDocuments();
  const activeDocuments = [...documents]
    .filter(doc => doc.status === 'active')
    .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());

  // Group documents by month
  const documentsByMonth = activeDocuments.reduce((acc, doc) => {
    const month = format(new Date(doc.updatedAt), 'MMMM yyyy');
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
        <p className="text-muted-foreground mt-1">
          Detailed, visual representation of your documents' journey, highlighting key updates.
        </p>
      </div>

      <div className="flex-grow space-y-12">
        {Object.entries(documentsByMonth).map(([month, docs]) => (
          <div key={month}>
            <h2 className="text-xl font-semibold mb-6 sticky top-0 bg-background py-2">{month}</h2>
            <div className="relative pl-6">
              {/* Vertical line */}
              <div className="absolute left-[2px] top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
              
              <div className="space-y-8">
                {docs.map((doc, index) => (
                  <div key={doc.id} className="relative flex items-start">
                    {/* Timeline dot */}
                    <div className="absolute left-[-24px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background"></div>

                    {/* Content Card */}
                    <div className="flex-1 ml-4">
                      <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                           <div className="flex-1">
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(doc.updatedAt), 'MMMM d')}
                                </p>
                                <h3 className="font-semibold text-lg mt-1">{doc.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                           </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
