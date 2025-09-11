
// It looks like you've provided some code to start. We'll be using this as a reference to get you connected to Firebase.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQPWIV5GJorq0sb9JZ-2hpTC9YEtwEP8A",
  authDomain: "docusync-lite-4254f.firebaseapp.com",
  projectId: "docusync-lite-4254f",
  storageBucket: "docusync-lite-4254f.appspot.com",
  messagingSenderId: "146120250858",
  appId: "1:146120250858:web:f2cb3647644048b80f4e93"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
