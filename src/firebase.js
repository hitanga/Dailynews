import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";

// Retrieve active Firebase configuration (supports custom project overrides from localStorage or env vars)
export function getActiveFirebaseConfig() {
  if (typeof window !== "undefined") {
    try {
      const customStr = localStorage.getItem("custom_firebase_config");
      if (customStr) {
        const custom = JSON.parse(customStr);
        if (custom.apiKey && custom.projectId) {
          return custom;
        }
      }
    } catch (e) {
      console.warn("Error reading custom_firebase_config:", e);
    }
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId || "",
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || appletConfig.firestoreDatabaseId || "",
  };
}

const firebaseConfig = getActiveFirebaseConfig();

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
const dbId = firebaseConfig.firestoreDatabaseId;
export const db = dbId && dbId !== "(default)"
  ? getFirestore(app, dbId)
  : getFirestore(app);

export default app;
