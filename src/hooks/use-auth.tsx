
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
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

// Mock user data
const MOCK_USER: User = {
  id: '1',
  name: 'Demo User',
  email: 'user@example.com',
  avatar: 'https://placehold.co/100x100.png',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in from a previous session
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
        if (password === 'password') {
          const loggedInUser = { ...MOCK_USER, email };
          setUser(loggedInUser);
          localStorage.setItem('user', JSON.stringify(loggedInUser));
          setLoading(false);
          resolve();
        } else {
          setLoading(false);
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = { ...MOCK_USER, id: Date.now().toString(), name, email };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        setLoading(false);
        resolve();
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
