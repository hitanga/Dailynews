/**
 * Helper to dynamically manage SEO metadata, OpenGraph tags, Twitter cards,
 * canonical links, and Schema.org JSON-LD in the document head for SPAs.
 */

const DEFAULT_TITLE = "DAILY NEWS - Multipurpose Magazine and Blog";
const DEFAULT_DESC =
  "Daily News multipurpose magazine and blog platform featuring breaking news, global reports, and fascinating fun facts.";

export function updatePageSeo({
  title,
  seoTitle,
  description,
  metaDescription,
  imageUrl,
  slug,
  tags = [],
  category = "News",
  datePublished,
}) {
  const finalTitle = (seoTitle || title ? `${seoTitle || title} – DAILY NEWS` : DEFAULT_TITLE).trim();
  const finalDesc = (metaDescription || description || DEFAULT_DESC).trim().slice(0, 160);
  const currentUrl = window.location.href;

  // 1. Update Document Title
  document.title = finalTitle;

  // 2. Helper to set or create meta tag
  const setMeta = (nameAttr, nameVal, contentVal) => {
    if (!contentVal) return;
    let el = document.querySelector(`meta[${nameAttr}="${nameVal}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(nameAttr, nameVal);
      document.head.appendChild(el);
    }
    el.setAttribute("content", contentVal);
  };

  // 3. Standard Meta
  setMeta("name", "description", finalDesc);
  if (tags && tags.length > 0) {
    setMeta("name", "keywords", Array.isArray(tags) ? tags.join(", ") : tags);
  }

  // 4. OpenGraph Meta
  setMeta("property", "og:title", seoTitle || title || DEFAULT_TITLE);
  setMeta("property", "og:description", finalDesc);
  setMeta("property", "og:type", "article");
  setMeta("property", "og:url", currentUrl);
  if (imageUrl) {
    setMeta("property", "og:image", imageUrl);
  }

  // 5. Twitter Card Meta
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", seoTitle || title || DEFAULT_TITLE);
  setMeta("name", "twitter:description", finalDesc);
  if (imageUrl) {
    setMeta("name", "twitter:image", imageUrl);
  }

  // 6. Canonical Link
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", currentUrl);

  // 7. Schema.org JSON-LD Structured Data
  let ldJsonScript = document.getElementById("article-schema-ldjson");
  if (!ldJsonScript) {
    ldJsonScript = document.createElement("script");
    ldJsonScript.id = "article-schema-ldjson";
    ldJsonScript.type = "application/ld+json";
    document.head.appendChild(ldJsonScript);
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": seoTitle || title || DEFAULT_TITLE,
    "description": finalDesc,
    "image": imageUrl ? [imageUrl] : [],
    "datePublished": datePublished || new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Daily News Editorial",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Daily News",
      "logo": {
        "@type": "ImageObject",
        "url": window.location.origin + "/favicon.svg",
      },
    },
    "keywords": Array.isArray(tags) ? tags.join(", ") : tags,
    "articleSection": category,
  };

  ldJsonScript.textContent = JSON.stringify(structuredData);
}

export function resetPageSeo() {
  document.title = DEFAULT_TITLE;
  const setMeta = (nameAttr, nameVal, contentVal) => {
    const el = document.querySelector(`meta[${nameAttr}="${nameVal}"]`);
    if (el) el.setAttribute("content", contentVal);
  };

  setMeta("name", "description", DEFAULT_DESC);
  setMeta("property", "og:title", DEFAULT_TITLE);
  setMeta("property", "og:description", DEFAULT_DESC);
  setMeta("property", "og:type", "website");

  const ldJsonScript = document.getElementById("article-schema-ldjson");
  if (ldJsonScript) {
    ldJsonScript.remove();
  }
}

/**
 * Generates a clean URL slug from title string
 */
export function generateSlug(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, "-")
    // Remove non-word/non-alphanumeric chars except hyphens and unicode words (for Hindi/other scripts)
    .replace(/[^\w\u0900-\u097F\-]+/g, "")
    // Collapse multiple hyphens
    .replace(/\-\-+/g, "-")
    // Trim leading/trailing hyphens
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
