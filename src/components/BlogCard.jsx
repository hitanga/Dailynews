import React, { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Format timestamp or date to human readable format
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return "";
  try {
    // Firestore Timestamp object has toDate()
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

export default function BlogCard({ blog }) {
  const [imageError, setImageError] = useState(false);

  // Short description snippet
  const snippet =
    blog.description && blog.description.length > 150
      ? blog.description.substring(0, 150) + "..."
      : blog.description;

  return (
    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
      {/* Blog Image */}
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {blog.imageUrl && !imageError ? (
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-gray-400 text-sm px-4 text-center">
            {imageError ? "Unable to load image" : "No image available"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {blog.createdAt && (
          <span className="text-xs text-gray-500 mb-2">
            {formatDate(blog.createdAt)}
          </span>
        )}

        <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {blog.title}
        </h2>

        <p className="text-gray-600 text-sm mb-5 flex-grow line-clamp-3">
          {snippet}
        </p>

        <div>
          <Link
            to={`/blog/${blog.id}`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            Read More
          </Link>
        </div>
      </div>
    </article>
  );
}
