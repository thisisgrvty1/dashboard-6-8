
import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ImageIcon, Sparkles, ArrowLeft, History, Trash2, HelpCircle, XCircle, Loader } from 'lucide-react';
import type { GeneratedImage, ImageJob } from '../types';
import MediaViewerModal, { MediaItem } from './MediaViewerModal';
import ImageGenerationBackground from './backgrounds/ImageGenerationBackground';

interface ImageGenerationViewProps {
  geminiApiKey: string;
  history: GeneratedImage[];
  setHistory: React.Dispatch<React.SetStateAction<GeneratedImage[]>>;
  jobs: ImageJob[];
  onGenerate: (settings: Omit<ImageJob, 'id' | 'status' | 'timestamp'>) => void;
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

const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
const styles = ["", "Photorealistic", "Cinematic", "Anime", "Fantasy Art", "Watercolor", "Sketch", "Abstract"];


const ImageGenerationView: React.FC<ImageGenerationViewProps> = ({ 
  geminiApiKey, history, setHistory, jobs, onGenerate, onClearCompleted, onDeleteJob
}) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [style, setStyle] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [seed, setSeed] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [subView, setSubView] = useState<'generate' | 'history'>('generate');

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerContent, setViewerContent] = useState<Partial<GeneratedImage> & { items: MediaItem[] }>({ items: [] });
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  const openViewer = (itemSet: GeneratedImage, index: number) => {
    const items: MediaItem[] = itemSet.imageUrls.map(url => ({ type: 'image', url }));
    setViewerContent({ ...itemSet, items });
    setViewerInitialIndex(index);
    setIsViewerOpen(true);
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

    onGenerate({ prompt, negativePrompt, style, aspectRatio, numberOfImages, seed: parsedSeed });
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
    if(window.confirm('Are you sure you want to delete this generation from your history?')) {
        setHistory(prev => prev.filter(img => img.id !== id));
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to delete your entire image history? This action cannot be undone.')) {
        setHistory([]);
    }
  };

  const handleUseHistorySettings = (e: React.MouseEvent, item: GeneratedImage) => {
    e.stopPropagation();
    setPrompt(item.prompt);
    setNegativePrompt(item.negativePrompt || '');
    setStyle(item.style || '');
    setAspectRatio(item.aspectRatio);
    setSeed(item.seed?.toString() || '');
    setNumberOfImages(item.imageUrls.length || 1); 
    setSubView('generate');
  };
  
  const renderHistoryView = () => (
    <div className="image-history-view">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h2 className="font-display text-4xl font-bold text-purple-600 dark:text-purple-400">Image History</h2>
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
               <ImageIcon className="mx-auto h-16 w-16 text-slate-400 dark:text-gray-600" />
              <h3 className="mt-4 font-display text-2xl font-semibold text-slate-800 dark:text-white">No Images Generated Yet</h3>
              <p className="mt-2 text-slate-600 dark:text-gray-400">Your generated images will appear here.</p>
            </div>
        ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                {history.map(imageSet => (
                    <div key={imageSet.id} className="group relative break-inside-avoid overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#101010] p-3">
                        {imageSet.imageUrls.map((url, index) => (
                             <img 
                              key={index} 
                              src={url} 
                              alt={imageSet.prompt} 
                              className={`w-full h-full object-cover ${index > 0 ? 'mt-3' : ''} rounded-lg cursor-pointer`}
                              onClick={() => openViewer(imageSet, index)}
                             />
                        ))}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end pointer-events-none">
                            <p className="text-sm text-white font-medium line-clamp-3">{imageSet.prompt}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(imageSet.timestamp).toLocaleString()}</p>
                            <div className="absolute top-2 right-2 space-x-1 pointer-events-auto">
                                <button onClick={(e) => handleUseHistorySettings(e, imageSet)} title="Use Settings" className="p-1.5 bg-black/50 rounded-full text-gray-300 hover:text-purple-400 hover:bg-purple-500/20 transition-colors">
                                    <Sparkles size={16} />
                                </button>
                                <button onClick={(e) => handleDeleteFromHistory(e, imageSet.id)} title="Delete" className="p-1.5 bg-black/50 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-500/20 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
  );

  const renderGeneratorView = () => (
      <div className="grid lg:grid-cols-12 gap-8 h-full image-generation-workspace">
        <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col h-fit generation-settings-sidebar">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-purple-600 dark:text-purple-400">Image Settings</h2>
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
                className="w-full px-4 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition min-h-[100px]"
                placeholder="A majestic lion wearing a crown..."
              />
            </div>
             <div>
              <label htmlFor="negativePrompt" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">Negative Prompt (Optional)</label>
              <textarea
                id="negativePrompt"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition min-h-[60px]"
                placeholder="e.g., blurry, cartoon, text"
              />
            </div>
            <div>
              <label htmlFor="style" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">Style (Optional)</label>
              <select id="style" value={style} onChange={e => setStyle(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none">
                  {styles.map(s => <option key={s} value={s}>{s || 'Default'}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="aspectRatio" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">Aspect Ratio</label>
                    <select id="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none">
                        {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="numberOfImages" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">Number</label>
                    <input type="number" id="numberOfImages" value={numberOfImages} onChange={e => setNumberOfImages(parseInt(e.target.value))} min="1" max="4" className="w-full px-3 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"/>
                </div>
            </div>
            <div>
              <label htmlFor="seed" className="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">
                <span>Seed (Optional)</span>
                <span className="group relative"><HelpCircle size={14} className="cursor-help"/>
                  <span className="absolute bottom-full z-10 mb-2 w-64 p-2 bg-black/80 text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Using the same seed and prompt will generate similar images. Leave blank for a random seed.</span>
                </span>
              </label>
              <input type="number" id="seed" value={seed} onChange={e => setSeed(e.target.value)} min="0" placeholder="e.g., 42" className="w-full px-3 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"/>
            </div>
            <button
              type="submit"
              disabled={jobs.some(j => j.status === 'generating') || !geminiApiKey}
              className="w-full px-5 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform hover:-translate-y-px flex items-center justify-center space-x-2 disabled:bg-slate-300 dark:disabled:bg-gray-700 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
            >
              <Sparkles size={18} /> <span>Generate</span>
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
                   <ImageIcon className="mx-auto h-16 w-16 text-slate-400 dark:text-gray-600" />
                  <h3 className="mt-4 font-display text-2xl font-semibold text-slate-800 dark:text-white">Ready to Create</h3>
                  <p className="mt-2 text-slate-600 dark:text-gray-400">Your generated images will appear here.</p>
                </div>
            ) : (
                <div className="space-y-6 h-[calc(100vh-16rem)] overflow-y-auto pr-2 generation-queue-list">
                    {jobs.map(job => (
                        <div key={job.id} className="bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 rounded-2xl p-4 generation-job-card">
                            <div className="flex justify-between items-start">
                                <div className="flex-grow pr-4">
                                  <p className="text-sm text-slate-700 dark:text-gray-300 line-clamp-2">{job.prompt}</p>
                                  <div className="text-xs text-slate-500 dark:text-gray-500 mt-1 flex items-center space-x-2 flex-wrap">
                                    {job.style && <span className="bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md">Style: {job.style}</span>}
                                    {job.status === 'completed' && job.seed !== undefined && <span>Seed: {job.seed}</span>}
                                  </div>
                                </div>
                                <div className="flex-shrink-0 flex items-center space-x-2">
                                  {job.status === 'generating' && <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full animate-pulse">Generating</span>}
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
                               { job.status === 'generating' && 
                                  <div 
                                    className="w-full bg-slate-100 dark:bg-black/30 border border-dashed border-slate-300 dark:border-white/20 rounded-xl flex items-center justify-center"
                                    style={{ aspectRatio: job.aspectRatio.replace(':', ' / ') }}
                                  >
                                    <div className="flex flex-col items-center text-slate-600 dark:text-gray-400">
                                      <Loader size={24} className="animate-spin mb-2" />
                                      <p className="text-sm">Generating...</p>
                                    </div>
                                  </div>
                               }
                               {job.status === 'completed' && job.imageUrls && (
                                   <div className={`grid gap-2 ${job.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                       {job.imageUrls.map((url, index) => (
                                          <img 
                                            key={index}
                                            src={url} 
                                            alt={job.prompt}
                                            className="w-full h-full object-cover rounded-lg cursor-pointer"
                                            style={{ aspectRatio: job.aspectRatio.replace(':', ' / ') }}
                                            onClick={() => openViewer({ ...job, id: job.id, imageUrls: job.imageUrls || [], timestamp: job.timestamp }, index)}
                                          />
                                       ))}
                                   </div>
                               )}
                               {job.status === 'failed' && (
                                   <div 
                                     className="w-full bg-red-500/5 border border-red-500/20 rounded-xl flex flex-col items-center justify-center text-red-500 dark:text-red-400 p-4"
                                     style={{ aspectRatio: job.aspectRatio.replace(':', ' / ') }}
                                    >
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
      key="image-generation-view"
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative isolate module-image_generation"
    >
        <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden blur-[120px] opacity-20 dark:opacity-30">
            <ImageGenerationBackground />
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
                  style={viewerContent.style}
                  negativePrompt={viewerContent.negativePrompt}
              />
          )}
        </AnimatePresence>
    </motion.div>
  );
};

export default ImageGenerationView;
