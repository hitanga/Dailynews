import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroFallbackImg from "../assets/images/hero_city_street_1790345223275.jpg";
import { stripHtml, getCleanCategory } from "../utils/contentFormatter";

export default function HeroSection({ blog }) {
  if (!blog) return null;

  const [currentImg, setCurrentImg] = useState(blog.imageUrl || heroFallbackImg);

  useEffect(() => {
    setCurrentImg(blog.imageUrl || heroFallbackImg);
  }, [blog.imageUrl]);

  const dateText = (
    blog.dateString ||
    (blog.createdAt?.toDate
      ? blog.createdAt.toDate().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "FEBRUARY 1, 2019")
  ).toUpperCase();

  const category = getCleanCategory(blog.category).toUpperCase();
  const comments = blog.commentsCount ?? 0;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10 mb-14 sm:mb-18">
      {/* Desktop & Tablet: Composite Layout */}
      <div className="relative w-full min-h-[380px] sm:min-h-[440px] md:h-[480px] lg:h-[520px] bg-white">
        
        {/* 1. Left Dark Slate Architectural Block (42% width) */}
        <div className="hidden md:block absolute left-0 top-0 bottom-0 w-[42%] bg-[#22252a] z-0" />

        {/* 2. Right Photographic Panorama (starts at 42% width, spans to 100%) */}
        <div className="relative md:absolute md:left-[42%] md:right-0 md:top-0 md:bottom-0 h-64 sm:h-80 md:h-full z-0 overflow-hidden bg-gray-100">
          <Link to={`/blog/${blog.id}`} className="block w-full h-full group relative">
            <img
              src={currentImg}
              alt={blog.title}
              onError={() => {
                if (currentImg !== heroFallbackImg) {
                  setCurrentImg(heroFallbackImg);
                }
              }}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
            />
            {/* Circular Target Reticle Icon on the right side of the photo */}
            <div className="absolute right-5 lg:right-8 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-7 h-7 rounded-full border border-white/70 bg-black/20 text-white pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </Link>
        </div>

        {/* 3. Floating Crisp White Content Card */}
        {/* Positioned inside the dark block on the left and overlapping across into the photo on the right */}
        <div className="relative -mt-12 md:mt-0 md:absolute md:left-[4.5%] lg:left-[5%] md:top-[8%] md:bottom-[8%] md:w-[44%] lg:w-[43%] z-10 flex items-center px-3 md:px-0">
          
          {/* Mobile Dark Backdrop backing */}
          <div className="md:hidden absolute inset-0 -m-2 bg-[#22252a] -z-10" />

          <div className="w-full bg-white p-6 sm:p-8 lg:p-10 xl:p-12 shadow-md md:shadow-lg border border-gray-100 flex flex-col justify-center">
            
            {/* Meta Info: DATE • CATEGORY • COMMENTS */}
            <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-gray-500 uppercase flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
              <span>{dateText}</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-700">{category}</span>
              <span className="text-gray-300">•</span>
              <span>{comments} {comments === 1 ? "COMMENT" : "COMMENTS"}</span>
            </div>

            {/* Coral Accent Line */}
            <div className="w-8 h-[2.5px] bg-[#f84560] mb-4" />

            {/* Headline Title */}
            <h2 className="font-heading text-xl sm:text-2xl lg:text-[27px] xl:text-[30px] font-extrabold text-gray-900 leading-[1.24] mb-4">
              <Link
                to={`/blog/${blog.id}`}
                className="hover:text-[#f84560] transition-colors"
              >
                {blog.title}
              </Link>
            </h2>

            {/* Excerpt */}
            <p className="text-xs sm:text-[13.5px] text-gray-600 leading-relaxed line-clamp-3">
              {stripHtml(blog.description)}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
