
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

export interface MediaViewerModalProps {
  items: MediaItem[];
  initialIndex: number;
  onClose: () => void;
  prompt?: string;
  seed?: number;
  // Image specific
  style?: string;
  negativePrompt?: string;
  // Video specific
  model?: string;
  inputImage?: { mimeType: string; data: string; };
}

const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ 
  items, initialIndex, onClose, prompt, seed, style, negativePrompt, model, inputImage 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
  }, [items.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
  }, [items.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
      if (items.length > 1) {
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, goToNext, goToPrevious, items.length]);

  if (!items || items.length === 0) return null;
  
  const currentItem = items[currentIndex];

  const dataUrl = inputImage ? `data:${inputImage.mimeType};base64,${inputImage.data}` : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 p-2 sm:p-4 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent z-10">
          <div className="text-white max-w-[calc(100%-3.5rem)] flex items-start space-x-2 sm:space-x-4">
            {inputImage && (
              <img src={dataUrl} alt="Input" className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md border-2 border-white/50 flex-shrink-0" />
            )}
            <div>
              {prompt && <p className="font-bold text-base sm:text-lg leading-tight line-clamp-3">{prompt}</p>}
              {negativePrompt && <p className="text-sm text-red-300 mt-1">Negative: <span className="text-gray-300">{negativePrompt}</span></p>}
              <div className="text-xs text-gray-400 mt-2 flex items-center space-x-3 flex-wrap">
                  {seed !== undefined && <span>Seed: {seed}</span>}
                  {style && <span>Style: {style}</span>}
                  {model && <span>Model: {model.startsWith('veo-2') ? 'VEO 2.0' : 'VEO'}</span>}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white bg-black/50 hover:bg-white/20 transition-colors flex-shrink-0 ml-2 sm:ml-4"
            aria-label="Close viewer"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="relative flex-grow w-full flex items-center justify-center">
          {items.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-1 sm:p-2 rounded-full text-white bg-black/50 hover:bg-white/20 transition-colors"
              aria-label="Previous item"
            >
              <ChevronLeft className="h-7 w-7 sm:h-8 sm:w-8" />
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex items-center justify-center"
            >
              {currentItem.type === 'image' ? (
                <img
                  src={currentItem.url}
                  alt={`Generated content ${currentIndex + 1}`}
                  className="max-w-full max-h-[80vh] sm:max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <div className="w-full max-w-screen-lg h-auto aspect-video">
                  <VideoPlayer
                    src={currentItem.url}
                    autoPlay={true}
                    loop={false}
                    muted={false}
                    controls={true}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {items.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-1 sm:p-2 rounded-full text-white bg-black/50 hover:bg-white/20 transition-colors"
              aria-label="Next item"
            >
              <ChevronRight className="h-7 w-7 sm:h-8 sm:w-8" />
            </button>
          )}
        </div>

        {items.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 text-center bg-gradient-to-t from-black/50 to-transparent">
            <p className="text-white font-semibold">{currentIndex + 1} / {items.length}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MediaViewerModal;