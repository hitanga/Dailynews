import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";

// Purge any stale legacy cached database or project IDs from the user's browser localStorage
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("custom_firebase_config");
  } catch (e) {
    // Ignore storage exceptions
  }
}

export function getActiveFirebaseConfig() {
  return {
    apiKey:
      import.meta.env.VITE_FIREBASE_API_KEY ||
      appletConfig.apiKey ||
      "",
    authDomain:
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
      appletConfig.authDomain ||
      "blog-8bfbc.firebaseapp.com",
    projectId:
      import.meta.env.VITE_FIREBASE_PROJECT_ID ||
      appletConfig.projectId ||
      "blog-8bfbc",
    storageBucket:
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
      appletConfig.storageBucket ||
      "blog-8bfbc.firebasestorage.app",
    messagingSenderId:
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
      appletConfig.messagingSenderId ||
      "41510846951",
    appId:
      import.meta.env.VITE_FIREBASE_APP_ID ||
      appletConfig.appId ||
      "1:41510846951:web:45127ecea19640cf1afd42",
    firestoreDatabaseId: "(default)",
  };
}

const firebaseConfig = getActiveFirebaseConfig();

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore strictly targeting the default database (compatible with Vercel and production)
export const db = getFirestore(app);

export default app;
