import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { DEFAULT_POSTS } from "../utils/seedData";

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("Featured");
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
        // 1. First check local custom blogs
        let foundLocally = null;
        try {
          const localList = JSON.parse(
            localStorage.getItem("daily_news_custom_blogs") || "[]"
          );
          foundLocally = localList.find((b) => b.id === id);
        } catch (e) {}

        if (foundLocally) {
          setTitle(foundLocally.title || "");
          setImageUrl(foundLocally.imageUrl || "");
          setCategory(foundLocally.category || "Featured");
          setDescription(foundLocally.description || "");
          setInitialLoading(false);
          return;
        }

        // 2. Check Firestore
        try {
          const blogRef = doc(db, "blogs", id);
          const docSnap = await getDoc(blogRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title || "");
            setImageUrl(data.imageUrl || "");
            setCategory(data.category || "Featured");
            setDescription(data.description || "");
            setInitialLoading(false);
            return;
          }
        } catch (firestoreErr) {
          console.warn("Firestore fetch error:", firestoreErr);
        }

        // 3. Check DEFAULT_POSTS (for sample/editorial articles)
        const sampleMatch = DEFAULT_POSTS.find(
          (p, idx) => `post-${idx}` === id || p.title.toLowerCase().includes(id.toLowerCase())
        );

        if (sampleMatch) {
          setTitle(sampleMatch.title || "");
          setImageUrl(sampleMatch.imageUrl || "");
          setCategory(sampleMatch.category || "Featured");
          setDescription(sampleMatch.description || "");
          setInitialLoading(false);
          return;
        }

        setError("Story could not be found.");
      } catch (err) {
        console.error("Error loading blog for edit:", err);
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
      const updatedFields = {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        category: category.trim() || "Featured",
        description: description.trim(),
        updatedAt: serverTimestamp(),
      };

      // 1. Update in Firestore
      try {
        const blogRef = doc(db, "blogs", id);
        await setDoc(blogRef, updatedFields, { merge: true });
      } catch (firestoreErr) {
        console.warn("Firestore write skipped, updating locally:", firestoreErr);
      }

      // 2. Also update in localStorage custom blogs so changes reflect everywhere immediately
      try {
        const localList = JSON.parse(
          localStorage.getItem("daily_news_custom_blogs") || "[]"
        );
        const existingIdx = localList.findIndex((b) => b.id === id);

        const localObj = {
          id,
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          category: category.trim() || "Featured",
          description: description.trim(),
          updatedAt: new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          localList[existingIdx] = { ...localList[existingIdx], ...localObj };
        } else {
          localList.unshift(localObj);
        }

        localStorage.setItem("daily_news_custom_blogs", JSON.stringify(localList));
      } catch (storageErr) {
        console.warn("Storage update skipped:", storageErr);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Error updating story:", err);
      setError("Unable to save story updates. Please try again.");
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
          EDITORIAL EDITOR
        </span>
        <h1 className="font-heading text-3xl font-extrabold text-gray-900">
          Edit Story
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Modify the title, category, cover photo, or narrative body.
        </p>
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
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            required
            value={imageUrl}
            onChange={handleImageUrlChange}
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

        {/* Description / Body */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Story Body
          </label>
          <textarea
            rows={10}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-900 text-sm leading-relaxed focus:outline-none focus:border-[#f84560]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#f84560] hover:bg-[#e0344f] text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full transition-colors disabled:opacity-50 cursor-pointer shadow-md"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
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
