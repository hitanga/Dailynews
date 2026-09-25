import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [error, setError] = useState("");

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
          setCategory(data.category || "Featured");
          setDescription(data.description || "");
        } else {
          setError("Story not found.");
        }
      } catch (err) {
        console.error("Error loading blog:", err);
        setError("Unable to load story. Please try again.");
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
      const blogRef = doc(db, "blogs", id);
      await updateDoc(blogRef, {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        category: category.trim() || "Featured",
        description: description.trim(),
        updatedAt: serverTimestamp(),
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Error updating story:", err);
      setError("Unable to update story. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-[#f84560] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Loading Story...</p>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded mb-6">
          {error}
        </div>
        <Link
          to="/dashboard"
          className="inline-block bg-gray-900 text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="text-xs font-bold uppercase tracking-wider text-[#f84560] hover:text-[#d62844] flex items-center gap-1"
        >
          <span>← BACK TO DASHBOARD</span>
        </Link>
      </div>

      <div className="border-b border-gray-100 pb-4 mb-8">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#f84560] uppercase block mb-1">
          EDIT PUBLICATION
        </span>
        <h1 className="font-heading text-3xl font-extrabold text-gray-900">
          Edit Story
        </h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Story Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter story title"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-[#f84560]"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Category / Tags
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Featured, Lifestyle, Photo"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-[#f84560]"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Cover Image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={handleImageUrlChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-[#f84560]"
          />

          {imageUrl.trim() && (
            <div className="mt-3">
              <span className="block text-[11px] font-bold tracking-wider uppercase text-gray-500 mb-1.5">
                Image Preview:
              </span>
              <div className="relative w-full max-h-80 bg-gray-50 border border-gray-200 rounded p-2 flex items-center justify-center overflow-hidden">
                {imageError ? (
                  <div className="py-8 text-center text-red-600 text-xs">
                    <p className="font-bold">Unable to load image.</p>
                    <p className="text-gray-500 mt-1">Please check the image URL.</p>
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-72 max-w-full object-contain rounded"
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
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Story Content
          </label>
          <textarea
            rows={10}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your story content here..."
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-900 text-sm leading-relaxed focus:outline-none focus:border-[#f84560]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#f84560] hover:bg-[#e0344f] text-white font-bold text-xs uppercase tracking-wider px-7 py-3 rounded-full transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {saving ? "Saving Changes..." : "Update Story"}
          </button>
          <Link
            to="/dashboard"
            className="text-gray-500 hover:text-gray-800 text-xs font-bold uppercase tracking-wider px-4 py-3"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
