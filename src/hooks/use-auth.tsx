
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
import { send2faCode, verifyAndEnable2FA } from '@/app/actions';
import { Verify2faDialog } from '@/components/auth/verify-2fa-dialog';
import { useToast } from './use-toast';


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
  verify2faAndLogin: (userId: string, code: string) => Promise<void>;
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
  const [tempFirebaseUser, setTempFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!is2faVerificationRequired) {
            const formattedUser = await formatUser(firebaseUser);
            localStorage.setItem('lastUserEmail', formattedUser.email);
            localStorage.setItem('lastUserName', formattedUser.name);
            setUser(formattedUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [is2faVerificationRequired]);
  
  const handleSuccessfulLogin = useCallback(async (firebaseUser: FirebaseUser) => {
    setLoading(true);
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (userData?.is2faEnabled) {
      setUserIdFor2fa(firebaseUser.uid);
      setTempFirebaseUser(firebaseUser);
      setIs2faVerificationRequired(true);
      await send2faCode(firebaseUser.uid);
      // We don't sign out, just wait for verification
    } else {
      // Regular login
      const formattedUser = await formatUser(firebaseUser);
      setUser(formattedUser);
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect ? decodeURIComponent(redirect) : '/dashboard');
    }
    setLoading(false);
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

  const verify2faAndLogin = async (userId: string, code: string) => {
    if (!tempFirebaseUser || tempFirebaseUser.uid !== userId) {
        throw new Error("User session mismatch during 2FA verification.");
    }
    // Using the in-memory store via server action
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists()) throw new Error("User not found");

    // This part is now a pseudo-verification as the real check is in the server action
    // But we need to do it to avoid depending on the server action's response for login flow
    // In a real app with a dedicated backend, the server action would return a custom token
    const { success, error } = await verifyAndEnable2FA(userId, code);
    
    if (success) {
      // If code is valid, finalize the login
      setIs2faVerificationRequired(false);
      setUserIdFor2fa(null);
      const formattedUser = await formatUser(tempFirebaseUser);
      setUser(formattedUser);
      setTempFirebaseUser(null);
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
        await setDoc(userDocRef, {
            name,
            email,
            avatar,
            is2faEnabled: false,
        });
        
        localStorage.setItem('lastLoginProvider', 'password');
        // onAuthStateChanged will handle setting the new user
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
      const userDoc = await getDoc(userDocRef);

      let isNewUser = false;
      if (!userDoc.exists()) {
          isNewUser = true;
          await setDoc(userDocRef, {
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              avatar: firebaseUser.photoURL,
              is2faEnabled: false,
          });
      }
      
      // @ts-ignore
      localStorage.setItem('lastLoginProvider', provider.providerId);
      const formattedUser = await formatUser(firebaseUser);
      setUser(formattedUser);
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect ? decodeURIComponent(redirect) : '/dashboard');

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
    
    // 1. Update Firebase Auth profile
    await updateProfile(firebaseUser, { displayName: name, photoURL: avatar });

    // 2. Update user document in 'users' collection
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userDocRef, { name, avatar, organizationName }, { merge: true });

    // 3. Update 'members' field in all relevant documents
    const documentsRef = collection(db, 'documents');
    const q = query(documentsRef, where(`members.${firebaseUser.uid}`, '!=', null));
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);
    querySnapshot.forEach(docSnap => {
        const docRef = doc(db, 'documents', docSnap.id);
        const memberUpdate = {
            [`members.${firebaseUser.uid}.name`]: name,
            [`members.${firebaseUser.uid}.avatar`]: avatar
        };
        batch.update(docRef, memberUpdate);
    });
    await batch.commit();


    // 4. Update local state
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
    const result = await verifyAndEnable2FA(user.id, code);

    if (result.success) {
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
                    // If dialog is closed, cancel the 2FA attempt
                    setIs2faVerificationRequired(false);
                    setUserIdFor2fa(null);
                    setTempFirebaseUser(null);
                    signOut(auth); // Fully sign out
                }
            }}
            userId={userIdFor2fa}
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
