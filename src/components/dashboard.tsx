import { TimelineView } from '@/components/timeline-view';
import { DocumentList } from '@/components/document-list';
import type { Document } from '@/lib/types';
import {
  FileText,
  FileImage,
  Sheet,
  FileSignature,
} from 'lucide-react';

const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Project Phoenix Proposal',
    description: 'Initial proposal for the new marketing campaign.',
    category: 'Work',
    tags: ['marketing', 'q4', 'planning'],
    createdAt: '2023-10-26T10:00:00Z',
    updatedAt: '2023-10-26T11:30:00Z',
    version: 2,
    type: 'PDF',
    icon: 'FileText',
  },
  {
    id: '2',
    title: 'Q3 Financial Report',
    description: 'Quarterly financial results and analysis.',
    category: 'Finance',
    tags: ['finance', 'report', 'earnings'],
    createdAt: '2023-10-25T15:20:00Z',
    updatedAt: '2023-10-25T15:20:00Z',
    version: 1,
    type: 'Spreadsheet',
    icon: 'Sheet',
  },
  {
    id: '3',
    title: 'New Logo Concepts',
    description: 'Draft designs for the company rebranding.',
    category: 'Work',
    tags: ['design', 'branding', 'logo'],
    createdAt: '2023-10-24T09:05:00Z',
    updatedAt: '2023-10-24T14:00:00Z',
    version: 3,
    type: 'Image',
    icon: 'FileImage',
  },
  {
    id: '4',
    title: 'Signed NDA',
    description: 'Non-disclosure agreement with Partner Corp.',
    category: 'Legal',
    tags: ['legal', 'nda', 'contract'],
    createdAt: '2023-10-22T18:00:00Z',
    updatedAt: '2023-10-22T18:00:00Z',
    version: 1,
    type: 'Word',
    icon: 'FileSignature',
  },
  {
    id: '5',
    title: 'Vacation Photos',
    description: 'Pictures from the summer trip to Italy.',
    category: 'Personal',
    tags: ['travel', 'photos', 'vacation'],
    createdAt: '2023-09-15T12:00:00Z',
    updatedAt: '2023-09-15T12:00:00Z',
    version: 1,
    type: 'Image',
    icon: 'FileImage',
  },
    {
    id: '6',
    title: 'Home Loan Agreement',
    description: 'Mortgage agreement documents for the new house.',
    category: 'Finance',
    tags: ['loan', 'mortgage', 'housing'],
    createdAt: '2023-08-01T11:45:00Z',
    updatedAt: '2023-08-01T11:45:00Z',
    version: 1,
    type: 'PDF',
    icon: 'FileText',
  },
];

export function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Timeline</h1>
        <TimelineView documents={mockDocuments} />
      </section>
      <section>
        <h1 className="text-3xl font-bold tracking-tight mb-4">All Documents</h1>
        <DocumentList documents={mockDocuments} />
      </section>
    </div>
  );
}
