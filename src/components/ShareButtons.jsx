import React, { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  Twitter,
  Facebook,
  Linkedin,
  Send,
  MessageCircle,
} from "lucide-react";

export default function ShareButtons({ title = "", url = "", variant = "bar" }) {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = title ? `${title} – Read on Daily News` : "Daily News Editorial Story";

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn("Could not copy link:", e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "Daily News Story",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to dropdown
        if (err.name !== "AbortError") {
          setShowDropdown(true);
        }
      }
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      bg: "bg-[#25D366] hover:bg-[#20ba59]",
      text: "text-white",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        shareText + "\n" + shareUrl
      )}`,
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      bg: "bg-black hover:bg-neutral-800",
      text: "text-white",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      bg: "bg-[#1877F2] hover:bg-[#166fe5]",
      text: "text-white",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      bg: "bg-[#0A66C2] hover:bg-[#095196]",
      text: "text-white",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
    },
    {
      name: "Telegram",
      icon: Send,
      bg: "bg-[#229ED9] hover:bg-[#1e8dbf]",
      text: "text-white",
      href: `https://t.me/share/url?url=${encodeURIComponent(
        shareUrl
      )}&text=${encodeURIComponent(shareText)}`,
    },
  ];

  // Compact Header Variant (for top of article)
  if (variant === "compact") {
    return (
      <div className="relative inline-flex items-center gap-2">
        <button
          type="button"
          onClick={handleNativeShare}
          className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-[#f84560] text-gray-700 hover:text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          title="Share article"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          title="Copy link"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-gray-500" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        {/* Dropdown for social channels */}
        {showDropdown && (
          <div className="absolute top-full left-0 mt-2 z-30 bg-white border border-gray-200 rounded-lg shadow-xl p-3 flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
              Share:
            </span>
            {shareLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-8 h-8 rounded-full flex items-center justify-center ${item.bg} ${item.text} transition-transform hover:scale-110 shadow-xs`}
                title={`Share on ${item.name}`}
              >
                <item.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full Bar Variant (for bottom of article)
  return (
    <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-4 sm:p-5 my-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left Label */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-red-50 text-[#f84560] flex items-center justify-center">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-extrabold text-sm text-gray-900 leading-tight">
              Share This Story
            </h4>
            <p className="text-[11px] text-gray-500">
              Spread knowledge and fascinating discoveries with friends
            </p>
          </div>
        </div>

        {/* Right Share Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {shareLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center w-9 h-9 rounded-full ${item.bg} ${item.text} transition-transform hover:scale-108 shadow-xs`}
              title={`Share on ${item.name}`}
            >
              <item.icon className="w-4.5 h-4.5" />
            </a>
          ))}

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
              copied
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300 shadow-xs"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
