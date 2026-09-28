import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";

// Clean up any stale legacy cached config in localStorage
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("custom_firebase_config");
  } catch (e) {
    // Ignore storage errors
  }
}

export function getActiveFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId || "",
    firestoreDatabaseId: "(default)",
  };
}

const firebaseConfig = getActiveFirebaseConfig();

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore on the project's standard (default) database
export const db = getFirestore(app);

export default app;
