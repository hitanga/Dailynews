import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../components/BlogCard";

export default function Dashboard() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Delete confirmation modal state
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setError("");
    try {
      const blogsRef = collection(db, "blogs");
      let snapshot;
      try {
        const q = query(blogsRef, orderBy("createdAt", "desc"));
        snapshot = await getDocs(q);
      } catch (orderErr) {
        snapshot = await getDocs(blogsRef);
      }

      const blogsList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Sort in-memory to ensure latest is first
      blogsList.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeB - timeA;
      });

      setBlogs(blogsList);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Unable to load blogs. Please try again.");
    } finally {
      setLoading(false);
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
      // Delete document from Firestore
      await deleteDoc(doc(db, "blogs", blogToDelete.id));

      // Refresh blogs list
      setBlogs((prev) => prev.filter((b) => b.id !== blogToDelete.id));
      setSuccessMessage("Blog deleted successfully.");

      // Clear alert after 4 seconds
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            <p className="text-sm text-gray-500">
              Logged in as <span className="font-medium text-gray-700">{user?.displayName || user?.email}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded text-sm transition-colors cursor-pointer"
          >
            Create New Blog
          </Link>
          <button
            onClick={handleLogout}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded text-sm transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16 text-gray-600">
          <p className="text-base">Loading blogs...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && blogs.length === 0 && (
        <div className="text-center py-16 bg-gray-50 border border-gray-200 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No blogs found</h2>
          <p className="text-gray-600 mb-6">You haven't written any blog posts yet.</p>
          <Link
            to="/dashboard/create"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded text-sm transition-colors"
          >
            Create Your First Blog
          </Link>
        </div>
      )}

      {/* Blog Posts List */}
      {!loading && blogs.length > 0 && (
        <div className="space-y-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
            >
              {/* Blog Image */}
              <div className="w-full md:w-44 h-32 bg-gray-100 rounded overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
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
                  <span className="text-gray-400 text-xs">No Image</span>
                )}
              </div>

              {/* Blog Details */}
              <div className="flex-grow min-w-0">
                <h2 className="text-lg font-bold text-gray-900 mb-1 truncate">
                  {blog.title}
                </h2>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {blog.description}
                </p>
                <p className="text-xs text-gray-500">
                  Created: {formatDate(blog.createdAt) || "Recently"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                <Link
                  to={`/dashboard/edit/${blog.id}`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1.5 rounded transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setBlogToDelete(blog)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-3 py-1.5 rounded transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {blogToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete this blog?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setBlogToDelete(null)}
                disabled={isDeleting}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
