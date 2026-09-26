import React, { useEffect, useState } from "react";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import {
  seedInitialBlogsIfEmpty,
  combineBlogsConsistently,
} from "../utils/seedData";
import { stripHtml } from "../utils/contentFormatter";
import { formatDate } from "../components/BlogCard";
import HeroSection from "../components/HeroSection";
import BlogCard from "../components/BlogCard";
import FunFactsSection from "../components/StaffPicksSection";
import heroCityStreetImg from "../assets/images/hero_city_street_1790345223275.jpg";

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
  const location = useLocation();
  const { isAdmin } = useAuth();

  const searchQuery = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";

  // Check if viewing the dedicated Fun Facts page
  const isFunFactsPage =
    location.pathname === "/fun-facts" ||
    (categoryFilter && categoryFilter.toLowerCase().includes("fun"));

  // Check if viewing the dedicated News page
  const isNewsPage =
    location.pathname === "/news" ||
    (categoryFilter && categoryFilter.toLowerCase().includes("news"));

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

  // Helper to determine if a story belongs to Fun Facts
  const isFunFact = (blog) =>
    (blog.category || "").toLowerCase().includes("fun fact");

  // All fun facts stories
  const allFunFacts = blogs.filter((b) => isFunFact(b));
  // All news stories
  const allNewsStories = blogs.filter((b) => !isFunFact(b));

  // Search filter helper (searches Title, Description, Tags, and Category)
  const matchesSearch = (blog) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = blog.title?.toLowerCase().includes(q);
    const matchDesc = blog.description?.toLowerCase().includes(q);
    const matchTags = Array.isArray(blog.tags)
      ? blog.tags.some((t) => (t || "").toLowerCase().includes(q))
      : false;
    const matchCategory = (blog.category || "").toLowerCase().includes(q);
    return matchTitle || matchDesc || matchTags || matchCategory;
  };

  // -------------------------------------------------------------
  // VIEW 1: DEDICATED FUN FACTS PAGE (/fun-facts or ?category=fun facts)
  // ONLY Fun Facts related articles/blogs are displayed!
  // -------------------------------------------------------------
  if (isFunFactsPage) {
    const displayedFunFacts = allFunFacts.filter(matchesSearch);
    const featuredFact = displayedFunFacts.length > 0 ? displayedFunFacts[0] : null;
    const gridFacts = displayedFunFacts.length > 1 ? displayedFunFacts.slice(1) : [];

    return (
      <main className="min-h-screen bg-white pb-16">
        {/* Page Header */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-[0.24em] text-amber-600 uppercase mb-2 flex items-center gap-1.5">
                <span>💡</span>
                <span>DID YOU KNOW? • CURATED TRIVIA & DISCOVERIES</span>
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                Fun Facts
              </h1>
              <p className="text-gray-500 text-sm mt-2 max-w-2xl">
                Explore unbelievable discoveries, historical oddities, and fascinating trivia curated by the Daily News editorial team.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                {displayedFunFacts.length} {displayedFunFacts.length === 1 ? "Fun Fact" : "Fun Facts"} Published
              </span>
              {isAdmin && (
                <Link
                  to="/dashboard/create"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider px-4 py-1.5 rounded-full transition-colors shadow-xs"
                >
                  + Add Fun Fact
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Empty State */}
        {displayedFunFacts.length === 0 && (
          <div className="max-w-3xl mx-auto px-4 py-20 text-center">
            <span className="text-4xl mb-3 block">💡</span>
            <h3 className="font-heading text-xl font-bold text-gray-800 mb-2">
              No Fun Facts Found
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Check back soon for new trivia, discoveries, and oddities.
            </p>
            {isAdmin && (
              <Link
                to="/dashboard/create"
                className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm"
              >
                Write First Fun Fact
              </Link>
            )}
          </div>
        )}

        {/* Fun Facts Stories Content */}
        {displayedFunFacts.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
            {/* 1. Featured Spotlight Fun Fact */}
            {featuredFact && (
              <div className="bg-amber-50/40 border border-amber-200/80 rounded-lg p-6 sm:p-8 flex flex-col lg:flex-row gap-8 items-center">
                <div className="w-full lg:w-1/2 aspect-[16/10] bg-gray-100 rounded-md overflow-hidden relative shadow-sm">
                  <img
                    src={featuredFact.imageUrl || heroCityStreetImg}
                    alt={featuredFact.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = heroCityStreetImg;
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-amber-500 text-white font-bold text-[10px] tracking-wider uppercase px-3 py-1 rounded shadow">
                    💡 Spotlight Fact
                  </div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#22252a]" />
                </div>

                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                  <div className="text-[10px] font-bold tracking-[0.2em] text-amber-700 uppercase mb-2">
                    {formatDate(featuredFact.createdAt, featuredFact.dateString)} • {featuredFact.category || "Fun Facts"}
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug mb-3 hover:text-[#f84560] transition-colors">
                    <Link to={`/blog/${featuredFact.id}`}>
                      {featuredFact.title}
                    </Link>
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-5 line-clamp-4">
                    {stripHtml(featuredFact.description)}
                  </p>
                  <div>
                    <Link
                      to={`/blog/${featuredFact.id}`}
                      className="inline-flex items-center gap-2 bg-[#1e2024] hover:bg-black text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-colors shadow-sm"
                    >
                      <span>Read Full Story</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Grid of All Remaining Fun Facts */}
            {gridFacts.length > 0 && (
              <div>
                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-heading text-xl font-bold text-gray-900">
                    More Fascinating Trivia
                  </h3>
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    {gridFacts.length} {gridFacts.length === 1 ? "article" : "articles"}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {gridFacts.map((fact) => (
                    <BlogCard key={fact.id} blog={fact} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: DEDICATED NEWS PAGE (/news or ?category=news)
  // ONLY News related articles/blogs are displayed!
  // -------------------------------------------------------------
  if (isNewsPage) {
    const displayedNews = allNewsStories.filter(matchesSearch);
    const heroNews = displayedNews.length > 0 ? displayedNews[0] : null;
    const gridNews = displayedNews.length > 1 ? displayedNews.slice(1) : displayedNews;

    return (
      <main className="min-h-screen bg-white pb-16">
        {/* Page Header */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-[0.24em] text-[#f84560] uppercase mb-2 flex items-center gap-1.5">
                <span>📰</span>
                <span>DAILY NEWS REPORTING • GLOBAL & LOCAL</span>
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                Latest News
              </h1>
              <p className="text-gray-500 text-sm mt-2 max-w-2xl">
                Stay informed with breaking headlines, comprehensive market updates, and editorial reports.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                {displayedNews.length} {displayedNews.length === 1 ? "News Story" : "News Stories"} Published
              </span>
              {isAdmin && (
                <Link
                  to="/dashboard/create"
                  className="bg-[#f84560] hover:bg-[#e0344f] text-white font-bold text-xs uppercase tracking-wider px-4 py-1.5 rounded-full transition-colors shadow-xs"
                >
                  + Write News
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Hero Feature for News */}
        {heroNews && (
          <div className="pt-2">
            <HeroSection blog={heroNews} />
          </div>
        )}

        {/* 3-Column Stories Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              All News Stories
            </h2>
          </div>

          {displayedNews.length === 0 ? (
            <div className="py-16 text-center bg-gray-50 border border-gray-100 p-8 rounded">
              <h3 className="font-heading text-lg font-bold text-gray-800 mb-2">
                No News Stories Found
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Check back shortly for latest breaking news and editorial reports.
              </p>
              {isAdmin && (
                <Link
                  to="/dashboard/create"
                  className="inline-block bg-[#f84560] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full"
                >
                  Create News Story
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {gridNews.slice(0, visibleCount).map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}

          {gridNews.length > visibleCount && (
            <div className="mt-14 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((p) => p + 3)}
                className="inline-block bg-[#f84560] hover:bg-[#e0344f] text-white font-heading font-bold text-[11px] tracking-[0.16em] uppercase px-9 py-3.5 rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
              >
                MORE POSTS
              </button>
            </div>
          )}
        </section>
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: SEARCH RESULTS VIEW (when ?q=... is entered)
  // -------------------------------------------------------------
  if (searchQuery) {
    const searchResults = blogs.filter(matchesSearch);

    return (
      <main className="min-h-screen bg-white pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-gray-50 border border-gray-200 px-5 py-4 rounded-lg flex items-center justify-between mb-8">
            <p className="text-sm text-gray-800">
              Showing search results for: <strong className="text-gray-900">"{searchQuery}"</strong> (
              {searchResults.length} {searchResults.length === 1 ? "story" : "stories"} found)
            </p>
            <Link
              to="/"
              className="text-xs font-bold text-[#f84560] hover:underline uppercase tracking-wider"
            >
              Clear Search
            </Link>
          </div>

          {searchResults.length === 0 ? (
            <div className="py-20 text-center bg-gray-50 border border-gray-100 rounded p-8">
              <h3 className="font-heading text-lg font-bold text-gray-800 mb-2">
                No matching stories found
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Try searching with different terms or keywords.
              </p>
              <Link
                to="/"
                className="inline-block bg-[#f84560] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full"
              >
                Browse All Stories
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {searchResults.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 4: DEFAULT HOMEPAGE (/)
  // Shows:
  // 1. Hero Feature Section (latest news story)
  // 2. Latest News Section (grid of news stories)
  // 3. Fun Facts Section (curated fun facts cards)
  // -------------------------------------------------------------
  const heroPost = allNewsStories.length > 0 ? allNewsStories[0] : blogs[0];
  const latestNewsList = allNewsStories.length > 1 ? allNewsStories.slice(1) : allNewsStories;

  return (
    <main className="min-h-screen bg-white pb-12">
      {/* 1. Hero Feature Section (Displays newest/featured news blog) */}
      {heroPost && <HeroSection blog={heroPost} />}

      {/* 2. Latest News Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-10 text-left flex items-end justify-between">
          <div>
            <span className="block text-[11px] font-bold tracking-[0.22em] text-[#f84560] uppercase mb-1.5 flex items-center gap-1.5">
              <span>📰</span>
              <span>BROWSE AND READ THE LATEST STUFF</span>
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Latest News
            </h2>
          </div>

          <Link
            to="/news"
            className="text-xs font-bold uppercase tracking-wider text-[#f84560] hover:text-[#d62844] hidden sm:flex items-center gap-1"
          >
            <span>View All News</span>
            <span>→</span>
          </Link>
        </div>

        {/* 3-Column Latest News Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {latestNewsList.slice(0, visibleCount).map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

        {/* "MORE POSTS" Button for Latest News */}
        {latestNewsList.length > visibleCount && (
          <div className="mt-14 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 3)}
              className="inline-block bg-[#f84560] hover:bg-[#e0344f] text-white font-heading font-bold text-[11px] tracking-[0.16em] uppercase px-9 py-3.5 rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
            >
              MORE POSTS
            </button>
          </div>
        )}
      </section>

      {/* 3. Fun Facts Section */}
      {allFunFacts.length > 0 && <FunFactsSection blogs={allFunFacts} />}
    </main>
  );
}
