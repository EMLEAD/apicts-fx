"use client";

import Navbar from "@/Components/NavBar";
import Footer from "@/Components/Footer";
import { Mail, Phone, MapPin, Send, Loader2, Youtube, Twitter, Linkedin, Instagram, Facebook, Send as TelegramIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    contactInfo: {
      email: 'support@apicts.com',
      phone: '+2348139399978',
      address: 'Km 18, Topaz Plaza, New Road,\nLekki Ajah, Lagos',
      workingDays: 'Monday - Saturday: 9:00 AM - 6:00 PM'
    },
    socialLinks: {
      youtube: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      facebook: '',
      telegram: ''
    }
  });

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch('/api/site-settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            const contactInfo = typeof data.settings.contactInfo === 'string' 
              ? JSON.parse(data.settings.contactInfo) 
              : (data.settings.contactInfo || siteSettings.contactInfo);
              
            const socialLinks = typeof data.settings.socialLinks === 'string'
              ? JSON.parse(data.settings.socialLinks)
              : (data.settings.socialLinks || siteSettings.socialLinks);
              
            setSiteSettings({ contactInfo, socialLinks });
          }
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };
    fetchSiteSettings();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while sending");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Contact Page Content */}
      <main className="flex-grow pt-24 pb-16 px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mt-12 mb-12">
            <p className="text-lg text-gray-700 font-medium">
              We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-xl border-t-4 border-blue-600">
              <h2 className="text-2xl font-bold text-green-700 mb-6">Send us a Message</h2>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                    placeholder="+234 813 939 9978"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-md hover:bg-green-600 hover:shadow-lg flex items-center justify-center gap-2 font-semibold transition-all duration-300 disabled:opacity-70"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-lg shadow-xl border-t-4 border-red-600">
                <h2 className="text-2xl font-bold text-black mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-lg shadow-md shrink-0">
                      <Mail className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-1">Email</h3>
                      <p className="text-gray-700">{siteSettings.contactInfo.email}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-lg shadow-md shrink-0">
                      <Phone className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-1">Phone</h3>
                      <p className="text-gray-700">{siteSettings.contactInfo.phone}</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-lg shadow-md shrink-0">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-1">Address</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {siteSettings.contactInfo.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white text-black p-8 rounded-lg shadow-xl border-l-4 border-red-600">
                <h2 className="text-2xl font-bold text-red-600 mb-6">Business Hours</h2>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {siteSettings.contactInfo.workingDays}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white text-black p-8 rounded-lg shadow-xl border-t-4 border-blue-600">
                <h2 className="text-2xl font-bold text-blue-600 mb-6">Connect With Us</h2>
                <div className="flex flex-wrap gap-4">
                  {siteSettings.socialLinks?.twitter && (
                    <a href={siteSettings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 text-blue-500 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                      <Twitter size={24} />
                    </a>
                  )}
                  {siteSettings.socialLinks?.youtube && (
                    <a href={siteSettings.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-3 bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all">
                      <Youtube size={24} />
                    </a>
                  )}
                  {siteSettings.socialLinks?.linkedin && (
                    <a href={siteSettings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-700 hover:text-white transition-all">
                      <Linkedin size={24} />
                    </a>
                  )}
                  {siteSettings.socialLinks?.instagram && (
                    <a href={siteSettings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-600 hover:text-white transition-all">
                      <Instagram size={24} />
                    </a>
                  )}
                  {siteSettings.socialLinks?.facebook && (
                    <a href={siteSettings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                      <Facebook size={24} />
                    </a>
                  )}
                  {siteSettings.socialLinks?.telegram && (
                    <a href={siteSettings.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition-all">
                      <TelegramIcon size={24} />
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

