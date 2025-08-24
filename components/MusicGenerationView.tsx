
import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Music, Sparkles, ArrowLeft, History, Trash2, XCircle, Edit3 } from 'lucide-react';
import type { GeneratedMusic, MusicJob } from '../types';
import AudioPlayer from './AudioPlayer';
import MusicGenerationBackground from './backgrounds/MusicGenerationBackground';

interface MusicGenerationViewProps {
  sunoApiKey: string;
  history: GeneratedMusic[];
  setHistory: React.Dispatch<React.SetStateAction<GeneratedMusic[]>>;
  jobs: MusicJob[];
  onGenerate: (settings: Omit<MusicJob, 'id' | 'status' | 'timestamp' | 'statusMessage'>) => void;
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

const MusicGenerationView: React.FC<MusicGenerationViewProps> = ({ 
  sunoApiKey, history, setHistory, jobs, onGenerate, onClearCompleted, onDeleteJob
}) => {
  const [lyricsPrompt, setLyricsPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('');
  const [isInstrumental, setIsInstrumental] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [subView, setSubView] = useState<'generate' | 'history'>('generate');

  const triggerGenerate = () => {
    if (!lyricsPrompt.trim() || !title.trim()) {
      setError('Please enter a prompt and a title.');
      return;
    }
    if (!sunoApiKey) {
      setError('Suno API Key is not set. Please add it in the Settings page.');
      return;
    }
    
    setError(null);
    onGenerate({ prompt: lyricsPrompt, title, style, isInstrumental });
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    triggerGenerate();
  };

  const handleLyricsPromptKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      triggerGenerate();
    }
  };
  
  const handleDeleteFromHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this track from your history?')) {
        setHistory(prev => prev.filter(track => track.id !== id));
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to delete your entire music history? This action cannot be undone.')) {
        setHistory([]);
    }
  };

  const handleRenameHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const currentTrack = history.find(t => t.id === id);
    if (!currentTrack) return;
    const newTitle = window.prompt("Enter new title:", currentTrack.title);
    if (newTitle && newTitle.trim() !== "") {
        setHistory(prev => prev.map(t => t.id === id ? { ...t, title: newTitle.trim() } : t));
    }
  };
  
  const renderHistoryView = () => (
    <div className="music-history-view">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h2 className="font-display text-4xl font-bold text-rose-600 dark:text-rose-400">Music History</h2>
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
               <Music className="mx-auto h-16 w-16 text-slate-400 dark:text-gray-600" />
              <h3 className="mt-4 font-display text-2xl font-semibold text-slate-800 dark:text-white">No Music Generated Yet</h3>
              <p className="mt-2 text-slate-600 dark:text-gray-400">Your generated music tracks will appear here.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {history.map(track => (
                    <div key={track.id} className="bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center space-x-4 group">
                        <div className="flex-grow">
                             <h3 className="font-bold text-slate-800 dark:text-white">{track.title}</h3>
                             <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{track.style} {track.isInstrumental && '(Instrumental)'}</p>
                             <p className="text-sm text-slate-600 dark:text-gray-300 mt-2 line-clamp-2">{track.prompt}</p>
                             <div className="mt-3">
                                 <AudioPlayer src={track.audioUrl} />
                             </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => handleRenameHistoryItem(e, track.id)} title="Rename" className="p-2 text-slate-500 dark:text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors">
                                <Edit3 size={16} />
                            </button>
                            <button onClick={(e) => handleDeleteFromHistory(e, track.id)} title="Delete" className="p-2 text-slate-500 dark:text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
  );

  const renderGeneratorView = () => (
      <div className="grid lg:grid-cols-12 gap-8 h-full music-generation-workspace">
        <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col h-fit generation-settings-sidebar">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-rose-600 dark:text-rose-400">Music Settings</h2>
            {history.length > 0 && (
                <button onClick={() => setSubView('history')} className="text-xs text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-lg transition-colors flex items-center space-x-1">
                    <History size={14} />
                    <span>History</span>
                </button>
            )}
          </div>
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">Title</label>
              <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition" placeholder="e.g., Midnight Rain" />
            </div>
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">Prompt</label>
              <textarea id="prompt" value={lyricsPrompt} onChange={(e) => setLyricsPrompt(e.target.value)} onKeyDown={handleLyricsPromptKeyDown} className="w-full px-4 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition min-h-[100px]" placeholder="A sad, slow, solo piano melody..." />
            </div>
            <div>
              <label htmlFor="style" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">Style</label>
              <input id="style" value={style} onChange={(e) => setStyle(e.target.value)} className="w-full px-4 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition" placeholder="e.g., Cinematic, Acoustic Pop" />
            </div>
            <div className="flex items-center">
              <input id="isInstrumental" type="checkbox" checked={isInstrumental} onChange={(e) => setIsInstrumental(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
              <label htmlFor="isInstrumental" className="ml-2 block text-sm text-slate-600 dark:text-gray-400">Instrumental</label>
            </div>
            <button
              type="submit"
              disabled={jobs.some(j => j.status === 'generating' || j.status === 'polling') || !sunoApiKey}
              className="w-full px-5 py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-500 transition-all duration-300 shadow-[0_0_20px_rgba(225,29,72,0.5)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)] transform hover:-translate-y-px flex items-center justify-center space-x-2 disabled:bg-slate-300 dark:disabled:bg-gray-700 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
            >
              <Sparkles size={18} /> <span>Generate</span>
            </button>
             {error && (<p className="text-xs text-red-500 mt-2 text-center">{error}</p>)}
          </form>
        </div>
        
        <div className="lg:col-span-8 xl:col-span-9 generation-queue-area">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Generation Queue</h2>
                <button onClick={onClearCompleted} className="text-sm text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-2">
                  <XCircle size={16}/>
                  <span>Clear Completed</span>
                </button>
            </div>
            {jobs.length === 0 ? (
                 <div className="text-center h-full flex flex-col justify-center items-center py-20 px-6 bg-white/50 dark:bg-black/30 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl">
                   <Music className="mx-auto h-16 w-16 text-slate-400 dark:text-gray-600" />
                  <h3 className="mt-4 font-display text-2xl font-semibold text-slate-800 dark:text-white">Ready to Compose</h3>
                  <p className="mt-2 text-slate-600 dark:text-gray-400">Your generated music tracks will appear here.</p>
                </div>
            ) : (
                <div className="space-y-6 h-[calc(100vh-16rem)] overflow-y-auto pr-2 generation-queue-list">
                    {jobs.map(job => (
                        <div key={job.id} className="bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 rounded-2xl p-4 generation-job-card">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-grow pr-4">
                                  <h4 className="font-semibold text-slate-800 dark:text-white">{job.title}</h4>
                                  <p className="text-sm text-slate-700 dark:text-gray-300 line-clamp-2">{job.prompt}</p>
                                </div>
                                <div className="flex-shrink-0 flex items-center space-x-2">
                                  {job.status === 'generating' && <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">Generating</span>}
                                  {job.status === 'polling' && <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full animate-pulse">Polling...</span>}
                                  {job.status === 'completed' && <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full">Completed</span>}
                                  {job.status === 'failed' && <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-1 rounded-full">Failed</span>}
                                </div>
                            </div>
                            <div>
                               { (job.status === 'generating' || job.status === 'polling') && 
                                  <div className="h-24 bg-slate-100 dark:bg-black/30 border border-dashed border-slate-300 dark:border-white/20 rounded-xl flex flex-col items-center justify-center text-slate-600 dark:text-gray-400 p-4 text-center">
                                    <div className="text-sm text-rose-600 dark:text-rose-300 mb-4">{job.statusMessage}</div>
                                    <div className="w-full bg-slate-200 dark:bg-black/50 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-rose-600 h-1.5 rounded-full w-full animate-progress-stripes"
                                            style={{
                                            backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)',
                                            backgroundSize: '1rem 1rem'
                                            }}
                                        ></div>
                                    </div>
                                  </div>
                               }
                               {job.status === 'completed' && job.audioUrl && <AudioPlayer src={job.audioUrl} />}
                               {job.status === 'failed' && (
                                   <div className="h-24 bg-red-500/5 border border-red-500/20 rounded-xl flex flex-col items-center justify-center text-red-500 dark:text-red-400 p-4">
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
      key="music-generation-view"
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative isolate module-music_generation"
    >
        <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden blur-[120px] opacity-20 dark:opacity-30">
            <MusicGenerationBackground />
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
    </motion.div>
  );
};

export default MusicGenerationView;
