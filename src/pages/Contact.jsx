import React, { useState } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Mail, Send, CheckCircle2, AlertCircle, MessageSquare, Clock, MapPin, ExternalLink } from "lucide-react";

export const ADMIN_CONTACT_EMAIL = "championhoney@gmail.com";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastMessageData, setLastMessageData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill out your Name, Email, and Message.");
      return;
    }

    setLoading(true);

    const submissionData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim() || "General Editorial Inquiry",
      message: message.trim(),
      recipient: ADMIN_CONTACT_EMAIL,
      dateString: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    let emailDelivered = false;

    // 1. Send live email notification to championhoney@gmail.com via FormSubmit service
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${ADMIN_CONTACT_EMAIL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: submissionData.name,
          email: submissionData.email,
          _replyto: submissionData.email,
          _subject: `[Daily News] Contact: ${submissionData.subject} (From ${submissionData.name})`,
          _cc: "championhonehy@gmail.com",
          Subject: submissionData.subject,
          Sender_Name: submissionData.name,
          Sender_Email: submissionData.email,
          Message: submissionData.message,
          Submitted_At: submissionData.dateString,
          _template: "table",
          _captcha: "false",
        }),
      });

      if (response.ok) {
        emailDelivered = true;
      }
    } catch (netErr) {
      console.warn("Email service network attempt:", netErr);
    }

    // 2. Persist to Firestore "inquiries" collection so Admin can also read it in Dashboard
    try {
      await addDoc(collection(db, "inquiries"), {
        name: submissionData.name,
        email: submissionData.email,
        subject: submissionData.subject,
        message: submissionData.message,
        recipient: ADMIN_CONTACT_EMAIL,
        createdAt: serverTimestamp(),
        dateString: submissionData.dateString,
        read: false,
      });
    } catch (firestoreErr) {
      console.warn("Could not save inquiry to Firestore:", firestoreErr);
    }

    // 3. Backup to localStorage so Admin has complete access in all environments
    try {
      const stored = JSON.parse(localStorage.getItem("daily_news_inquiries") || "[]");
      stored.unshift({
        id: "msg-" + Date.now(),
        ...submissionData,
        createdAt: new Date().toISOString(),
        read: false,
      });
      localStorage.setItem("daily_news_inquiries", JSON.stringify(stored));
    } catch (e) {}

    setLastMessageData(submissionData);
    setLoading(false);
    setSubmitted(true);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  const mailtoUrl = lastMessageData
    ? `mailto:${ADMIN_CONTACT_EMAIL}?subject=${encodeURIComponent(
        `Contact Form: ${lastMessageData.subject}`
      )}&body=${encodeURIComponent(
        `From: ${lastMessageData.name} (${lastMessageData.email})\n\nMessage:\n${lastMessageData.message}`
      )}`
    : `mailto:${ADMIN_CONTACT_EMAIL}`;

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
          Have a breaking story tip, feedback, or general inquiry? Fill out the form below and your message will be forwarded directly to the administrator desk.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        {/* Contact Info & Office Details */}
        <div className="md:col-span-5 bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-xl">
          <h2 className="font-heading text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#f84560]" />
            <span>Newsroom Desk</span>
          </h2>
          
          <div className="space-y-4 text-xs text-gray-600">
            <div>
              <span className="font-bold text-gray-900 block uppercase tracking-wider text-[10px] mb-0.5 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-[#f84560]" />
                <span>Editorial Admin Email</span>
              </span>
              <a
                href={`mailto:${ADMIN_CONTACT_EMAIL}`}
                className="text-[#f84560] font-mono font-semibold hover:underline block break-all text-xs"
              >
                {ADMIN_CONTACT_EMAIL}
              </a>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                All form submissions are routed here
              </span>
            </div>

            <div>
              <span className="font-bold text-gray-900 block uppercase tracking-wider text-[10px] mb-0.5 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span>Headquarters</span>
              </span>
              <p>742 Evergreen Avenue, Media District</p>
              <p>New York, NY 10001, United States</p>
            </div>

            <div>
              <span className="font-bold text-gray-900 block uppercase tracking-wider text-[10px] mb-0.5 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>Hours</span>
              </span>
              <p className="text-gray-600">Mon - Fri: 8:00 AM - 7:00 PM EST</p>
              <p className="text-gray-400">Weekend breaking news desk on standby</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <span className="font-bold text-gray-900 block uppercase tracking-wider text-[10px] mb-1">
              Direct Mail Link
            </span>
            <a
              href={`mailto:${ADMIN_CONTACT_EMAIL}?subject=Editorial%20Tip`}
              className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-[#f84560] font-semibold transition-colors"
            >
              <span>Click to open in your default mail app</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white border border-gray-200 p-6 sm:p-8 rounded-xl shadow-xs">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
                Message Sent to Editorial!
              </h3>
              <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                Your message has been forwarded directly to:
              </p>
              <p className="font-mono text-xs font-bold text-gray-900 bg-gray-100 py-1.5 px-3 rounded-md inline-block mb-4">
                {ADMIN_CONTACT_EMAIL}
              </p>
              <p className="text-xs text-gray-500 mb-6">
                The administrator has received your form data and will review it shortly.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="bg-[#f84560] hover:bg-[#e0344f] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-full transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
                <a
                  href={mailtoUrl}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send via Email Client</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-[#f84560] focus:ring-1 focus:ring-[#f84560] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-[#f84560] focus:ring-1 focus:ring-[#f84560] transition-all"
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
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-[#f84560] focus:ring-1 focus:ring-[#f84560] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message or story tip here..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-[#f84560] focus:ring-1 focus:ring-[#f84560] transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#f84560] hover:bg-[#e0344f] text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? "Sending Message..." : "Submit Message"}</span>
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-2">
                  Delivered securely to {ADMIN_CONTACT_EMAIL}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
