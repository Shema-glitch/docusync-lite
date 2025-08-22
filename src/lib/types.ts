import type { LucideIcon } from 'lucide-react';

export type Document = {
  id: string;
  title: string;
  description: string;
  category: 'Work' | 'Personal' | 'Finance' | 'Legal';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
  type: 'PDF' | 'Word' | 'Image' | 'Spreadsheet';
  icon: string;
  status: 'active' | 'trashed';
  reminderDate?: string;
  isFavorite?: boolean;
};
