
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const ACCENT_COLOR_KEY = 'docusync-accent-color';
const FONT_SIZE_KEY = 'docusync-font-size';

export const accentColors = [
    { name: 'Orange', class: 'bg-orange-500', value: '25 95% 53%' }, // Changed to HSL values only
    { name: 'Blue', class: 'bg-blue-500', value: '217 91% 60%' },   // Changed to HSL values only
    { name: 'Green', class: 'bg-green-500', value: '142 71% 45%' },  // Changed to HSL values only
    { name: 'Purple', class: 'bg-purple-500', value: '258 90% 47%' }, // Changed to HSL values only
    { name: 'Rose', class: 'bg-rose-500', value: '347 90% 55%' },  // Changed to HSL values only
];

const DEFAULT_ACCENT_COLOR = accentColors[0].value;
const DEFAULT_FONT_SIZE = 14;

interface AppearanceContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  const [accentColor, setAccentColorState] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_ACCENT_COLOR;
    return localStorage.getItem(ACCENT_COLOR_KEY) || DEFAULT_ACCENT_COLOR;
  });

  const [fontSize, setFontSizeState] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_FONT_SIZE;
    return parseInt(localStorage.getItem(FONT_SIZE_KEY) || `${DEFAULT_FONT_SIZE}`, 10);
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const setAccentColor = useCallback((color: string) => {
    setAccentColorState(color);
    if (isClient) {
      localStorage.setItem(ACCENT_COLOR_KEY, color);
    }
  }, [isClient]);

  const setFontSize = useCallback((size: number) => {
    setFontSizeState(size);
    if (isClient) {
      localStorage.setItem(FONT_SIZE_KEY, size.toString());
    }
  }, [isClient]);


  useEffect(() => {
    if (isClient) {
      // This now sets --primary to just the HSL values, e.g., '25 95% 53%'
      document.documentElement.style.setProperty('--primary', accentColor);
    }
  }, [accentColor, isClient]);

  useEffect(() => {
    if (isClient) {
      document.documentElement.style.fontSize = `${fontSize}px`;
    }
  }, [fontSize, isClient]);
  

  const value = {
    fontSize,
    setFontSize,
    accentColor,
    setAccentColor,
  };

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
}
