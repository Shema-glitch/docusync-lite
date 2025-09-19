
import admin from 'firebase-admin';
import './server-init'; // Ensure the SDK is initialized

export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
export const adminDb = admin.firestore();
