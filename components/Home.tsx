import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { TopLevelView, ImageJob, VideoJob, MusicJob, ChatSession, AISearchResult, ActivityStreamItem } from '../types';
import { MessageSquare, Bot, ImageIcon, VideoIcon, Globe, Music, ArrowRight, Loader, CheckCircle, XCircle, Clock, Sun, ArrowUpRight } from 'lucide-react';
import { useTranslations } from '../hooks/useTranslations';

interface HomeProps {
  setView: (view: TopLevelView) => void;
  imageJobs: ImageJob[];
  videoJobs: VideoJob[];
  musicJobs: MusicJob[];
  chatSessions: ChatSession[];
  aiSearchResults: AISearchResult[];
}

const pageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};


const Home: React.FC<HomeProps> = ({ setView, imageJobs, videoJobs, musicJobs, chatSessions, aiSearchResults }) => {
   const { t } = useTranslations();
   const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
   
   const modules = useMemo(() => [
    {
      view: 'ai_agent' as TopLevelView,
      title: t('module_ai_agent_title'),
      description: t('module_ai_agent_desc'),
      icon: Bot,
      theme: {
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        text: 'text-indigo-500 dark:text-indigo-400',
        borderHover: 'hover:border-indigo-500/80',
      },
    },
    {
      view: 'image_generation' as TopLevelView,
      title: t('module_image_generation_title'),
      description: t('module_image_generation_desc'),
      icon: ImageIcon,
      theme: {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        text: 'text-purple-500 dark:text-purple-400',
        borderHover: 'hover:border-purple-500/80',
      },
    },
    {
      view: 'video_generation' as TopLevelView,
      title: t('module_video_generation_title'),
      description: t('module_video_generation_desc'),
      icon: VideoIcon,
      theme: {
        bg: 'bg-green-500/10 dark:bg-green-500/20',
        text: 'text-green-500 dark:text-green-400',
        borderHover: 'hover:border-green-500/80',
      },
    },
    {
      view: 'ai_search' as TopLevelView,
      title: t('module_ai_search_title'),
      description: t('module_ai_search_desc'),
      icon: Globe,
      theme: {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-500 dark:text-amber-400',
        borderHover: 'hover:border-amber-500/80',
      },
    },
    {
      view: 'webhook_chat' as TopLevelView,
      title: t('module_webhook_chat_title'),
      description: t('module_webhook_chat_desc'),
      icon: MessageSquare,
      theme: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-500 dark:text-blue-400',
        borderHover: 'hover:border-blue-500/80',
      },
    },
     {
      view: 'music_generation' as TopLevelView,
      title: t('module_music_generation_title'),
      description: t('module_music_generation_desc'),
      icon: Music,
      theme: {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-500 dark:text-rose-400',
        borderHover: 'hover:border-rose-500/80',
      },
      status: 'coming_soon',
    },
  ], [t]);

   const recentActivities: ActivityStreamItem[] = useMemo(() => {
    const combined: ActivityStreamItem[] = [
      ...imageJobs.map(j => ({ ...j, type: 'image' as const })),
      ...videoJobs.map(j => ({ ...j, type: 'video' as const })),
      ...musicJobs.map(j => ({ ...j, type: 'music' as const })),
      ...chatSessions.map(s => ({ ...s, type: 'agent' as const })),
      ...aiSearchResults.map(r => ({ ...r, type: 'search' as const }))
    ];
    return combined
      .sort((a, b) => new Date('lastUpdated' in b ? b.lastUpdated : b.timestamp).getTime() - new Date('lastUpdated' in a ? a.lastUpdated : a.timestamp).getTime())
      .slice(0, 10); // Always limit to 10 for recent activity display
  }, [imageJobs, videoJobs, musicJobs, chatSessions, aiSearchResults]);
  
  const featuredModule = modules.find(m => m.view === 'ai_agent');

  return (
    <motion.div
      key="home-view"
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col gap-8 lg:flex-row lg:gap-12 home-view"
    >
      {/* Mobile: Briefing First */}
      <motion.div variants={itemVariants} className="block lg:hidden">
        <div className="bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6">
          <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Sun className="text-amber-500" size={20} />
                {t('home_briefing_title')}
              </h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{today}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-gray-300 mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
            {t('home_briefing_desc')}
          </p>
          <div className="mt-4 space-y-2">
            <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group">
              <span>{t('home_briefing_link1')}</span>
              <ArrowUpRight size={16} className="text-slate-400 dark:text-gray-500 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group">
              <span>{t('home_briefing_link2')}</span>
              <ArrowUpRight size={16} className="text-slate-400 dark:text-gray-500 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group">
              <span>{t('home_briefing_link3')}</span>
              <ArrowUpRight size={16} className="text-slate-400 dark:text-gray-500 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>
      </motion.div>

      {/* Mobile: Featured Module Second */}
      {featuredModule && (
        <motion.div variants={itemVariants} className="block lg:hidden">
          <div className="relative">
            <div className={`absolute -inset-1 rounded-2xl ${featuredModule.theme.bg} blur-lg opacity-60`}></div>
            <div className={`relative ${featuredModule.theme.bg} border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col`}>
              <div className="flex-grow">
                <div className="p-3 rounded-xl bg-indigo-500/20 w-fit">
                  <featuredModule.icon size={28} className={featuredModule.theme.text} />
                </div>
                <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white mt-4">{t('home_featured_module_title')}</h4>
                <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                  {t('home_featured_module_desc')}
                </p>
              </div>
              <button
                onClick={() => setView(featuredModule.view)}
                className="mt-4 w-full bg-indigo-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-indigo-500 transition-colors flex items-center justify-center space-x-2"
              >
                <span>{t('home_featured_module_cta')}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile: Explore Modules Third */}
      <motion.div variants={itemVariants} className="block lg:hidden">
        <h3 className="font-display text-3xl font-bold mb-6 text-slate-900 dark:text-white">{t('home_explore_modules')}</h3>
        <div className="grid grid-cols-3 gap-4">
          {modules.map((mod, i) => {
            const isFeatured = mod.view === 'ai_agent';
            const isComingSoon = mod.status === 'coming_soon';

            return (
              <motion.div
                key={mod.view}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="module-card-wrapper"
              >
                <div
                  onClick={isComingSoon ? undefined : () => setView(mod.view)}
                  className={`relative aspect-square rounded-2xl p-4 flex items-center justify-center group transition-all duration-300
                    ${isComingSoon
                      ? 'opacity-60 grayscale cursor-not-allowed bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10'
                      : 'cursor-pointer hover:-translate-y-1 ' +
                        (isFeatured
                          ? 'featured-module-card animate-featured-glow bg-mesh-gradient bg-[length:200%_200%] animate-gradient-pan'
                          : `bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 hover:shadow-lg ${mod.theme.borderHover} dark:hover:shadow-[0_0_20px_rgba(150,150,150,0.1)]`)
                    }
                  `}
                >
                  {isFeatured && !isComingSoon && (
                    <div className="absolute top-1 right-1 z-10 text-white bg-mesh-gradient bg-[200%_auto] animate-gradient-pan rounded-full p-1 shadow-lg">
                      <Bot size={8} />
                    </div>
                  )}
                  {isComingSoon && (
                    <div className="absolute top-1 right-1 z-10 text-slate-600 dark:text-gray-300 bg-slate-200 dark:bg-black/40 rounded-full p-1">
                      <Clock size={8} />
                    </div>
                  )}
                  <div className={`p-2 rounded-xl ${isFeatured && !isComingSoon ? 'bg-white/20 backdrop-blur-sm' : mod.theme.bg}`}>
                    <mod.icon className={`h-8 w-8 ${isFeatured && !isComingSoon ? 'text-white' : mod.theme.text}`} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Mobile: Recent Activity Fourth */}
      <motion.div variants={itemVariants} className="block lg:hidden">
        <h3 className="font-display text-3xl font-bold mb-6 text-slate-900 dark:text-white">{t('home_recent_activity')}</h3>
        {recentActivities.length > 0 ? (
          <div className="bg-white dark:bg-[#101010]/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg divide-y divide-slate-200 dark:divide-white/10 overflow-hidden">
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {recentActivities.map(activity => {
                const { icon: Icon, color, view, title, timestamp } = (() => {
                    switch (activity.type) {
                        case 'image': return { icon: ImageIcon, color: 'text-purple-500 bg-purple-500/10', view: 'image_generation' as TopLevelView, title: activity.prompt, timestamp: activity.timestamp };
                        case 'video': return { icon: VideoIcon, color: 'text-green-500 bg-green-500/10', view: 'video_generation' as TopLevelView, title: activity.prompt, timestamp: activity.timestamp };
                        case 'music': return { icon: Music, color: 'text-rose-500 bg-rose-500/10', view: 'music_generation' as TopLevelView, title: activity.title, timestamp: activity.timestamp };
                        case 'agent': return { icon: Bot, color: 'text-indigo-500 bg-indigo-500/10', view: 'ai_agent' as TopLevelView, title: activity.title, timestamp: activity.lastUpdated };
                        case 'search': return { icon: Globe, color: 'text-amber-500 bg-amber-500/10', view: 'ai_search' as TopLevelView, title: activity.prompt, timestamp: activity.timestamp };
                    }
                })();

                const isJob = 'status' in activity && (activity.type === 'image' || activity.type === 'video' || activity.type === 'music');
                
                let StatusIcon: React.ElementType | null = null;
                let statusColor: string | null = null;
                let statusText: string | null = null;

                if (isJob) {
                    const job = activity as ImageJob | VideoJob | MusicJob;
                    StatusIcon = { generating: Loader, polling: Loader, completed: CheckCircle, failed: XCircle }[job.status];
                    statusColor = { generating: 'text-blue-500', polling: 'text-yellow-500', completed: 'text-green-500', failed: 'text-red-500' }[job.status];
                    statusText = t(`job_status_${job.status}_single`);
                }

                return (
                  <div key={activity.id} onClick={() => setView(view)} className="p-4 flex items-center space-x-4 cursor-pointer group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-200">
                    <div className={`w-12 h-12 flex-shrink-0 rounded-lg ${color} flex items-center justify-center overflow-hidden`}>
                        {(() => {
                            if (activity.type === 'image' && activity.status === 'completed' && activity.imageUrls?.[0]) {
                                return <img src={activity.imageUrls[0]} alt={activity.prompt} className="w-full h-full object-cover" />;
                            }
                            if (activity.type === 'video' && (activity as VideoJob).inputImage) {
                                const vidJob = activity as VideoJob;
                                return <img src={`data:${vidJob.inputImage.mimeType};base64,${vidJob.inputImage.data}`} alt="Video input" className="w-full h-full object-cover" />;
                            }
                            return <Icon size={24} className="opacity-80" />;
                        })()}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-medium text-slate-800 dark:text-gray-200 truncate">{title}</p>
                      <p className="text-sm text-slate-500 dark:text-gray-400">{formatTimeAgo(timestamp)}</p>
                    </div>
                    {isJob && StatusIcon && (
                      <div className="flex items-center space-x-2 text-sm flex-shrink-0">
                          <StatusIcon size={16} className={`${statusColor} ${(activity as ImageJob).status === 'generating' || (activity as VideoJob).status === 'polling' ? 'animate-spin' : ''}`} />
                          <span className={`font-medium ${statusColor} hidden sm:inline`}>{statusText}</span>
                      </div>
                    )}
                     <ArrowRight size={16} className="text-slate-400 dark:text-gray-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-white/50 dark:bg-black/30 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col justify-center items-center">
             <CheckCircle className="mx-auto h-12 w-12 text-slate-400 dark:text-gray-600" />
            <h3 className="mt-4 font-display text-xl font-semibold text-slate-800 dark:text-white">{t('home_no_activity_title')}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">{t('home_no_activity_desc')}</p>
          </div>
        )}
      </motion.div>

      {/* Desktop Layout: Left Column */}
      <motion.div variants={itemVariants} className="hidden lg:flex lg:w-2/3 flex-col">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Daily Briefing */}
            <motion.div variants={itemVariants}>
                <div className="bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 h-full flex flex-col">
                    <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                        <div>
                            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                               <Sun className="text-amber-500" size={20} />
                               {t('home_briefing_title')}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{today}</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 flex-grow">
                        {t('home_briefing_desc')}
                    </p>
                    <div className="mt-4 space-y-2">
                         <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group">
                            <span>{t('home_briefing_link1')}</span>
                            <ArrowUpRight size={16} className="text-slate-400 dark:text-gray-500 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
                        </a>
                         <a href="#" target="_blank" rel="noopener noreferrer"className="flex items-center justify-between p-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group">
                            <span>{t('home_briefing_link2')}</span>
                            <ArrowUpRight size={16} className="text-slate-400 dark:text-gray-500 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
                        </a>
                         <a href="#" target="_blank" rel="noopener noreferrer"className="flex items-center justify-between p-2 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors group">
                            <span>{t('home_briefing_link3')}</span>
                            <ArrowUpRight size={16} className="text-slate-400 dark:text-gray-500 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
                        </a>
                    </div>
                </div>
            </motion.div>
            
            {/* Featured Module */}
            {featuredModule && (
                <motion.div variants={itemVariants} className="relative h-full">
                    <div className={`absolute -inset-1 rounded-2xl ${featuredModule.theme.bg} blur-lg opacity-60`}></div>
                    <div className={`relative ${featuredModule.theme.bg} border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col h-full`}>
                         <div className="flex-grow">
                            <div className="p-3 rounded-xl bg-indigo-500/20 w-fit">
                                <featuredModule.icon size={28} className={featuredModule.theme.text} />
                            </div>
                            <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white mt-4">{t('home_featured_module_title')}</h4>
                            <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                               {t('home_featured_module_desc')}
                            </p>
                        </div>
                        <button
                            onClick={() => setView(featuredModule.view)}
                            className="mt-4 w-full bg-indigo-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-indigo-500 transition-colors flex items-center justify-center space-x-2"
                        >
                            <span>{t('home_featured_module_cta')}</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
        
        <div className="recent-activity-section flex flex-col flex-grow">
          <h3 className="font-display text-3xl font-bold mb-6 text-slate-900 dark:text-white flex-shrink-0">{t('home_recent_activity')}</h3>
          {recentActivities.length > 0 ? (
            <div className="bg-white dark:bg-[#101010]/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg flex-1 divide-y divide-slate-200 dark:divide-white/10 overflow-hidden">
              <div className="h-full max-h-[calc(100vh-32rem)] overflow-y-auto custom-scrollbar">
                {recentActivities.map(activity => {
                  const { icon: Icon, color, view, title, timestamp } = (() => {
                      switch (activity.type) {
                          case 'image': return { icon: ImageIcon, color: 'text-purple-500 bg-purple-500/10', view: 'image_generation' as TopLevelView, title: activity.prompt, timestamp: activity.timestamp };
                          case 'video': return { icon: VideoIcon, color: 'text-green-500 bg-green-500/10', view: 'video_generation' as TopLevelView, title: activity.prompt, timestamp: activity.timestamp };
                          case 'music': return { icon: Music, color: 'text-rose-500 bg-rose-500/10', view: 'music_generation' as TopLevelView, title: activity.title, timestamp: activity.timestamp };
                          case 'agent': return { icon: Bot, color: 'text-indigo-500 bg-indigo-500/10', view: 'ai_agent' as TopLevelView, title: activity.title, timestamp: activity.lastUpdated };
                          case 'search': return { icon: Globe, color: 'text-amber-500 bg-amber-500/10', view: 'ai_search' as TopLevelView, title: activity.prompt, timestamp: activity.timestamp };
                      }
                  })();

                  const isJob = 'status' in activity && (activity.type === 'image' || activity.type === 'video' || activity.type === 'music');
                  
                  let StatusIcon: React.ElementType | null = null;
                  let statusColor: string | null = null;
                  let statusText: string | null = null;

                  if (isJob) {
                      const job = activity as ImageJob | VideoJob | MusicJob;
                      StatusIcon = { generating: Loader, polling: Loader, completed: CheckCircle, failed: XCircle }[job.status];
                      statusColor = { generating: 'text-blue-500', polling: 'text-yellow-500', completed: 'text-green-500', failed: 'text-red-500' }[job.status];
                      statusText = t(`job_status_${job.status}_single`);
                  }

                  return (
                    <div key={activity.id} onClick={() => setView(view)} className="p-4 flex items-center space-x-4 cursor-pointer group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-200">
                      <div className={`w-12 h-12 flex-shrink-0 rounded-lg ${color} flex items-center justify-center overflow-hidden`}>
                          {(() => {
                              if (activity.type === 'image' && activity.status === 'completed' && activity.imageUrls?.[0]) {
                                  return <img src={activity.imageUrls[0]} alt={activity.prompt} className="w-full h-full object-cover" />;
                              }
                              if (activity.type === 'video' && (activity as VideoJob).inputImage) {
                                  const vidJob = activity as VideoJob;
                                  return <img src={`data:${vidJob.inputImage.mimeType};base64,${vidJob.inputImage.data}`} alt="Video input" className="w-full h-full object-cover" />;
                              }
                              return <Icon size={24} className="opacity-80" />;
                          })()}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-slate-800 dark:text-gray-200 truncate">{title}</p>
                        <p className="text-sm text-slate-500 dark:text-gray-400">{formatTimeAgo(timestamp)}</p>
                      </div>
                      {isJob && StatusIcon && (
                        <div className="flex items-center space-x-2 text-sm flex-shrink-0">
                            <StatusIcon size={16} className={`${statusColor} ${(activity as ImageJob).status === 'generating' || (activity as VideoJob).status === 'polling' ? 'animate-spin' : ''}`} />
                            <span className={`font-medium ${statusColor} hidden sm:inline`}>{statusText}</span>
                        </div>
                      )}
                       <ArrowRight size={16} className="text-slate-400 dark:text-gray-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 px-6 bg-white/50 dark:bg-black/30 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex-1 flex flex-col justify-center items-center">
               <CheckCircle className="mx-auto h-12 w-12 text-slate-400 dark:text-gray-600" />
              <h3 className="mt-4 font-display text-xl font-semibold text-slate-800 dark:text-white">{t('home_no_activity_title')}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">{t('home_no_activity_desc')}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Desktop Layout: Right Column */}
      <motion.div variants={itemVariants} className="hidden lg:flex lg:w-1/3 flex-col">
        <h3 className="font-display text-3xl font-bold mb-6 text-slate-900 dark:text-white">{t('home_explore_modules')}</h3>
        <div className="flex flex-col gap-4">
          {modules.map((mod, i) => {
            const isFeatured = mod.view === 'ai_agent';
            const isComingSoon = mod.status === 'coming_soon';

            return (
              <motion.div
                key={mod.view}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="module-card-wrapper h-full"
              >
                <div
                  onClick={isComingSoon ? undefined : () => setView(mod.view)}
                  className={`relative h-full rounded-2xl p-4 flex items-center group transition-all duration-300
                    ${isComingSoon
                      ? 'opacity-60 grayscale cursor-not-allowed bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10'
                      : 'cursor-pointer hover:-translate-y-1 ' +
                        (isFeatured
                          ? 'featured-module-card animate-featured-glow bg-mesh-gradient bg-[length:200%_200%] animate-gradient-pan'
                          : `bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 hover:shadow-lg ${mod.theme.borderHover} dark:hover:shadow-[0_0_20px_rgba(150,150,150,0.1)]`)
                    }
                  `}
                >
                  {isFeatured && !isComingSoon && (
                    <div className="absolute top-2 right-2 z-10 text-white bg-mesh-gradient bg-[200%_auto] animate-gradient-pan rounded-full px-2.5 py-0.5 flex items-center space-x-1.5 shadow-lg">
                      <Bot size={12} />
                      <span className="text-[10px] font-semibold">{t('module_featured_tag')}</span>
                    </div>
                  )}
                  {isComingSoon && (
                     <div className="absolute top-2 right-2 z-10 text-slate-600 dark:text-gray-300 bg-slate-200 dark:bg-black/40 rounded-full px-2 py-0.5 flex items-center space-x-1.5">
                      <Clock size={12} />
                      <span className="text-[10px] font-semibold">{t('module_status_coming_soon')}</span>
                    </div>
                  )}
                  <div className={`p-3 rounded-xl flex-shrink-0 ${isFeatured && !isComingSoon ? 'bg-white/20 backdrop-blur-sm' : mod.theme.bg}`}>
                    <mod.icon className={`h-6 w-6 ${isFeatured && !isComingSoon ? 'text-white' : mod.theme.text}`} />
                  </div>
                  <h3 className={`ml-4 flex-grow font-display text-base font-semibold ${isFeatured && !isComingSoon ? 'text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]' : 'text-slate-900 dark:text-white'}`}>
                    {mod.title}
                  </h3>
                   <ArrowRight size={16} className="ml-4 flex-shrink-0 text-slate-400 dark:text-gray-500 group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Home;