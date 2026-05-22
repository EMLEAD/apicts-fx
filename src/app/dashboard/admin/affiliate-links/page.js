"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminAffiliateLinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    targetUrl: '',
    isActive: true,
    displayOrder: 0
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/affiliate-links', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLinks(data.links);
      }
    } catch (error) {
      console.error('Error fetching affiliate links:', error);
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingLink 
        ? `/api/admin/affiliate-links/${editingLink.id}`
        : '/api/admin/affiliate-links';
      
      const method = editingLink ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingLink ? 'Updated successfully' : 'Created successfully');
        setIsModalOpen(false);
        fetchLinks();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advert?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/affiliate-links/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Deleted successfully');
        fetchLinks();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete');
    }
  };

  const openModal = (link = null) => {
    if (link) {
      setEditingLink(link);
      setFormData({
        name: link.name,
        imageUrl: link.imageUrl || '',
        targetUrl: link.targetUrl || '',
        isActive: link.isActive,
        displayOrder: link.displayOrder || 0
      });
    } else {
      setEditingLink(null);
      setFormData({
        name: '',
        imageUrl: '',
        targetUrl: '',
        isActive: true,
        displayOrder: 0
      });
    }
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Affiliate Adverts</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Advert
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {links.map((link) => (
              <tr key={link.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {link.imageUrl ? (
                    <img src={link.imageUrl} alt={link.name} className="h-10 w-20 object-cover bg-gray-100 rounded" />
                  ) : (
                    <div className="h-10 w-20 bg-gray-100 rounded flex items-center justify-center">
                      <ImageIcon className="text-gray-400" size={20} />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{link.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{link.targetUrl}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${link.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {link.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{link.displayOrder}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openModal(link)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(link.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {links.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No adverts found. Create one above.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full my-8">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{editingLink ? 'Edit Advert' : 'Add Advert'}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Advert Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. TradingView Pro"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Affiliate URL</label>
                  <input
                    type="url"
                    required
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Advert Image (Banner)</label>
                  <div className="flex items-center space-x-4">
                    {formData.imageUrl && (
                      <div className="w-16 h-16 bg-gray-50 border rounded-lg p-1 flex items-center justify-center shrink-0">
                        <img src={formData.imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          const toastId = toast.loading('Uploading image...');
                          try {
                            const fd = new FormData();
                            fd.append('image', file);
                            
                            const res = await fetch('/api/upload/image?folder=apicts/affiliates', {
                              method: 'POST',
                              body: fd
                            });
                            
                            const data = await res.json();
                            if (res.ok && data.url) {
                              setFormData({...formData, imageUrl: data.url});
                              toast.success('Image uploaded successfully', { id: toastId });
                            } else {
                              toast.error(data.error || 'Failed to upload image', { id: toastId });
                            }
                          } catch (err) {
                            console.error(err);
                            toast.error('Error uploading image', { id: toastId });
                          }
                        }}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">Active</label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Advert'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
