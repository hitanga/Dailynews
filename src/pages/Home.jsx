import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import {
  DEFAULT_POSTS,
  seedInitialBlogsIfEmpty,
  combineBlogsConsistently,
  getBlogTime,
} from "../utils/seedData";
import HeroSection from "../components/HeroSection";
import BlogCard from "../components/BlogCard";
import StaffPicksSection from "../components/StaffPicksSection";

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
  const [visibleCount, setVisibleCount] = useState(6);
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

  // Filter based on search query or category
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

  // Hero post: Always the newest story (blogs[0])
  const heroPost = filteredBlogs.length > 0 ? filteredBlogs[0] : null;

  // Latest stories: Follows hero post (or take all if filtered)
  const latestStories =
    filteredBlogs.length > 1 ? filteredBlogs.slice(1) : filteredBlogs;

  // Staff picks: Always takes items 2 through 6 so there are always 4 picks
  const staffPicks =
    blogs.length > 4 ? blogs.slice(2, 6) : blogs.slice(0, 4);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
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

      {/* 1. Hero Feature Section (Displays newest/featured blog) */}
      {!searchQuery && !categoryFilter && heroPost && (
        <HeroSection blog={heroPost} />
      )}

      {/* 2. Latest Stories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-10 text-left">
          <span className="block text-[11px] font-bold tracking-[0.22em] text-gray-800 uppercase mb-1.5">
            BROWSE AND READ THE LATEST STUFF
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Latest Stories
          </h2>
        </div>

        {/* Empty State when search returns 0 results */}
        {filteredBlogs.length === 0 && (
          <div className="py-16 text-center bg-gray-50 border border-gray-100 p-8 my-6">
            <h3 className="font-heading text-lg font-bold text-gray-800 mb-2">
              No matching stories found
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Try a different search term or browse all articles.
            </p>
            <a
              href="/"
              className="inline-block bg-[#f84560] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full"
            >
              View All Stories
            </a>
          </div>
        )}

        {/* 3-Column Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {latestStories.slice(0, visibleCount).map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

        {/* "MORE POSTS" Button */}
        {latestStories.length > visibleCount && (
          <div className="mt-14 text-center">
            <button
              type="button"
              onClick={handleLoadMore}
              className="inline-block bg-[#f84560] hover:bg-[#e0344f] text-white font-heading font-bold text-[11px] tracking-[0.16em] uppercase px-9 py-3.5 rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
            >
              MORE POSTS
            </button>
          </div>
        )}
      </section>

      {/* 3. Staff's Picks Section */}
      {!searchQuery && !categoryFilter && (
        <StaffPicksSection blogs={staffPicks} />
      )}
    </main>
  );
}
