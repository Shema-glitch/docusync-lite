// src/lib/server-init.ts
import admin from 'firebase-admin';
import { config } from 'dotenv';
config();

// Initialize Firebase Admin SDK
// This file should be imported at the top of any server-side entry point
// to ensure that the SDK is initialized before any other code runs.
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) : undefined;

    if (serviceAccount) {
         admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
    } else {
        // Fallback for environments where Application Default Credentials are set via file path or service account
         admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
    }
    
    console.log('Firebase Admin SDK initialized successfully.');

  } catch (error) {
    console.error('Firebase admin initialization error in server-init.ts', error);
  }
}
