import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function CreateBlog() {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Handle URL change and reset error state for preview
  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
    setImageError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Validation
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!imageUrl.trim()) {
      setError("Please enter an image URL.");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    setLoading(true);

    try {
      // 2. Save blog to Firestore collection 'blogs'
      await addDoc(collection(db, "blogs"), {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        description: description.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 3. Redirect back to Dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Error creating blog:", err);
      setError("Unable to save blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        Create New Blog
      </h1>

      {/* Error message */}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Blog form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Blog Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title"
            className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={handleImageUrlChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-blue-500"
          />

          {/* Live Image Preview */}
          {imageUrl.trim() && (
            <div className="mt-3">
              <span className="block text-xs font-medium text-gray-500 mb-1.5">
                Image Preview:
              </span>
              <div className="w-full max-h-72 bg-gray-50 border border-gray-200 rounded p-2 flex items-center justify-center overflow-hidden">
                {imageError ? (
                  <div className="py-8 text-center text-red-600 text-sm">
                    <p className="font-medium">Unable to load image.</p>
                    <p className="text-xs text-red-500 mt-1">Please check the image URL.</p>
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-64 max-w-full object-contain rounded"
                    onLoad={() => setImageError(false)}
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your blog content here..."
            className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-blue-500"
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded text-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Saving..." : "Create Blog"}
          </button>
          <Link
            to="/dashboard"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2 rounded text-sm transition-colors cursor-pointer"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
