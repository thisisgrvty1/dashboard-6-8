





import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDatabase } from './hooks/useDatabase';
import type { ApiKeys, Module, TopLevelView, ChatSession, GeneratedImage, GeneratedVideo, ImageJob, VideoJob, Theme, GeneratedMusic, MusicJob, AISearchResult } from './types';
import Header from './components/Header';
import Settings from './components/Settings';
import Home from './components/Home';
import WebhookChatView from './components/WebhookChatView';
import AIAgentView from './components/AIAgentView';
import VideoGenerationView from './components/VideoGenerationView';
import ImageGenerationView from './components/ImageGenerationView';
import AISearchView from './components/GoogleSearchView';
import MusicGenerationView from './components/MusicGenerationView';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import ImprintView from './components/ImprintView';
import PrivacyPolicyView from './components/PrivacyPolicyView';
import GeminiLiveView from './components/GeminiLiveView';
import { GoogleGenAI } from '@google/genai';
import { useTranslations } from './hooks/useTranslations';


// Constants for recent activity limits (database stores full history)
const MAX_RECENT_ACTIVITY_ITEMS = 10;

const App: React.FC = () => {
  const [view, setView] = useState<TopLevelView>('home');
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark');
  const [showSplash, setShowSplash] = useState(sessionStorage.getItem('splashShown') !== 'true');
  const { t } = useTranslations();
  const db = useDatabase();
  
  const [apiKeys, setApiKeys] = useLocalStorage<ApiKeys>('apiKeys', {
    make: '',
    openai: '',
    gemini: '',
    suno: '',
  });

  const [modules, setModules] = useLocalStorage<Module[]>('webhook_modules', []);
  
  // Recent activity state (limited to 10 items for performance)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [generatedMusic, setGeneratedMusic] = useState<GeneratedMusic[]>([]);
  const [aiSearchResults, setAiSearchResults] = useState<AISearchResult[]>([]);
  
  // Centralized job management state
  const [imageJobs, setImageJobs] = useState<ImageJob[]>([]);
  const [videoJobs, setVideoJobs] = useState<VideoJob[]>([]);
  const [musicJobs, setMusicJobs] = useState<MusicJob[]>([]);
  const pollingIntervalRef = useRef<number | null>(null);
  
  // Load recent activity from database when user is authenticated
  useEffect(() => {
    if (db.user && !db.isLoading) {
      const loadRecentActivity = async () => {
        const [images, videos, music, searches, chats] = await Promise.all([
          db.loadGeneratedImages(MAX_RECENT_ACTIVITY_ITEMS),
          db.loadGeneratedVideos(MAX_RECENT_ACTIVITY_ITEMS),
          db.loadGeneratedMusic(MAX_RECENT_ACTIVITY_ITEMS),
          db.loadAISearchResults(MAX_RECENT_ACTIVITY_ITEMS),
          db.loadChatSessions(MAX_RECENT_ACTIVITY_ITEMS),
        ]);
        
        setGeneratedImages(images);
        setGeneratedVideos(videos);
        setGeneratedMusic(music);
        setAiSearchResults(searches);
        setChatSessions(chats);
      };
      
      loadRecentActivity();
    }
  }, [db.user, db.isLoading]);
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Global Escape key handler to return to home
  const handleAppKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && view !== 'home') {
      setView('home');
    }
  }, [view]);

  useEffect(() => {
    document.addEventListener('keydown', handleAppKeyDown);
    return () => {
      document.removeEventListener('keydown', handleAppKeyDown);
    };
  }, [handleAppKeyDown]);
  
  const handleSplashAnimationComplete = () => {
    // Add a delay to ensure the splash screen is visible for at least 3 seconds total.
    setTimeout(() => {
      sessionStorage.setItem('splashShown', 'true');
      setShowSplash(false);
    }, 1400); 
  };

  // === IMAGE GENERATION LOGIC ===
  const handleImageGenerate = async (settings: Omit<ImageJob, 'id' | 'status' | 'timestamp'>) => {
    const newJob: ImageJob = {
      ...settings,
      id: `job-${Date.now()}`,
      status: 'generating',
      timestamp: new Date().toISOString(),
    };
    setImageJobs(prev => [newJob, ...prev]);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKeys.gemini });
      const finalPrompt = settings.style ? `${settings.prompt}, in a ${settings.style} style` : settings.prompt;
      
      const config: { 
        numberOfImages: number;
        outputMimeType: string;
        aspectRatio: string;
        seed?: number;
        negativePrompt?: string;
       } = { 
            numberOfImages: settings.numberOfImages, 
            outputMimeType: 'image/png', 
            aspectRatio: settings.aspectRatio,
      };
      if (settings.seed) config.seed = settings.seed;
      if (settings.negativePrompt) config.negativePrompt = settings.negativePrompt;
      
      const response = await ai.models.generateImages({ model: 'imagen-3.0-generate-002', prompt: finalPrompt, config });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const imageUrls = response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
        const usedSeed = newJob.seed;
        setImageJobs(prev => prev.map(job => job.id === newJob.id ? { ...job, status: 'completed', imageUrls, seed: usedSeed } : job));
        const newHistoryItem: GeneratedImage = { 
          id: newJob.id, 
          prompt: newJob.prompt, 
          imageUrls, 
          timestamp: newJob.timestamp, 
          aspectRatio: newJob.aspectRatio, 
          seed: usedSeed,
          style: newJob.style,
          negativePrompt: newJob.negativePrompt,
        };
        
        // Save to database and update recent activity
        await db.saveGeneratedImage(newHistoryItem);
        setGeneratedImages(prev => [newHistoryItem, ...prev].slice(0, MAX_RECENT_ACTIVITY_ITEMS));
      } else {
        throw new Error('Image generation failed. No images were returned.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setImageJobs(prev => prev.map(job => job.id === newJob.id ? { ...job, status: 'failed', error: errorMessage } : job));
    }
  };

  const handleDeleteImageJob = (jobId: string) => {
    setImageJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const handleClearCompletedImageJobs = () => {
    setImageJobs(prev => prev.filter(job => job.status !== 'completed'));
  };

  // === VIDEO GENERATION LOGIC ===
  const pollVideoJobs = useCallback(async (currentJobs: VideoJob[]) => {
    const activeJobs = currentJobs.filter(job => job.status === 'polling' && job.operation);
    if (activeJobs.length === 0 || !apiKeys.gemini) {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      return;
    }

    const ai = new GoogleGenAI({ apiKey: apiKeys.gemini });

    for (const job of activeJobs) {
      try {
        console.log(`Polling job ${job.id}, operation:`, job.operation);
        const updatedOperation = await ai.operations.getVideosOperation({ operation: job.operation });
        console.log(`Job ${job.id} operation status:`, updatedOperation);
        
        if (updatedOperation.done) {
          const generatedVideos = updatedOperation.response?.generatedVideos;
          console.log(`Job ${job.id} generated videos:`, generatedVideos);
          if (generatedVideos && generatedVideos.length > 0) {
            const authenticatedUrls = generatedVideos.map(v => {
              const uri = v.video?.uri;
              if (!uri) {
                console.error(`No URI found for video in job ${job.id}:`, v);
                return null;
              }
              // Check if the URI already has query parameters
              const separator = uri.includes('?') ? '&' : '?';
              return `${uri}${separator}key=${apiKeys.gemini}`;
            }).filter(Boolean);
            
            console.log(`Job ${job.id} authenticated URLs:`, authenticatedUrls);
            const usedSeed = job.seed;
            setVideoJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed', videoUrls: authenticatedUrls, seed: usedSeed, statusMessage: t('job_status_completed_single') } : j));
            const newHistoryItem: GeneratedVideo = { 
              id: job.id, 
              prompt: job.prompt, 
              videoUrls: authenticatedUrls, 
              timestamp: job.timestamp, 
              seed: usedSeed,
              model: job.model,
              inputImage: job.inputImage,
            };
            
            // Save to database and update recent activity
            await db.saveGeneratedVideo(newHistoryItem);
            setGeneratedVideos(prev => [newHistoryItem, ...prev].slice(0, MAX_RECENT_ACTIVITY_ITEMS));
          } else { 
            console.error(`Job ${job.id} completed but no videos found. Response:`, updatedOperation.response);
            throw new Error('Generation finished, but no video URL was found.'); 
          }
        } else {
          const state = (updatedOperation.metadata as any)?.state ?? 'IN_PROGRESS';
          console.log(`Job ${job.id} still processing, state: ${state}`);
          setVideoJobs(prev => prev.map(j => j.id === job.id ? { ...j, operation: updatedOperation, statusMessage: t('video_job_status_message_processing', { state: String((updatedOperation.metadata as any)?.state ?? 'IN_PROGRESS') }) } : j));
        }
      } catch (pollError) {
        console.error(`Polling error for job ${job.id}:`, pollError);
        const errorMessage = pollError instanceof Error ? pollError.message : 'Unknown polling error.';
        setVideoJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'failed', error: errorMessage, statusMessage: t('job_status_failed_single') } : j));
      }
    }
  }, [apiKeys.gemini, setGeneratedVideos, t]);

  useEffect(() => {
    const isPollingNeeded = videoJobs.some(j => j.status === 'polling');
    if (isPollingNeeded && !pollingIntervalRef.current) {
      pollingIntervalRef.current = window.setInterval(() => setVideoJobs(currentJobs => {
        pollVideoJobs(currentJobs);
        return currentJobs;
      }), 10000);
    } else if (!isPollingNeeded && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    return () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); };
  }, [videoJobs, pollVideoJobs]);


  const handleVideoGenerate = async (settings: Omit<VideoJob, 'id' | 'status' | 'timestamp' | 'statusMessage'>) => {
    const newJob: VideoJob = {
        ...settings,
        id: `job-${Date.now()}`,
        status: 'generating',
        statusMessage: 'Initializing...',
        timestamp: new Date().toISOString(),
    };
    setVideoJobs(prev => [newJob, ...prev]);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKeys.gemini });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const generationPayload: any = {
        model: settings.model,
        prompt: settings.prompt,
        config: { numberOfVideos: settings.numberOfVideos, seed: settings.seed },
      };

      if (settings.inputImage) {
        generationPayload.image = {
          imageBytes: settings.inputImage.data,
          mimeType: settings.inputImage.mimeType,
        };
      }

      console.log('Starting video generation with payload:', generationPayload);
      const operation = await ai.models.generateVideos(generationPayload);
      console.log('Video generation operation started:', operation);
      setVideoJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'polling', operation, statusMessage: t('job_status_polling') } : j));
    } catch (e) {
      console.error('Video generation failed:', e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setVideoJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'failed', error: errorMessage, statusMessage: t('job_status_failed_single') } : j));
    }
  };
  
  const handleDeleteVideoJob = (jobId: string) => {
    setVideoJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const handleClearCompletedVideoJobs = () => {
    setVideoJobs(prev => prev.filter(job => job.status === 'generating' || job.status === 'polling'));
  };

  // === MUSIC GENERATION LOGIC (SIMULATED) ===
  const handleMusicGenerate = async (settings: Omit<MusicJob, 'id' | 'status' | 'timestamp' | 'statusMessage'>) => {
    const newJob: MusicJob = {
      ...settings,
      id: `job-${Date.now()}`,
      status: 'generating',
      statusMessage: 'Initializing...',
      timestamp: new Date().toISOString(),
    };
    setMusicJobs(prev => [newJob, ...prev]);

    // Simulate API call and polling
    setTimeout(() => {
      setMusicJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'polling', statusMessage: t('music_job_status_composing') } : j));
    }, 2000);

    setTimeout(() => {
      setMusicJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, statusMessage: t('music_job_status_adding_instruments') } : j));
    }, 10000);

    setTimeout(() => {
        // Simulate a successful generation
        // Placeholder for a silent audio clip
        const audioUrl = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAARAAADTGF2ZjU2LjQwLjEwMQAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAA';
        setMusicJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'completed', statusMessage: t('job_status_completed_single'), audioUrl } : j));
        
        // Save to database and update recent activity
        await db.saveGeneratedMusic(newHistoryItem);
        setGeneratedMusic(prev => [newHistoryItem, ...prev].slice(0, MAX_RECENT_ACTIVITY_ITEMS));
    }, 25000);
  };

  const handleDeleteMusicJob = (jobId: string) => {
    setMusicJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const handleClearCompletedMusicJobs = () => {
    setMusicJobs(prev => prev.filter(job => job.status === 'generating' || job.status === 'polling'));
  };


  const renderContent = () => {
    switch (view) {
      case 'settings':
        return <Settings apiKeys={apiKeys} setApiKeys={setApiKeys} />;
      case 'webhook_chat':
        return (
          <WebhookChatView 
            modules={modules}
            setModules={setModules}
            makeApiKey={apiKeys.make}
          />
        );
      case 'ai_agent':
        return <AIAgentView geminiApiKey={apiKeys.gemini} sessions={chatSessions} setSessions={setChatSessions} />;
      case 'video_generation':
        return <VideoGenerationView 
                  geminiApiKey={apiKeys.gemini} 
                  history={generatedVideos} 
                  setHistory={setGeneratedVideos}
                  jobs={videoJobs}
                  onGenerate={handleVideoGenerate}
                  onClearCompleted={handleClearCompletedVideoJobs}
                  onDeleteJob={handleDeleteVideoJob}
               />;
      case 'image_generation':
        return <ImageGenerationView 
                  geminiApiKey={apiKeys.gemini} 
                  history={generatedImages} 
                  setHistory={setGeneratedImages} 
                  jobs={imageJobs}
                  onGenerate={handleImageGenerate}
                  onClearCompleted={handleClearCompletedImageJobs}
                  onDeleteJob={handleDeleteImageJob}
               />;
       case 'music_generation':
        return <MusicGenerationView 
                  sunoApiKey={apiKeys.suno} 
                  history={generatedMusic} 
                  setHistory={setGeneratedMusic}
                  jobs={musicJobs}
                  onGenerate={handleMusicGenerate}
                  onClearCompleted={handleClearCompletedMusicJobs}
                  onDeleteJob={handleDeleteMusicJob}
                />;
      case 'ai_search':
        return <AISearchView geminiApiKey={apiKeys.gemini} history={aiSearchResults} setHistory={setAiSearchResults} />;
      case 'imprint':
        return <ImprintView setView={setView} />;
      case 'privacy_policy':
        return <PrivacyPolicyView setView={setView} />;
      case 'gemini_live':
        return <GeminiLiveView geminiApiKey={apiKeys.gemini} setView={setView} />;
      case 'home':
      default:
        return <Home 
                 setView={setView} 
                 imageJobs={imageJobs}
                 videoJobs={videoJobs}
                 musicJobs={musicJobs}
                 chatSessions={chatSessions}
                 aiSearchResults={aiSearchResults}
               />;
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col app-container">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash-overlay"
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-color)' }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <SplashScreen onAnimationComplete={handleSplashAnimationComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {!showSplash && (
        <motion.div
          className="flex flex-col min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Header setView={setView} isHome={view === 'home'} theme={theme} setTheme={setTheme} imageJobs={imageJobs} videoJobs={videoJobs} musicJobs={musicJobs} />
          <main className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto w-full flex-grow">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </main>
          <Footer setView={setView} />
        </motion.div>
      )}
    </div>
  );
};

export default App;
