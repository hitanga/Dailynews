import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import {
  DEFAULT_POSTS,
  seedInitialBlogsIfEmpty,
  combineBlogsConsistently,
} from "../utils/seedData";
import HeroSection from "../components/HeroSection";
import BlogCard from "../components/BlogCard";
import FunFactsSection from "../components/StaffPicksSection";

function getInitialPosts() {
  let customBlogs = [];
  try {
    customBlogs = JSON.parse(
      localStorage.getItem("daily_news_custom_blogs") || "[]"
    );
  } catch (e) {
    customBlogs = [];
  }
  return combineBlogsConsistently([], customBlogs);
}

export default function Home() {
  const [blogs, setBlogs] = useState(getInitialPosts);
  const [visibleNewsCount, setVisibleNewsCount] = useState(6);
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";

  useEffect(() => {
    const blogsRef = collection(db, "blogs");

    const unsubscribe = onSnapshot(
      blogsRef,
      (snapshot) => {
        let localCustom = [];
        try {
          localCustom = JSON.parse(
            localStorage.getItem("daily_news_custom_blogs") || "[]"
          );
        } catch (e) {
          localCustom = [];
        }

        if (!snapshot.empty) {
          const firestoreDocs = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));

          const merged = combineBlogsConsistently(firestoreDocs, localCustom);
          setBlogs(merged);
        } else {
          // If Firestore is empty, keep full curated list and seed in background
          setBlogs(combineBlogsConsistently([], localCustom));
          seedInitialBlogsIfEmpty().catch(() => {});
        }
      },
      (error) => {
        console.warn("Firestore snapshot listener error, using robust editorial list:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Separate News vs Fun Facts
  const isFunFact = (blog) =>
    (blog.category || "").toLowerCase().includes("fun fact");

  // Filter based on search query or category filter
  const filteredBlogs = blogs.filter((blog) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = blog.title?.toLowerCase().includes(q);
      const matchDesc = blog.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    if (categoryFilter) {
      const c = categoryFilter.toLowerCase();
      const matchCat = blog.category?.toLowerCase().includes(c);
      if (!matchCat) return false;
    }
    return true;
  });

  // News stories (all non-fun-fact stories or stories explicitly categorized as news)
  const newsStories = filteredBlogs.filter((b) => !isFunFact(b));
  // Fun facts stories
  const funFactStories = filteredBlogs.filter((b) => isFunFact(b));

  // Hero post: Latest news story if available, or first filtered blog
  const heroPost = !searchQuery && !categoryFilter && newsStories.length > 0
    ? newsStories[0]
    : filteredBlogs.length > 0
    ? filteredBlogs[0]
    : null;

  // Latest News grid: excludes hero post on default view
  const latestNewsList =
    !searchQuery && !categoryFilter && newsStories.length > 1
      ? newsStories.slice(1)
      : newsStories;

  const handleLoadMoreNews = () => {
    setVisibleNewsCount((prev) => prev + 3);
  };

  return (
    <main className="min-h-screen bg-white pb-12">
      {/* Search / Filter Notification Banner */}
      {(searchQuery || categoryFilter) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-gray-50 border border-gray-200 px-4 py-3 text-sm flex items-center justify-between">
            <p className="text-gray-700">
              Showing results for:{" "}
              <strong className="text-gray-900">
                {searchQuery ? `"${searchQuery}"` : `Category: ${categoryFilter}`}
              </strong>{" "}
              ({filteredBlogs.length} {filteredBlogs.length === 1 ? "story" : "stories"} found)
            </p>
            <a
              href="/"
              className="text-xs font-semibold text-[#f84560] hover:underline"
            >
              Clear filter
            </a>
          </div>
        </div>
      )}

      {/* 1. Hero Feature Section (Displays newest/featured news blog) */}
      {!searchQuery && !categoryFilter && heroPost && (
        <HeroSection blog={heroPost} />
      )}

      {/* 2. Latest News Section (Renamed from Latest Stories) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-10 text-left">
          <span className="block text-[11px] font-bold tracking-[0.22em] text-[#f84560] uppercase mb-1.5 flex items-center gap-1.5">
            <span>📰</span>
            <span>BROWSE AND READ THE LATEST STUFF</span>
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Latest News
          </h2>
        </div>

        {/* Empty State when search returns 0 results */}
        {newsStories.length === 0 && (
          <div className="py-12 text-center bg-gray-50 border border-gray-100 p-8 my-6 rounded">
            <h3 className="font-heading text-lg font-bold text-gray-800 mb-2">
              No news stories found
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Write a new story categorized as "News" in the dashboard.
            </p>
            <a
              href="/dashboard/create"
              className="inline-block bg-[#f84560] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full"
            >
              Create News Story
            </a>
          </div>
        )}

        {/* 3-Column Latest News Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {latestNewsList.slice(0, visibleNewsCount).map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

        {/* "MORE POSTS" Button for Latest News */}
        {latestNewsList.length > visibleNewsCount && (
          <div className="mt-14 text-center">
            <button
              type="button"
              onClick={handleLoadMoreNews}
              className="inline-block bg-[#f84560] hover:bg-[#e0344f] text-white font-heading font-bold text-[11px] tracking-[0.16em] uppercase px-9 py-3.5 rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
            >
              MORE POSTS
            </button>
          </div>
        )}
      </section>

      {/* 3. Fun Facts Section (Changed from Staff's Picks) */}
      {!searchQuery && !categoryFilter && funFactStories.length > 0 && (
        <FunFactsSection blogs={funFactStories} />
      )}
    </main>
  );
}
