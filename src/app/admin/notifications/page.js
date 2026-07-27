'use client';

import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, X, Loader2, Info, AlertTriangle, Megaphone, ExternalLink, Upload } from 'lucide-react';

const typeConfig = {
  info: { icon: Info, bg: 'bg-blue-100', text: 'text-blue-600', label: 'Info' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Warning' },
  announcement: { icon: Megaphone, bg: 'bg-red-100', text: 'text-red-600', label: 'Announcement' }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', imageUrl: '', type: 'info', targetUrl: '', startsAt: '', endsAt: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload/image?folder=apicts/notifications', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setForm(p => ({ ...p, imageUrl: data.url }));
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const body = {
        ...form,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null
      };
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create');
      }
      setForm({ title: '', message: '', imageUrl: '', type: 'info', targetUrl: '', startsAt: '', endsAt: '' });
      setShowForm(false);
      fetchNotifications();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    if (!confirm('Delete this notification?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Manage popup notifications shown to users</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'New Notification'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Notification</h3>
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                required
                rows={3}
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                placeholder="Notification message content"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
                <label className="flex items-center justify-center gap-2 w-full p-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {uploading ? <Loader2 size={16} className="animate-spin text-gray-400" /> : <Upload size={16} className="text-gray-400" />}
                  <span className="text-sm text-gray-600">{form.imageUrl ? 'Image uploaded ✓' : 'Upload image'}</span>
                </label>
                {form.imageUrl && (
                  <div className="mt-2 relative inline-block">
                    <img src={form.imageUrl} alt="" className="h-16 rounded-lg border border-gray-200 object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, imageUrl: '' }))}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target URL (optional)</label>
                <input
                  type="url"
                  value={form.targetUrl}
                  onChange={e => setForm(p => ({ ...p, targetUrl: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starts At (optional)</label>
                <input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={e => setForm(p => ({ ...p, startsAt: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ends At (optional)</label>
                <input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={e => setForm(p => ({ ...p, endsAt: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Creating...' : 'Create Notification'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(n => {
            const cfg = typeConfig[n.type] || typeConfig.info;
            const Icon = cfg.icon;
            return (
              <div key={n.id} className={`bg-white rounded-xl shadow-sm border p-6 ${n.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-lg ${cfg.bg} flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${cfg.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{n.title}</h4>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                        {!n.isActive && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">{n.message}</p>
                      {n.imageUrl && (
                        <img src={n.imageUrl} alt="" className="mt-2 rounded-lg max-h-32 object-cover border border-gray-100" />
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>Created {new Date(n.createdAt).toLocaleDateString()}</span>
                        {n.startsAt && <span>Starts {new Date(n.startsAt).toLocaleDateString()}</span>}
                        {n.endsAt && <span>Ends {new Date(n.endsAt).toLocaleDateString()}</span>}
                        {n.targetUrl && (
                          <a href={n.targetUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-red-600 hover:underline">
                            <ExternalLink size={12} /> Link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(n.id, n.isActive)}
                      className={`p-1 rounded-lg transition-colors ${n.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      title={n.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {n.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
