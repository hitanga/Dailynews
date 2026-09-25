import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { DEFAULT_POSTS } from "../utils/seedData";
import { formatDate } from "../components/BlogCard";
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
        // 1. First check local storage custom posts
        try {
          const localPosts = JSON.parse(
            localStorage.getItem("daily_news_custom_blogs") || "[]"
          );
          const localMatch = localPosts.find((p) => p.id === id);
          if (localMatch) {
            setBlog(localMatch);
            setImgSrc(
              !localMatch.imageUrl || localMatch.imageUrl.includes("photo-1477959858617-67f30bc75b82")
                ? heroCityStreetImg
                : localMatch.imageUrl
            );
            setLoading(false);
            return;
          }
        } catch (e) {
          // continue
        }

        // 2. Check Firestore
        const blogRef = doc(db, "blogs", id);
        const docSnap = await getDoc(blogRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const loadedBlog = { id: docSnap.id, ...data };
          setBlog(loadedBlog);
          setImgSrc(
            !loadedBlog.imageUrl || loadedBlog.imageUrl.includes("photo-1477959858617-67f30bc75b82")
              ? heroCityStreetImg
              : loadedBlog.imageUrl
          );
        } else {
          // 3. Fallback to default posts
          const defaultMatch = DEFAULT_POSTS.find(
            (p, idx) =>
              `post-${idx}` === id ||
              p.title.toLowerCase().includes(id.toLowerCase())
          );
          if (defaultMatch) {
            setBlog({ id, ...defaultMatch });
            setImgSrc(
              !defaultMatch.imageUrl || defaultMatch.imageUrl.includes("photo-1477959858617-67f30bc75b82")
                ? heroCityStreetImg
                : defaultMatch.imageUrl
            );
          } else {
            setError("Story not found.");
          }
        }
      } catch (err) {
        console.warn("Firestore fetch issue, checking fallback defaults:", err);
        const defaultMatch =
          DEFAULT_POSTS.find((p, idx) => `post-${idx}` === id) || DEFAULT_POSTS[0];
        setBlog({ id, ...defaultMatch });
        setImgSrc(
          !defaultMatch.imageUrl || defaultMatch.imageUrl.includes("photo-1477959858617-67f30bc75b82")
            ? heroCityStreetImg
            : defaultMatch.imageUrl
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
    window.scrollTo({ top: 0, behavior: "smooth" });
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
  const categoryText = blog.category || "Featured, Lifestyle";

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
        <span className="text-gray-900">{categoryText}</span>
        <span>•</span>
        <span>{dateText}</span>
        <span>•</span>
        <span>By Daily News Editorial</span>
      </div>

      {/* Red Accent Bar */}
      <div className="w-10 h-[2.5px] bg-[#f84560] mb-5" />

      {/* Headline Title */}
      <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.18] mb-8">
        {blog.title}
      </h1>

      {/* Hero Photograph with Gutenverse Architectural Corner */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[21/10] bg-gray-100 overflow-hidden mb-10 border border-gray-100">
        <img
          src={imgSrc}
          alt={blog.title}
          className="w-full h-full object-cover"
          onError={() => setImgSrc(heroCityStreetImg)}
        />
        {/* Corner tab */}
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#22252a]" />
      </div>

      {/* Story Content / Editorial Body */}
      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6 text-[16px] sm:text-[18px]">
        {blog.description?.split("\n\n").map((paragraph, idx) => (
          <p key={idx} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
