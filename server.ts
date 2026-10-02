import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const isProd = process.env.NODE_ENV === "production";
const PROJECT_ID = "blog-8bfbc";
const DEFAULT_BANNER = "https://dailynews-rose.vercel.app/og-banner.jpg";
const DEFAULT_TITLE = "DAILY NEWS - Multipurpose Magazine and Blog";
const DEFAULT_DESC =
  "Daily News multipurpose magazine and blog platform featuring chilling horror stories, global reports, and fascinating fun facts.";

// Crawler detection regex
const CRAWLER_USER_AGENT_REGEX =
  /(facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Pinterest|SkypeUriPreview|Google-Structured-Data-Testing-Tool|Google-PageSpeed-Insights)/i;

function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripTags(html: string): string {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchBlogFromFirestore(blogId: string) {
  try {
    const directUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/blogs/${encodeURIComponent(
      blogId
    )}`;
    const directRes = await fetch(directUrl);
    if (directRes.ok) {
      const doc = await directRes.json();
      if (doc && doc.fields) {
        return {
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

    // Try query by slug
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
    const queryRes = await fetch(queryUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    });

    if (queryRes.ok) {
      const results = await queryRes.json();
      if (Array.isArray(results) && results[0]?.document?.fields) {
        const doc = results[0].document;
        const docPath = doc.name || "";
        const extractedId = docPath.split("/").pop() || blogId;
        return {
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
  } catch (err) {
    console.warn("Firestore fetch notice:", err);
  }
  return null;
}

function generatePreviewHtml(blog: any, blogId: string, origin: string) {
  const postTitle = blog ? blog.seoTitle || blog.title || DEFAULT_TITLE : DEFAULT_TITLE;
  const rawDesc = blog
    ? blog.metaDescription || stripTags(blog.description) || DEFAULT_DESC
    : DEFAULT_DESC;
  const postDesc = rawDesc.length > 200 ? rawDesc.slice(0, 197) + "..." : rawDesc;

  let postImage = blog && blog.imageUrl ? blog.imageUrl : DEFAULT_BANNER;
  if (postImage && postImage.startsWith("/")) {
    postImage = `${origin}${postImage}`;
  }

  const postUrl = blogId ? `${origin}/blog/${encodeURIComponent(blogId)}` : origin;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(postTitle)}</title>
  <meta name="description" content="${escapeHtml(postDesc)}">

  <!-- Open Graph / Facebook -->
  <meta property="og:site_name" content="Daily News">
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

  <!-- Immediate Browser Redirection for real human readers -->
  <link rel="canonical" href="${escapeHtml(postUrl)}">
  <meta http-equiv="refresh" content="0;url=${escapeHtml(postUrl)}">
  <script>
    if (typeof window !== 'undefined') {
      window.location.replace('${escapeHtml(postUrl)}');
    }
  </script>
</head>
<body>
  <h1>${escapeHtml(postTitle)}</h1>
  <p>${escapeHtml(postDesc)}</p>
  <a href="${escapeHtml(postUrl)}">View Article</a>
</body>
</html>`;
}

async function startServer() {
  // 1. API Preview endpoint
  app.get("/api/preview", async (req, res) => {
    const blogId = String(req.query.id || "").trim();
    const blog = await fetchBlogFromFirestore(blogId);
    const origin = `${req.protocol}://${req.get("host")}`;
    const html = generatePreviewHtml(blog, blogId, origin);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
    return res.status(200).send(html);
  });

  // 2. Crawler interception for /blog/:id
  app.get("/blog/:id", async (req, res, next) => {
    const userAgent = req.get("user-agent") || "";
    if (CRAWLER_USER_AGENT_REGEX.test(userAgent)) {
      const blogId = req.params.id;
      const blog = await fetchBlogFromFirestore(blogId);
      const origin = `${req.protocol}://${req.get("host")}`;
      const html = generatePreviewHtml(blog, blogId, origin);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
      return res.status(200).send(html);
    }
    next();
  });

  // 3. Serve Vite in dev or static files in production
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT} (isProd: ${isProd})`);
  });
}

startServer();
