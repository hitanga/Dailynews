import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [error, setError] = useState("");

  // Load selected blog from Firestore
  useEffect(() => {
    const fetchBlog = async () => {
      setInitialLoading(true);
      setError("");
      try {
        const blogRef = doc(db, "blogs", id);
        const docSnap = await getDoc(blogRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setImageUrl(data.imageUrl || "");
          setDescription(data.description || "");
        } else {
          setError("Blog post not found.");
        }
      } catch (err) {
        console.error("Error loading blog:", err);
        setError("Unable to load blog. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
    setImageError(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Validate the form
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

    setSaving(true);

    try {
      // 2. Update Firestore document with updated values and updatedAt timestamp
      const blogRef = doc(db, "blogs", id);
      await updateDoc(blogRef, {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        description: description.trim(),
        updatedAt: serverTimestamp(),
      });

      // 3. Redirect back to Dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Error updating blog:", err);
      setError("Unable to update blog. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-600">
        <p className="text-base">Loading...</p>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
        <Link
          to="/dashboard"
          className="inline-block bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

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
        Edit Blog
      </h1>

      {/* Error message */}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleUpdate} className="space-y-6">
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
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded text-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Updating..." : "Update Blog"}
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
