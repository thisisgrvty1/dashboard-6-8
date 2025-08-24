import React, { useState, useEffect } from 'react';

interface VideoPlayerProps {
  src: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  controls = true, 
  autoPlay = true, 
  loop = true, 
  muted = false, 
  playsInline = false,
  className = "rounded-lg w-full h-full object-cover" 
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    const fetchVideo = async () => {
      try {
        setVideoUrl(null);
        setError(null);
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.statusText}`);
        }
        const blob = await response.blob();
        if (blob.type.startsWith('video/')) {
            objectUrl = URL.createObjectURL(blob);
            setVideoUrl(objectUrl);
        } else {
            throw new Error(`Invalid content type: ${blob.type}. Expected a video file.`);
        }
      } catch (e) {
        console.error("Failed to load video", e);
        setError(e instanceof Error ? e.message : "Could not load video.");
      }
    };

    if (src) {
        fetchVideo();
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (error) {
    return <div className={`flex items-center justify-center bg-black text-red-400 text-xs p-2 text-center ${className}`}>Error: {error}</div>;
  }
  
  if (!videoUrl) {
    return <div className={`flex items-center justify-center bg-black text-white text-xs ${className}`}>Loading video...</div>;
  }
  
  return (
    <video 
      src={videoUrl} 
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      className={className}
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayer;
