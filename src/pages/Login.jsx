import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import appletConfig from "../../firebase-applet-config.json";
import { getActiveFirebaseConfig } from "../firebase";

export default function Login() {
  const [error, setError] = useState("");
  const [unauthorizedDomain, setUnauthorizedDomain] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Custom Firebase configuration fields for Vercel deployment
  const [customApiKey, setCustomApiKey] = useState("");
  const [customAuthDomain, setCustomAuthDomain] = useState("");
  const [customProjectId, setCustomProjectId] = useState("");
  const [customAppId, setCustomAppId] = useState("");
  const [configSuccess, setConfigSuccess] = useState(false);

  const { loginWithGoogle, loginAsEditor, user } = useAuth();
  const navigate = useNavigate();

  const currentHostname = typeof window !== "undefined" ? window.location.hostname : "";
  const activeConfig = getActiveFirebaseConfig();
  const projectId = activeConfig.projectId || appletConfig.projectId || "axiomatic-constant-gmn89";
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

  const handleGoogleLogin = async (preferRedirect = false) => {
    setError("");
    setUnauthorizedDomain(false);
    setLoading(true);

    try {
      await loginWithGoogle(preferRedirect);
      navigate("/dashboard");
    } catch (err) {
      console.error("Google Auth error:", err);

      if (err.code === "auth/unauthorized-domain") {
        setUnauthorizedDomain(true);
        setError("Domain Not Authorized: Firebase requires this domain to be added to Authorized Domains.");
      } else if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in window was closed before completing.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked. Switching to redirect sign-in...");
        try {
          await loginWithGoogle(true);
        } catch (redirectErr) {
          setError("Please allow popups or redirect authentication for this domain.");
        }
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(err.message || "Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditorLogin = () => {
    loginAsEditor();
    navigate("/dashboard");
  };

  const handleSaveCustomFirebase = (e) => {
    e.preventDefault();
    if (!customApiKey.trim() || !customProjectId.trim()) {
      setError("Please provide at least the API Key and Project ID.");
      return;
    }

    const configToSave = {
      apiKey: customApiKey.trim(),
      authDomain: customAuthDomain.trim() || `${customProjectId.trim()}.firebaseapp.com`,
      projectId: customProjectId.trim(),
      storageBucket: `${customProjectId.trim()}.appspot.com`,
      appId: customAppId.trim() || "",
    };

    try {
      localStorage.setItem("custom_firebase_config", JSON.stringify(configToSave));
      setConfigSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      console.error("Failed to save config:", err);
      setError("Unable to save custom configuration.");
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
          Sign in to manage articles, publish content, and edit stories.
        </p>

        {/* Detailed Unauthorized Domain Resolution Card */}
        {unauthorizedDomain && (
          <div className="mb-6 bg-amber-50 border border-amber-300 text-left p-4 rounded text-xs text-amber-900 space-y-3">
            <h3 className="font-bold text-amber-950 flex items-center gap-1.5 text-sm">
              <span>⚠️ Action Required: Domain Authorization on Vercel</span>
            </h3>
            
            <p className="text-amber-900 leading-relaxed">
              If you added <strong>{currentHostname}</strong> to Firebase Authorized Domains, this error occurs because:
            </p>

            <ul className="list-disc list-inside space-y-1.5 text-[11px] text-amber-950 font-medium">
              <li>
                <strong>1. Project ID Mismatch:</strong> Your Vercel build is currently pointing to project <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono font-bold">{projectId}</code>. If you added the domain to a different Firebase project, click below to connect your own project!
              </li>
              <li>
                <strong>2. Google OAuth CDN Propagation (5–10 min):</strong> If you just added the domain, Google servers take a few minutes to update globally.
              </li>
              <li>
                <strong>3. Instant Workaround:</strong> Click <strong>"Continue as Editorial Staff"</strong> below to enter the dashboard immediately without any delay!
              </li>
            </ul>

            <div className="pt-2 border-t border-amber-200 flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-gray-700 bg-white border border-amber-200 px-2 py-1 rounded select-all">
                {currentHostname}
              </span>
              <button
                type="button"
                onClick={copyHostname}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded text-xs transition-colors shrink-0 cursor-pointer"
              >
                {copied ? "Copied! ✓" : "Copy Domain"}
              </button>
            </div>
          </div>
        )}

        {/* Generic Error Notice */}
        {error && !unauthorizedDomain && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded text-left">
            {error}
          </div>
        )}

        {/* Sign In Action Buttons */}
        <div className="space-y-3">
          {/* 1. Google OAuth Button */}
          <button
            type="button"
            onClick={() => handleGoogleLogin(false)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold text-xs py-3 px-4 rounded transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {/* Google SVG Logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>{loading ? "Signing In with Google..." : "Continue with Google"}</span>
          </button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-gray-400">
              <span className="bg-white px-2">OR</span>
            </div>
          </div>

          {/* 2. Instant Editorial Staff Access Bypass */}
          <button
            type="button"
            onClick={handleEditorLogin}
            className="w-full bg-[#1e2024] hover:bg-[#2b2f35] text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded transition-colors shadow-sm cursor-pointer"
          >
            Continue as Editorial Staff (Instant Access)
          </button>
        </div>

        {/* Footer info note */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col gap-2">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Current Firebase Project: <span className="font-mono text-gray-700 font-semibold">{projectId}</span>
          </p>
          <button
            type="button"
            onClick={() => setShowConfigModal(!showConfigModal)}
            className="text-[11px] text-[#f84560] hover:underline font-bold"
          >
            {showConfigModal ? "Hide Custom Project Setup" : "Using your own Firebase project? Click here"}
          </button>
        </div>

        {/* Custom Project Config Form */}
        {showConfigModal && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded text-left text-xs">
            <h4 className="font-bold text-gray-900 mb-2">Connect Your Firebase Project</h4>
            <p className="text-gray-500 text-[11px] mb-3">
              If you authorized <code>{currentHostname}</code> in your personal Firebase project, enter its details here:
            </p>
            <form onSubmit={handleSaveCustomFirebase} className="space-y-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase">Project ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. my-daily-news-app"
                  value={customProjectId}
                  onChange={(e) => setCustomProjectId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase">API Key</label>
                <input
                  type="text"
                  required
                  placeholder="AIzaSy..."
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase">Auth Domain (optional)</label>
                <input
                  type="text"
                  placeholder="my-daily-news-app.firebaseapp.com"
                  value={customAuthDomain}
                  onChange={(e) => setCustomAuthDomain(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-xs bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#f84560] text-white font-bold py-2 rounded text-xs uppercase tracking-wider mt-2 cursor-pointer"
              >
                {configSuccess ? "Connected! Reloading..." : "Connect Project"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
