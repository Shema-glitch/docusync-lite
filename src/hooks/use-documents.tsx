
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Document, DocumentMember } from '@/lib/types';
import { useToast } from './use-toast';
import { useAuth, type User } from './use-auth';
import { db, storage } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';


interface DocumentsContextType {
  documents: Document[];
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status' | 'isFavorite' | 'members'>) => Promise<string | undefined>;
  deleteDocument: (id: string) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  permanentlyDeleteDocument: (id: string) => Promise<void>;
  updateDocumentMembers: (id: string, members: Record<string, DocumentMember>) => Promise<void>;
  findUserByEmail: (email: string) => Promise<User | null>;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>) => {
    if (!user) return;
    const docRef = doc(db, 'documents', id);
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
  }, [user]);

  // Reminder checking effect
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      documents.forEach(doc => {
        if (doc.reminderDate && doc.status === 'active') {
          const reminderTime = new Date(doc.reminderDate);
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
           
            updateDocument(doc.id, { reminderDate: undefined });
          }
        }
      });
    }, 60000); 

    return () => clearInterval(interval);
  }, [documents, toast, updateDocument]);


  useEffect(() => {
    if (!user) {
        setDocuments([]);
        return;
    }

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
    }, (error) => {
        console.error("Error fetching documents: ", error);
        toast({ title: "Error", description: "Could not fetch documents.", variant: "destructive" });
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

  const deleteDocument = async (id: string) => {
    await updateDocument(id, { status: 'trashed', trashedAt: serverTimestamp() as any });
  };

  const restoreDocument = async (id: string) => {
    await updateDocument(id, { status: 'active', trashedAt: null });
  };

  const permanentlyDeleteDocument = async (id: string) => {
    if (!user) return;

    const docToDelete = documents.find(d => d.id === id);
    if (docToDelete && docToDelete.storagePath) {
        const fileRef = ref(storage, docToDelete.storagePath);
        try {
            await deleteObject(fileRef);
        } catch (error: any) {
            if (error.code !== 'storage/object-not-found') {
                console.error("Error deleting file from storage: ", error);
            }
        }
    }

    const docRef = doc(db, 'documents', id);
    await deleteDoc(docRef);
  };
  
  const updateDocumentMembers = async (id: string, members: Record<string, DocumentMember>) => {
    await updateDocument(id, { members });
  };

  const value = { documents, addDocument, deleteDocument, updateDocument, restoreDocument, permanentlyDeleteDocument, updateDocumentMembers, findUserByEmail };

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
}
