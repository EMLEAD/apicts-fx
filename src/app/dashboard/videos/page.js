'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Play, 
  Clock, 
  Eye, 
  ThumbsUp, 
  Download,
  Filter,
  Search,
  Grid3X3,
  List,
  ChevronRight,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatViews = (views) => {
  if (!views) return '0';
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
};

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

export default function VideosPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoCategories, setVideoCategories] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Failed to parse user data', err);
      }
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      const params = new URLSearchParams({
        limit: '100',
        offset: '0'
      });

      if (filterCategory !== 'all') {
        params.append('category', filterCategory);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/videos?${params.toString()}`, {
        headers: headers || {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      
      if (data.success) {
        setVideos(data.videos || []);
        setHasActiveSubscription(data.hasActiveSubscription || false);
        
        // Update categories with real counts
        const categories = ['all', 'tutorials', 'market-analysis', 'news', 'webinars'];
        const categoryCounts = categories.map(catId => {
          if (catId === 'all') {
            return { id: catId, name: 'All Videos', count: data.videos?.length || 0 };
          }
          const count = data.videos?.filter(v => v.category === catId).length || 0;
          const name = catId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          return { id: catId, name, count };
        });
        setVideoCategories(categoryCounts);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, searchTerm]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Refresh videos when user subscription status might have changed
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === null) {
        // User data changed, refresh videos to check subscription status
        fetchVideos();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (when subscription is updated)
    const handleSubscriptionUpdate = () => {
      fetchVideos();
    };
    
    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, [fetchVideos]);

  const filteredVideos = videos.filter(video => {
    const matchesSearch = !searchTerm || 
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || video.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredVideos = filteredVideos.filter(v => {
    // Consider recent videos as featured (top 2-3 most recent)
    return filteredVideos.indexOf(v) < 3;
  });

  const handleVideoClick = (video) => {
    if (video.isLocked) {
      router.push('/dashboard/subscription');
      return;
    }
    // Handle video playback - can navigate to video detail page or open modal
    if (video.videoUrl) {
      window.open(video.videoUrl, '_blank');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
          <p className="text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Educational Videos</h1>
        <p className="text-gray-600 mt-2">Learn trading strategies, market analysis, and stay updated with the latest trends.</p>
        {hasActiveSubscription ? (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-700">
              You have an active subscription. All premium videos are unlocked.
            </p>
          </div>
        ) : (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-700">
                Some videos require an active subscription. <button onClick={() => router.push('/dashboard/subscription')} className="underline font-medium">Subscribe now</button> to unlock all content.
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/subscription')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
            >
              View Plans
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            >
              {videoCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Videos */}
      {filterCategory === 'all' && featuredVideos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Videos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredVideos.map(video => (
              <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                {video.isLocked && (
                  <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
                    <div className="text-center text-white p-6">
                      <Lock className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Subscription Required</h3>
                      <p className="text-sm mb-4">This video is available for subscribers only.</p>
                      <button
                        onClick={() => router.push('/dashboard/subscription')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Subscribe Now
                      </button>
                    </div>
                  </div>
                )}
                <div className="relative">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <Play className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <button
                      onClick={() => handleVideoClick(video)}
                      className="bg-red-600 text-white p-3 rounded-full hover:bg-green-600 transition-colors"
                    >
                      <Play className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                    Featured
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {formatDuration(video.duration)}
                  </div>
                  {video.isLocked && (
                    <div className="absolute top-4 left-4 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-medium flex items-center space-x-1">
                      <Lock className="h-3 w-3" />
                      <span>Premium</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{video.description || 'No description available'}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {formatViews(video.views)}
                      </span>
                      <span className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {formatViews(video.likes)}
                      </span>
                    </div>
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Videos */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {filterCategory === 'all' ? 'All Videos' : videoCategories.find(c => c.id === filterCategory)?.name}
            <span className="text-gray-500 font-normal ml-2">({filteredVideos.length})</span>
          </h2>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No videos found matching your criteria.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map(video => (
              <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative">
                {video.isLocked && (
                  <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="text-center text-white p-4">
                      <Lock className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium mb-2">Subscription Required</p>
                      <button
                        onClick={() => router.push('/dashboard/subscription')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>
                )}
                <div className="relative">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      width={400}
                      height={160}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                      <Play className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleVideoClick(video)}
                      className="bg-red-600 text-white p-3 rounded-full hover:bg-green-600 transition-colors"
                    >
                      <Play className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {formatDuration(video.duration)}
                  </div>
                  {video.isLocked && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                      <Lock className="h-3 w-3" />
                      <span>Premium</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description || 'No description available'}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {formatViews(video.views)}
                      </span>
                      <span className="flex items-center">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {formatViews(video.likes)}
                      </span>
                    </div>
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVideos.map(video => (
              <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow relative">
                {video.isLocked && (
                  <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                    <div className="text-center text-white p-4">
                      <Lock className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium mb-2">Subscription Required</p>
                      <button
                        onClick={() => router.push('/dashboard/subscription')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <div className="relative flex-shrink-0">
                    {video.thumbnail ? (
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        width={128}
                        height={80}
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Play className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                      <button
                        onClick={() => handleVideoClick(video)}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
                      {formatDuration(video.duration)}
                    </div>
                    {video.isLocked && (
                      <div className="absolute top-1 left-1 bg-yellow-500 text-white px-1 py-0.5 rounded text-xs font-medium flex items-center space-x-1">
                        <Lock className="h-2 w-2" />
                        <span>Premium</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{video.description || 'No description available'}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {formatViews(video.views)}
                      </span>
                      <span className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {formatViews(video.likes)}
                      </span>
                      <span>{formatDate(video.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
