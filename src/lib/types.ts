
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
  type: 'PDF' | 'Word' | 'Image' | 'Spreadsheet' | 'TXT' | 'OTHER';
  icon: 'FileText' | 'FileSignature' | 'FileImage' | 'Sheet';
  status: 'active' | 'trashed';
  reminderDate?: string;
  isFavorite?: boolean;
  content?: string; // Store file content as a data URL
  fileType?: string; // e.g. 'application/pdf' or 'text/plain'
};
