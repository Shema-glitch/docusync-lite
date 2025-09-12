
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    updateProfile,
    type User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';


export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_AVATAR_URL = 'https://placehold.co/100x100/EEDC82/333333?text=';

async function formatUser(firebaseUser: FirebaseUser): Promise<User> {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: userData.name || firebaseUser.displayName || 'Anonymous',
            avatar: userData.avatar || firebaseUser.photoURL || `${MOCK_AVATAR_URL}${firebaseUser.displayName?.charAt(0) || 'A'}`,
        };
    }

    // This is a fallback in case the user document doesn't exist for some reason
    return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email || 'Anonymous',
        avatar: firebaseUser.photoURL || `${MOCK_AVATAR_URL}${firebaseUser.displayName?.charAt(0) || 'A'}`,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const formattedUser = await formatUser(firebaseUser);
        setUser(formattedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle setting the user
    } catch(error: any) {
        throw new Error(error.message);
    } finally {
        setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        const avatar = `${MOCK_AVATAR_URL}${name.charAt(0) || 'A'}`;

        await updateProfile(firebaseUser, {
            displayName: name,
            photoURL: avatar
        });
        
        // Also create a user document in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userDocRef, {
            name,
            email,
            avatar,
        });

        // onAuthStateChanged will handle setting the new user
    } catch (error: any) {
        throw new Error(error.message);
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    try {
        await signOut(auth);
        setUser(null);
        router.push('/login');
    } catch (error: any) {
        console.error("Logout failed", error);
        throw new Error(error.message);
    }
  };

  const value = { user, loading, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
