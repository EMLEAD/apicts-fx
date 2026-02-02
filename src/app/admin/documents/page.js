'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, FileText, Lock, Upload, Download } from 'lucide-react';

export default function DocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [plans, setPlans] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    fileUrl: '',
    fileSize: 0,
    fileType: 'pdf',
    thumbnail: '',
    category: '',
    status: 'draft',
    tags: [],
    accessType: 'all',
    planIds: []
  });

  useEffect(() => {
    fetchDocuments();
    fetchPlans();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [searchTerm, documents]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const filterDocuments = () => {
    if (!searchTerm) {
      setFilteredDocuments(documents);
      return;
    }
    const filtered = documents.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDocuments(filtered);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload/document', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadFormData
      });

      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({
          ...prev,
          fileUrl: data.url,
          fileSize: data.size,
          fileType: data.format || 'pdf'
        }));
        alert('File uploaded successfully!');
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingDocument
        ? `/api/admin/documents/${editingDocument.id}`
        : '/api/admin/documents';
      const method = editingDocument ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      setShowAddModal(false);
      setEditingDocument(null);
      setFormData({ 
        title: '', slug: '', description: '', fileUrl: '', fileSize: 0, fileType: 'pdf',
        thumbnail: '', category: '', status: 'draft', tags: [], accessType: 'all', planIds: [] 
      });
      fetchDocuments();
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const handleEdit = (doc) => {
    setEditingDocument(doc);
    setFormData({
      title: doc.title,
      slug: doc.slug,
      description: doc.description || '',
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize || 0,
      fileType: doc.fileType || 'pdf',
      thumbnail: doc.thumbnail || '',
      category: doc.category || '',
      status: doc.status,
      tags: doc.tags || [],
      accessType: doc.accessType || 'all',
      planIds: doc.planIds || []
    });
    setShowAddModal(true);
  };

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between mt-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600 mt-2">Manage PDFs and downloadable resources</p>
        </div>
        <button
          onClick={() => {
            setEditingDocument(null);
            setFormData({ 
              title: '', slug: '', description: '', fileUrl: '', fileSize: 0, fileType: 'pdf',
              thumbnail: '', category: '', status: 'draft', tags: [], accessType: 'all', planIds: [] 
            });
            setShowAddModal(true);
          }}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Document</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-8 w-8 text-red-600" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doc.status === 'published' ? 'bg-green-100 text-green-700' :
                    doc.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {doc.status}
                  </span>
                  {doc.accessType !== 'all' && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center space-x-1">
                      <Lock className="h-3 w-3" />
                      <span>Premium</span>
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{doc.downloads || 0} downloads</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
              {doc.description && <p className="text-sm text-gray-600 mb-4">{doc.description.substring(0, 100)}...</p>}
              <div className="text-xs text-gray-500 mb-4">
                <p>Size: {formatFileSize(doc.fileSize)}</p>
                <p>Type: {doc.fileType?.toUpperCase()}</p>
              </div>
              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(doc)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No documents found. Create your first document to get started.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingDocument ? 'Edit' : 'Create'} Document
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    disabled={uploading}
                  />
                  {uploading && <span className="text-sm text-blue-600">Uploading...</span>}
                </div>
                {formData.fileUrl && (
                  <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-900">File uploaded successfully</p>
                          <p className="text-xs text-green-700">Size: {formatFileSize(formData.fileSize)}</p>
                        </div>
                      </div>
                      <a
                        href={formData.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <span>Preview</span>
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Guide, Report, Template, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Control</label>
                <select
                  value={formData.accessType}
                  onChange={(e) => setFormData({ ...formData, accessType: e.target.value, planIds: e.target.value === 'specific_plans' ? formData.planIds : [] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Users (Free & Subscribed)</option>
                  <option value="subscribers_only">All Subscribers (Any Active Plan)</option>
                  <option value="specific_plans">Specific Plans Only</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.accessType === 'all' && 'Everyone can download this document'}
                  {formData.accessType === 'subscribers_only' && 'Only users with any active subscription can download'}
                  {formData.accessType === 'specific_plans' && 'Only users subscribed to selected plans can download'}
                </p>
              </div>
              {formData.accessType === 'specific_plans' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Plans</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {plans.map((plan) => (
                      <label key={plan.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.planIds.includes(plan.id)}
                          onChange={(e) => {
                            const newPlanIds = e.target.checked
                              ? [...formData.planIds, plan.id]
                              : formData.planIds.filter(id => id !== plan.id);
                            setFormData({ ...formData, planIds: newPlanIds });
                          }}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">{plan.name} - ${plan.price}/{plan.billingCycle}</span>
                      </label>
                    ))}
                  </div>
                  {formData.planIds.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">Please select at least one plan</p>
                  )}
                </div>
              )}
              </div>
              <div className="border-t border-gray-200 p-6 flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingDocument(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled={!formData.fileUrl}
                >
                  {editingDocument ? 'Update' : 'Create'} Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
