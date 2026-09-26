/**
 * Utility to parse and format blog narrative text, supporting both rich HTML
 * and markdown-style formatting (such as **bold**, *italic*, hyperlinks, headings).
 */

export function formatContentToHtml(content) {
  if (!content) return "";

  // If already full HTML with paragraph tags or headings
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);

  // Convert markdown bold, italics, links even if mixed with HTML
  let processed = content
    // Markdown bold **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>")
    // Markdown italic *text* or _text_
    .replace(/(^|[^\*])\*(.*?)\*([^\*]|$)/g, "$1<em>$2</em>$3")
    .replace(/(^|[^_])_(.*?)([^_]|$)/g, "$1<em>$2</em>$3")
    // Markdown links: [anchor](url)
    .replace(
      /\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#f84560] underline font-medium hover:text-[#d62844]">$1</a>'
    );

  if (hasHtmlTags) {
    return processed;
  }

  // If plain text with line breaks, convert to <p> tags
  const paragraphs = processed.split(/\n\s*\n/);
  return paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h1") ||
        trimmed.startsWith("<h2") ||
        trimmed.startsWith("<h3") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol")
      ) {
        return trimmed;
      }
      return `<p class="mb-4 leading-relaxed">${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .filter(Boolean)
    .join("");
}

/**
 * Strips HTML and markdown tokens for clean excerpts in cards and listings
 */
export function stripHtml(content) {
  if (!content) return "";
  return content
    .replace(/<[^>]+>/g, " ")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns a clean, professional category name for cards and headers ("News" or "Fun Facts"),
 * ensuring that any accidental tags or long comma-separated lists are NEVER shown on homepage cards.
 */
export function getCleanCategory(rawCategory) {
  if (!rawCategory) return "News";
  const str = String(rawCategory).trim();
  const lower = str.toLowerCase();
  if (lower.includes("fun fact")) return "Fun Facts";
  if (lower.includes("news")) return "News";
  // If user entered a specific topic (e.g. Science), take only the first clean token before commas/hash
  const first = str.split(/[,#]/)[0].trim();
  return first || "News";
}

/**
 * Extracts clean tag list from both the tags array and any tags that may have been saved in the category string.
 * This is used ONLY on the blog detail page!
 */
export function extractAllTags(blog) {
  if (!blog) return [];
  const tagsSet = new Set();

  if (Array.isArray(blog.tags)) {
    blog.tags.forEach((t) => {
      const clean = String(t).trim().replace(/^#+/, "");
      if (clean) tagsSet.add(clean);
    });
  }

  // Also extract if extra comma-separated tags or hashtags were previously saved inside category string
  if (blog.category) {
    const parts = blog.category.split(/[,#]/);
    if (parts.length > 1) {
      parts.slice(1).forEach((part) => {
        const clean = part.trim().replace(/^#+/, "");
        if (
          clean &&
          !clean.toLowerCase().includes("fun fact") &&
          !clean.toLowerCase().includes("news")
        ) {
          tagsSet.add(clean);
        }
      });
    }
  }

  return Array.from(tagsSet);
}
