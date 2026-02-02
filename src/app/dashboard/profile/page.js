'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Mail, Calendar, Shield, Edit2, Save, X, Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [documentForm, setDocumentForm] = useState({
    documentType: 'nin',
    documentImageFront: null,
    documentImageBack: null
  });
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchUserProfile();
    fetchDocuments();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setFormData({
          username: data.user.username,
          email: data.user.email
        });
      } else {
        localStorage.removeItem('token');
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setEditMode(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file, side) => {
    if (!file) return;

    const setUploading = side === 'front' ? setUploadingFront : setUploadingBack;
    const setPreview = side === 'front' ? setFrontPreview : setBackPreview;

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('side', side);

      const res = await fetch('/api/upload/document-image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setDocumentForm(prev => ({
          ...prev,
          [side === 'front' ? 'documentImageFront' : 'documentImageBack']: data.url
        }));
        setPreview(URL.createObjectURL(file));
        setMessage({ type: 'success', text: `${side === 'front' ? 'Front' : 'Back'} image uploaded successfully!` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitDocument = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    if (!documentForm.documentImageFront) {
      setMessage({ type: 'error', text: 'Please upload at least the front image of your document' });
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(documentForm)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Document submitted successfully!' });
        setShowDocumentForm(false);
        setDocumentForm({
          documentType: 'nin',
          documentImageFront: null,
          documentImageBack: null
        });
        setFrontPreview(null);
        setBackPreview(null);
        fetchDocuments();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit document' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit document' });
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      verified: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      expired: 'bg-gray-100 text-gray-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDocumentType = (type) => {
    const types = {
      nin: 'National ID (NIN)',
      drivers_license: "Driver's License",
      voters_card: "Voter's Card",
      international_passport: 'International Passport'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information and documents</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
            {user?.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={user.username}
                width={96}
                height={96}
                unoptimized
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{user?.username}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user?.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      username: user.username,
                      email: user.email
                    });
                  }}
                  className="flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <h4 className="text-sm font-medium text-gray-600">Username</h4>
                </div>
                <p className="text-gray-900">{user?.username}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <h4 className="text-sm font-medium text-gray-600">Email</h4>
                </div>
                <p className="text-gray-900">{user?.email}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <h4 className="text-sm font-medium text-gray-600">Role</h4>
                </div>
                <p className="text-gray-900 capitalize">{user?.role}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <h4 className="text-sm font-medium text-gray-600">Member Since</h4>
                </div>
                <p className="text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Verification Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Document Verification</h2>
            <p className="text-sm text-gray-600 mt-1">Upload your identification documents for verification</p>
          </div>
          {!showDocumentForm && (
            <button
              onClick={() => setShowDocumentForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Add Document</span>
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Document Form */}
          {showDocumentForm && (
            <form onSubmit={handleSubmitDocument} className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit New Document</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                <select
                  value={documentForm.documentType}
                  onChange={(e) => setDocumentForm({ ...documentForm, documentType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="nin">National ID (NIN)</option>
                  <option value="drivers_license">Driver&apos;s License</option>
                  <option value="voters_card">Voter&apos;s Card</option>
                  <option value="international_passport">International Passport</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Front Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Front Image <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                    {frontPreview ? (
                      <div className="relative">
                        <img src={frontPreview} alt="Front" className="w-full h-48 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => {
                            setFrontPreview(null);
                            setDocumentForm(prev => ({ ...prev, documentImageFront: null }));
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload front of document</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'front')}
                          className="hidden"
                          id="front-upload"
                          disabled={uploadingFront}
                        />
                        <label
                          htmlFor="front-upload"
                          className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
                        >
                          {uploadingFront ? 'Uploading...' : 'Choose File'}
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Back Image <span className="text-gray-400">(Optional)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                    {backPreview ? (
                      <div className="relative">
                        <img src={backPreview} alt="Back" className="w-full h-48 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => {
                            setBackPreview(null);
                            setDocumentForm(prev => ({ ...prev, documentImageBack: null }));
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload back of document</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'back')}
                          className="hidden"
                          id="back-upload"
                          disabled={uploadingBack}
                        />
                        <label
                          htmlFor="back-upload"
                          className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
                        >
                          {uploadingBack ? 'Uploading...' : 'Choose File'}
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  <span>{saving ? 'Submitting...' : 'Submit Document'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDocumentForm(false)}
                  className="flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          )}

          {/* Documents List */}
          {documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {formatDocumentType(doc.documentType)}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(doc.verificationStatus)}`}>
                            {doc.verificationStatus}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {/* Document Images */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            {doc.documentImageFront && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-700">Front Image</p>
                                <a
                                  href={doc.documentImageFront}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img
                                    src={doc.documentImageFront}
                                    alt="Document Front"
                                    className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                                  />
                                </a>
                              </div>
                            )}
                            {doc.documentImageBack && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-700">Back Image</p>
                                <a
                                  href={doc.documentImageBack}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img
                                    src={doc.documentImageBack}
                                    alt="Document Back"
                                    className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
                                  />
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            {doc.documentNumber && (
                              <p><span className="font-medium">Document Number:</span> {doc.documentNumber}</p>
                            )}
                            {doc.fullName && (
                              <p><span className="font-medium">Full Name:</span> {doc.fullName}</p>
                            )}
                            {doc.dateOfBirth && (
                              <p><span className="font-medium">Date of Birth:</span> {new Date(doc.dateOfBirth).toLocaleDateString()}</p>
                            )}
                            <p><span className="font-medium">Submitted:</span> {new Date(doc.createdAt).toLocaleDateString()}</p>
                            {doc.verifiedAt && (
                              <p><span className="font-medium">Verified:</span> {new Date(doc.verifiedAt).toLocaleDateString()}</p>
                            )}
                            {doc.rejectionReason && (
                              <p className="text-red-600"><span className="font-medium">Rejection Reason:</span> {doc.rejectionReason}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(doc.verificationStatus)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No documents submitted yet</p>
              <p className="text-sm text-gray-400 mt-2">Upload your identification documents to get verified</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
