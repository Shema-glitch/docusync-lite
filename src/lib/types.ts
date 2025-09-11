
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
  type: 'PDF' | 'Word' | 'Image' | 'Spreadsheet' | 'Presentation' | 'TXT' | 'OTHER';
  icon: 'FileText' | 'FileSignature' | 'FileImage' | 'FileSpreadsheet' | 'Presentation' | 'Sheet';
  status: 'active' | 'trashed';
  reminderDate?: string;
  isFavorite?: boolean;
  content: string; // Firebase Storage URL or data URI for TXT
  fileType: string; // e.g. 'application/pdf' or 'text/plain'
  storagePath?: string; // Path in Firebase Storage
};
