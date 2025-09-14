
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

export function useSessionTimeout() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(() => {
    logout().then(() => {
        toast({
            title: 'Session Timed Out',
            description: 'You have been logged out due to inactivity.',
        });
    });
  }, [logout, toast]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (user) {
      timeoutRef.current = setTimeout(handleLogout, TIMEOUT_DURATION);
    }
  }, [user, handleLogout]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach(event => window.addEventListener(event, handleActivity));
    resetTimeout(); // Initial setup

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, resetTimeout]);
}
