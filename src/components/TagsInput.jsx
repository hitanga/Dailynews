import React, { useState } from "react";
import { Tag, X } from "lucide-react";

export default function TagsInput({
  tags = [],
  onChange,
  placeholder = "Type tag and press Enter or comma...",
  suggestedTags = ["Amazing Facts", "Science Facts", "World News", "Technology", "Trivia", "Nature"],
}) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (rawTag) => {
    const trimmed = rawTag.trim().replace(/^#+/, "");
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        // Support comma separated values if pasted
        const splitted = inputValue.split(",");
        splitted.forEach((t) => addTag(t));
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text");
    if (pasteData.includes(",")) {
      e.preventDefault();
      const splitted = pasteData.split(",");
      splitted.forEach((t) => addTag(t));
      setInputValue("");
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      const splitted = inputValue.split(",");
      splitted.forEach((t) => addTag(t));
      setInputValue("");
    }
  };

  return (
    <div className="space-y-2">
      {/* Tag Badges and Input Box */}
      <div className="min-h-[46px] p-2 bg-white border border-gray-300 rounded-lg flex flex-wrap items-center gap-1.5 focus-within:border-[#f84560] transition-colors">
        <Tag className="w-4 h-4 text-gray-400 ml-1 shrink-0" />

        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-200"
          >
            <span>#{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-red-500 hover:text-red-800 rounded-full hover:bg-red-100 p-0.5 cursor-pointer transition-colors"
              title="Remove tag"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? placeholder : "Add another tag..."}
          className="flex-grow min-w-[140px] px-2 py-1 text-sm text-gray-800 focus:outline-none bg-transparent"
        />
      </div>

      {/* Suggested Quick Tags */}
      {suggestedTags && suggestedTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs text-gray-500">
          <span className="text-[11px] font-medium text-gray-400">Suggestions:</span>
          {suggestedTags
            .filter((st) => !tags.includes(st))
            .slice(0, 5)
            .map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => addTag(st)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer"
              >
                + {st}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
