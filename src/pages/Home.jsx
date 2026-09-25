import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import BlogCard from "../components/BlogCard";

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setError("");
    try {
      // Query blogs from Firestore ordered by createdAt descending (newest first)
      const blogsRef = collection(db, "blogs");
      let snapshot;
      try {
        const q = query(blogsRef, orderBy("createdAt", "desc"));
        snapshot = await getDocs(q);
      } catch (orderErr) {
        // Fallback without orderBy if index is building or items have null createdAt
        snapshot = await getDocs(blogsRef);
      }

      const blogsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // In case fallback was used, sort manually by date
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

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Page Title & Intro */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Latest Blog Posts
        </h1>
        <p className="text-gray-600 text-base">
          Read the latest articles, guides, and updates.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg">Loading blogs...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-center">
          <p>{error}</p>
          <button
            onClick={fetchBlogs}
            className="mt-2 text-sm text-red-700 underline font-medium hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && blogs.length === 0 && (
        <div className="text-center py-16 bg-gray-50 border border-gray-200 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No blogs found</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-4">
            There are no blog posts published yet. Log in to the dashboard to create your first blog post!
          </p>
        </div>
      )}

      {/* Blogs Grid */}
      {!loading && !error && blogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </main>
  );
}
