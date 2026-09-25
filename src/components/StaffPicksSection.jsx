import React from "react";
import { Link } from "react-router-dom";
import { formatDate } from "./BlogCard";
import heroCityStreetImg from "../assets/images/hero_city_street_1790345223275.jpg";

export default function StaffPicksSection({ blogs }) {
  if (!blogs || blogs.length === 0) return null;

  // Primary featured pick
  const mainPick = blogs[0];
  // Secondary side picks
  const sidePicks = blogs.slice(1, 4);

  const getCleanImageUrl = (url) => {
    if (!url || url.includes("photo-1477959858617-67f30bc75b82")) {
      return heroCityStreetImg;
    }
    return url;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-100">
      {/* Section Header */}
      <div className="mb-8">
        <span className="block text-[11px] font-bold tracking-[0.22em] text-gray-800 uppercase mb-1.5">
          YOU HAVE TO READ THIS!
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Staff's Picks
        </h2>
      </div>

      {/* Grid Layout: Featured Pick (Left) + List of Picks (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Pick (Large Left Card) */}
        {mainPick && (
          <div className="lg:col-span-7 group">
            <Link to={`/blog/${mainPick.id}`} className="block relative aspect-[16/10] bg-gray-100 overflow-hidden mb-4">
              <img
                src={getCleanImageUrl(mainPick.imageUrl)}
                alt={mainPick.title}
                onError={(e) => {
                  e.currentTarget.src = heroCityStreetImg;
                }}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
              />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#22252a]" />
            </Link>

            <div className="text-[10px] font-bold tracking-[0.16em] text-gray-400 uppercase flex items-center gap-1.5 mb-1.5">
              <span>{formatDate(mainPick.createdAt, mainPick.dateString)}</span>
              <span>•</span>
              <span className="text-gray-700">{mainPick.category || "Staff Pick"}</span>
            </div>

            <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-[#f84560] transition-colors leading-snug mb-2">
              <Link to={`/blog/${mainPick.id}`}>
                {mainPick.title}
              </Link>
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {mainPick.description}
            </p>
          </div>
        )}

        {/* Side Picks (Right Column List) */}
        <div className="lg:col-span-5 space-y-6">
          {sidePicks.map((pick) => (
            <article key={pick.id} className="flex gap-4 items-start group pb-6 border-b border-gray-100 last:border-0 last:pb-0">
              <Link to={`/blog/${pick.id}`} className="w-24 sm:w-28 h-20 sm:h-24 bg-gray-100 shrink-0 overflow-hidden relative block">
                <img
                  src={getCleanImageUrl(pick.imageUrl)}
                  alt={pick.title}
                  onError={(e) => {
                    e.currentTarget.src = heroCityStreetImg;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="text-[9px] sm:text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-1">
                  <span>{formatDate(pick.createdAt, pick.dateString)}</span>
                </div>

                <h4 className="font-heading text-sm sm:text-base font-bold text-gray-900 leading-snug group-hover:text-[#f84560] transition-colors line-clamp-2 mb-1.5">
                  <Link to={`/blog/${pick.id}`}>
                    {pick.title}
                  </Link>
                </h4>

                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {pick.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
