import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";
import heroCityStreetImg from "../assets/images/hero_city_street_1790345223275.jpg";

export const formatDate = (timestamp, fallbackDate) => {
  if (fallbackDate) return fallbackDate;
  if (!timestamp) return "Recent Story";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recent Story";
  }
};

export default function BlogCard({ blog }) {
  // If url is known broken url or missing, start with heroCityStreetImg
  const isBadUrl = !blog.imageUrl || blog.imageUrl.includes("photo-1477959858617-67f30bc75b82");
  const [imgSrc, setImgSrc] = useState(isBadUrl ? heroCityStreetImg : blog.imageUrl);

  const dateText = formatDate(blog.createdAt, blog.dateString);
  const categoryText = blog.category || "Featured, Trending";

  return (
    <article className="flex flex-col group">
      {/* Image Container with Gutenverse Architectural Corner Motif */}
      <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden">
        <Link to={`/blog/${blog.id}`} className="block w-full h-full">
          <img
            src={imgSrc}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
            onError={() => {
              if (imgSrc !== heroCityStreetImg) {
                setImgSrc(heroCityStreetImg);
              }
            }}
          />
        </Link>

        {/* Camera Badge (top right) */}
        {blog.hasCameraBadge && (
          <div className="absolute top-0 right-0 bg-[#f84560] text-white p-2">
            <Camera className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Bottom Right Corner Tab Motif (distinctive Gutenverse element) */}
        <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#22252a] pointer-events-none" />
      </div>

      {/* Card Content */}
      <div className="pt-4 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="font-heading text-[17px] sm:text-[18px] font-bold text-gray-900 leading-snug mb-2 group-hover:text-[#f84560] transition-colors line-clamp-2">
          <Link to={`/blog/${blog.id}`}>
            {blog.title}
          </Link>
        </h3>

        {/* Meta: Date & Category */}
        <div className="text-[10px] font-bold tracking-[0.16em] text-gray-400 uppercase flex items-center gap-1.5 flex-wrap">
          <span>{dateText}</span>
          <span>•</span>
          <span className="text-gray-600">{categoryText}</span>
        </div>

        {/* Red / Coral Accent Line */}
        <div className="w-6 h-[2px] bg-[#f84560] my-2.5" />

        {/* Excerpt */}
        <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed mb-3 line-clamp-3 flex-grow">
          {blog.description}
        </p>

        {/* Read More Link */}
        <div>
          <Link
            to={`/blog/${blog.id}`}
            className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#f84560] hover:text-[#d62844] transition-colors"
          >
            <span>READ MORE</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
