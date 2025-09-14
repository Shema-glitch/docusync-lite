
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Document, DocumentMember } from '@/lib/types';
import { useToast } from './use-toast';
import { useAuth, type User } from './use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDocs, writeBatch, getDoc, deleteDoc } from 'firebase/firestore';
import { permanentlyDeleteFile } from '@/app/actions';


interface DocumentsContextType {
  documents: Document[];
  loading: boolean;
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status' | 'isFavorite' | 'members'>) => Promise<string | undefined>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  permanentlyDeleteDocument: (id: string) => Promise<void>;
  updateDocumentMembers: (id: string, members: Record<string, DocumentMember>) => Promise<void>;
  findUserByEmail: (email: string) => Promise<User | null>;
  deleteDocument: (id: string) => Promise<void>;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Reminder checking effect
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      documents.forEach(doc => {
        if (doc.reminderDate && doc.status === 'active') {
          const reminderTime = new Date(doc.reminderDate);
          // Check if the reminder time is in the past and within the last minute
          if (now >= reminderTime && (now.getTime() - reminderTime.getTime()) < 60000) {
            
            const notificationTitle = `Reminder: ${doc.title}`;
            const notificationBody = `This is a reminder for your document.`;

            // Use browser notifications if available and permission is granted
            if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
                new Notification(notificationTitle, { body: notificationBody });
            } else {
                 // Fallback to toast notification
                 toast({
                    title: notificationTitle,
                    description: notificationBody,
                    duration: 10000,
                });
            }
           
            // Optimistically clear the reminder date from the UI and then from the backend
            updateDocument(doc.id, { reminderDate: undefined });
          }
        }
      });
    };
    
    // Check every 30 seconds
    const interval = setInterval(checkReminders, 30000); 

    return () => clearInterval(interval);
  }, [documents, toast, user]);


  useEffect(() => {
    if (!user) {
        setDocuments([]);
        setLoading(false);
        return;
    }
    setLoading(true);
    const q = query(collection(db, "documents"), where(`members.${user.id}`, "in", ["owner", "editor", "viewer"]));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const docs: Document[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            docs.push({
                id: doc.id,
                ...data,
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
  
 const addDocument = async (docData: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status' | 'isFavorite' | 'members'>): Promise<string | undefined> => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in to add a document.", variant: "destructive" });
      return;
    }
    const docRef = await addDoc(collection(db, 'documents'), {
      ...docData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1,
      status: 'active',
      isFavorite: false,
      members: {
        [user.id]: {
          role: 'owner',
          name: user.name,
          avatar: user.avatar,
        }
      }
    });
    return docRef.id;
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    if (!user) return;
    
    const originalDocuments = documents;
    const optimisticDocuments = documents.map(doc => 
      doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc
    );
    setDocuments(optimisticDocuments);

    try {
      const docRef = doc(db, 'documents', id);
      await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    } catch (error) {
      console.error("Failed to update document: ", error);
      setDocuments(originalDocuments); // Revert on failure
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Your changes could not be saved. Please try again."
      });
    }
  };

  const deleteDocument = async (id: string) => {
    updateDocument(id, { status: 'trashed', trashedAt: new Date().toISOString() });
  };

  const restoreDocument = async (id: string) => {
    updateDocument(id, { status: 'active', trashedAt: undefined });
  };

  const permanentlyDeleteDocument = async (id: string) => {
    if (!user) return;

    const docToDelete = documents.find(d => d.id === id);
    if (!docToDelete) return;

    const originalDocuments = documents;
    const optimisticDocuments = documents.filter(d => d.id !== id);
    setDocuments(optimisticDocuments);

    try {
        const result = await permanentlyDeleteFile({id: docToDelete.id, storagePath: docToDelete.storagePath});
        if (result.error) {
            throw new Error(result.error);
        }
    } catch (error: any) {
        console.error("Permanent delete failed: ", error);
        setDocuments(originalDocuments); // Revert on failure
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: error.message || 'The document could not be permanently deleted.',
        });
    }
  };

  const updateDocumentMembers = async (id: string, members: Record<string, DocumentMember>) => {
    await updateDocument(id, { members });
  };
  
  const findUserByEmail = async (email: string): Promise<User | null> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    return {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
    };
  };

  const value = { documents, loading, addDocument, updateDocument, restoreDocument, permanentlyDeleteDocument, updateDocumentMembers, findUserByEmail, deleteDocument };

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
}
