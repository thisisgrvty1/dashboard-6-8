
import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { VideoIcon, Sparkles, ArrowLeft, History, Trash2, HelpCircle, XCircle, UploadCloud, X } from 'lucide-react';
import type { GeneratedVideo, VideoJob } from '../types';
import VideoPlayer from './VideoPlayer';
import MediaViewerModal, { MediaItem } from './MediaViewerModal';
import VideoGenerationBackground from './backgrounds/VideoGenerationBackground';

interface VideoGenerationViewProps {
  geminiApiKey: string;
  history: GeneratedVideo[];
  setHistory: React.Dispatch<React.SetStateAction<GeneratedVideo[]>>;
  jobs: VideoJob[];
  onGenerate: (settings: Omit<VideoJob, 'id' | 'status' | 'timestamp' | 'statusMessage'>) => void;
  onClearCompleted: () => void;
  onDeleteJob: (jobId: string) => void;
}

const pageContainerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

const VideoGenerationView: React.FC<VideoGenerationViewProps> = ({ 
  geminiApiKey, history, setHistory, jobs, onGenerate, onClearCompleted, onDeleteJob
}) => {
  const [prompt, setPrompt] = useState('');
  const [numberOfVideos, setNumberOfVideos] = useState(1);
  const [seed, setSeed] = useState('');
  const [model, setModel] = useState('veo-2.0-generate-001');
  const [inputImage, setInputImage] = useState<{ url: string; mimeType: string; data: string } | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [subView, setSubView] = useState<'generate' | 'history'>('generate');
  
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerContent, setViewerContent] = useState<Partial<GeneratedVideo> & { items: MediaItem[] }>({ items: [], model: 'veo-2.0-generate-001' });
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  const openViewer = (itemSet: GeneratedVideo, index: number) => {
    const items: MediaItem[] = itemSet.videoUrls.map(url => ({ type: 'video', url }));
    setViewerContent({ ...itemSet, items });
    setViewerInitialIndex(index);
    setIsViewerOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        setInputImage({ url: result, mimeType: file.type, data: base64Data });
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read the image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerGenerate = () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
     if (!geminiApiKey) {
      setError('Google Gemini API Key is not set. Please add it in the Settings page.');
      return;
    }

    const parsedSeed = seed.trim() ? parseInt(seed, 10) : undefined;
    if (seed.trim() && (isNaN(parsedSeed) || parsedSeed < 0)) {
        setError('Seed must be a positive number.');
        return;
    }
    setError(null);
    console.log('Triggering video generation with settings:', {
      prompt, 
      numberOfVideos, 
      seed: parsedSeed, 
      model,
      inputImage: inputImage ? 'present' : 'none'
    });
    onGenerate({ 
      prompt, 
      numberOfVideos, 
      seed: parsedSeed, 
      model,
      inputImage: inputImage ? { mimeType: inputImage.mimeType, data: inputImage.data } : undefined
    });
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    triggerGenerate();
  };
  
  const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      triggerGenerate();
    }
  };

  const handleDeleteFromHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this video from your history?')) {
        setHistory(prev => prev.filter(vid => vid.id !== id));
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to delete your entire video history? This action cannot be undone.')) {
        setHistory([]);
    }
  };

  const handleUseHistorySettings = (e: React.MouseEvent, item: GeneratedVideo) => {
    e.stopPropagation();
    setPrompt(item.prompt);
    setSeed(item.seed?.toString() || '');
    setModel(item.model);
    if (item.inputImage) {
      const dataUrl = `data:${item.inputImage.mimeType};base64,${item.inputImage.data}`;
      setInputImage({ url: dataUrl, mimeType: item.inputImage.mimeType, data: item.inputImage.data });
    } else {
      setInputImage(null);
    }
    setNumberOfVideos(item.videoUrls.length || 1);
    setSubView('generate');
  };

  const renderHistoryView = () => (
      <div className="video-history-view">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h2 className="font-display text-4xl font-bold text-green-600 dark:text-green-400">Video History</h2>
            <div className="flex items-center space-x-2">
                {history.length > 0 && (
                    <button onClick={handleClearHistory} className="text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                        <Trash2 size={16} />
                        <span>Clear History</span>
                    </button>
                )}
                <button onClick={() => setSubView('generate')} className="text-sm text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                    <ArrowLeft size={16} />
                    <span>Back to Generator</span>
                </button>
            </div>
        </div>
        {history.length === 0 ? (
             <div className="text-center py-20 px-6 bg-white/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl">
               <VideoIcon className="mx-auto h-16 w-16 text-slate-400 dark:text-gray-600" />
              <h3 className="mt-4 font-display text-2xl font-semibold text-slate-800 dark:text-white">No Videos Generated Yet</h3>
              <p className="mt-2 text-slate-600 dark:text-gray-400">Your generated videos will appear here.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map(videoSet => (
                  <div key={videoSet.id} className="space-y-4">
                    {videoSet.videoUrls.map((url, index) => (
                      <div 
                        key={`${videoSet.id}-${index}`} 
                        className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-black cursor-pointer"
                        onClick={() => openViewer(videoSet, index)}
                      >
                          <VideoPlayer src={url} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end pointer-events-none">
                              <p className="text-sm text-white font-medium line-clamp-3">{videoSet.prompt}</p>
                          </div>
                          <div className="absolute top-2 right-2 space-x-1 pointer-events-auto z-10">
                              <button onClick={(e) => handleUseHistorySettings(e, videoSet)} title="Use Settings" className="p-1.5 bg-black/50 rounded-full text-gray-300 hover:text-green-400 hover:bg-green-500/20 transition-colors">
                                  <Sparkles size={16} />
                              </button>
                              <button onClick={(e) => handleDeleteFromHistory(e, videoSet.id)} title="Delete" className="p-1.5 bg-black/50 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-500/20 transition-colors">
                                 <Trash2 size={16} />
                              </button>
                          </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
        )}
      </div>
  );

  const renderGeneratorView = () => (
    <div className="grid lg:grid-cols-12 gap-8 h-full video-generation-workspace">
      <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col h-fit generation-settings-sidebar">
         <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-green-600 dark:text-green-400">Video Settings</h2>
            {history.length > 0 && (
                <button onClick={() => setSubView('history')} className="text-xs text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-lg transition-colors flex items-center space-x-1">
                    <History size={14} />
                    <span>History</span>
                </button>
            )}
          </div>
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">Prompt</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handlePromptKeyDown}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition min-h-[100px]"
                placeholder="A neon hologram of a cat driving a sports car..."
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">Input Image (Optional)</label>
              {inputImage ? (
                <div className="relative group">
                  <img src={inputImage.url} alt="Input preview" className="w-full h-auto rounded-lg border border-slate-300 dark:border-white/10" />
                  <button onClick={() => setInputImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-slate-100 dark:bg-black/40 border-2 border-slate-300 dark:border-white/20 border-dashed rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-black/60">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500 dark:text-gray-400">
                        <UploadCloud size={32} />
                        <p className="mb-2 text-sm">Click to upload an image</p>
                    </div>
                    <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                </label>
              )}
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">Model</label>
              <select id="model" value={model} onChange={e => setModel(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="veo-2.0-generate-001">VEO 2.0</option>
                  <option value="veo-3.0-generate-001" disabled>VEO 3.0 (Future)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label htmlFor="numberOfVideos" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">Number</label>
                  <input type="number" id="numberOfVideos" value={numberOfVideos} onChange={e => setNumberOfVideos(parseInt(e.target.value))} min="1" max="4" className="w-full px-3 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"/>
              </div>
               <div>
                <label htmlFor="seed" className="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">
                  <span>Seed (Optional)</span>
                  <span className="group relative"><HelpCircle size={14} className="cursor-help"/>
                    <span className="absolute bottom-full z-10 mb-2 w-64 p-2 bg-black/80 text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Using the same seed and prompt will generate similar videos.</span>
                  </span>
                </label>
                <input type="number" id="seed" value={seed} onChange={e => setSeed(e.target.value)} min="0" placeholder="e.g., 12345" className="w-full px-3 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"/>
              </div>
            </div>
            <button
              type="submit"
              disabled={!geminiApiKey}
              className="w-full px-5 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-all duration-300 shadow-[0_0_20px_rgba(22,163,74,0.5)] hover:shadow-[0_0_30px_rgba(22,163,74,0.6)] transform hover:-translate-y-px flex items-center justify-center space-x-2 disabled:bg-slate-300 dark:disabled:bg-gray-700 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
            >
              <Sparkles size={18} /><span>Generate</span>
            </button>
             {error && (<p className="text-xs text-red-500 mt-2 text-center">{error}</p>)}
          </form>
        </div>

      <div className="lg:col-span-8 xl:col-span-9 generation-queue-area">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Generation Queue</h2>
                <button
                  onClick={onClearCompleted}
                  className="text-sm text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <XCircle size={16}/>
                  <span>Clear Completed</span>
                </button>
            </div>
            {jobs.length === 0 ? (
                 <div className="text-center h-full flex flex-col justify-center items-center py-20 px-6 bg-white/50 dark:bg-black/30 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl">
                   <VideoIcon className="mx-auto h-16 w-16 text-slate-400 dark:text-gray-600" />
                  <h3 className="mt-4 font-display text-2xl font-semibold text-slate-800 dark:text-white">Ready to Create</h3>
                  <p className="mt-2 text-slate-600 dark:text-gray-400">Your generated videos will appear here.</p>
                </div>
            ) : (
                <div className="space-y-6 h-[calc(100vh-16rem)] overflow-y-auto pr-2 generation-queue-list">
                    {jobs.map(job => (
                        <div key={job.id} className="bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 rounded-2xl p-4 generation-job-card">
                           <div className="flex justify-between items-start">
                                <div className="flex-grow pr-4">
                                  <p className="text-sm text-slate-700 dark:text-gray-300 line-clamp-2">{job.prompt}</p>
                                  <div className="text-xs text-slate-500 dark:text-gray-500 mt-1 flex items-center space-x-2 flex-wrap">
                                    <span className="bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md">Model: {job.model.startsWith('veo-2') ? 'VEO 2.0' : 'VEO'}</span>
                                    {job.inputImage && <span className="bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md">+ Image Input</span>}
                                    {job.status === 'completed' && job.seed !== undefined && <span>Seed: {job.seed}</span>}
                                  </div>
                                </div>
                                <div className="flex-shrink-0 flex items-center space-x-2">
                                  {job.status === 'generating' && <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">Generating</span>}
                                  {job.status === 'polling' && <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full animate-pulse">Polling...</span>}
                                  {job.status === 'completed' && <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full">Completed</span>}
                                  {job.status === 'failed' && (
                                    <>
                                      <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-1 rounded-full">Failed</span>
                                      <button onClick={() => onDeleteJob(job.id)} className="text-slate-500 dark:text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-500/10" aria-label="Delete failed job">
                                        <Trash2 size={16} />
                                      </button>
                                    </>
                                  )}
                                </div>
                            </div>
                            <div className="mt-4">
                               { (job.status === 'generating' || job.status === 'polling') && 
                                  <div className="aspect-video bg-slate-100 dark:bg-black/30 border border-dashed border-slate-300 dark:border-white/20 rounded-xl flex flex-col items-center justify-center text-slate-600 dark:text-gray-400 p-4 text-center">
                                    <div className="text-sm text-green-600 dark:text-green-300 mb-4">{job.statusMessage}</div>
                                    <div className="w-full bg-slate-200 dark:bg-black/50 rounded-full h-2.5 overflow-hidden">
                                      <div
                                        className="bg-green-600 h-2.5 rounded-full w-full animate-progress-stripes"
                                        style={{
                                          backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)',
                                          backgroundSize: '1rem 1rem'
                                        }}
                                      ></div>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-4">Video generation can take several minutes.</p>
                                  </div>
                               }
                               {job.status === 'completed' && job.videoUrls && (
                                   <div className={`grid grid-cols-${job.videoUrls.length > 1 ? 2 : 1} gap-2`}>
                                       {job.videoUrls.map((url, index) => (
                                          <div key={index} className="aspect-video cursor-pointer" onClick={() => openViewer({ ...job, id: job.id, videoUrls: job.videoUrls || [], timestamp: job.timestamp }, index)}>
                                            <VideoPlayer src={url} />
                                          </div>
                                       ))}
                                   </div>
                               )}
                               {job.status === 'failed' && (
                                   <div className="aspect-video bg-red-500/5 border border-red-500/20 rounded-xl flex flex-col items-center justify-center text-red-500 dark:text-red-400 p-4">
                                       <p className="font-semibold text-sm">Generation Failed</p>
                                       <p className="text-xs mt-1 text-center">{job.error}</p>
                                   </div>
                               )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
  
  return (
    <motion.div
      key="video-generation-view"
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative isolate module-video_generation"
    >
      <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden blur-[120px] opacity-20 dark:opacity-30">
        <VideoGenerationBackground />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={subView}
          variants={pageContainerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {subView === 'generate' ? renderGeneratorView() : renderHistoryView()}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {isViewerOpen && (
          <MediaViewerModal
            items={viewerContent.items}
            initialIndex={viewerInitialIndex}
            onClose={() => setIsViewerOpen(false)}
            prompt={viewerContent.prompt}
            seed={viewerContent.seed}
            model={viewerContent.model}
            inputImage={viewerContent.inputImage}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoGenerationView;
