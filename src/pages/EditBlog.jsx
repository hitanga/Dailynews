import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { DEFAULT_POSTS } from "../utils/seedData";
import RichTextEditor from "../components/RichTextEditor";
import TagsInput from "../components/TagsInput";
import SeoSettingsPanel from "../components/SeoSettingsPanel";
import { generateSlug } from "../utils/seoHelper";

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryType, setCategoryType] = useState("News"); // "News" | "Fun Facts"
  const [subTag, setSubTag] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);

  // SEO Fields (Hidden from frontend body, embedded in Google/Social metadata)
  const [seoTitle, setSeoTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      setInitialLoading(true);
      setError("");

      try {
        let loadedData = null;

        // 1. Check local custom blogs
        try {
          const localList = JSON.parse(
            localStorage.getItem("daily_news_custom_blogs") || "[]"
          );
          const found = localList.find((b) => b.id === id || b.slug === id);
          if (found) loadedData = found;
        } catch (e) {}

        // 2. Check Firestore
        if (!loadedData) {
          try {
            const blogRef = doc(db, "blogs", id);
            const docSnap = await getDoc(blogRef);
            if (docSnap.exists()) {
              loadedData = { id: docSnap.id, ...docSnap.data() };
            }
          } catch (firestoreErr) {
            console.warn("Firestore fetch error:", firestoreErr);
          }
        }

        // 3. Check DEFAULT_POSTS (for sample/editorial articles)
        if (!loadedData) {
          const sampleMatch = DEFAULT_POSTS.find(
            (p, idx) =>
              `post-${idx}` === id ||
              p.title.toLowerCase().includes(id.toLowerCase())
          );
          if (sampleMatch) loadedData = { id, ...sampleMatch };
        }

        if (loadedData) {
          setTitle(loadedData.title || "");
          setImageUrl(loadedData.imageUrl || "");
          setDescription(loadedData.description || "");
          setTags(Array.isArray(loadedData.tags) ? loadedData.tags : []);

          // SEO Fields
          setSeoTitle(loadedData.seoTitle || loadedData.title || "");
          setSlug(loadedData.slug || generateSlug(loadedData.title || ""));
          setMetaDescription(loadedData.metaDescription || "");

          const cat = loadedData.category || "News";
          if (cat.toLowerCase().includes("fun fact")) {
            setCategoryType("Fun Facts");
          } else {
            setCategoryType("News");
          }

          // Clean sub-tags
          const cleanSub = cat
            .replace(/fun facts?/gi, "")
            .replace(/news/gi, "")
            .replace(/^[,\s]+|[,\s]+$/g, "");
          setSubTag(cleanSub);

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
      const finalCategory = categoryType;
      const allTags = [...tags];
      if (subTag.trim() && !allTags.includes(subTag.trim())) {
        allTags.unshift(subTag.trim());
      }

      const finalSlug = (slug.trim() || generateSlug(title)).trim();

      const updatedFields = {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        category: finalCategory,
        description: description.trim(),
        tags: allTags,
        // SEO Fields
        seoTitle: (seoTitle.trim() || title.trim()),
        slug: finalSlug,
        metaDescription: metaDescription.trim(),
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
        const existingIdx = localList.findIndex((b) => b.id === id || b.slug === id);

        const localObj = {
          id,
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          category: finalCategory,
          description: description.trim(),
          tags: tags,
          seoTitle: (seoTitle.trim() || title.trim()),
          slug: finalSlug,
          metaDescription: metaDescription.trim(),
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
          Modify the category, title, tags, cover photo, font styling, or hidden SEO details.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Category Selection Cards: News vs Fun Facts */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Select Story Category *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
            {/* 1. News Card */}
            <div
              onClick={() => setCategoryType("News")}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                categoryType === "News"
                  ? "border-[#f84560] bg-red-50/30 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-heading font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <span>📰</span>
                  <span>News Story</span>
                </span>
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    categoryType === "News"
                      ? "border-[#f84560] bg-[#f84560]"
                      : "border-gray-300"
                  }`}
                >
                  {categoryType === "News" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Displays in the <strong>Latest News</strong> section on the homepage.
              </p>
            </div>

            {/* 2. Fun Facts Card */}
            <div
              onClick={() => setCategoryType("Fun Facts")}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                categoryType === "Fun Facts"
                  ? "border-amber-500 bg-amber-50/40 shadow-xs"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-heading font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <span>💡</span>
                  <span>Fun Facts</span>
                </span>
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    categoryType === "Fun Facts"
                      ? "border-amber-500 bg-amber-500"
                      : "border-gray-300"
                  }`}
                >
                  {categoryType === "Fun Facts" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Displays in the dedicated <strong>Fun Facts</strong> discovery section.
              </p>
            </div>
          </div>

          {/* Optional Sub-category or custom topic */}
          <div className="mt-2">
            <input
              type="text"
              value={subTag}
              onChange={(e) => setSubTag(e.target.value)}
              placeholder="Topic / Sub-Category (e.g. Amazing Facts, Science, Business, World)"
              className="w-full px-3 py-2 border border-gray-200 rounded text-gray-700 text-xs focus:outline-none focus:border-[#f84560]"
            />
          </div>
        </div>

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
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-[#f84560]"
          />
        </div>

        {/* Story Tags Input (Visible on Frontend) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Story Tags (Visible on frontend & searchable)
            </label>
            <span className="text-[11px] text-gray-400">
              Press Enter or Comma to add
            </span>
          </div>
          <TagsInput
            tags={tags}
            onChange={setTags}
            placeholder="e.g. Amazing Facts, Hindi Facts, Science Facts, Honey Facts, रोचक तथ्य..."
            suggestedTags={
              categoryType === "Fun Facts"
                ? ["Amazing Facts", "Science Facts", "Honey Facts", "Hindi Facts", "Nature Trivia", "History Facts"]
                : ["World News", "Economy", "Markets", "Technology", "Climate", "Breaking"]
            }
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Tags will be displayed as clickable topic badges at the bottom of your article and make the story instantly searchable.
          </p>
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

        {/* Story Body & Rich Text Formatting (Visible on Frontend) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Story Body & Formatting *
          </label>
          <RichTextEditor
            value={description}
            onChange={(content) => setDescription(content)}
            placeholder="Write your story narrative here. Use the toolbar to style bold, italic, font sizes, colors, and hyperlinks..."
          />
        </div>

        {/* SEO & Search Optimization Details (Hidden from Frontend Body) */}
        <SeoSettingsPanel
          seoTitle={seoTitle}
          setSeoTitle={setSeoTitle}
          slug={slug}
          setSlug={setSlug}
          metaDescription={metaDescription}
          setMetaDescription={setMetaDescription}
          fallbackTitle={title}
          fallbackDescription={description}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#f84560] hover:bg-[#e0344f] text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full transition-colors disabled:opacity-50 cursor-pointer shadow-md"
          >
            {saving ? "Saving Changes..." : `Save ${categoryType} Changes`}
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
