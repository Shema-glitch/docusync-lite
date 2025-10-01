
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction, useCallback } from 'react';
import { Zap, Upload, Search, Star, ShieldCheck } from 'lucide-react';

const ONBOARDING_STORAGE_KEY_COMPLETE = 'docusync-onboarding-complete';
const ONBOARDING_STORAGE_KEY_STEP = 'docusync-onboarding-step';

const steps = [
    {
        title: "Welcome to DocuSync Lite!",
        description: "This quick tour will show you the key features to get you started. You'll learn how to upload, find, and organize your documents.",
        icon: Zap,
        targetId: null,
    },
    {
        title: "Upload Your First Document",
        description: "Click here to upload files. You can drag and drop or browse your computer. It's the first step to building your digital vault.",
        icon: Upload,
        targetId: 'step-1-upload',
        route: '/dashboard',
    },
    {
        title: "Search Across Everything",
        description: "Use the search bar to instantly find documents by title, content, or tags. Never lose a file again.",
        icon: Search,
        targetId: 'step-2-search',
        route: null,
    },
    {
        title: "Star Your Favorites",
        description: "Hover over any document and click the star icon to pin it for quick access from your dashboard.",
        icon: Star,
        targetId: 'step-3-favorite',
        route: '/documents',
    },
    {
        title: "Secure Your Account",
        description: "Head to Settings > Security to enable Two-Factor Authentication (2FA). It adds an extra layer of protection.",
        icon: ShieldCheck,
        targetId: 'step-4-security',
        route: '/settings',
    },
];

interface OnboardingContextType {
  isGuideVisible: boolean;
  setIsGuideVisible: Dispatch<SetStateAction<boolean>>;
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  completeOnboarding: () => void;
  startOnboarding: () => void;
  steps: typeof steps;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  useEffect(() => {
    // This effect should only run once on the client-side
    const onboardingComplete = localStorage.getItem(ONBOARDING_STORAGE_KEY_COMPLETE);
    if (!onboardingComplete) {
      const savedStep = parseInt(localStorage.getItem(ONBOARDING_STORAGE_KEY_STEP) || '0', 10);
      setCurrentStep(savedStep);
      setIsGuideVisible(true); // Show the guide if not completed
    }
    setHasCheckedStorage(true);
  }, []);

  const updateStep = useCallback((step: number) => {
    setCurrentStep(step);
    localStorage.setItem(ONBOARDING_STORAGE_KEY_STEP, step.toString());
  }, []);

  const nextStep = () => {
    updateStep(currentStep + 1);
  };

  const prevStep = () => {
    updateStep(Math.max(0, currentStep - 1));
  };
  
  const startOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY_COMPLETE);
    updateStep(0);
    setIsGuideVisible(true);
  }

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY_COMPLETE, 'true');
    localStorage.removeItem(ONBOARDING_STORAGE_KEY_STEP);
    setIsGuideVisible(false);
    updateStep(0);
  };

  // Only render children after checking local storage to prevent flash of incorrect state
  if (!hasCheckedStorage) {
    return null;
  }

  const value = {
    isGuideVisible,
    setIsGuideVisible,
    currentStep,
    nextStep,
    prevStep,
    completeOnboarding,
    startOnboarding,
    steps,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
