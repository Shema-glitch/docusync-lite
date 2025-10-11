
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import type { Document, DocumentMember } from '@/lib/types';
import { useToast } from './use-toast';
import { useAuth, type User } from './use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDocs, writeBatch, getDoc, deleteDoc } from 'firebase/firestore';
import { permanentlyDeleteFile } from '@/app/actions';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


interface DocumentsContextType {
  documents: Document[];
  loading: boolean;
  tags: string[];
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status' | 'isFavorite' | 'members'>) => Promise<string | undefined>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  permanentlyDeleteDocument: (id: string) => Promise<void>;
  updateDocumentMembers: (id: string, members: Record<string, DocumentMember>) => Promise<void>;
  findUserByEmail: (email: string) => Promise<User | null>;
  findUserById: (id: string) => Promise<User | null>;
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
    const documentsCollectionRef = collection(db, "documents");
    const q = query(documentsCollectionRef, where(`members.${user.id}`, "in", ["owner", "editor", "viewer"]));

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
        
        const permissionError = new FirestorePermissionError({
          path: documentsCollectionRef.path,
          operation: 'list',
        }, error);

        errorEmitter.emit('permission-error', permissionError);
        
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const tags = useMemo(() => {
    const allTags = new Set<string>();
    documents
      .filter(doc => doc.status === 'active')
      .forEach(doc => {
        doc.tags.forEach(tag => allTags.add(tag));
      });
    return Array.from(allTags).sort();
  }, [documents]);
  
 const addDocument = async (docData: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status' | 'isFavorite' | 'members'>): Promise<string | undefined> => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in to add a document.", variant: "destructive" });
      return;
    }

    const batch = writeBatch(db);
    
    // 1. Create the new document
    const newDocRef = doc(collection(db, 'documents'));
    const newDocumentData = {
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
    };
    batch.set(newDocRef, newDocumentData);

    // 2. Create an activity log entry
    const activityRef = doc(collection(db, 'users', user.id, 'activity'));
    batch.set(activityRef, {
        type: 'CREATE_DOCUMENT',
        timestamp: serverTimestamp(),
        details: {
            documentId: newDocRef.id,
            documentTitle: docData.title,
        }
    });

    try {
        await batch.commit();
        return newDocRef.id;
    } catch(serverError: any) {
        const permissionError = new FirestorePermissionError({
          path: newDocRef.path,
          operation: 'create',
          requestResourceData: newDocumentData,
        }, serverError);
        errorEmitter.emit('permission-error', permissionError);
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    if (!user) return;
    
    const originalDocuments = documents;
    const optimisticDocuments = documents.map(doc => 
      doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc
    );
    setDocuments(optimisticDocuments);

    const docRef = doc(db, 'documents', id);
    updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() })
      .catch((serverError: any) => {
        setDocuments(originalDocuments); // Revert on failure
        const permissionError = new FirestorePermissionError({
          path: `documents/${id}`,
          operation: 'update',
          requestResourceData: updates,
        }, serverError);
        errorEmitter.emit('permission-error', permissionError);
      });
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

    const originalDocuments = [...documents];
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
    if (!user) return;
  
    const docRef = doc(db, 'documents', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
  
    const originalMembers = docSnap.data().members || {};
    const newMemberIds = Object.keys(members).filter(id => !originalMembers[id]);
  
    const batch = writeBatch(db);
    batch.update(docRef, { members, updatedAt: serverTimestamp() });
  
    // Log activity for newly added members
    if (newMemberIds.length > 0) {
      const activityRef = doc(collection(db, 'users', user.id, 'activity'));
      batch.set(activityRef, {
        type: 'SHARE_DOCUMENT',
        timestamp: serverTimestamp(),
        details: {
          documentId: id,
          documentTitle: docSnap.data().title,
          sharedWith: members[newMemberIds[0]].name, // Just log the first new member for simplicity
        }
      });
    }
  
    batch.commit().catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: { members },
        }, serverError);
        errorEmitter.emit('permission-error', permissionError);
    });

    // Optimistically update local state
    const optimisticDocuments = documents.map(doc => 
      doc.id === id ? { ...doc, members, updatedAt: new Date().toISOString() } : doc
    );
    setDocuments(optimisticDocuments);
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
        organizationName: userData.organizationName,
        is2faEnabled: userData.is2faEnabled,
    };
  };

  const findUserById = async (id: string): Promise<User | null> => {
    const userDocRef = doc(db, 'users', id);
    
    try {
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          return null;
        }

        const userData = userDoc.data();
        return {
          id: userDoc.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar,
          organizationName: userData.organizationName,
          is2faEnabled: userData.is2faEnabled,
        };
    } catch(serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
        }, serverError);
        errorEmitter.emit('permission-error', permissionError);
        return null;
    }
  };

  const value = { documents, loading, tags, addDocument, updateDocument, restoreDocument, permanentlyDeleteDocument, updateDocumentMembers, findUserByEmail, findUserById, deleteDocument };

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
}
