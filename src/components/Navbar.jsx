import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight hover:text-blue-600 transition-colors">
          My Blog
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            Home
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2"
              >
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                )}
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 transition-colors cursor-pointer bg-transparent border-0 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
