import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onSearch }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    }
    setSearchOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-100">
      {/* Search Bar Drawer (Opens when clicking SEARCH in the navigation - No search icon) */}
      {searchOpen && (
        <div className="bg-[#1e2024] text-white py-4 px-4 sm:px-8 border-b border-gray-800 transition-all">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3">
              <input
                type="text"
                autoFocus
                placeholder="Type keywords and press Enter to search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-gray-400 text-sm font-medium focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#f84560] hover:bg-[#e0344f] text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
              >
                Search
              </button>
            </form>
            <button
              onClick={() => setSearchOpen(false)}
              className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider px-2 py-1 cursor-pointer shrink-0"
              aria-label="Close search"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Top Header Bar: Left-Aligned Logo and Right-Aligned User Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left Side: Daily News Logo & Subtitle */}
          <div className="flex flex-col items-start text-left">
            <Link to="/" className="inline-block group">
              <span className="font-heading font-black tracking-tight text-3xl sm:text-4xl lg:text-[44px] text-gray-900 uppercase block leading-none">
                DAILY NEWS
              </span>
            </Link>
            <span className="block text-[8px] sm:text-[9.5px] md:text-[10px] font-semibold tracking-[0.24em] text-gray-500 uppercase mt-1.5">
              MULTIPURPOSE MAGAZINE AND BLOG
            </span>
          </div>

          {/* Right Side: Editorial / User Login / Dashboard (No social icons) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-800 hover:text-[#f84560] bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded transition-colors"
                >
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  )}
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider px-2 py-1 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-[#f84560] bg-gray-50 hover:bg-gray-100 px-3.5 py-1.5 rounded transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Center Navigation Bar: Home, News, Search (no icon), Contact */}
      <nav className="border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-center gap-8 sm:gap-14 py-3.5 text-[11px] sm:text-xs font-bold tracking-[0.16em] uppercase text-gray-800">
            {/* 1. HOME */}
            <li>
              <Link
                to="/"
                className={`transition-colors ${
                  location.pathname === "/" && !location.search.includes("category=news")
                    ? "text-[#f84560]"
                    : "hover:text-[#f84560]"
                }`}
              >
                HOME
              </Link>
            </li>

            {/* 2. NEWS */}
            <li>
              <Link
                to="/?category=news"
                className={`transition-colors ${
                  location.search.includes("category=news")
                    ? "text-[#f84560]"
                    : "hover:text-[#f84560]"
                }`}
              >
                NEWS
              </Link>
            </li>

            {/* 3. FUN FACTS */}
            <li>
              <Link
                to="/?category=fun facts"
                className={`transition-colors ${
                  location.search.includes("category=fun")
                    ? "text-[#f84560]"
                    : "hover:text-[#f84560]"
                }`}
              >
                FUN FACTS
              </Link>
            </li>

            {/* 4. SEARCH (No Search Icon) */}
            <li>
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className={`transition-colors font-bold cursor-pointer uppercase tracking-[0.16em] ${
                  searchOpen ? "text-[#f84560]" : "text-gray-800 hover:text-[#f84560]"
                }`}
              >
                SEARCH
              </button>
            </li>

            {/* 4. CONTACT */}
            <li>
              <Link
                to="/contact"
                className={`transition-colors ${
                  location.pathname === "/contact"
                    ? "text-[#f84560]"
                    : "hover:text-[#f84560]"
                }`}
              >
                CONTACT
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
