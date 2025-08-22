
'use client';

import { TimelineView } from '@/components/timeline-view';
import { useDocuments } from '@/hooks/use-documents.tsx';

export default function TimelinePage() {
  const { documents } = useDocuments();
  const recentDocuments = [...documents]
    .filter(doc => doc.status === 'active')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Timeline</h1>
      <p className="text-muted-foreground mb-6">A chronological view of your most recently updated documents.</p>
      <div className="space-y-8">
        {recentDocuments.map(doc => (
            <div key={doc.id} className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-center">
                    <div className="w-px h-6 bg-border -mb-1" />
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <div className="w-px flex-grow bg-border" />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{new Date(doc.updatedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p>
                    <h3 className="font-semibold">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
