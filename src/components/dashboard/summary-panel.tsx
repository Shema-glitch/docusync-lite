
'use client';
import { SummaryCard } from './summary-card';
import type { Document } from '@/lib/types';
import { File, Star, Clock, FileImage, FileSpreadsheet } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface SummaryPanelProps {
  documents: Document[];
}

export function SummaryPanel({ documents }: SummaryPanelProps) {
  const totalDocs = documents.length;
  const starredDocs = documents.filter((doc) => doc.isFavorite).length;
  
  const updatedThisWeek = documents.filter(doc => {
    const today = new Date();
    const updatedAt = new Date(doc.updatedAt);
    return differenceInDays(today, updatedAt) <= 7;
  }).length;

  const imageFiles = documents.filter(doc => doc.type === 'Image').length;
  const spreadsheets = documents.filter(doc => doc.type === 'Spreadsheet').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <SummaryCard title="Total Documents" value={totalDocs} Icon={File} />
      <SummaryCard title="Starred" value={starredDocs} Icon={Star} />
      <SummaryCard title="Updated This Week" value={updatedThisWeek} Icon={Clock} />
      <SummaryCard title="Image Files" value={imageFiles} Icon={FileImage} />
      <SummaryCard title="Spreadsheets" value={spreadsheets} Icon={FileSpreadsheet} />
    </div>
  );
}
