import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import appletConfig from "../../firebase-applet-config.json";

export default function Login() {
  const [error, setError] = useState("");
  const [unauthorizedDomain, setUnauthorizedDomain] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const currentHostname = typeof window !== "undefined" ? window.location.hostname : "";
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || "axiomatic-constant-gmn89";
  const firebaseSettingsUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const copyHostname = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setUnauthorizedDomain(false);
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      console.error("Google Auth error:", err);

      if (err.code === "auth/unauthorized-domain") {
        setUnauthorizedDomain(true);
        setError("Domain Not Authorized: Firebase requires this domain to be added to Authorized Domains.");
      } else if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in window was closed before completing.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(err.message || "Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-16 bg-gray-50/50">
      <div className="max-w-lg w-full bg-white border border-gray-200 rounded p-8 sm:p-10 shadow-lg text-center">
        {/* Brand */}
        <span className="font-heading font-black tracking-tight text-3xl sm:text-4xl text-gray-900 uppercase block mb-1">
          DAILY NEWS
        </span>
        <span className="block text-[10px] font-semibold tracking-[0.22em] text-gray-500 uppercase mb-6">
          MULTIPURPOSE MAGAZINE AND BLOG
        </span>

        <h1 className="font-heading text-xl font-bold text-gray-900 mb-2">
          Editorial Sign In
        </h1>
        <p className="text-xs text-gray-600 mb-8">
          Sign in with your Google account to manage articles, publish content, and edit stories.
        </p>

        {/* Detailed Unauthorized Domain Resolution Card */}
        {unauthorizedDomain && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-left p-4 rounded text-sm text-amber-900">
            <h3 className="font-semibold text-amber-900 mb-1 flex items-center gap-1.5">
              <span>⚠️ Action Required: Authorize Domain in Firebase</span>
            </h3>
            <p className="text-xs text-amber-800 mb-3">
              Google OAuth only allows domains explicitly registered in your Firebase project. To enable Google Sign-In for this preview:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-white border border-amber-300 rounded p-2 gap-2">
                <span className="font-mono text-gray-800 break-all select-all">
                  {currentHostname}
                </span>
                <button
                  type="button"
                  onClick={copyHostname}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-2.5 py-1 rounded text-xs transition-colors shrink-0 cursor-pointer"
                >
                  {copied ? "Copied! ✓" : "Copy"}
                </button>
              </div>

              <ol className="list-decimal list-inside space-y-1 text-gray-700 pt-1">
                <li>
                  Click the <strong>Copy</strong> button above to copy this domain.
                </li>
                <li>
                  Open{" "}
                  <a
                    href={firebaseSettingsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline font-medium hover:text-blue-800"
                  >
                    Firebase Console &gt; Authentication &gt; Settings
                  </a>
                  .
                </li>
                <li>
                  Scroll down to <strong>Authorized domains</strong> and click <strong>Add domain</strong>.
                </li>
                <li>
                  Paste <code className="bg-amber-100 px-1 rounded">{currentHostname}</code> and click <strong>Done</strong>.
                </li>
                <li>
                  Return here and click <strong>Continue with Google</strong>!
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Standard Error message (if not unauthorized-domain) */}
        {error && !unauthorizedDomain && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded text-left">
            {error}
          </div>
        )}

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 border border-gray-300 rounded text-sm transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {/* Google SVG Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? "Signing in..." : "Continue with Google"}</span>
        </button>

        <p className="mt-8 text-xs text-gray-500">
          Note: When running locally on <code>localhost:3000</code>, Google Sign-In works immediately because localhost is pre-authorized by default.
        </p>
      </div>
    </div>
  );
}
