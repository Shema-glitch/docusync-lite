
'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';
import { useAuth } from '@/hooks/use-auth';

export function FirebaseErrorListener() {
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error("Caught Firestore Permission Error:", error);

      const contextualError = `
        FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
        ${JSON.stringify({
          auth: user ? { uid: user.id, token: { name: user.name, email: user.email } } : null,
          method: error.context.operation,
          path: `/databases/(default)/documents/${error.context.path}`,
          requestData: error.context.requestResourceData
        }, null, 2)}
      `;

      // In a real app, you might log this to a service like Sentry.
      // For development, we'll throw to show it in the Next.js overlay.
      // We use a timeout to break out of the current event loop and ensure
      // the Next.js overlay picks up the uncaught exception.
      setTimeout(() => {
        throw new Error(contextualError);
      }, 0);
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast, user]);

  return null; // This component does not render anything
}
