'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Upload, Save, Loader2, Image as ImageIcon, Link as LinkIcon, Mail, Phone, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function SiteSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    logoUrl: '/images/apicts-logo.jpg',
    logoWidth: 42,
    logoHeight: 42,
    socialLinks: {
      youtube: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      facebook: '',
      telegram: ''
    },
    contactInfo: {
      email: 'support@apicts.com',
      phone: '+2348139399978',
      address: 'Km 18, Topaz Plaza, New Road, Lekki Ajah, Lagos'
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/site-settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
          
          // Parse JSON strings from database
          const socialLinks = typeof data.settings.socialLinks === 'string' 
            ? JSON.parse(data.settings.socialLinks) 
            : (data.settings.socialLinks || {
                youtube: '',
                twitter: '',
                linkedin: '',
                instagram: '',
                facebook: '',
                telegram: ''
              });
          
          const contactInfo = typeof data.settings.contactInfo === 'string' 
            ? JSON.parse(data.settings.contactInfo) 
            : (data.settings.contactInfo || {
                email: 'support@apicts.com',
                phone: '+2348139399978',
                address: 'Km 18, Topaz Plaza, New Road, Lekki Ajah, Lagos'
              });
          
          setFormData({
            logoUrl: data.settings.logoUrl || '/images/apicts-logo.jpg',
            logoWidth: data.settings.logoWidth || 42,
            logoHeight: data.settings.logoHeight || 42,
            socialLinks,
            contactInfo
          });
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({ ...prev, logoUrl: data.url }));
        setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to upload logo' });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessage({ type: 'error', text: 'Failed to upload logo' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const url = settings?.id ? '/api/admin/site-settings' : '/api/admin/site-settings';
      const method = settings?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...(settings?.id && { id: settings.id }),
          ...formData,
          isActive: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSettings(data.settings);
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          Site Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your site logo, social links, and contact information</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 rounded-lg border p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Logo Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <ImageIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Logo Settings</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Logo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center bg-gray-50">
                {formData.logoUrl ? (
                  <Image
                    src={formData.logoUrl}
                    alt="Site Logo"
                    width={formData.logoWidth}
                    height={formData.logoHeight}
                    className="rounded-full"
                  />
                ) : (
                  <ImageIcon className="h-16 w-16 text-gray-400" />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="/images/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={formData.logoWidth}
                    onChange={(e) => setFormData(prev => ({ ...prev, logoWidth: parseInt(e.target.value) || 42 }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={formData.logoHeight}
                    onChange={(e) => setFormData(prev => ({ ...prev, logoHeight: parseInt(e.target.value) || 42 }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <LinkIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Social Media Links</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {Object.keys(formData.socialLinks).map((platform) => (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {platform}
                </label>
                <input
                  type="url"
                  value={formData.socialLinks[platform]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, [platform]: e.target.value }
                  }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={`https://${platform}.com/yourprofile`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, email: e.target.value }
                }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="support@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Phone
              </label>
              <input
                type="tel"
                value={formData.contactInfo.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, phone: e.target.value }
                }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Address
              </label>
              <textarea
                value={formData.contactInfo.address}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, address: e.target.value }
                }))}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Your business address"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
