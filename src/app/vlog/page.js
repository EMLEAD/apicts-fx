"use client";

import React, { useRef, useState } from "react";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import Link from "next/link";
import { PlusCircle, UploadCloud, ArrowRight } from "lucide-react";

const isAdmin = () => {
  return false; // Set to true for admin
};

// Helper to check if a URL is a YouTube link
function isYouTubeUrl(url) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

// Helper to extract YouTube video ID
function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function VlogPage() {
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: "How to Trade Forex on Apicts-FX",
      description: "A step-by-step guide for beginners to start trading forex and become a pro in no time.",
      url: "https://www.youtube.com/watch?v=1jofE-GNYZ4",
      thumbnail: "/images/vlog-thumb1.jpg",
      uploadedBy: "APICTS Academy",
      date: "15-0-2025",
    },
    {
      id: 2,
      title: "Mentorship With Don",
      description: "Learn from the best! and trade like a pro with our expert mentorship from DON himself.",
      url: "https://www.youtube.com/watch?v=tGOfzmPfFIA",
      thumbnail: "/images/vlog-thumb2.jpg",
      uploadedBy: "APICTS Academy",
      date: "15-0-2025",
    },
    {
      id: 3,
      title: "Understanding Market Analysis(Fundamentals and Technicals)",
      description: "Learn about what drives the market. Who are the market makers? and how to be a profitable trader.",
      url: "https://www.youtube.com/watch?v=pPN59DjpCfk&t=3s",
      thumbnail: "/images/vlog-thumb2.jpg",
      uploadedBy: "APICTS Academy",
      date: "15-0-2025",
    },
  ]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // Simulate upload (replace with real upload logic)
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    setTimeout(() => {
      setUploading(false);
      setVideos((prev) => [
        {
          id: prev.length + 1,
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: "Newly uploaded video.",
          url: URL.createObjectURL(file),
          thumbnail: "/images/vlog-thumb1.jpg",
          uploadedBy: "You",
          date: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
    }, 2000);
  };

  const admin = isAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900 via-blue-700 to-green-500">
      <Navbar />
      <section className="flex-1 py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <div className="mt-20">
              <p className="text-blue-100 text-lg">
                Watch, learn, and trade like a pro! Explore our latest video contents.
              </p>
            </div>
            {admin && (
              <div className="mt-6 md:mt-0">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
                  disabled={uploading}
                >
                  <UploadCloud size={22} />
                  {uploading ? "Uploading..." : "Upload Video"}
                </button>
                <input
                  type="file"
                  accept="video/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </div>
            )}
          </div>
          {uploadError && (
            <div className="mb-4 text-red-500 font-semibold">{uploadError}</div>
          )}

          {/* Video Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative group">
                  {isYouTubeUrl(video.url) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(video.url)}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-56 bg-black rounded-t-2xl"
                    />
                  ) : (
                    <video
                      src={video.url}
                      poster={video.thumbnail}
                      controls
                      className="w-full h-56 object-cover bg-black rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                    {video.uploadedBy}
                  </div>
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold text-white mb-1">{video.title}</h2>
                  <p className="text-blue-100 text-sm mb-2">{video.description}</p>
                  <div className="flex items-center justify-between text-xs text-blue-200">
                    <span>{video.date}</span>
                    <span>#{video.id}</span>
                  </div>
                </div>
              </div>
            ))}
            {/* Upload Card - Only for Admin */}
            {admin && (
              <div
                onClick={() => fileInputRef.current.click()}
                className="flex flex-col items-center justify-center bg-white/10 border-2 border-dashed border-green-400 rounded-2xl cursor-pointer hover:bg-green-500/20 transition-all duration-300 min-h-[250px]"
              >
                <PlusCircle size={48} className="text-green-500 mb-2" />
                <span className="text-green-500 font-bold text-lg">Upload New Video</span>
                <input
                  type="file"
                  accept="video/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="text-center mb-10">
        <Link href="/register">
          <button className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2">
            Subscribe for more videos
            <ArrowRight size={20} />
          </button>
        </Link>
      </div>
      <Footer />
    </div>
  );
}