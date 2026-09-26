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

// Designated Admin Email
export const ADMIN_EMAIL = "championhonehy@gmail.com";

// Helper to verify if user has admin privileges
export const checkIsAdmin = (user) => {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase().trim();
  // Grant admin access to championhonehy@gmail.com (and championhoney@gmail.com if typo)
  return email === "championhonehy@gmail.com" || email === "championhoney@gmail.com";
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
    return await signInWithEmailAndPassword(auth, trimmedEmail, password);
  };

  // Register / Sign up with Email and Password
  const signUpWithEmail = async (email, password, displayName = "") => {
    const trimmedEmail = email.trim();
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

    return userCredential;
  };

  // Send Password Reset Email
  const resetPassword = async (email) => {
    const trimmedEmail = email.trim();
    return await sendPasswordResetEmail(auth, trimmedEmail);
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

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
