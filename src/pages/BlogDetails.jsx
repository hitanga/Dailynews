import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { DEFAULT_POSTS } from "../utils/seedData";
import { formatDate } from "../components/BlogCard";
import { formatContentToHtml, stripHtml } from "../utils/contentFormatter";
import { updatePageSeo, resetPageSeo } from "../utils/seoHelper";
import { Tag } from "lucide-react";
import heroCityStreetImg from "../assets/images/hero_city_street_1790345223275.jpg";

export default function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgSrc, setImgSrc] = useState(heroCityStreetImg);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError("");

      try {
        let loadedBlog = null;

        // 1. Check local storage custom blogs (by id or slug)
        try {
          const localPosts = JSON.parse(
            localStorage.getItem("daily_news_custom_blogs") || "[]"
          );
          const localMatch = localPosts.find(
            (p) => p.id === id || p.slug === id
          );
          if (localMatch) {
            loadedBlog = localMatch;
          }
        } catch (e) {}

        // 2. Check Firestore (by document ID, then by slug field)
        if (!loadedBlog) {
          try {
            const blogRef = doc(db, "blogs", id);
            const docSnap = await getDoc(blogRef);

            if (docSnap.exists()) {
              loadedBlog = { id: docSnap.id, ...docSnap.data() };
            } else {
              // Try querying by slug field in Firestore
              const q = query(collection(db, "blogs"), where("slug", "==", id));
              const querySnap = await getDocs(q);
              if (!querySnap.empty) {
                const firstDoc = querySnap.docs[0];
                loadedBlog = { id: firstDoc.id, ...firstDoc.data() };
              }
            }
          } catch (firestoreErr) {
            console.warn("Firestore fetch error:", firestoreErr);
          }
        }

        // 3. Fallback to default sample posts
        if (!loadedBlog) {
          const defaultMatch = DEFAULT_POSTS.find(
            (p, idx) =>
              `post-${idx}` === id ||
              p.slug === id ||
              p.title.toLowerCase().includes(id.toLowerCase())
          );
          if (defaultMatch) {
            loadedBlog = { id, ...defaultMatch };
          }
        }

        if (loadedBlog) {
          setBlog(loadedBlog);
          const finalImage =
            !loadedBlog.imageUrl ||
            loadedBlog.imageUrl.includes("photo-1477959858617-67f30bc75b82")
              ? heroCityStreetImg
              : loadedBlog.imageUrl;
          setImgSrc(finalImage);

          // Update Hidden SEO Metadata (HTML <head> only, hidden from page body)
          updatePageSeo({
            title: loadedBlog.title,
            seoTitle: loadedBlog.seoTitle,
            description: stripHtml(loadedBlog.description),
            metaDescription: loadedBlog.metaDescription,
            imageUrl: finalImage,
            slug: loadedBlog.slug,
            tags: loadedBlog.tags,
            category: loadedBlog.category,
            datePublished: loadedBlog.createdAt?.toDate
              ? loadedBlog.createdAt.toDate().toISOString()
              : new Date().toISOString(),
          });
        } else {
          setError("Story not found.");
        }
      } catch (err) {
        console.warn("Error fetching story details:", err);
        setError("Unable to load story.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Cleanup SEO tags when leaving this article page
    return () => {
      resetPageSeo();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-3 border-[#f84560] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
          Loading Story...
        </p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">
          Story Not Found
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          The requested article could not be located.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#f84560] hover:bg-[#e0344f] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
        >
          ← Return to Magazine
        </Link>
      </div>
    );
  }

  const dateText = formatDate(blog.createdAt, blog.dateString);
  const categoryText = blog.category || "Featured";
  const formattedHtml = formatContentToHtml(blog.description);
  const blogTags = Array.isArray(blog.tags) ? blog.tags : [];

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Breadcrumb / Back Link */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#f84560] hover:text-[#d62844] transition-colors"
        >
          <span>← BACK TO ALL STORIES</span>
        </Link>
      </div>

      {/* Category & Meta */}
      <div className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-3 flex flex-wrap items-center gap-2">
        <span className="text-gray-900 font-bold">{categoryText}</span>
        <span>•</span>
        <span>{dateText}</span>
        <span>•</span>
        <span>By Daily News Editorial</span>
      </div>

      {/* Red Accent Bar */}
      <div className="w-10 h-[2.5px] bg-[#f84560] mb-5" />

      {/* 1. VISIBLE FRONTEND: Title */}
      <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.18] mb-8">
        {blog.title}
      </h1>

      {/* 2. VISIBLE FRONTEND: Image */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[21/10] bg-gray-100 overflow-hidden mb-10 border border-gray-100 shadow-xs">
        <img
          src={imgSrc}
          alt={blog.title}
          className="w-full h-full object-cover"
          onError={() => setImgSrc(heroCityStreetImg)}
        />
        {/* Corner tab */}
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#22252a]" />
      </div>

      {/* 3. VISIBLE FRONTEND: Description (Story Body) */}
      <div
        className="article-rendered-content text-gray-800 leading-relaxed text-[16px] sm:text-[18px]"
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
      />

      {/* 4. VISIBLE FRONTEND: Tags (Only Title, Image, Description, and Tags are visible) */}
      {blogTags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-gray-500 mb-3 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#f84560]" />
            <span>Tags & Topics</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {blogTags.map((tag, idx) => (
              <Link
                key={idx}
                to={`/?q=${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-[#f84560] text-gray-700 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors border border-gray-200 hover:border-[#f84560]"
                title={`Find more stories tagged #${tag}`}
              >
                <span>#{tag}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* NOTE: SEO Title, Slug, and Meta Description are intentionally kept hidden
          from this article body and only rendered in HTML <head> for search engines */}
    </article>
  );
}
