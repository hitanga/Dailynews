import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import RichTextEditor from "../components/RichTextEditor";

export default function CreateBlog() {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("Featured");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
    setImageError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a title for the story.");
      return;
    }
    if (!imageUrl.trim()) {
      setError("Please provide a cover image URL.");
      return;
    }
    if (!description.trim()) {
      setError("Please enter the narrative content for your story.");
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const dateString = now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      const newPostData = {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        category: category.trim() || "Featured",
        description: description.trim(),
        dateString: dateString,
        commentsCount: 0,
        isHero: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 1. Save to Firestore
      let createdDocId = "custom-" + Date.now();
      try {
        const docRef = await addDoc(collection(db, "blogs"), newPostData);
        createdDocId = docRef.id;
      } catch (firestoreErr) {
        console.warn("Firestore write fallback to local storage:", firestoreErr);
      }

      // 2. Also cache in localStorage for instant rendering in Hero Section and Dashboard
      try {
        const localList = JSON.parse(
          localStorage.getItem("daily_news_custom_blogs") || "[]"
        );
        localList.unshift({
          id: createdDocId,
          ...newPostData,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem(
          "daily_news_custom_blogs",
          JSON.stringify(localList)
        );
      } catch (storageErr) {
        console.warn("Storage caching error:", storageErr);
      }

      // Direct user straight to Dashboard where they can view, edit, or manage the new story!
      navigate("/dashboard");
    } catch (err) {
      console.error("Error creating blog:", err);
      setError("Unable to save story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          NEW PUBLICATION
        </span>
        <h1 className="font-heading text-3xl font-extrabold text-gray-900">
          Create New Story
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Publish a new article to feature it prominently in the Hero section on the homepage.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Story Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Breaking: Global Climate Summit Announces New Carbon Targets"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-[#f84560]"
          />
        </div>

        {/* Category & Tag */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Category / Tags
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Featured, News, Tech, Business"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-[#f84560]"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Cover Image URL *
          </label>
          <input
            type="url"
            required
            value={imageUrl}
            onChange={handleImageUrlChange}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-[#f84560]"
          />

          {/* Live Image Preview */}
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

        {/* Rich Story Content */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Story Body & Formatting *
          </label>
          <RichTextEditor
            value={description}
            onChange={(content) => setDescription(content)}
            placeholder="Write your story content here. Use the toolbar above to style bold, italic, underline, font size, colors, lists, and hyperlinks..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#f84560] hover:bg-[#e0344f] text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full transition-colors disabled:opacity-50 cursor-pointer shadow-md"
          >
            {loading ? "Publishing Story..." : "Publish & Feature in Hero"}
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
