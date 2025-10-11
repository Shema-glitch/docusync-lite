
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    updateProfile,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    OAuthProvider,
    sendPasswordResetEmail,
    type User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, writeBatch, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { send2faCode, verify2faCode } from '@/app/actions';
import { Verify2faDialog } from '@/components/auth/verify-2fa-dialog';
import { useToast } from './use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';


export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  organizationName?: string;
  is2faEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: Partial<Pick<User, 'name' | 'avatar' | 'organizationName'>>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  enable2FA: (code: string) => Promise<void>;
  verify2faAndLogin: (userId: string, email: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_AVATAR_URL = 'https://placehold.co/100x100/EEDC82/333333?text=';

async function formatUser(firebaseUser: FirebaseUser): Promise<User> {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    let userDoc;
    try {
        userDoc = await getDoc(userDocRef);
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
        }, serverError);
        errorEmitter.emit('permission-error', permissionError);
        // Fallback to auth data if Firestore read fails
        return {
             id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email || 'Anonymous',
            avatar: firebaseUser.photoURL || `${MOCK_AVATAR_URL}${firebaseUser.displayName?.charAt(0) || 'A'}`,
            is2faEnabled: false,
        }
    }


    if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: userData.name || firebaseUser.displayName || 'Anonymous',
            avatar: userData.avatar || firebaseUser.photoURL || `${MOCK_AVATAR_URL}${firebaseUser.displayName?.charAt(0) || 'A'}`,
            organizationName: userData.organizationName,
            is2faEnabled: userData.is2faEnabled || false,
        };
    }

    // This is a fallback in case the user document doesn't exist for some reason
    return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email || 'Anonymous',
        avatar: firebaseUser.photoURL || `${MOCK_AVATAR_URL}${firebaseUser.displayName?.charAt(0) || 'A'}`,
        is2faEnabled: false,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const [is2faVerificationRequired, setIs2faVerificationRequired] = useState(false);
  const [userIdFor2fa, setUserIdFor2fa] = useState<string | null>(null);
  const [userEmailFor2fa, setUserEmailFor2fa] = useState<string | null>(null);
  const [tempFirebaseUser, setTempFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Only set user if 2FA isn't pending. If it is, the verify2faAndLogin function will handle it.
        if (!is2faVerificationRequired) {
            const formattedUser = await formatUser(firebaseUser);
            localStorage.setItem('lastUserEmail', formattedUser.email);
            localStorage.setItem('lastUserName', formattedUser.name);
            setUser(formattedUser);
        }
      } else {
        setUser(null);
        setTempFirebaseUser(null);
        setUserIdFor2fa(null);
        setUserEmailFor2fa(null);
        setIs2faVerificationRequired(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [is2faVerificationRequired]);
  
  const handleSuccessfulLogin = useCallback(async (firebaseUser: FirebaseUser) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    let userDoc;
    try {
        userDoc = await getDoc(userDocRef);
    } catch(serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
        }, serverError);
        errorEmitter.emit('permission-error', permissionError);
        // Don't proceed with login if we can't even read the user doc
        await signOut(auth);
        return;
    }
    
    const userData = userDoc.exists() ? userDoc.data() : null;

    if (userData?.is2faEnabled) {
      setUserIdFor2fa(firebaseUser.uid);
      setUserEmailFor2fa(firebaseUser.email);
      setTempFirebaseUser(firebaseUser);
      setIs2faVerificationRequired(true);
      if (firebaseUser.email) {
        await send2faCode(firebaseUser.uid, firebaseUser.email);
      }
      setLoading(false);
    } else {
      const formattedUser = await formatUser(firebaseUser);
      setUser(formattedUser);
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect ? decodeURIComponent(redirect) : '/dashboard');
      setLoading(false);
    }
  }, [router]);


  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem('lastLoginProvider', 'password');
        await handleSuccessfulLogin(cred.user);
    } catch(error: any) {
        setLoading(false);
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          throw new Error('Invalid credentials. Please check your email and password.');
        }
        throw new Error(error.message);
    }
  };

  const verify2faAndLogin = async (userId: string, email: string, code: string) => {
    if (!tempFirebaseUser || tempFirebaseUser.uid !== userId) {
        throw new Error("User session mismatch during 2FA verification.");
    }
    
    const { success, error } = await verify2faCode(userId, code);
    
    if (success) {
      setIs2faVerificationRequired(false); // This will trigger the onAuthStateChanged to set the user
      
      toast({
        variant: 'success',
        title: 'Login Successful!',
      });
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect ? decodeURIComponent(redirect) : '/dashboard');
    } else {
       throw new Error(error || "Invalid or expired 2FA code.");
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
        
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const newUserDoc = {
            name,
            email,
            avatar,
            is2faEnabled: false,
        };
        await setDoc(userDocRef, newUserDoc)
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'create',
                    requestResourceData: newUserDoc
                }, serverError);
                errorEmitter.emit('permission-error', permissionError);
            });
        
        localStorage.setItem('lastLoginProvider', 'password');
        const redirect = new URLSearchParams(window.location.search).get('redirect');
        router.push(redirect ? decodeURIComponent(redirect) : '/dashboard');

    } catch (error: any) {
        setLoading(false);
        throw new Error(error.message);
    }
  };
  
  const handleProviderLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider | OAuthProvider) => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
        }, serverError);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError; // Stop the login process
      });

      if (!userDoc.exists()) {
          const newUserDoc = {
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              avatar: firebaseUser.photoURL,
              is2faEnabled: false,
          };
          await setDoc(userDocRef, newUserDoc)
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'create',
                    requestResourceData: newUserDoc
                }, serverError);
                errorEmitter.emit('permission-error', permissionError);
            });
      }
      
      // @ts-ignore
      localStorage.setItem('lastLoginProvider', provider.providerId);
      await handleSuccessfulLogin(firebaseUser);

    } catch (error: any) {
       if (error.code !== 'auth/popup-closed-by-user') {
            throw error;
        }
    } finally {
        setLoading(false);
    }
  }

  const loginWithGoogle = async (): Promise<void> => {
    await handleProviderLogin(new GoogleAuthProvider());
  };

  const loginWithMicrosoft = async (): Promise<void> => {
    await handleProviderLogin(new OAuthProvider('microsoft.com'));
  };

  const loginWithFacebook = async (): Promise<void> => {
    await handleProviderLogin(new FacebookAuthProvider());
  };


  const logout = async () => {
    try {
        await signOut(auth);
        setUser(null);
        setTempFirebaseUser(null);
        setUserIdFor2fa(null);
        setUserEmailFor2fa(null);
        setIs2faVerificationRequired(false);
        router.push('/login');
    } catch (error: any) {
        console.error("Logout failed", error);
        throw new Error(error.message);
    }
  };

  const updateUserProfile = async (updates: Partial<Pick<User, 'name' | 'avatar' | 'organizationName'>>) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !user) {
        throw new Error("You must be logged in to update your profile.");
    }

    const { name = user.name, avatar = user.avatar, organizationName = user.organizationName } = updates;
    
    await updateProfile(firebaseUser, { displayName: name, photoURL: avatar });

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const updateData = { name, avatar, organizationName };
    await updateDoc(userDocRef, updateData)
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: updateData
            }, serverError);
            errorEmitter.emit('permission-error', permissionError);
        });

    const documentsRef = collection(db, 'documents');
    const q = query(documentsRef, where(`members.${firebaseUser.uid}`, '!=', null));
    
    getDocs(q).then(querySnapshot => {
        const batch = writeBatch(db);
        querySnapshot.forEach(docSnap => {
            const docRef = doc(db, 'documents', docSnap.id);
            const memberUpdate = {
                [`members.${firebaseUser.uid}.name`]: name,
                [`members.${firebaseUser.uid}.avatar`]: avatar
            };
            batch.update(docRef, memberUpdate);
        });
        return batch.commit();
    }).catch(serverError => {
         const permissionError = new FirestorePermissionError({
            path: 'documents',
            operation: 'list',
        }, serverError);
        errorEmitter.emit('permission-error', permissionError);
    });

    setUser(prevUser => prevUser ? { ...prevUser, name, avatar, organizationName } : null);
  };
  
  const sendPasswordReset = async (email: string): Promise<void> => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        throw new Error(error.message);
    }
  }
  
  const enable2FA = async (code: string) => {
    if (!user) {
        console.error('[2FA DEBUG] No user authenticated.');
        throw new Error("Not authenticated");
    }
    const result = await verify2faCode(user.id, code);

    if (result.success) {
        const userDocRef = doc(db, 'users', user.id);
        const updateData = { is2faEnabled: true };
        
        await updateDoc(userDocRef, updateData)
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'update',
                    requestResourceData: updateData
                }, serverError);
                errorEmitter.emit('permission-error', permissionError);
                setUser(prev => prev ? ({ ...prev, is2faEnabled: false }) : null);
            });

        setUser(prev => prev ? ({ ...prev, is2faEnabled: true }) : null);

    } else {
        throw new Error(result.error || "Failed to enable 2FA.");
    }
  };

  const value = { user, loading, login, signup, logout, updateUserProfile, loginWithGoogle, loginWithMicrosoft, loginWithFacebook, sendPasswordReset, enable2FA, verify2faAndLogin };

  return (
    <AuthContext.Provider value={value}>
        {children}
        <Verify2faDialog 
            isOpen={is2faVerificationRequired}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setIs2faVerificationRequired(false);
                    if (auth.currentUser) {
                      signOut(auth);
                    }
                }
            }}
            userId={userIdFor2fa}
            userEmail={userEmailFor2fa}
        />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

    