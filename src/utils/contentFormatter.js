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
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
