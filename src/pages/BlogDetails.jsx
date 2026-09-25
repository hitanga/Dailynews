import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { formatDate } from "../components/BlogCard";

export default function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError("");
      try {
        const blogRef = doc(db, "blogs", id);
        const docSnap = await getDoc(blogRef);

        if (docSnap.exists()) {
          setBlog({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Blog post not found.");
        }
      } catch (err) {
        console.error("Error fetching blog post:", err);
        setError("Unable to load blog. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-600">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error || "Blog post not found."}</p>
        </div>
        <Link
          to="/"
          className="inline-block bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium"
        >
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← Back to Blogs
        </Link>
      </div>

      {/* Blog Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
        {blog.title}
      </h1>

      {/* Date */}
      {blog.createdAt && (
        <p className="text-sm text-gray-500 mb-6">
          {formatDate(blog.createdAt)}
        </p>
      )}

      {/* Large Blog Image */}
      <div className="w-full max-h-[460px] bg-gray-100 rounded-lg overflow-hidden mb-8 border border-gray-200 flex items-center justify-center">
        {blog.imageUrl && !imageError ? (
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="w-full h-auto max-h-[460px] object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="p-8 text-center text-gray-400">
            {imageError ? "Unable to load image." : "No image provided."}
          </div>
        )}
      </div>

      {/* Blog Description / Content */}
      <div className="text-gray-800 text-base leading-relaxed whitespace-pre-line mb-10">
        {blog.description}
      </div>

      {/* Footer Back Button */}
      <div className="pt-6 border-t border-gray-200">
        <Link
          to="/"
          className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          Back to Blogs
        </Link>
      </div>
    </article>
  );
}
