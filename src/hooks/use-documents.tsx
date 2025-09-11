
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Document } from '@/lib/types';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';


interface DocumentsContextType {
  documents: Document[];
  loading: boolean;
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status' | 'isFavorite'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  permanentlyDeleteDocument: (id: string) => Promise<void>;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.id, 'documents', id);
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
  }, [user]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
  }, []);

  // Reminder checking effect
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      documents.forEach(doc => {
        if (doc.reminderDate && doc.status === 'active') {
          const reminderTime = new Date(doc.reminderDate);
          // Check if reminder is due in the last minute
          if (now >= reminderTime && (now.getTime() - reminderTime.getTime()) < 60000) {
            
            const notificationTitle = `Reminder: ${doc.title}`;
            const notificationBody = `This is a reminder for your document.`;

            if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
                new Notification(notificationTitle, { body: notificationBody });
            } else {
                 toast({
                    title: notificationTitle,
                    description: notificationBody,
                });
            }
           
            // To prevent re-triggering, clear the reminder date
            updateDocument(doc.id, { reminderDate: undefined });
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [documents, toast, updateDocument]);


  useEffect(() => {
    if (!user) {
        setDocuments([]);
        setLoading(false);
        return;
    }

    setLoading(true);
    const q = query(collection(db, 'users', user.id, 'documents'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const docs: Document[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            docs.push({
                id: doc.id,
                ...data,
                // Convert Firestore Timestamps to ISO strings
                createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
            } as Document);
        });
        setDocuments(docs);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching documents: ", error);
        toast({ title: "Error", description: "Could not fetch documents.", variant: "destructive" });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);
  
  const addDocument = async (docData: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status' | 'isFavorite'>) => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in to add a document.", variant: "destructive" });
      return;
    }
    await addDoc(collection(db, 'users', user.id, 'documents'), {
      ...docData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1,
      status: 'active',
      isFavorite: false,
    });
  };

  const deleteDocument = async (id: string) => {
    await updateDocument(id, { status: 'trashed' });
  };

  const restoreDocument = async (id: string) => {
    await updateDocument(id, { status: 'active' });
  };

  const permanentlyDeleteDocument = async (id: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.id, 'documents', id);
    await deleteDoc(docRef);
  };

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
