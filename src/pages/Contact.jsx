import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setLoading(true);
    // Simulate sending message
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[11px] font-bold tracking-[0.22em] text-[#f84560] uppercase block mb-2">
          GET IN TOUCH
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Contact Editorial
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Have a breaking story tip, feedback, or general inquiry for the Daily News editorial team? Reach out using the form below or contact our desk directly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        {/* Contact Info & Office Details */}
        <div className="md:col-span-5 bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded">
          <h2 className="font-heading text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Newsroom Desk
          </h2>
          
          <div className="space-y-4 text-xs text-gray-600">
            <div>
              <span className="font-bold text-gray-900 block uppercase tracking-wider text-[10px] mb-0.5">
                Headquarters
              </span>
              <p>742 Evergreen Avenue, Media District</p>
              <p>New York, NY 10001, United States</p>
            </div>

            <div>
              <span className="font-bold text-gray-900 block uppercase tracking-wider text-[10px] mb-0.5">
                Editorial Inquiries
              </span>
              <p className="text-[#f84560] font-medium">editor@dailynews.press</p>
              <p>press@dailynews.press</p>
            </div>

            <div>
              <span className="font-bold text-gray-900 block uppercase tracking-wider text-[10px] mb-0.5">
                Phone & Hours
              </span>
              <p>+1 (555) 234-8900</p>
              <p className="text-gray-500">Mon - Fri: 8:00 AM - 7:00 PM EST</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <span className="font-bold text-gray-900 block uppercase tracking-wider text-[10px] mb-1">
              Social Newsdesk
            </span>
            <p className="text-xs text-gray-500">
              Follow @DailyNews on Twitter, Instagram, and Facebook for real-time editorial updates.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white border border-gray-200 p-6 sm:p-8 rounded shadow-xs">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-50 text-green-600 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                ✓
              </div>
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
                Thank You for Reaching Out
              </h3>
              <p className="text-xs text-gray-600 mb-6">
                Your message has been sent to our editorial desk. We will review your inquiry shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="bg-[#f84560] hover:bg-[#e0344f] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-full transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-[#f84560]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-[#f84560]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Story tip or inquiry"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-[#f84560]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message or story tip here..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded text-gray-900 text-sm focus:outline-none focus:border-[#f84560]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f84560] hover:bg-[#e0344f] text-white text-xs font-bold uppercase tracking-wider py-3 rounded-full transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? "Sending..." : "Submit Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
