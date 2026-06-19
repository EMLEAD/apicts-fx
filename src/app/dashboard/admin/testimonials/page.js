"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, Video, Link as LinkIcon, Upload, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import { isYouTubeUrl, getYouTubeThumbnail } from "@/lib/utils/video";

const EMPTY_FORM = {
  authorName: "",
  authorRole: "",
  description: "",
  mediaType: "youtube",
  mediaUrl: "",
  cloudinaryPublicId: "",
  thumbnailUrl: "",
  rating: 5,
  isActive: true,
  displayOrder: 0
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/testimonials", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setTestimonials(data.testimonials);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditing(item);
      setFormData({
        authorName: item.authorName || "",
        authorRole: item.authorRole || "",
        description: item.description || "",
        mediaType: item.mediaType || "youtube",
        mediaUrl: item.mediaUrl || "",
        cloudinaryPublicId: item.cloudinaryPublicId || "",
        thumbnailUrl: item.thumbnailUrl || "",
        rating: item.rating || 5,
        isActive: item.isActive !== false,
        displayOrder: item.displayOrder || 0
      });
    } else {
      setEditing(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const handleVideoUpload = async (file) => {
    if (!file) return;
    setUploadingVideo(true);
    const toastId = toast.loading("Uploading video to Cloudinary...");
    try {
      const fd = new FormData();
      fd.append("video", file);
      const res = await fetch("/api/upload/video?folder=apicts/testimonials", {
        method: "POST",
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setFormData((prev) => ({
        ...prev,
        mediaType: "upload",
        mediaUrl: data.url,
        cloudinaryPublicId: data.publicId,
        thumbnailUrl: data.thumbnailUrl || prev.thumbnailUrl
      }));
      toast.success("Video uploaded", { id: toastId });
    } catch (err) {
      toast.error(err.message || "Upload failed", { id: toastId });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url = editing ? `/api/admin/testimonials/${editing.id}` : "/api/admin/testimonials";
      const method = editing ? "PUT" : "POST";

      let payload = { ...formData };
      if (payload.mediaType === "youtube" && isYouTubeUrl(payload.mediaUrl) && !payload.thumbnailUrl) {
        payload.thumbnailUrl = getYouTubeThumbnail(payload.mediaUrl);
      }
      if (payload.mediaType !== "upload") {
        payload.cloudinaryPublicId = null;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Save failed");

      toast.success(editing ? "Updated" : "Created");
      setIsModalOpen(false);
      fetchTestimonials();
    } catch (err) {
      toast.error(err.message || "Error saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Deleted");
      fetchTestimonials();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-600 mt-1">Manage video testimonials shown on the homepage slider.</p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Plus size={20} className="mr-2" />
          Add Testimonial
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Media</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {testimonials.map((item) => {
              const thumb = item.thumbnailUrl || (item.mediaType === "youtube" ? getYouTubeThumbnail(item.mediaUrl) : null);
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {thumb ? (
                        <img src={thumb} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Video className="text-gray-400" size={20} />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.authorName}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{item.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 capitalize">
                      {item.mediaType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {item.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.displayOrder}</td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" onClick={() => openModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      <Edit2 size={18} />
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No testimonials yet. Add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full my-8">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-5">{editing ? "Edit Testimonial" : "Add Testimonial"}</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role / Title</label>
                  <input
                    type="text"
                    value={formData.authorRole}
                    onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                    placeholder="e.g. Forex Trader, Lagos"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
                    placeholder="What did the customer say about APICTS?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video Source *</label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { id: "youtube", label: "YouTube", icon: Video },
                      { id: "url", label: "Any Link", icon: LinkIcon },
                      { id: "upload", label: "Upload", icon: Upload }
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setFormData({ ...formData, mediaType: id })}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                          formData.mediaType === id ? "border-red-600 bg-red-50 text-red-700" : "border-gray-200 text-gray-600"
                        }`}
                      >
                        <Icon size={18} className="mb-1" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {formData.mediaType === "youtube" && (
                    <input
                      type="url"
                      required
                      value={formData.mediaUrl}
                      onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                    />
                  )}

                  {formData.mediaType === "url" && (
                    <input
                      type="url"
                      required
                      value={formData.mediaUrl}
                      onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                      placeholder="https://example.com/embed/... or direct video URL"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                    />
                  )}

                  {formData.mediaType === "upload" && (
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                        disabled={uploadingVideo}
                        onChange={(e) => handleVideoUpload(e.target.files?.[0])}
                        className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-50 file:text-red-700 file:font-semibold"
                      />
                      {formData.mediaUrl && (
                        <p className="text-xs text-green-600 truncate">Uploaded: {formData.mediaUrl}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: n })}
                          className="p-0.5"
                        >
                          <Star size={22} className={n <= formData.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-red-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Show on homepage</span>
                </label>

                <div className="flex gap-3 pt-4 border-t">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingVideo || (formData.mediaType === "upload" && !formData.mediaUrl)}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 flex items-center justify-center"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save"}
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
