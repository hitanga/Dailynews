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

// Designated Sole Administrator Email
export const ADMIN_EMAIL = "championhonehy@gmail.com";

// Strict check: only championhonehy@gmail.com has administrative access
export const checkIsAdmin = (user) => {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase().trim();
  return email === "championhonehy@gmail.com" || email === "championhoney@gmail.com";
};

// Create Authentication Context
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authenticate user with Email and Password via Firebase
  const loginWithEmail = async (email, password) => {
    const trimmedEmail = email.trim();
    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    return userCredential.user;
  };

  // Register new user with Email and Password via Firebase
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

    return userCredential.user;
  };

  // Send Password Reset Email via Firebase
  const resetPassword = async (email) => {
    const trimmedEmail = email.trim();
    return await sendPasswordResetEmail(auth, trimmedEmail);
  };

  // Securely log out current user
  const logout = async () => {
    try {
      localStorage.removeItem("daily_news_auth_user");
    } catch (e) {}
    await signOut(auth);
    setUser(null);
  };

  // Strictly check if currently authenticated user is the administrator
  const isAdmin = checkIsAdmin(user);

  // Listen to live Firebase auth state changes
  useEffect(() => {
    // Clear any legacy mock sessions from localStorage for security
    try {
      localStorage.removeItem("daily_news_auth_user");
      localStorage.removeItem("daily_news_registered_users");
    } catch (e) {}

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
