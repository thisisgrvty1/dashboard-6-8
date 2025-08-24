import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader, ImageIcon, VideoIcon, Music, X } from 'lucide-react';
import type { ImageJob, VideoJob, MusicJob, TopLevelView, CombinedJob } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface JobStatusIndicatorProps {
  imageJobs: ImageJob[];
  videoJobs: VideoJob[];
  musicJobs: MusicJob[];
  setView: (view: TopLevelView) => void;
}

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    
    mediaQueryList.addEventListener('change', listener);
    
    if (mediaQueryList.matches !== matches) {
      setMatches(mediaQueryList.matches);
    }
    
    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query, matches]);

  return matches;
};

const JobStatusIndicator: React.FC<JobStatusIndicatorProps> = ({ imageJobs, videoJobs, musicJobs, setView }) => {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const recentJobs: CombinedJob[] = useMemo(() => {
    const combined: CombinedJob[] = [
      ...imageJobs.map(j => ({ ...j, type: 'image' as const })),
      ...videoJobs.map(j => ({ ...j, type: 'video' as const })),
      ...musicJobs.map(j => ({ ...j, type: 'music' as const }))
    ];
    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
  }, [imageJobs, videoJobs, musicJobs]);

  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');

  useEffect(() => {
    let timer: number;
    const isProcessing = recentJobs.some(j => j.status === 'generating' || j.status === 'polling');
    const hasFailures = recentJobs.some(j => j.status === 'failed');

    if (isProcessing) {
      setStatus('processing');
    } else if (hasFailures) {
      setStatus('failed');
    } else if (recentJobs.length > 0) {
      if (status === 'processing') {
         setStatus('completed');
         timer = window.setTimeout(() => setStatus('idle'), 5000);
      } else if (status !== 'completed') {
         setStatus('idle');
      }
    } else {
      setStatus('idle');
    }
    
    return () => clearTimeout(timer);
  }, [recentJobs, status]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleJobClick = (job: CombinedJob) => {
    setIsOpen(false);
    if (job.type === 'image') setView('image_generation');
    else if (job.type === 'video') setView('video_generation');
    else setView('music_generation');
  };

  if (status === 'idle' && recentJobs.length === 0) return null;

  const getStatusContent = () => {
    switch(status) {
      case 'processing':
        return { icon: <Loader size={16} className="animate-spin" />, text: t('job_status_processing'), color: 'text-blue-500 dark:text-blue-400 bg-blue-500/10' };
      case 'completed':
        return { icon: <CheckCircle size={16} />, text: t('job_status_completed'), color: 'text-green-600 dark:text-green-400 bg-green-500/10' };
      case 'failed':
        return { icon: <XCircle size={16} />, text: t('job_status_failed'), color: 'text-red-600 dark:text-red-400 bg-red-500/10' };
      default:
        return { icon: <CheckCircle size={16} />, text: t('job_status_recent'), color: 'text-slate-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10' };
    }
  };
  
  const { icon, text, color } = getStatusContent();
  
  const renderPreview = (job: CombinedJob) => {
    if (job.type === 'image' && job.status === 'completed' && job.imageUrls?.[0]) {
      return <img src={job.imageUrls[0]} alt="Preview" className="w-full h-full object-cover" />;
    }
    
    switch (job.type) {
      case 'image': return <ImageIcon size={20} className="text-slate-500 dark:text-gray-400" />;
      case 'video': return <VideoIcon size={20} className="text-slate-500 dark:text-gray-400" />;
      case 'music': return <Music size={20} className="text-slate-500 dark:text-gray-400" />;
      default: return null;
    }
  };

  const JobList = () => (
    <ul className="flex-grow overflow-y-auto">
      {recentJobs.map(job => {
         let count = 0;
          if (job.type === 'image') {
              count = job.status === 'completed' ? (job.imageUrls?.length || 1) : job.numberOfImages;
          } else if (job.type === 'video') {
              count = job.status === 'completed' ? (job.videoUrls?.length || 1) : job.numberOfVideos;
          }

        return (
          <li key={job.id}>
            <button onClick={() => handleJobClick(job)} className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center space-x-3">
              <div className="w-10 h-10 flex-shrink-0 bg-slate-100 dark:bg-black/40 rounded-md flex items-center justify-center overflow-hidden">
                  {renderPreview(job)}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-gray-200 truncate">
                  {job.type === 'music' ? job.title : job.prompt}
                </p>
                <div className="text-xs text-slate-500 dark:text-gray-500 mt-1 flex items-center space-x-1.5">
                   <span className={`font-semibold ${
                     job.status === 'completed' ? 'text-green-500' :
                     job.status === 'failed' ? 'text-red-500' :
                     'text-blue-500'
                   }`}>
                     {t(`job_status_${job.status}_single`)}
                   </span>
                   {count > 1 && (
                    <>
                      <span>&middot;</span>
                      <span>{t('job_status_outputs', { count })}</span>
                    </>
                   )}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div 
      ref={containerRef}
      className="relative"
      onMouseEnter={!isMobile ? () => setIsOpen(true) : undefined}
      onMouseLeave={!isMobile ? () => setIsOpen(false) : undefined}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 sm:px-3 sm:py-1.5 rounded-full sm:rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${color}`}
      >
        {icon}
        <span className="hidden sm:inline">{text}</span>
      </button>

      <AnimatePresence>
        {isOpen && recentJobs.length > 0 && (
          isMobile ? (
            <motion.div
              key="mobile-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/80 dark:bg-black/90 backdrop-blur-sm z-50 flex flex-col"
            >
              <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#101010]">
                   <h4 className="font-semibold text-lg text-slate-800 dark:text-white">{t('job_status_modal_title')}</h4>
                   <button onClick={() => setIsOpen(false)} className="p-2 rounded-full text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10">
                       <X size={24}/>
                   </button>
              </div>
              <JobList />
            </motion.div>
          ) : (
            <motion.div
              key="desktop-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-200 dark:border-white/10">
                <h4 className="font-semibold text-sm text-slate-800 dark:text-white">{t('job_status_modal_title')}</h4>
              </div>
              <JobList />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobStatusIndicator;