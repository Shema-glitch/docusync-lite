
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

// For our mock auth, we'll store user with password in a different object
interface StoredUser extends User {
    password_insecure: string;
}


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_AVATAR = 'https://placehold.co/100x100.png';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in from a previous session
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
        console.error("Could not parse user from local storage", error);
        localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
            const storedUsersJSON = localStorage.getItem('users_db');
            const storedUsers: StoredUser[] = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
            const foundUser = storedUsers.find(u => u.email === email);

            if (foundUser && foundUser.password_insecure === password) {
                const { password_insecure, ...userToLogin } = foundUser;
                setUser(userToLogin);
                localStorage.setItem('user', JSON.stringify(userToLogin));
                setLoading(false);
                resolve();
            } else {
                 setLoading(false);
                 reject(new Error('Invalid email or password'));
            }
        } catch(e) {
            console.error("Login failed", e);
            setLoading(false);
            reject(new Error('An unexpected error occurred during login.'));
        }
      }, 1000);
    });
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
            const storedUsersJSON = localStorage.getItem('users_db');
            const storedUsers: StoredUser[] = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
            
            if (storedUsers.some(u => u.email === email)) {
                setLoading(false);
                return reject(new Error('A user with this email already exists.'));
            }

            const newUser: StoredUser = { 
                id: Date.now().toString(), 
                name, 
                email, 
                avatar: MOCK_AVATAR,
                password_insecure: password // In a real app, NEVER store plain text passwords
            };

            storedUsers.push(newUser);
            localStorage.setItem('users_db', JSON.stringify(storedUsers));
            
            const { password_insecure, ...userToLogin } = newUser;
            setUser(userToLogin);
            localStorage.setItem('user', JSON.stringify(userToLogin));
            setLoading(false);
            resolve();
        } catch(e) {
             console.error("Signup failed", e);
            setLoading(false);
            reject(new Error('An unexpected error occurred during signup.'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
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
