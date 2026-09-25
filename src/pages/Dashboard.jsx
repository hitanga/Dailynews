import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../components/BlogCard";
import { seedInitialBlogsIfEmpty, combineBlogsConsistently } from "../utils/seedData";
import { stripHtml } from "../utils/contentFormatter";

export default function Dashboard() {
  const [blogs, setBlogs] = useState([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("all"); // "all" | "news" | "fun-facts"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);

  // Delete confirmation modal state
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchBlogs();
  }, [location]);

  const fetchBlogs = async () => {
    setLoading(true);
    setError("");

    // 1. Load locally cached / created blogs
    let localCustom = [];
    try {
      localCustom = JSON.parse(
        localStorage.getItem("daily_news_custom_blogs") || "[]"
      );
    } catch (e) {
      localCustom = [];
    }

    // 2. Fetch live Firestore documents
    let firestoreDocs = [];
    try {
      const blogsRef = collection(db, "blogs");
      let snapshot;
      try {
        const q = query(blogsRef, orderBy("createdAt", "desc"));
        snapshot = await getDocs(q);
      } catch (orderErr) {
        snapshot = await getDocs(blogsRef);
      }

      if (snapshot && !snapshot.empty) {
        firestoreDocs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
      }
    } catch (err) {
      console.warn("Firestore fetch error, falling back to local posts:", err);
    }

    // 3. Combine custom blogs, firestore documents, and sample stories
    const combined = combineBlogsConsistently(firestoreDocs, localCustom);
    setBlogs(combined);
    setLoading(false);
  };

  const handleSeedDefaults = async () => {
    setIsSeeding(true);
    try {
      await seedInitialBlogsIfEmpty();
      await fetchBlogs();
      setSuccessMessage("Sample articles synchronized with Firestore!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Seeding error:", err);
      setError("Could not populate sample articles.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;

    setIsDeleting(true);
    try {
      // 1. Delete from Firestore
      try {
        await deleteDoc(doc(db, "blogs", blogToDelete.id));
      } catch (firestoreErr) {
        console.warn("Firestore delete issue:", firestoreErr);
      }

      // 2. Remove from local custom blogs if present
      try {
        const localList = JSON.parse(
          localStorage.getItem("daily_news_custom_blogs") || "[]"
        );
        const updated = localList.filter((b) => b.id !== blogToDelete.id);
        localStorage.setItem("daily_news_custom_blogs", JSON.stringify(updated));
      } catch (storageErr) {
        console.warn("Storage update issue:", storageErr);
      }

      // 3. Save to deleted IDs blacklist
      try {
        const delList = JSON.parse(
          localStorage.getItem("daily_news_deleted_ids") || "[]"
        );
        if (!delList.includes(blogToDelete.id)) {
          delList.push(blogToDelete.id);
          localStorage.setItem("daily_news_deleted_ids", JSON.stringify(delList));
        }
      } catch (delErr) {}

      // Update state
      setBlogs((prev) => prev.filter((b) => b.id !== blogToDelete.id));
      setSuccessMessage("Story deleted successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err) {
      console.error("Error deleting blog:", err);
      setError("Failed to delete blog. Please try again.");
    } finally {
      setIsDeleting(false);
      setBlogToDelete(null);
    }
  };

  const isFunFact = (blog) =>
    (blog.category || "").toLowerCase().includes("fun fact");

  // Calculate category counts
  const newsCount = blogs.filter((b) => !isFunFact(b)).length;
  const funFactsCount = blogs.filter((b) => isFunFact(b)).length;

  // Filter based on active category tab
  const displayedBlogs = blogs.filter((blog) => {
    if (selectedCategoryTab === "news") return !isFunFact(blog);
    if (selectedCategoryTab === "fun-facts") return isFunFact(blog);
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 mb-8 gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#f84560] uppercase mb-1 block">
            DAILY NEWS EDITORIAL
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Editorial Dashboard
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            <p className="text-xs text-gray-500">
              Authenticated editor: <span className="font-medium text-gray-800">{user?.displayName || user?.email || "Editorial Staff"}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSeedDefaults}
            disabled={isSeeding}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-full text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            {isSeeding ? "Populating..." : "Seed Sample Articles"}
          </button>
          <Link
            to="/dashboard/create"
            className="bg-[#f84560] hover:bg-[#e0344f] text-white font-bold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <span>+</span>
            <span>CREATE NEW STORY</span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-800 font-semibold px-3 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 text-xs px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Category Tabs: All Stories | News | Fun Facts */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
        <button
          type="button"
          onClick={() => setSelectedCategoryTab("all")}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategoryTab === "all"
              ? "bg-[#1e2024] text-white shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
          }`}
        >
          <span>All Stories</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategoryTab === "all" ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700"}`}>
            {blogs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategoryTab("news")}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategoryTab === "news"
              ? "bg-[#f84560] text-white shadow-xs"
              : "bg-red-50 text-red-700 hover:bg-red-100"
          }`}
        >
          <span>📰 Latest News</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategoryTab === "news" ? "bg-red-800 text-white" : "bg-red-100 text-red-800"}`}>
            {newsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategoryTab("fun-facts")}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategoryTab === "fun-facts"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-amber-50 text-amber-800 hover:bg-amber-100"
          }`}
        >
          <span>💡 Fun Facts</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategoryTab === "fun-facts" ? "bg-amber-700 text-white" : "bg-amber-100 text-amber-900"}`}>
            {funFactsCount}
          </span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20 text-gray-500">
          <div className="w-8 h-8 border-3 border-[#f84560] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs uppercase tracking-wider font-bold">Loading dashboard stories...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && displayedBlogs.length === 0 && (
        <div className="text-center py-16 bg-gray-50 border border-gray-200 rounded p-8">
          <h2 className="font-heading text-xl font-bold text-gray-800 mb-2">
            No stories in {selectedCategoryTab === "news" ? "Latest News" : selectedCategoryTab === "fun-facts" ? "Fun Facts" : "this view"}
          </h2>
          <p className="text-xs text-gray-600 mb-6">
            Create a new story and select the category to publish it.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/dashboard/create"
              className="inline-block bg-[#f84560] hover:bg-[#e0344f] text-white font-bold px-5 py-2 rounded-full text-xs uppercase tracking-wider transition-colors"
            >
              Write First Story
            </Link>
          </div>
        </div>
      )}

      {/* Blog Posts List */}
      {!loading && displayedBlogs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            <span>
              {selectedCategoryTab === "news"
                ? "Latest News Stories"
                : selectedCategoryTab === "fun-facts"
                ? "Fun Facts Stories"
                : "All Stories"}{" "}
              ({displayedBlogs.length})
            </span>
            <span className="text-[11px] font-normal lowercase text-gray-400">Click Edit to modify any article</span>
          </div>

          {displayedBlogs.map((blog) => {
            const isFact = isFunFact(blog);

            return (
              <div
                key={blog.id}
                className="bg-white border border-gray-200 rounded p-4 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between hover:border-gray-300 transition-colors shadow-xs"
              >
                {/* Blog Image */}
                <div className="w-full md:w-36 h-24 bg-gray-100 rounded overflow-hidden shrink-0 relative">
                  {blog.imageUrl ? (
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#22252a]" />
                  {/* Category Pill Tag on Image */}
                  <div
                    className={`absolute top-1.5 left-1.5 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow-xs ${
                      isFact
                        ? "bg-amber-500 text-white"
                        : "bg-[#f84560] text-white"
                    }`}
                  >
                    {isFact ? "Fun Fact" : "News"}
                  </div>
                </div>

                {/* Blog Details */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded ${
                        isFact
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {isFact ? "💡 FUN FACTS" : "📰 NEWS"}
                    </span>
                    {blog.category && (
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {blog.category}
                      </span>
                    )}
                  </div>

                  <h2 className="font-heading text-base font-bold text-gray-900 mb-1 truncate">
                    {blog.title}
                  </h2>
                  <p className="text-gray-500 text-xs mb-2 line-clamp-1">
                    {stripHtml(blog.description)}
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    Published: {formatDate(blog.createdAt, blog.dateString)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Link
                    to={`/blog/${blog.id}`}
                    target="_blank"
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded transition-colors border border-gray-200"
                  >
                    View
                  </Link>
                  <Link
                    to={`/dashboard/edit/${blog.id}`}
                    className="bg-[#22252a] hover:bg-black text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded transition-colors shadow-xs"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBlogToDelete(blog)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {blogToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete <strong className="text-gray-900">"{blogToDelete.title}"</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setBlogToDelete(null)}
                disabled={isDeleting}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete Story"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
