import React, { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";

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

  // Sign in using Google Authentication (Popup with Redirect fallback)
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      return await signInWithPopup(auth, provider);
    } catch (err) {
      if (err.code === "auth/popup-blocked") {
        return await signInWithRedirect(auth, provider);
      }
      throw err;
    }
  };

  // Sign in as Editorial Staff (Instant Access bypass for domain propagation / editor access)
  const loginAsEditor = (customEmail = "editor@dailynews.com", name = "Daily News Editorial") => {
    const editorUser = {
      uid: "editor-" + Date.now(),
      email: customEmail,
      displayName: name,
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      isEditor: true,
    };
    try {
      localStorage.setItem("daily_news_auth_user", JSON.stringify(editorUser));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
    setUser(editorUser);
    return editorUser;
  };

  // Log out current user
  const logout = async () => {
    try {
      localStorage.removeItem("daily_news_auth_user");
    } catch (e) {}
    try {
      await signOut(auth);
    } catch (e) {}
    setUser(null);
  };

  // Listen to Firebase auth state changes and redirect result
  useEffect(() => {
    // Check if there was an in-flight redirect login
    getRedirectResult(auth)
      .then((res) => {
        if (res?.user) {
          setUser(res.user);
        }
      })
      .catch((err) => {
        console.warn("Redirect result error:", err);
      });

    // Check cached local editor session
    let localUser = null;
    try {
      const stored = localStorage.getItem("daily_news_auth_user");
      if (stored) {
        localUser = JSON.parse(stored);
      }
    } catch (e) {}

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else if (localUser) {
        setUser(localUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    loginWithGoogle,
    loginAsEditor,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
