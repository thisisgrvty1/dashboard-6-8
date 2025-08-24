import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TopLevelView, Theme, ImageJob, VideoJob, MusicJob, Language } from '../types';
import { BotMessageSquare, Settings, Sun, Moon, Globe, Check, Sparkles } from 'lucide-react';
import JobStatusIndicator from './JobStatusIndicator';
import { useLanguage } from '../hooks/useLanguage';
import { useTranslations } from '../hooks/useTranslations';


interface HeaderProps {
  setView: (view: TopLevelView) => void;
  isHome: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  imageJobs: ImageJob[];
  videoJobs: VideoJob[];
  musicJobs: MusicJob[];
}

const Header: React.FC<HeaderProps> = ({ setView, isHome, theme, setTheme, imageJobs, videoJobs, musicJobs }) => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslations();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
  ];
  
  return (
    <header className="bg-white/30 dark:bg-black/30 backdrop-blur-lg sticky top-0 z-50 border-b border-black/10 dark:border-white/10 app-header">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:p-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('home')}>
             <div className="w-8 h-8 rounded-lg bg-mesh-gradient bg-[200%_auto] animate-gradient-pan flex items-center justify-center">
                <BotMessageSquare size={20} className="text-white" />
            </div>
            <h1 className="hidden sm:block font-display text-2xl font-bold text-transparent bg-clip-text bg-mesh-gradient bg-[200%_auto] animate-gradient-pan tracking-wide">
                AI Dashboard
            </h1>
          </div>
          <nav className="flex items-center space-x-2">
            {!isHome && (
              <button
                onClick={() => setView('home')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
              >
                {t('header_home')}
              </button>
            )}
            <button
              onClick={() => setView('gemini_live')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-colors duration-200 flex items-center space-x-2"
            >
              <Sparkles size={16} />
              <span className="hidden sm:inline">{t('header_tech_preview')}</span>
            </button>
            <JobStatusIndicator imageJobs={imageJobs} videoJobs={videoJobs} musicJobs={musicJobs} setView={setView} />
             <div className="relative" ref={langRef}>
                <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="p-2 rounded-full text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                    aria-label="Change language"
                >
                    <Globe size={20} />
                </button>
                <AnimatePresence>
                {isLangOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden"
                    >
                        <ul>
                            {languages.map(lang => (
                                <li key={lang.code}>
                                    <button
                                        onClick={() => {
                                            console.log('Header - Language button clicked, changing to:', lang.code);
                                            setLanguage(lang.code);
                                            setIsLangOpen(false);
                                            console.log('Header - Language dropdown closed');
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-between"
                                    >
                                        <span>{lang.name}</span>
                                        {language === lang.code && <Check size={16} className="text-indigo-500" />}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
              aria-label={t('header_theme_aria')}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setView('settings')}
              className="p-2 rounded-full text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
              aria-label={t('header_settings_aria')}
            >
              <Settings size={20} />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;