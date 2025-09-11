
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Document } from '@/lib/types';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';
import { db, storage } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';


interface DocumentsContextType {
  documents: Document[];
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status' | 'isFavorite' | 'content'> & { content: string }) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  permanentlyDeleteDocument: (id: string) => Promise<void>;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
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
        return;
    }

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
    }, (error) => {
        console.error("Error fetching documents: ", error);
        toast({ title: "Error", description: "Could not fetch documents.", variant: "destructive" });
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

    const docToDelete = documents.find(d => d.id === id);

    // Delete file from Storage if it exists
    if (docToDelete && docToDelete.storagePath) {
        const fileRef = ref(storage, docToDelete.storagePath);
        try {
            await deleteObject(fileRef);
        } catch (error: any) {
             // If file not found, it might have been already deleted or failed to upload.
             // We can log this but shouldn't block deleting the DB record.
            if (error.code !== 'storage/object-not-found') {
                console.error("Error deleting file from storage: ", error);
                toast({
                    title: "Deletion Error",
                    description: "Could not delete the file from storage, but removing the document record.",
                    variant: "destructive"
                });
            }
        }
    }

    // Delete the document from Firestore
    const docRef = doc(db, 'users', user.id, 'documents', id);
    await deleteDoc(docRef);
  };

  const value = { documents, addDocument, deleteDocument, updateDocument, restoreDocument, permanentlyDeleteDocument };

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
}
