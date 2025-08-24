

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { Globe, Search, Link, History, ArrowLeft, Trash2, Edit3, Eye } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import GoogleSearchBackground from './backgrounds/GoogleSearchBackground';
import type { AISearchResult, GroundingChunk } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface AISearchViewProps {
    geminiApiKey: string;
    history: AISearchResult[];
    setHistory: React.Dispatch<React.SetStateAction<AISearchResult[]>>;
    onSaveResult?: (result: AISearchResult) => Promise<void>;
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

const AISearchView: React.FC<AISearchViewProps> = ({ geminiApiKey, history, setHistory, onSaveResult }) => {
    const { t } = useTranslations();
    const [searchInput, setSearchInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentResult, setCurrentResult] = useState<{ prompt: string, result: string, sources: GroundingChunk[] } | null>(null);
    const [subView, setSubView] = useState<'search' | 'history'>('search');

    const handleSearch = async (e: React.FormEvent, searchPrompt: string) => {
        e.preventDefault();
        if (!searchPrompt.trim()) {
            setError(t('search_prompt_error'));
            return;
        }
        if (!geminiApiKey) {
            setError(t('error_gemini_api_key_not_set'));
            return;
        }

        setIsLoading(true);
        setError(null);
        setCurrentResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: searchPrompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            const resultText = response.text;
            const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[];
            
            setCurrentResult({ prompt: searchPrompt, result: resultText, sources: groundingChunks });
            
            const newResult = {
                id: `search-${Date.now()}`,
                prompt: searchPrompt,
                result: resultText,
                sources: groundingChunks,
                timestamp: new Date().toISOString(),
            };
            
            setHistory(prev => [newResult, ...prev]);
            
            // Save to database if available
            if (onSaveResult) {
                onSaveResult(newResult).catch(error => {
                    console.error('Failed to save search result to database:', error);
                });
            }

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to get response: ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setSearchInput('');
        }
    };

    const renderedHtml = useMemo(() => {
        if (!currentResult) return '';
        const rawHtml = marked.parse(currentResult.result) as string;
        return DOMPurify.sanitize(rawHtml);
    }, [currentResult]);
    
    const handleViewHistoryItem = (item: AISearchResult) => {
        setCurrentResult({ prompt: item.prompt, result: item.result, sources: item.sources });
        setSubView('search');
    };

    const handleRenameHistoryItem = (id: string) => {
        const item = history.find(i => i.id === id);
        if (!item) return;
        const newPrompt = window.prompt(t('search_rename_prompt'), item.prompt);
        if (newPrompt && newPrompt.trim()) {
            setHistory(prev => prev.map(i => i.id === id ? { ...i, prompt: newPrompt.trim() } : i));
        }
    };

    const handleDeleteHistoryItem = (id: string) => {
        if (window.confirm(t('search_delete_history_confirm'))) {
            setHistory(prev => prev.filter(item => item.id !== id));
        }
    };
    
    const handleClearHistory = () => {
        if (window.confirm(t('search_clear_history_confirm'))) {
            setHistory([]);
        }
    };

    const renderSearchView = () => (
      <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
              <div className="text-center sm:text-left">
                  <h2 className="font-display text-4xl font-bold text-amber-600 dark:text-amber-400">{t('search_title')}</h2>
                  <p className="mt-2 text-lg text-slate-600 dark:text-gray-400">
                      {t('search_desc')}
                  </p>
              </div>
              {history.length > 0 && (
                  <button onClick={() => setSubView('history')} className="text-sm text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                      <History size={16} />
                      <span>{t('button_history')}</span>
                  </button>
              )}
          </div>
          
          <form onSubmit={(e) => handleSearch(e, searchInput)} className="mb-12">
              <div className="relative">
                  <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder={t('search_placeholder')}
                      className="w-full pl-5 pr-14 py-4 bg-white/80 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-full text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-lg shadow-lg"
                  />
                  <button
                      type="submit"
                      disabled={isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full p-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                      aria-label="Search"
                  >
                      <Search size={24} />
                  </button>
              </div>
               {error && (<p className="text-sm text-red-500 mt-3 text-center">{error}</p>)}
          </form>

          {isLoading && (
              <div className="text-center">
                  <div className="mx-auto w-10 h-10 border-4 border-t-amber-500 border-slate-200 dark:border-gray-700 rounded-full animate-spin"></div>
                  <p className="mt-4 text-slate-500 dark:text-gray-400">{t('search_loading_message')}</p>
              </div>
          )}
          
          {currentResult && !isLoading && (
              <div className="bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
                  <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-4">{currentResult.prompt}</h3>
                  <div 
                    className="prose prose-slate dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  />

                  {currentResult.sources.length > 0 && (
                      <div className="mt-8 border-t border-slate-200 dark:border-white/10 pt-6">
                          <h4 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center space-x-2">
                              <Link size={16} />
                              <span>{t('search_sources_label')}</span>
                          </h4>
                          <ul className="space-y-2">
                              {currentResult.sources.map((source, index) => (
                                  <li key={index}>
                                      <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline text-sm truncate block">
                                          {source.web.title || source.web.uri}
                                      </a>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}
              </div>
          )}
          {!currentResult && !isLoading && (
            <div className="text-center py-20 px-6 bg-white/50 dark:bg-black/30 border border-dashed border-slate-300 dark:border-white/10 rounded-2xl">
               <Globe className="mx-auto h-16 w-16 text-slate-400 dark:text-gray-600" />
              <h3 className="mt-4 font-display text-2xl font-semibold text-slate-800 dark:text-white">{t('search_empty_title')}</h3>
              <p className="mt-2 text-slate-600 dark:text-gray-400">{t('search_empty_desc')}</p>
            </div>
          )}
      </div>
    );

    const renderHistoryView = () => (
      <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <h2 className="font-display text-4xl font-bold text-amber-600 dark:text-amber-400">{t('search_history_title')}</h2>
              <div className="flex items-center space-x-2">
                  {history.length > 0 && (
                      <button onClick={handleClearHistory} className="text-sm text-red-500 dark:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                          <Trash2 size={16} /><span>{t('button_clear_history')}</span>
                      </button>
                  )}
                  <button onClick={() => setSubView('search')} className="text-sm text-slate-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                      <ArrowLeft size={16} /><span>{t('button_back_to_search')}</span>
                  </button>
              </div>
          </div>
          {history.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-gray-400">{t('search_history_empty')}</p>
          ) : (
            <ul className="space-y-3">
              {history.map(item => (
                <li key={item.id} className="bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 rounded-lg p-4 flex justify-between items-center group">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{item.prompt}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleSearch(new Event('submit') as any, item.prompt)} title={t('button_search_again')} className="p-2 text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"><Search size={16} /></button>
                      <button onClick={() => handleViewHistoryItem(item)} title={t('button_view_result')} className="p-2 text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"><Eye size={16} /></button>
                      <button onClick={() => handleRenameHistoryItem(item.id)} title={t('button_rename')} className="p-2 text-slate-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"><Edit3 size={16} /></button>
                      <button onClick={() => handleDeleteHistoryItem(item.id)} title={t('button_delete')} className="p-2 text-slate-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full"><Trash2 size={16} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
      </div>
    );

    return (
        <motion.div
            key="ai-search-view"
            variants={pageContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative isolate module-ai_search"
        >
            <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden blur-[120px] opacity-20 dark:opacity-30">
                <GoogleSearchBackground />
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                  key={subView}
                  variants={pageContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {subView === 'search' ? renderSearchView() : renderHistoryView()}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

export default AISearchView;