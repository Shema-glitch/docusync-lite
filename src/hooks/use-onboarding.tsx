
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction, useCallback } from 'react';

const ONBOARDING_STORAGE_KEY_COMPLETE = 'docusync-onboarding-complete';
const ONBOARDING_STORAGE_KEY_STEP = 'docusync-onboarding-step';

interface OnboardingContextType {
  isGuideVisible: boolean;
  setIsGuideVisible: Dispatch<SetStateAction<boolean>>;
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  completeOnboarding: () => void;
  startOnboarding: () => void;
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
