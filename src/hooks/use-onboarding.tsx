
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';

const ONBOARDING_STORAGE_KEY = 'docusync-onboarding-complete';

interface OnboardingContextType {
  isFirstTime: boolean;
  setIsFirstTime: Dispatch<SetStateAction<boolean>>;
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // This effect should only run on the client-side
    const onboardingComplete = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!onboardingComplete) {
      setIsFirstTime(true);
    }
  }, []);

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsFirstTime(false);
    setCurrentStep(0);
  };

  const value = {
    isFirstTime,
    setIsFirstTime,
    currentStep,
    nextStep,
    prevStep,
    completeOnboarding,
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
