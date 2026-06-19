"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star, Quote, Play, Loader2 } from "lucide-react";
import {
  getYouTubeEmbedUrl,
  isDirectVideoUrl,
  isYouTubeUrl,
  getTestimonialThumbnail
} from "@/lib/utils/video";

function TestimonialMedia({ testimonial, isActive }) {
  if (!testimonial || !isActive) {
    return (
      <div className="w-full aspect-video bg-gray-800 rounded-2xl flex items-center justify-center">
        <Play className="w-16 h-16 text-gray-600" />
      </div>
    );
  }

  if (testimonial.mediaType === "youtube" || isYouTubeUrl(testimonial.mediaUrl)) {
    const embedUrl = getYouTubeEmbedUrl(testimonial.mediaUrl);
    if (!embedUrl) return null;
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
        <iframe
          src={embedUrl}
          title={`${testimonial.authorName} testimonial`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (testimonial.mediaType === "upload" || isDirectVideoUrl(testimonial.mediaUrl)) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
        <video
          src={testimonial.mediaUrl}
          controls
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={getTestimonialThumbnail(testimonial) || undefined}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
      <iframe
        src={testimonial.mediaUrl}
        title={`${testimonial.authorName} testimonial`}
        className="absolute inset-0 w-full h-full"
        allowFullScreen
      />
    </div>
  );
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.testimonials?.length) {
          setTestimonials(data.testimonials);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const goTo = useCallback((index) => {
    if (!testimonials.length || isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((index + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 400);
  }, [testimonials.length, isAnimating]);

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(goNext, 9000);
    return () => clearInterval(timer);
  }, [testimonials.length, goNext]);

  if (loading) {
    return (
      <section className="py-20 bg-gray-950 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </section>
    );
  }

  if (!testimonials.length) return null;

  const current = testimonials[activeIndex];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block text-red-400 text-sm font-bold uppercase tracking-[0.2em] mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            What Our Clients Say
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Real stories from traders and customers who trust APICTS for their exchange needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className={`transition-all duration-400 ${isAnimating ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"}`}>
            <TestimonialMedia testimonial={current} isActive={!isAnimating} />
          </div>

          <div className={`space-y-6 transition-all duration-400 delay-75 ${isAnimating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}>
            <Quote className="w-10 h-10 text-red-500/80" />

            <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-medium">
              &ldquo;{current.description}&rdquo;
            </p>

            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={i < (current.rating || 5) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
                />
              ))}
            </div>

            <div className="pt-2 border-t border-white/10">
              <p className="text-white font-bold text-lg">{current.authorName}</p>
              {current.authorRole && (
                <p className="text-red-400 text-sm font-medium mt-0.5">{current.authorRole}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous testimonial"
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-red-600 hover:border-red-600 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next testimonial"
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-red-600 hover:border-red-600 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to testimonial ${i + 1}`}
                    onClick={() => goTo(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === activeIndex ? "w-8 bg-red-500" : "w-2 bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500 font-medium">
              {activeIndex + 1} / {testimonials.length}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
