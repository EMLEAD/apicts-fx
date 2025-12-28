'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Lock, Search, Filter, Calendar, Eye, TrendingDown, CheckCircle } from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, selectedCategory, searchTerm]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const res = await fetch('/api/documents', { headers });
      const data = await res.json();
      
      if (data.success) {
        setDocuments(data.documents || []);
        setHasSubscription(data.hasActiveSubscription || false);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.documents.map(doc => doc.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleDownload = async (doc) => {
    if (doc.isLocked) {
      alert('This document requires an active subscription. Please subscribe to access.');
      return;
    }

    // Track download
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`/api/documents/${doc.id}/download`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error tracking download:', error);
    }

    // Open document in new tab
    window.open(doc.fileUrl, '_blank');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getAccessBadge = (doc) => {
    if (doc.accessType === 'all') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center space-x-1">
        <CheckCircle className="h-3 w-3" />
        <span>Free</span>
      </span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center space-x-1">
      <Lock className="h-3 w-3" />
      <span>Premium</span>
    </span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Resource Library</h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Access trading guides, market analysis reports, and educational materials
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-12">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none bg-white transition-all"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredDocuments.length}</span> of <span className="font-semibold text-gray-900">{documents.length}</span> documents
              </span>
              {hasSubscription && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  ✓ Premium Access
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Loading documents...</p>
          </div>
        )}

        {/* Documents Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  doc.isLocked ? 'border-yellow-200' : 'border-gray-200'
                }`}
              >
                {/* Document Header */}
                <div className={`p-6 ${doc.isLocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'bg-gradient-to-br from-red-50 to-pink-50'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${doc.isLocked ? 'bg-yellow-100' : 'bg-red-100'}`}>
                      <FileText className={`h-8 w-8 ${doc.isLocked ? 'text-yellow-600' : 'text-red-600'}`} />
                    </div>
                    {getAccessBadge(doc)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{doc.title}</h3>
                  {doc.category && (
                    <span className="inline-block px-3 py-1 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full text-xs font-medium">
                      {doc.category}
                    </span>
                  )}
                </div>

                {/* Document Body */}
                <div className="p-6">
                  {doc.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{doc.description}</p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Download className="h-4 w-4" />
                      <span>{doc.downloads || 0} downloads</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Eye className="h-4 w-4" />
                      <span>{doc.views || 0} views</span>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(doc.createdAt)}</span>
                      </span>
                      <span className="font-medium">{formatFileSize(doc.fileSize)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Format:</span>
                      <span className="font-semibold text-gray-700 uppercase">{doc.fileType}</span>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={doc.isLocked}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                      doc.isLocked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:scale-105'
                    }`}
                  >
                    {doc.isLocked ? (
                      <>
                        <Lock className="h-5 w-5" />
                        <span>Subscription Required</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5" />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDocuments.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Check back soon for new resources'}
            </p>
          </div>
        )}

        {/* Subscription CTA */}
        {!hasSubscription && filteredDocuments.some(doc => doc.isLocked) && (
          <div className="mt-12 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-white text-center shadow-2xl">
            <Lock className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-2">Unlock Premium Documents</h3>
            <p className="text-red-100 mb-6 max-w-2xl mx-auto">
              Get unlimited access to all premium trading guides, market analysis reports, and exclusive educational materials
            </p>
            <a
              href="/pricing"
              className="inline-block bg-white text-red-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              View Plans
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
