import React, { useRef, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  Unlink,
  Palette,
  List,
  ListOrdered,
  Quote,
  Eye,
  Edit3,
  Heading1,
  Heading2,
  Heading3,
  Type,
  RemoveFormatting,
} from "lucide-react";
import { formatContentToHtml } from "../utils/contentFormatter";

const PRESET_COLORS = [
  { name: "Default (Charcoal)", value: "#1e2024" },
  { name: "Daily News Coral", value: "#f84560" },
  { name: "Slate Blue", value: "#2563eb" },
  { name: "Forest Green", value: "#16a34a" },
  { name: "Amber Gold", value: "#d97706" },
  { name: "Purple", value: "#9333ea" },
  { name: "Muted Gray", value: "#64748b" },
];

export default function RichTextEditor({ value, onChange, placeholder = "Write your story narrative here..." }) {
  const editorRef = useRef(null);
  const [activeTab, setActiveTab] = useState("editor"); // "editor" | "preview"
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [savedSelection, setSavedSelection] = useState(null);

  // Initialize and synchronize content
  useEffect(() => {
    if (editorRef.current && activeTab === "editor") {
      const formatted = formatContentToHtml(value || "");
      if (editorRef.current.innerHTML !== formatted && document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = formatted;
      }
    }
  }, [value, activeTab]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const executeCommand = (command, val = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  const saveCurrentSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedSelection(sel.getRangeAt(0));
      const text = sel.toString();
      if (text) setLinkText(text);
    }
  };

  const restoreSelection = () => {
    if (savedSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection);
    }
  };

  const openLinkDialog = () => {
    saveCurrentSelection();
    setLinkUrl("");
    setShowLinkModal(true);
  };

  const handleInsertLink = (e) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    let finalUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }

    editorRef.current?.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      document.execCommand("createLink", false, finalUrl);
    } else {
      const label = linkText.trim() || finalUrl;
      const linkHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="text-[#f84560] underline font-medium hover:text-[#d62844]">${label}</a>&nbsp;`;
      document.execCommand("insertHTML", false, linkHtml);
    }

    handleInput();
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
  };

  const handleColorSelect = (color) => {
    executeCommand("foreColor", color);
    setShowColorPicker(false);
  };

  const handleFontSizeChange = (e) => {
    const format = e.target.value;
    if (format === "p") {
      executeCommand("formatBlock", "<p>");
    } else if (format === "h1") {
      executeCommand("formatBlock", "<h1>");
    } else if (format === "h2") {
      executeCommand("formatBlock", "<h2>");
    } else if (format === "h3") {
      executeCommand("formatBlock", "<h3>");
    } else if (format === "small") {
      executeCommand("fontSize", "2");
    } else if (format === "large") {
      executeCommand("fontSize", "5");
    }
    e.target.value = "";
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-xs focus-within:border-[#f84560] transition-colors">
      {/* Editor Top Navigation: Visual vs Preview */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "editor"
                ? "bg-white text-gray-900 shadow-xs border border-gray-200"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-[#f84560]" />
            <span>Visual Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "preview"
                ? "bg-white text-gray-900 shadow-xs border border-gray-200"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#f84560]" />
            <span>Live Article Preview</span>
          </button>
        </div>

        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold hidden sm:inline">
          Rich Text & Markdown Supported
        </span>
      </div>

      {/* Formatting Toolbar (Only in Editor tab) */}
      {activeTab === "editor" && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-white border-b border-gray-200 text-gray-700 select-none">
          {/* Font Size & Headings Dropdown */}
          <div className="relative inline-block mr-1">
            <select
              onChange={handleFontSizeChange}
              defaultValue=""
              className="text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded px-2.5 py-1.5 text-gray-700 cursor-pointer focus:outline-none focus:border-[#f84560]"
              title="Font Size & Headings"
            >
              <option value="" disabled>
                Font Size / Style
              </option>
              <option value="p">Normal Paragraph (16px)</option>
              <option value="h1">Heading 1 (Large Title)</option>
              <option value="h2">Heading 2 (Section Title)</option>
              <option value="h3">Heading 3 (Subheading)</option>
              <option value="large">Large Text</option>
              <option value="small">Small Text (13px)</option>
            </select>
          </div>

          <div className="h-4 w-px bg-gray-200 mx-1" />

          {/* Bold */}
          <button
            type="button"
            onClick={() => executeCommand("bold")}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition-colors cursor-pointer"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => executeCommand("italic")}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition-colors cursor-pointer"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => executeCommand("underline")}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition-colors cursor-pointer"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-gray-200 mx-1" />

          {/* Font Color Picker Dropdown */}
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition-colors cursor-pointer flex items-center gap-1"
              title="Text Color"
            >
              <Palette className="w-4 h-4 text-[#f84560]" />
              <span className="text-[11px] font-bold">Color</span>
            </button>

            {showColorPicker && (
              <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-56">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Choose Font Color
                </span>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => handleColorSelect(c.value)}
                      className="w-8 h-8 rounded-full border border-gray-300 hover:scale-110 transition-transform cursor-pointer shadow-xs flex items-center justify-center"
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-medium">Custom color:</span>
                  <input
                    type="color"
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="w-7 h-7 p-0 border-0 rounded cursor-pointer"
                    title="Custom color picker"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-gray-200 mx-1" />

          {/* Hyperlink */}
          <button
            type="button"
            onClick={openLinkDialog}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition-colors cursor-pointer flex items-center gap-1"
            title="Add Hyperlink"
          >
            <LinkIcon className="w-4 h-4 text-blue-600" />
            <span className="text-[11px] font-medium hidden sm:inline">Link</span>
          </button>

          {/* Unlink */}
          <button
            type="button"
            onClick={() => executeCommand("unlink")}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
            title="Remove Link"
          >
            <Unlink className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-gray-200 mx-1" />

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => executeCommand("insertUnorderedList")}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition-colors cursor-pointer"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => executeCommand("insertOrderedList")}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition-colors cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Blockquote */}
          <button
            type="button"
            onClick={() => executeCommand("formatBlock", "<blockquote>")}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition-colors cursor-pointer"
            title="Quote Block"
          >
            <Quote className="w-4 h-4" />
          </button>

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => executeCommand("removeFormat")}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-800 transition-colors cursor-pointer ml-auto"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Body */}
      {activeTab === "editor" ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          placeholder={placeholder}
          className="min-h-[280px] max-h-[550px] overflow-y-auto p-4 sm:p-5 text-gray-800 text-[15px] sm:text-[16px] leading-relaxed focus:outline-none article-editor-content"
          style={{ whiteSpace: "pre-wrap" }}
        />
      ) : (
        /* Live Article Preview */
        <div className="min-h-[280px] max-h-[550px] overflow-y-auto p-5 sm:p-6 bg-gray-50/70 border-t border-gray-100">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#f84560] mb-3">
              PREVIEW RENDERING
            </span>
            <div
              className="article-rendered-content text-gray-800 leading-relaxed text-[16px] sm:text-[17px] space-y-4"
              dangerouslySetInnerHTML={{
                __html: formatContentToHtml(value || "<p><em>No story text entered yet.</em></p>"),
              }}
            />
          </div>
        </div>
      )}

      {/* Hyperlink Insertion Dialog Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-2xl border border-gray-200">
            <h3 className="font-heading text-base font-bold text-gray-900 mb-1 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-[#f84560]" />
              <span>Insert Hyperlink</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter the destination web address (URL) and optional display text.
            </p>

            <form onSubmit={handleInsertLink} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Destination URL *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="https://example.com/report"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#f84560]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Link Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Read the full NSE analysis"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#f84560]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#f84560] hover:bg-[#e0344f] text-white rounded cursor-pointer shadow-xs"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
