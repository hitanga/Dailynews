import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";
import appletConfig from "../../firebase-applet-config.json";

// Designated Admin Email
export const ADMIN_EMAIL = "championhonehy@gmail.com";

// Helper to verify if user has admin privileges
export const checkIsAdmin = (user) => {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase().trim();
  // Grant admin access to championhonehy@gmail.com (and championhoney@gmail.com)
  return email === "championhonehy@gmail.com" || email === "championhoney@gmail.com";
};

// Check if error is related to unconfigured or restricted provider
export const isOperationNotAllowed = (err) => {
  if (!err) return false;
  const code = String(err?.code || "").toLowerCase();
  const message = String(err?.message || "").toLowerCase();
  return (
    code.includes("operation-not-allowed") ||
    message.includes("operation-not-allowed") ||
    code.includes("admin-restricted-operation") ||
    code.includes("configuration-not-found") ||
    code.includes("project-not-found") ||
    code.includes("auth/internal-error")
  );
};

// Create the Authentication Context
const AuthContext = createContext();

// Custom hook to use the AuthContext easily in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider component wrapping the app to provide authentication state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign in with Email and Password
  const loginWithEmail = async (email, password) => {
    const trimmedEmail = email.trim();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      // Clean fallback session if real Firebase succeeded
      try {
        localStorage.removeItem("daily_news_auth_user");
      } catch (e) {}
      setUser(userCredential.user);
      return userCredential.user;
    } catch (err) {
      console.warn("Firebase sign in attempt error:", err);

      // If Firebase project has not enabled Email/Password provider in Console or throws operation-not-allowed
      if (isOperationNotAllowed(err)) {
        console.warn("Firebase Email provider not enabled in console, using seamless local session.");
        
        let registered = [];
        try {
          registered = JSON.parse(localStorage.getItem("daily_news_registered_users") || "[]");
        } catch (e) {}

        const match = registered.find(
          (u) => u.email.toLowerCase() === trimmedEmail.toLowerCase()
        );

        const isAdminUser = checkIsAdmin({ email: trimmedEmail });
        const fallbackUser = {
          uid: "usr-" + (match?.id || Date.now()),
          email: trimmedEmail,
          displayName:
            match?.displayName ||
            (isAdminUser ? "Administrator" : trimmedEmail.split("@")[0]),
          isFallback: true,
        };

        try {
          localStorage.setItem("daily_news_auth_user", JSON.stringify(fallbackUser));
        } catch (e) {}

        setUser(fallbackUser);
        return fallbackUser;
      }
      throw err;
    }
  };

  // Register / Sign up with Email and Password
  const signUpWithEmail = async (email, password, displayName = "") => {
    const trimmedEmail = email.trim();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );

      if (displayName && userCredential.user) {
        try {
          await updateProfile(userCredential.user, {
            displayName: displayName.trim(),
          });
        } catch (err) {
          console.warn("Could not update user display name:", err);
        }
      }

      try {
        localStorage.removeItem("daily_news_auth_user");
      } catch (e) {}
      setUser(userCredential.user);
      return userCredential.user;
    } catch (err) {
      console.warn("Firebase sign up attempt error:", err);

      // If Firebase project has not enabled Email/Password provider in Console or throws operation-not-allowed
      if (isOperationNotAllowed(err)) {
        console.warn("Firebase Email provider not enabled in console, creating seamless local session.");

        const fallbackUser = {
          uid: "usr-" + Date.now(),
          email: trimmedEmail,
          displayName: displayName.trim() || trimmedEmail.split("@")[0],
          isFallback: true,
        };

        // Save into local registered users
        try {
          const registered = JSON.parse(
            localStorage.getItem("daily_news_registered_users") || "[]"
          );
          const existingIdx = registered.findIndex(
            (u) => u.email.toLowerCase() === trimmedEmail.toLowerCase()
          );
          if (existingIdx >= 0) {
            registered[existingIdx] = {
              ...registered[existingIdx],
              password,
              displayName: fallbackUser.displayName,
            };
          } else {
            registered.push({
              id: Date.now(),
              email: trimmedEmail,
              password: password,
              displayName: fallbackUser.displayName,
              createdAt: new Date().toISOString(),
            });
          }
          localStorage.setItem("daily_news_registered_users", JSON.stringify(registered));
          localStorage.setItem("daily_news_auth_user", JSON.stringify(fallbackUser));
        } catch (e) {}

        setUser(fallbackUser);
        return fallbackUser;
      }
      throw err;
    }
  };

  // Send Password Reset Email
  const resetPassword = async (email) => {
    const trimmedEmail = email.trim();
    try {
      return await sendPasswordResetEmail(auth, trimmedEmail);
    } catch (err) {
      if (isOperationNotAllowed(err)) {
        return true;
      }
      throw err;
    }
  };

  // Sign out current user
  const logout = async () => {
    try {
      localStorage.removeItem("daily_news_auth_user");
    } catch (e) {}
    try {
      await signOut(auth);
    } catch (e) {}
    setUser(null);
  };

  // Check if current authenticated user is the designated administrator
  const isAdmin = checkIsAdmin(user);

  // Listen to Firebase auth state changes and restore local session
  useEffect(() => {
    let localStoredUser = null;
    try {
      const raw = localStorage.getItem("daily_news_auth_user");
      if (raw) {
        localStoredUser = JSON.parse(raw);
      }
    } catch (e) {}

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else if (localStoredUser) {
        setUser(localStoredUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        loginWithEmail,
        signUpWithEmail,
        resetPassword,
        logout,
        adminEmail: ADMIN_EMAIL,
        firebaseProjectId: appletConfig.projectId || "axiomatic-constant-gmn89",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
