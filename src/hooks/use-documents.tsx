
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Document } from '@/lib/types';
import { useToast } from './use-toast';

interface DocumentsContextType {
  documents: Document[];
  loading: boolean;
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status'>) => void;
  deleteDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  restoreDocument: (id: string) => void;
  permanentlyDeleteDocument: (id: string) => void;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

const MOCK_DOCUMENTS: Document[] = [
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
      status: 'active',
      isFavorite: true,
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
      status: 'active',
      isFavorite: false,
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
      status: 'active',
      isFavorite: false,
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
      status: 'active',
      isFavorite: true,
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
      status: 'active',
      isFavorite: false,
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
      status: 'active',
      isFavorite: false,
    },
  ];

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    try {
      const storedDocs = localStorage.getItem('documents_db');
      if (storedDocs) {
        setDocuments(JSON.parse(storedDocs));
      } else {
        setDocuments(MOCK_DOCUMENTS);
        localStorage.setItem('documents_db', JSON.stringify(MOCK_DOCUMENTS));
      }
    } catch (error) {
        console.error("Could not parse documents from local storage", error);
        setDocuments(MOCK_DOCUMENTS);
    }
    setLoading(false);
  }, []);

  // Reminder checking effect
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      documents.forEach(doc => {
        if (doc.reminderDate && doc.status === 'active') {
          const reminderTime = new Date(doc.reminderDate);
          if (now >= reminderTime && (now.getTime() - reminderTime.getTime()) < 60000) { // Check if reminder is due in the last minute
            toast({
              title: `Reminder: ${doc.title}`,
              description: 'This is a reminder for your document.',
            });
            // To prevent re-triggering, you might want to clear the reminder date
            updateDocument(doc.id, { reminderDate: undefined });
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [documents, toast]);


  const updateLocalStorage = (docs: Document[]) => {
    localStorage.setItem('documents_db', JSON.stringify(docs));
  };

  const addDocument = useCallback((docData: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status'>) => {
    const newDoc: Document = {
      ...docData,
      id: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      status: 'active',
      isFavorite: false,
    };
    setDocuments(prevDocs => {
      const newDocs = [newDoc, ...prevDocs];
      updateLocalStorage(newDocs);
      return newDocs;
    });
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prevDocs => {
        const newDocs = prevDocs.map(doc => doc.id === id ? { ...doc, status: 'trashed' as const, updatedAt: new Date().toISOString() } : doc);
        updateLocalStorage(newDocs);
        return newDocs;
    });
  }, []);

  const restoreDocument = useCallback((id: string) => {
    setDocuments(prevDocs => {
        const newDocs = prevDocs.map(doc => doc.id === id ? { ...doc, status: 'active' as const, updatedAt: new Date().toISOString() } : doc);
        updateLocalStorage(newDocs);
        return newDocs;
    });
  }, []);

  const permanentlyDeleteDocument = useCallback((id: string) => {
    setDocuments(prevDocs => {
      const newDocs = prevDocs.filter(doc => doc.id !== id);
      updateLocalStorage(newDocs);
      return newDocs;
    });
  }, []);


  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments(prevDocs => {
        const newDocs = prevDocs.map(doc => doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc);
        updateLocalStorage(newDocs);
        return newDocs;
    });
  }, []);

  const value = { documents, loading, addDocument, deleteDocument, updateDocument, restoreDocument, permanentlyDeleteDocument };

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
}
