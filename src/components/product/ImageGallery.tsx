"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] w-full rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
        No images available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[4/3] w-full rounded-[2.5rem] overflow-hidden bg-gray-100 dark:bg-gray-800 group shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={images[activeIndex]}
            alt={title}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-all active:scale-90"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-all active:scale-90"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Fullscreen Button */}
        <button 
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-6 right-6 p-3 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-all active:scale-90"
        >
          <Maximize2 size={20} />
        </button>

        {/* Badge */}
        <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl text-white text-xs font-black tracking-widest uppercase">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 transition-all border-4 ${
                idx === activeIndex 
                  ? "border-primary scale-105 shadow-lg shadow-primary/20" 
                  : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              {idx === activeIndex && (
                <div className="absolute inset-0 bg-primary/10" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox (Simple) */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFullscreen(false)}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <img 
              src={images[activeIndex]} 
              alt={title} 
              className="max-w-full max-h-full object-contain rounded-xl"
            />
            <button className="absolute top-8 right-8 text-white font-black text-xl">CLOSE</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
