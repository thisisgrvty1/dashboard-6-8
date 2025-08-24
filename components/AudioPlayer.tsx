
import React from 'react';

interface AudioPlayerProps {
  src: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  src, 
  className = "w-full" 
}) => {
  if (!src) {
    return <div className={`flex items-center justify-center bg-black text-gray-400 text-xs p-2 text-center h-14 rounded-lg ${className}`}>Audio not available.</div>;
  }
  
  return (
    <audio 
      src={src} 
      controls
      className={className}
    >
      Your browser does not support the audio element.
    </audio>
  );
};

export default AudioPlayer;
