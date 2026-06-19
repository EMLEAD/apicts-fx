export function isYouTubeUrl(url) {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
}

export function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2]?.length === 11 ? match[2] : null;
}

export function getYouTubeEmbedUrl(url) {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
}

export function getYouTubeThumbnail(url) {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function isDirectVideoUrl(url) {
  if (!url) return false;
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) return true;
  if (url.includes('cloudinary.com') && (url.includes('/video/') || url.includes('resource_type=video'))) {
    return true;
  }
  return false;
}

export function getTestimonialThumbnail(testimonial) {
  if (testimonial.thumbnailUrl) return testimonial.thumbnailUrl;
  if (testimonial.mediaType === 'youtube') return getYouTubeThumbnail(testimonial.mediaUrl);
  return null;
}
