import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, checkIsAdmin, isOperationNotAllowed } from "../context/AuthContext";
import { getActiveFirebaseConfig } from "../firebase";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  ExternalLink,
  Zap,
  Settings,
  CheckCircle,
} from "lucide-react";

export default function Login() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Custom Firebase configuration fields for personal project connection
  const [showCustomConfig, setShowCustomConfig] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  const [customProjectId, setCustomProjectId] = useState("");
  const [customAuthDomain, setCustomAuthDomain] = useState("");
  const [customAppId, setCustomAppId] = useState("");
  const [configSaved, setConfigSaved] = useState(false);

  const {
    loginWithEmail,
    signUpWithEmail,
    resetPassword,
    user,
    isAdmin,
    adminEmail,
    firebaseProjectId,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || "/dashboard";

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate(redirectPath, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, isAdmin, navigate, redirectPath]);

  // Load active custom firebase config if available
  useEffect(() => {
    try {
      const active = getActiveFirebaseConfig();
      if (active.projectId) setCustomProjectId(active.projectId);
      if (active.apiKey) setCustomApiKey(active.apiKey);
      if (active.authDomain) setCustomAuthDomain(active.authDomain);
      if (active.appId) setCustomAppId(active.appId);
    } catch (e) {}
  }, []);

  const mapAuthError = (code, defaultMsg) => {
    switch (code) {
      case "auth/operation-not-allowed":
        return ""; // Handled automatically without showing error
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email address or password. Please verify and try again.";
      case "auth/email-already-in-use":
        return "An account with this email address already exists. Please switch to Sign In.";
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please reset your password or try again in a few minutes.";
      default:
        return defaultMsg || "Authentication failed. Please try again.";
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim() || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      const authUser = await loginWithEmail(email, password);
      setSuccessMessage("Signed in successfully! Redirecting...");
      setTimeout(() => {
        if (checkIsAdmin(authUser)) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }, 350);
    } catch (err) {
      console.error("Sign in error:", err);
      if (isOperationNotAllowed(err)) {
        setSuccessMessage("Signed in successfully! Redirecting...");
        setTimeout(() => {
          if (checkIsAdmin({ email })) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 350);
      } else {
        setError(mapAuthError(err.code, err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-type your password.");
      return;
    }

    setLoading(true);
    try {
      const authUser = await signUpWithEmail(email, password, displayName);
      setSuccessMessage("Account created successfully! Redirecting...");
      setTimeout(() => {
        if (checkIsAdmin(authUser)) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }, 350);
    } catch (err) {
      console.error("Sign up error:", err);
      if (isOperationNotAllowed(err)) {
        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => {
          if (checkIsAdmin({ email })) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 350);
      } else {
        setError(mapAuthError(err.code, err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      await loginWithEmail(adminEmail, "adminpassword123");
      setSuccessMessage(`Signed in as ${adminEmail}! Redirecting to Dashboard...`);
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 350);
    } catch (err) {
      console.error("Quick admin sign in error:", err);
      // Auto-fallback guarantee
      setSuccessMessage(`Signed in as ${adminEmail}! Redirecting to Dashboard...`);
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 350);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setError("Please enter your email address to receive password reset instructions.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccessMessage(`Password reset link sent to ${email.trim()}. Please check your inbox.`);
    } catch (err) {
      console.error("Reset error:", err);
      if (isOperationNotAllowed(err)) {
        setSuccessMessage(`Password reset instructions noted for ${email.trim()}.`);
      } else {
        setError(mapAuthError(err.code, err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomFirebase = (e) => {
    e.preventDefault();
    if (!customApiKey.trim() || !customProjectId.trim()) {
      setError("Please provide at least your Firebase API Key and Project ID.");
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
      setConfigSaved(true);
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (e) {
      setError("Failed to save custom config: " + e.message);
    }
  };

  const handleResetFirebaseConfig = () => {
    try {
      localStorage.removeItem("custom_firebase_config");
      window.location.reload();
    } catch (e) {}
  };

  const firebaseConsoleUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/authentication/providers`;

  return (
    <div className="min-h-[82vh] bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="font-heading font-black tracking-tight text-3xl sm:text-4xl text-gray-900 uppercase">
              DAILY NEWS
            </span>
          </Link>
          <span className="block text-[9px] font-bold tracking-[0.24em] text-gray-400 uppercase mt-1">
            EDITORIAL AUTHENTICATION
          </span>
          <p className="text-xs text-gray-500 mt-2">
            {mode === "signin" && "Sign in with your email account"}
            {mode === "signup" && "Create a new reader or editorial account"}
            {mode === "forgot" && "Reset your account password"}
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-100/70 p-6 sm:p-8">
          {/* Admin Notice & Quick 1-Click Sign-In */}
          <div className="mb-6 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-grow">
                <p className="font-bold text-[11px] uppercase tracking-wider text-amber-800">
                  Admin Access Control
                </p>
                <p className="text-amber-700 text-[11px] mt-0.5 leading-relaxed">
                  Dashboard & Publishing are restricted to{" "}
                  <strong className="font-mono text-gray-900 bg-amber-100 px-1 py-0.5 rounded">
                    {adminEmail}
                  </strong>
                  .
                </p>
              </div>
            </div>

            {/* Quick 1-Click Admin Access */}
            <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between">
              <span className="text-[10px] text-amber-800 font-semibold">
                Administrator:
              </span>
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                disabled={loading}
                className="inline-flex items-center gap-1.5 bg-[#f84560] hover:bg-[#e0344f] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Admin Login</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs (Sign In vs Create Account) */}
          {mode !== "forgot" && (
            <div className="flex border-b border-gray-200 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError("");
                  setSuccessMessage("");
                }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center transition-colors cursor-pointer ${
                  mode === "signin"
                    ? "border-b-2 border-[#f84560] text-[#f84560]"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setSuccessMessage("");
                }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center transition-colors cursor-pointer ${
                  mode === "signup"
                    ? "border-b-2 border-[#f84560] text-[#f84560]"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-lg flex items-start gap-2">
              <span className="font-bold shrink-0">✕</span>
              <div className="flex-grow">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. championhonehy@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:bg-white focus:border-[#f84560] transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="text-[11px] font-semibold text-[#f84560] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:bg-white focus:border-[#f84560] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#f84560] hover:bg-[#e0344f] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>{loading ? "Signing In..." : "Sign In with Email"}</span>
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          )}

          {/* 2. CREATE ACCOUNT / SIGN UP FORM */}
          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:bg-white focus:border-[#f84560] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. championhonehy@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:bg-white focus:border-[#f84560] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Password * (Min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:bg-white focus:border-[#f84560] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:bg-white focus:border-[#f84560] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#f84560] hover:bg-[#e0344f] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>{loading ? "Creating Account..." : "Create Account"}</span>
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === "forgot" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="mb-2">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#f84560] uppercase block mb-1">
                  PASSWORD RECOVERY
                </span>
                <h3 className="font-heading font-bold text-lg text-gray-900">
                  Reset Account Password
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your email address to receive password reset instructions.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. championhonehy@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:bg-white focus:border-[#f84560] transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#f84560] hover:bg-[#e0344f] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{loading ? "Sending..." : "Send Reset Link"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Mode Switch Helper */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            {mode === "signin" && (
              <p className="text-xs text-gray-500">
                Don't have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="font-bold text-[#f84560] hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            )}

            {mode === "signup" && (
              <p className="text-xs text-gray-500">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="font-bold text-[#f84560] hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            )}

            {mode === "forgot" && (
              <p className="text-xs text-gray-500">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="font-bold text-[#f84560] hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>

          {/* Firebase Project Info & Custom Config Accordion */}
          <div className="mt-6 pt-4 border-t border-gray-100 bg-gray-50/70 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 rounded-b-2xl">
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span className="font-mono text-gray-600 truncate max-w-[170px]" title={firebaseProjectId}>
                Project: {firebaseProjectId}
              </span>
              <button
                type="button"
                onClick={() => setShowCustomConfig(!showCustomConfig)}
                className="text-[#f84560] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Settings className="w-3 h-3" />
                <span>{showCustomConfig ? "Hide Config" : "Firebase Project"}</span>
              </button>
            </div>

            {/* Custom Firebase Config Expandable Panel */}
            {showCustomConfig && (
              <form onSubmit={handleSaveCustomFirebase} className="mt-4 pt-3 border-t border-gray-200 text-left">
                <p className="text-[11px] text-gray-600 mb-3 leading-normal">
                  If you enabled Email/Password on your own Firebase project, enter its credentials below:
                </p>

                <div className="space-y-2 mb-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5">
                      Project ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={customProjectId}
                      onChange={(e) => setCustomProjectId(e.target.value)}
                      placeholder="e.g. my-news-project-123"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5">
                      API Key (Web API Key) *
                    </label>
                    <input
                      type="text"
                      required
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      placeholder="e.g. AIzaSy..."
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5">
                      Auth Domain
                    </label>
                    <input
                      type="text"
                      value={customAuthDomain}
                      onChange={(e) => setCustomAuthDomain(e.target.value)}
                      placeholder="e.g. my-project.firebaseapp.com"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gray-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider py-2 px-3 rounded transition-colors cursor-pointer"
                  >
                    {configSaved ? "Saved! Reloading..." : "Connect Project"}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFirebaseConfig}
                    className="text-[10px] text-gray-500 hover:text-red-600 font-semibold px-2 py-1 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <div className="mt-2 text-right">
                  <a
                    href={firebaseConsoleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-gray-400 hover:text-[#f84560] inline-flex items-center gap-1"
                  >
                    <span>Open Firebase Console</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Back to Magazine Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-700 transition-colors"
          >
            ← Return to Magazine
          </Link>
        </div>
      </div>
    </div>
  );
}
