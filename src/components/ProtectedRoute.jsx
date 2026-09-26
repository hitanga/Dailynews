import React from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, LogOut, Home } from "lucide-react";

/**
 * ProtectedRoute component:
 * - Checks if auth is still loading (shows loading state)
 * - If user is not authenticated, redirects to /login
 * - Enforces Admin Access: Only championhonehy@gmail.com is allowed into Dashboard
 */
export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading, logout, adminEmail } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[#f84560] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
            Verifying Admin Credentials...
          </p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Signed in, but NOT the designated admin (championhonehy@gmail.com)
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl shadow-xl p-6 sm:p-8 text-center">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <span className="text-[10px] font-bold tracking-[0.2em] text-red-600 uppercase block mb-1">
            ACCESS DENIED
          </span>
          <h2 className="font-heading text-2xl font-black text-gray-900 mb-2">
            Admin Access Required
          </h2>

          <p className="text-xs text-gray-600 leading-relaxed mb-4">
            Access to the editorial dashboard is reserved exclusively for the site administrator (
            <strong className="font-mono text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">
              {adminEmail}
            </strong>
            ).
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 mb-6 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
              Currently Signed In As:
            </span>
            <span className="font-mono text-gray-900 font-semibold break-all">
              {user.email || "Unknown Reader"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={async () => {
                await logout();
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#f84560] hover:bg-[#e0344f] text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Account</span>
            </button>
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Magazine</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // User is verified administrator (championhonehy@gmail.com)
  return children;
}
