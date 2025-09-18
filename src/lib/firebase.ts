// It looks like you've provided some code to start. We'll be using this as a reference to get you connected to Firebase.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// The environment variables are checked to determine if the code is running on the server or client.
// On the server, it uses the server-specific environment variables. On the client, it uses the NEXT_PUBLIC_ variables.
const firebaseConfig = {
  apiKey: typeof window === 'undefined' ? process.env.FIREBASE_API_KEY : process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: typeof window === 'undefined' ? process.env.FIREBASE_AUTH_DOMAIN : process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: typeof window === 'undefined' ? process.env.FIREBASE_PROJECT_ID : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: typeof window === 'undefined' ? process.env.FIREBASE_STORAGE_BUCKET : process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: typeof window === 'undefined' ? process.env.FIREBASE_MESSAGING_SENDER_ID : process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: typeof window === 'undefined' ? process.env.FIREBASE_APP_ID : process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: typeof window === 'undefined' ? process.env.FIREBASE_MEASUREMENT_ID : process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
