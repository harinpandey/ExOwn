"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, Maximize2, X } from "lucide-react";

interface ImageGalleryProps {
  images?: string[];
  title: string;
}

export default function ImageGallery({ images = [], title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const validImages = Array.isArray(images)
    ? images.map((url) => (typeof url === "string" ? url.trim() : "")).filter(Boolean)
    : [];

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
    setImgLoading(false);
  };

  const handleImageLoad = () => {
    setImgLoading(false);
  };

  const nextImage = () => {
    if (validImages.length <= 1) return;
    setImgLoading(true);
    setActiveIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    if (validImages.length <= 1) return;
    setImgLoading(true);
    setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  if (validImages.length === 0) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-zinc-900">
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400 dark:text-zinc-600">
          <ImageIcon size={44} strokeWidth={1.5} />
          <span className="text-xs font-semibold tracking-wide">No images provided for this listing</span>
        </div>
      </div>
    );
  }

  const activeImage = validImages[activeIndex];
  const isCurrentFailed = failedImages[activeIndex];

  return (
    <div className="space-y-3">
      {/* Primary Image Viewport */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        {imgLoading && !isCurrentFailed && (
          <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-zinc-800" />
        )}

        {!isCurrentFailed ? (
          <img
            key={activeImage}
            src={activeImage}
            alt={`${title} - Photo ${activeIndex + 1}`}
            onLoad={handleImageLoad}
            onError={() => handleImageError(activeIndex)}
            className={`h-full w-full object-cover transition-opacity duration-200 ${
              imgLoading ? "opacity-0" : "opacity-100"
            }`}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-50 text-gray-400 dark:bg-zinc-900 dark:text-zinc-500">
            <ImageIcon size={40} strokeWidth={1.5} />
            <span className="text-xs font-semibold">Image unavailable</span>
          </div>
        )}

        {/* Carousel Arrows (only if multiple images) */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/80 active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/80 active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Fullscreen Button */}
        {!isCurrentFailed && (
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            aria-label="Open full image view"
            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/80 active:scale-95"
          >
            <Maximize2 size={16} />
          </button>
        )}

        {/* Counter Badge */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {activeIndex + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {validImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {validImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => {
                if (idx !== activeIndex) {
                  setImgLoading(true);
                  setActiveIndex(idx);
                }
              }}
              aria-label={`View photo ${idx + 1}`}
              className={`relative h-18 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                idx === activeIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-gray-200 opacity-70 hover:opacity-100 dark:border-white/10"
              }`}
            >
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover"
                onError={() => handleImageError(idx)}
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Overlay */}
      {isFullscreen && !isCurrentFailed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image fullscreen view"
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            aria-label="Close fullscreen"
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={22} />
          </button>
          <img
            src={activeImage}
            alt={title}
            className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
}
