
'use client';

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;
  serverError: any;

  constructor(context: SecurityRuleContext, serverError?: any) {
    const deniedMessage = `Firestore Security Rules denied the following request:
${JSON.stringify({
  path: context.path,
  operation: context.operation,
  // Note: auth context will be added by the listener from the current user state
}, null, 2)}`;

    super(deniedMessage);
    this.name = 'FirestorePermissionError';
    this.context = context;
    this.serverError = serverError;

    // This is for V8 JS engines (like Node.js, Chrome)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }
}
