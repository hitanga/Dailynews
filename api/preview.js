/**
 * Dynamic Open Graph & Twitter Card Generator for Social Media Crawlers
 * Supports Facebook, WhatsApp, Twitter/X, LinkedIn, Telegram, Discord, Pinterest, and Slack.
 */

const DEFAULT_BANNER = "https://dailynews-rose.vercel.app/og-banner.jpg";
const SITE_NAME = "DAILY NEWS";
const DEFAULT_TITLE = "DAILY NEWS - Multipurpose Magazine and Blog";
const DEFAULT_DESC =
  "Daily News multipurpose magazine and blog platform featuring chilling horror stories, global reports, and fascinating fun facts.";
const PROJECT_ID = "blog-8bfbc";

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripTags(html) {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function handler(req, res) {
  const { id } = req.query;
  const blogId = id ? String(id).trim() : "";

  let blog = null;

  if (blogId) {
    try {
      // 1. Direct fetch by Firestore document ID
      const directUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/blogs/${encodeURIComponent(
        blogId
      )}`;
      const directRes = await fetch(directUrl);
      if (directRes.ok) {
        const doc = await directRes.json();
        if (doc && doc.fields) {
          blog = {
            id: blogId,
            title: doc.fields.title?.stringValue || "",
            seoTitle: doc.fields.seoTitle?.stringValue || "",
            description: doc.fields.description?.stringValue || "",
            metaDescription: doc.fields.metaDescription?.stringValue || "",
            imageUrl: doc.fields.imageUrl?.stringValue || "",
            slug: doc.fields.slug?.stringValue || "",
            category: doc.fields.category?.stringValue || "News",
          };
        }
      }

      // 2. Fallback: Query by slug if ID did not directly match
      if (!blog) {
        const queryUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
        const queryBody = {
          structuredQuery: {
            from: [{ collectionId: "blogs" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "slug" },
                op: "EQUAL",
                value: { stringValue: blogId },
              },
            },
            limit: 1,
          },
        };

        const queryRes = await fetch(queryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(queryBody),
        });

        if (queryRes.ok) {
          const results = await queryRes.json();
          if (Array.isArray(results) && results[0]?.document?.fields) {
            const doc = results[0].document;
            const docPath = doc.name || "";
            const extractedId = docPath.split("/").pop() || blogId;
            blog = {
              id: extractedId,
              title: doc.fields.title?.stringValue || "",
              seoTitle: doc.fields.seoTitle?.stringValue || "",
              description: doc.fields.description?.stringValue || "",
              metaDescription: doc.fields.metaDescription?.stringValue || "",
              imageUrl: doc.fields.imageUrl?.stringValue || "",
              slug: doc.fields.slug?.stringValue || "",
              category: doc.fields.category?.stringValue || "News",
            };
          }
        }
      }
    } catch (e) {
      console.error("Error fetching preview blog data:", e);
    }
  }

  // Determine Title, Description, Image, and Canonical URL
  const postTitle = blog ? (blog.seoTitle || blog.title || DEFAULT_TITLE) : DEFAULT_TITLE;
  const rawDesc = blog ? (blog.metaDescription || stripTags(blog.description) || DEFAULT_DESC) : DEFAULT_DESC;
  const postDesc = rawDesc.length > 200 ? rawDesc.slice(0, 197) + "..." : rawDesc;

  let postImage = (blog && blog.imageUrl) ? blog.imageUrl : DEFAULT_BANNER;
  if (postImage && postImage.startsWith("/")) {
    postImage = `https://dailynews-rose.vercel.app${postImage}`;
  }

  const postUrl = blogId
    ? `https://dailynews-rose.vercel.app/blog/${encodeURIComponent(blogId)}`
    : `https://dailynews-rose.vercel.app/`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(postTitle)}</title>
  <meta name="description" content="${escapeHtml(postDesc)}">

  <!-- Open Graph / Facebook -->
  <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">
  <meta property="og:type" content="${blog ? "article" : "website"}">
  <meta property="og:url" content="${escapeHtml(postUrl)}">
  <meta property="og:title" content="${escapeHtml(postTitle)}">
  <meta property="og:description" content="${escapeHtml(postDesc)}">
  <meta property="og:image" content="${escapeHtml(postImage)}">
  <meta property="og:image:secure_url" content="${escapeHtml(postImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(postTitle)}">
  <meta property="og:image:type" content="image/jpeg">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(postUrl)}">
  <meta name="twitter:title" content="${escapeHtml(postTitle)}">
  <meta name="twitter:description" content="${escapeHtml(postDesc)}">
  <meta name="twitter:image" content="${escapeHtml(postImage)}">
  <meta name="twitter:image:alt" content="${escapeHtml(postTitle)}">

  <!-- Canonical and Instant Human Redirection -->
  <link rel="canonical" href="${escapeHtml(postUrl)}">
  <meta http-equiv="refresh" content="0;url=${escapeHtml(postUrl)}">
  <script>
    if (typeof window !== 'undefined') {
      window.location.replace('${escapeHtml(postUrl)}');
    }
  </script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #fafafa;
      color: #111;
      text-align: center;
      padding: 24px;
    }
    .preview-card {
      max-width: 540px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);
    }
    .preview-img {
      width: 100%;
      height: 280px;
      object-fit: cover;
      display: block;
    }
    .content {
      padding: 20px 24px 24px;
      text-align: left;
    }
    h1 {
      font-size: 20px;
      line-height: 1.35;
      margin: 0 0 10px;
      color: #111827;
    }
    p {
      font-size: 14px;
      color: #4b5563;
      line-height: 1.6;
      margin: 0 0 16px;
    }
    a.btn {
      display: inline-block;
      background: #f84560;
      color: #ffffff;
      padding: 10px 22px;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="preview-card">
    ${postImage ? `<img class="preview-img" src="${escapeHtml(postImage)}" alt="${escapeHtml(postTitle)}" />` : ""}
    <div class="content">
      <h1>${escapeHtml(postTitle)}</h1>
      <p>${escapeHtml(postDesc)}</p>
      <a href="${escapeHtml(postUrl)}" class="btn">Read Story On Daily News &rarr;</a>
    </div>
  </div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=86400");
  return res.status(200).send(html);
}
