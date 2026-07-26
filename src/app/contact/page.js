"use client";

import Navbar from "@/Components/NavBar";
import Footer from "@/Components/Footer";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  Youtube,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Send as TelegramIcon,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", message: "" }
  const [fieldErrors, setFieldErrors] = useState({});
  const [siteSettings, setSiteSettings] = useState({
    contactInfo: {
      email: "support@apicts.com",
      phone: "+2348139399978",
      address: "Km 18, Topaz Plaza, New Road,\nLekki Ajah, Lagos",
      workingDays: "Monday - Saturday: 9:00 AM - 6:00 PM",
    },
    socialLinks: {
      youtube: "",
      twitter: "",
      linkedin: "",
      instagram: "",
      facebook: "",
      telegram: "",
    },
  });

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch("/api/site-settings");
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            const contactInfo =
              typeof data.settings.contactInfo === "string"
                ? JSON.parse(data.settings.contactInfo)
                : data.settings.contactInfo || siteSettings.contactInfo;

            const socialLinks =
              typeof data.settings.socialLinks === "string"
                ? JSON.parse(data.settings.socialLinks)
                : data.settings.socialLinks || siteSettings.socialLinks;

            setSiteSettings({ contactInfo, socialLinks });
          }
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
      }
    };
    fetchSiteSettings();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (formData.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (formData.subject.trim().length < 3) errors.subject = "Subject must be at least 3 characters";
    if (formData.message.trim().length < 10) errors.message = "Message must be at least 10 characters";
    if (formData.message.trim().length > 5000) errors.message = "Message must be under 5000 characters";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: "Message sent successfully! We'll get back to you soon." });
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setStatus({ type: "error", message: data.error || "Failed to send message. Please try again." });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "An error occurred. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all";

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-red-500 text-sm font-bold uppercase tracking-[0.2em] mb-3">
              Get In Touch
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Contact Us
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">
              Have a question or need assistance? Send us a message and we&apos;ll
              respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
            {/* Contact Form - 3 cols */}
            <div className="lg:col-span-3 bg-gray-900 border border-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-red-600 p-2 rounded-lg">
                  <MessageSquare className="text-white" size={22} />
                </div>
                <h2 className="text-2xl font-bold text-white">Send a Message</h2>
              </div>

              {/* Status Banner */}
              {status && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                    status.type === "success"
                      ? "bg-green-900/40 border border-green-700 text-green-300"
                      : "bg-red-900/40 border border-red-700 text-red-300"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle size={20} className="shrink-0 text-green-400" />
                  ) : (
                    <XCircle size={20} className="shrink-0 text-red-400" />
                  )}
                  <span className="text-sm font-medium">{status.message}</span>
                  <button
                    type="button"
                    onClick={() => setStatus(null)}
                    className="ml-auto text-gray-500 hover:text-white transition-colors"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={`${inputClasses} ${fieldErrors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                      placeholder="John Doe"
                    />
                    {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={inputClasses}
                      placeholder="+234 813 939 9978"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className={`${inputClasses} ${fieldErrors.subject ? "border-red-500 focus:ring-red-500" : ""}`}
                      placeholder="How can we help?"
                    />
                    {fieldErrors.subject && <p className="text-red-400 text-xs mt-1">{fieldErrors.subject}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className={`${inputClasses} ${fieldErrors.message ? "border-red-500 focus:ring-red-500" : ""}`}
                    placeholder="Tell us more about your inquiry..."
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.message ? (
                      <p className="text-red-400 text-xs">{fieldErrors.message}</p>
                    ) : (
                      <span />
                    )}
                    <p className={`text-xs ${formData.message.length > 5000 ? "text-red-400" : "text-gray-600"}`}>
                      {formData.message.length} / 5000
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3.5 rounded-lg hover:from-red-700 hover:to-red-600 hover:shadow-lg hover:shadow-red-600/25 flex items-center justify-center gap-2 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            {/* Sidebar - 2 cols */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info */}
              <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>
                <div className="space-y-5">
                  <a
                    href={`mailto:${siteSettings.contactInfo.email}`}
                    className="flex items-start gap-4 group"
                  >
                    <div className="bg-red-600/10 border border-red-600/30 p-3 rounded-xl group-hover:bg-red-600 transition-all shrink-0">
                      <Mail className="text-red-500 group-hover:text-white transition-colors" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-gray-300 text-sm">{siteSettings.contactInfo.email}</p>
                    </div>
                  </a>

                  <a
                    href={`tel:${siteSettings.contactInfo.phone}`}
                    className="flex items-start gap-4 group"
                  >
                    <div className="bg-red-600/10 border border-red-600/30 p-3 rounded-xl group-hover:bg-red-600 transition-all shrink-0">
                      <Phone className="text-red-500 group-hover:text-white transition-colors" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-gray-300 text-sm">{siteSettings.contactInfo.phone}</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="bg-red-600/10 border border-red-600/30 p-3 rounded-xl shrink-0">
                      <MapPin className="text-red-500" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Address</p>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {siteSettings.contactInfo.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-600/10 border border-red-600/30 p-3 rounded-xl">
                    <Clock className="text-red-500" size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Business Hours</h2>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {siteSettings.contactInfo.workingDays}
                </p>
              </div>

              {/* Social Media */}
              <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-5">Follow Us</h2>
                <div className="flex flex-wrap gap-3">
                  {siteSettings.socialLinks?.twitter && (
                    <a
                      href={siteSettings.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-800 border border-gray-700 text-gray-400 rounded-xl hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
                    >
                      <Twitter size={20} />
                    </a>
                  )}
                  {siteSettings.socialLinks?.youtube && (
                    <a
                      href={siteSettings.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-800 border border-gray-700 text-gray-400 rounded-xl hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
                    >
                      <Youtube size={20} />
                    </a>
                  )}
                  {siteSettings.socialLinks?.linkedin && (
                    <a
                      href={siteSettings.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-800 border border-gray-700 text-gray-400 rounded-xl hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
                    >
                      <Linkedin size={20} />
                    </a>
                  )}
                  {siteSettings.socialLinks?.instagram && (
                    <a
                      href={siteSettings.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-800 border border-gray-700 text-gray-400 rounded-xl hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
                    >
                      <Instagram size={20} />
                    </a>
                  )}
                  {siteSettings.socialLinks?.facebook && (
                    <a
                      href={siteSettings.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-800 border border-gray-700 text-gray-400 rounded-xl hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
                    >
                      <Facebook size={20} />
                    </a>
                  )}
                  {siteSettings.socialLinks?.telegram && (
                    <a
                      href={siteSettings.socialLinks.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-800 border border-gray-700 text-gray-400 rounded-xl hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
                    >
                      <TelegramIcon size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
