'use client';

import { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';

export default function VideosPage() {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const videoCategories = [
    { id: 'all', name: 'All Videos', count: 24 },
    { id: 'tutorials', name: 'Tutorials', count: 8 },
    { id: 'market-analysis', name: 'Market Analysis', count: 6 },
    { id: 'news', name: 'News & Updates', count: 5 },
    { id: 'webinars', name: 'Webinars', count: 5 }
  ];

  const videos = [
    {
      id: 1,
      title: 'Complete Guide to Forex Trading for Beginners',
      description: 'Learn the fundamentals of forex trading with our comprehensive beginner guide.',
      thumbnail: '/images/chart.jpg',
      duration: '15:30',
      views: '12.5K',
      likes: '1.2K',
      category: 'tutorials',
      uploadDate: '2 days ago',
      featured: true
    },
    {
      id: 2,
      title: 'Market Analysis: USD/NGN Exchange Rate Trends',
      description: 'In-depth analysis of current USD to NGN exchange rate movements.',
      thumbnail: '/images/bitcoin-crypto-currency-diagram.jpg',
      duration: '8:45',
      views: '8.7K',
      likes: '890',
      category: 'market-analysis',
      uploadDate: '1 week ago',
      featured: false
    },
    {
      id: 3,
      title: 'Weekly Market Update - December 2024',
      description: 'Stay updated with the latest market trends and trading opportunities.',
      thumbnail: '/images/financial-data.jpg',
      duration: '12:15',
      views: '15.2K',
      likes: '1.8K',
      category: 'news',
      uploadDate: '3 days ago',
      featured: true
    },
    {
      id: 4,
      title: 'Advanced Trading Strategies Webinar',
      description: 'Join our expert traders for an advanced strategies webinar.',
      thumbnail: '/images/stock-exchange-trading-forex-finance-graphic-concept.jpg',
      duration: '45:20',
      views: '5.3K',
      likes: '650',
      category: 'webinars',
      uploadDate: '1 week ago',
      featured: false
    },
    {
      id: 5,
      title: 'Risk Management in Forex Trading',
      description: 'Essential risk management techniques every trader should know.',
      thumbnail: '/images/CFDs.jpg',
      duration: '18:30',
      views: '9.1K',
      likes: '1.1K',
      category: 'tutorials',
      uploadDate: '5 days ago',
      featured: false
    },
    {
      id: 6,
      title: 'Cryptocurrency Market Outlook 2025',
      description: 'Expert predictions and analysis for the crypto market in 2025.',
      thumbnail: '/images/closeup-golden-bitcoins-dark-reflective-surface-histogram-decreasing-crypto (1).jpg',
      duration: '22:10',
      views: '11.8K',
      likes: '1.4K',
      category: 'market-analysis',
      uploadDate: '4 days ago',
      featured: true
    }
  ];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || video.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Educational Videos</h1>
        <p className="text-gray-600 mt-2">Learn trading strategies, market analysis, and stay updated with the latest trends.</p>
      </div>

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
      {filterCategory === 'all' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Videos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {videos.filter(video => video.featured).map(video => (
              <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="relative">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <button className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors">
                      <Play className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                    Featured
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{video.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {video.views}
                      </span>
                      <span className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {video.likes}
                      </span>
                    </div>
                    <span>{video.uploadDate}</span>
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

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map(video => (
              <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    width={400}
                    height={160}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors">
                      <Play className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {video.views}
                      </span>
                      <span className="flex items-center">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {video.likes}
                      </span>
                    </div>
                    <span>{video.uploadDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVideos.map(video => (
              <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-shrink-0">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      width={128}
                      height={80}
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                      <button className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors">
                        <Play className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
                      {video.duration}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{video.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {video.views}
                      </span>
                      <span className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {video.likes}
                      </span>
                      <span>{video.uploadDate}</span>
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
