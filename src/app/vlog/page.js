"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/Components/NavBar";
import Footer from "@/Components/Footer";
import Link from "next/link";
import { PlusCircle, UploadCloud, ArrowRight, Lock, Loader2, AlertCircle } from "lucide-react";

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

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

export default function VlogPage() {
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      const response = await fetch('/api/videos?limit=100&offset=0', {
        headers: headers || {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      
      if (data.success) {
        // Filter videos: show all if subscribed, otherwise only show non-subscription videos
        const filteredVideos = data.hasActiveSubscription
          ? data.videos // Show all videos (including subscription ones) if subscribed
          : data.videos.filter(v => !v.requiresSubscription); // Show only free videos if not subscribed
        
        setVideos(filteredVideos);
        setHasActiveSubscription(data.hasActiveSubscription || false);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Refresh videos when subscription status might have changed
  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      fetchVideos();
    };
    
    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);

    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, [fetchVideos]);

  // Simulate upload (replace with real upload logic)
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    setTimeout(() => {
      setUploading(false);
      // Refresh videos after upload
      fetchVideos();
    }, 2000);
  };

  const handleVideoClick = (video) => {
    if (video.isLocked) {
      router.push('/dashboard/subscription');
      return;
    }
    if (video.videoUrl) {
      window.open(video.videoUrl, '_blank');
    }
  };

  const admin = isAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <section className="flex-1 py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <div className="mt-20">
              <p className="text-white text-lg">
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

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {!hasActiveSubscription && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-700">
                  Premium videos are available to subscribers only. <Link href="/dashboard/subscription" className="underline font-medium">Subscribe</Link> to unlock all content.
                </p>
              </div>
              <Link href="/dashboard/subscription">
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors">
                  View Plans
                </button>
              </Link>
            </div>
          )}

          {/* Video Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
                <p className="text-gray-600">Loading videos...</p>
              </div>
            </div>
          ) : videos.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
              <p className="text-white text-lg">No videos available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => {
                const videoUrl = video.videoUrl;
                
                return (
                  <div
                    key={video.id}
                    className={`${video.bgClass || "bg-white/10"} backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 relative`}
                  >
                    <div className="relative group">
                      {videoUrl && isYouTubeUrl(videoUrl) ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}`}
                          title={video.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-56 bg-black rounded-t-2xl"
                        />
                      ) : videoUrl ? (
                        <video
                          src={videoUrl}
                          poster={video.thumbnail}
                          controls
                          className="w-full h-56 object-cover bg-black rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-56 bg-black rounded-t-2xl flex items-center justify-center">
                          {video.thumbnail ? (
                            <Image
                              src={video.thumbnail}
                              alt={video.title}
                              width={400}
                              height={224}
                              className="w-full h-56 object-cover"
                            />
                          ) : (
                            <Lock className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                      )}
                      {video.requiresSubscription && hasActiveSubscription && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg flex items-center space-x-1">
                          <Lock className="h-3 w-3" />
                          <span>Premium</span>
                        </div>
                      )}
                      {!video.requiresSubscription && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                          Free
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h2 className={`text-xl font-bold mb-1 ${video.titleClass || "text-white"}`}>{video.title}</h2>
                      <p className={`${video.descClass || "text-blue-100"} text-sm mb-2`}>{video.description || 'No description available'}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white">{formatDate(video.createdAt)}</span>
                        <span className="text-white">#{video.id?.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
          )}
        </div>
      </section>
      <div className="text-center mb-10">
        {!hasActiveSubscription ? (
          <Link href="/dashboard/subscription">
            <button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-green-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2">
              Subscribe for more videos
              <ArrowRight size={20} />
            </button>
          </Link>
        ) : (
          <Link href="/dashboard/videos">
            <button className="bg-gradient-to-r from-green-600 to-green-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-green-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2">
              View All Videos in Dashboard
              <ArrowRight size={20} />
            </button>
          </Link>
        )}
      </div>
      <Footer />
    </div>
  );
}