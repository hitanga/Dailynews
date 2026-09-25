import React, { useState } from "react";
import { Search, Globe, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from "lucide-react";
import { generateSlug } from "../utils/seoHelper";

export default function SeoSettingsPanel({
  seoTitle,
  setSeoTitle,
  slug,
  setSlug,
  metaDescription,
  setMetaDescription,
  fallbackTitle = "",
  fallbackDescription = "",
}) {
  const [isOpen, setIsOpen] = useState(true);

  // Default SEO title if empty
  const effectiveTitle = (seoTitle || fallbackTitle || "Article Title").trim();
  const effectiveSlug = (slug || generateSlug(fallbackTitle) || "story-slug").trim();
  const effectiveDesc = (metaDescription || fallbackDescription.replace(/<[^>]+>/g, " ").slice(0, 155) || "Story summary for search engines...").trim();

  const handleAutoSlug = () => {
    if (fallbackTitle) {
      setSlug(generateSlug(fallbackTitle));
    }
  };

  const handleAutoTitle = () => {
    if (fallbackTitle) {
      setSeoTitle(fallbackTitle);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
      {/* Panel Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50/80 hover:bg-gray-100 flex items-center justify-between text-left transition-colors cursor-pointer border-b border-gray-100"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🔍</span>
          <span className="font-heading font-extrabold text-sm text-gray-900">
            SEO & Search Optimization Details
          </span>
          <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
            Hidden from frontend body
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-xs text-gray-500 hidden md:inline">
            {isOpen ? "Collapse settings" : "Configure SEO title, slug & meta"}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Panel Body */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-5 bg-white">
          <div className="bg-blue-50/60 border border-blue-100 rounded-md p-3 text-xs text-blue-900 flex items-start gap-2">
            <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Search Engine & Social Card Optimization</p>
              <p className="text-blue-800 text-[11px] mt-0.5 leading-relaxed">
                These fields are embedded into HTML <code>&lt;head&gt;</code> meta tags, OpenGraph cards, Twitter cards, and Schema.org structured data. They will <strong>not</strong> display as visible text on the story page.
              </p>
            </div>
          </div>

          {/* 1. SEO Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                SEO Title
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoTitle}
                  className="text-[11px] font-semibold text-[#f84560] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Use Story Title</span>
                </button>
                <span
                  className={`text-[11px] font-mono ${
                    (seoTitle?.length || 0) > 60
                      ? "text-amber-600 font-bold"
                      : "text-gray-400"
                  }`}
                >
                  {seoTitle?.length || 0}/60 chars
                </span>
              </div>
            </div>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="e.g. क्या शहद कभी खराब नहीं होता? जानिए इसका Amazing Science Fact"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-[#f84560]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Custom title displayed in Google search results and browser tabs. If left blank, your main story title will be used.
            </p>
          </div>

          {/* 2. Slug / URL Permalink */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                URL Slug / Permalink
              </label>
              <button
                type="button"
                onClick={handleAutoSlug}
                className="text-[11px] font-semibold text-[#f84560] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate from Title</span>
              </button>
            </div>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden focus-within:border-[#f84560]">
              <span className="bg-gray-100 text-gray-500 text-xs px-3 py-2.5 border-r border-gray-300 select-none hidden sm:inline">
                /blog/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                placeholder="e.g. shahad-kharab-kyun-nahi-hota-amazing-fact"
                className="w-full px-3.5 py-2.5 text-gray-900 text-sm font-mono focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Search-friendly URL permalink. Allows visitors and crawlers to access the article via <code>/blog/{effectiveSlug}</code>.
            </p>
          </div>

          {/* 3. Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Meta Description
              </label>
              <span
                className={`text-[11px] font-mono ${
                  (metaDescription?.length || 0) > 160
                    ? "text-amber-600 font-bold"
                    : "text-gray-400"
                }`}
              >
                {metaDescription?.length || 0}/160 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="e.g. क्या आप जानते हैं कि सही परिस्थितियों में शहद असाधारण रूप से लंबे समय तक सुरक्षित रह सकता है? जानिए इसके पीछे छिपा fascinating science."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-900 text-sm leading-relaxed focus:outline-none focus:border-[#f84560]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Concise summary shown under your title in Google search results. Recommended length: 120–160 characters.
            </p>
          </div>

          {/* 4. Google Search Snippet Preview */}
          <div className="pt-2">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5">
              <Search className="w-3 h-3 text-[#f84560]" />
              <span>Google Search Preview</span>
            </span>

            <div className="bg-gray-50/90 border border-gray-200 rounded-lg p-3.5 max-w-xl font-sans text-left">
              {/* Site source breadcrumb */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-red-100 text-[#f84560] flex items-center justify-center text-[10px] font-black">
                  DN
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] text-gray-800 font-medium leading-none">Daily News</span>
                  <span className="text-[11px] text-gray-500 font-mono truncate max-w-xs sm:max-w-md">
                    https://dailynews.editorial/blog/{effectiveSlug}
                  </span>
                </div>
              </div>

              {/* Title Link */}
              <h4 className="text-[#1a0dab] hover:underline text-base sm:text-lg font-medium leading-snug line-clamp-1 mb-1 cursor-pointer">
                {effectiveTitle} – DAILY NEWS
              </h4>

              {/* Snippet text */}
              <p className="text-[13px] text-[#4d5156] leading-relaxed line-clamp-2">
                {effectiveDesc}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
