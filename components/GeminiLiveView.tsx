import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Chat } from '@google/genai';
import { Mic, Video, ScreenShare, Plus, CornerDownLeft, Command, Bot, User } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { TopLevelView } from '../types';
import { useTranslations } from '../hooks/useTranslations';


interface AIAgentMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
}

interface GeminiLiveViewProps {
  geminiApiKey: string;
  setView: (view: TopLevelView) => void;
}

const GeminiLiveView: React.FC<GeminiLiveViewProps> = ({ geminiApiKey, setView }) => {
  const { t } = useTranslations();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<AIAgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!geminiApiKey) {
        setError(t('error_gemini_api_key_not_set'));
        return;
    }
    setError(null);
    try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
        });
    } catch(e) {
        setError(e instanceof Error ? e.message : t('gemini_live_init_error'));
    }
  }, [geminiApiKey, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (prompt.trim() === '' || isLoading || !chatRef.current) return;

    const userMessage: AIAgentMessage = { id: `msg-${Date.now()}`, sender: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');
    setIsLoading(true);
    
    const modelMessageId = `msg-${Date.now() + 1}`;
    
    try {
      const result = await chatRef.current.sendMessageStream({ message: currentPrompt });
      let text = '';
      setMessages(prev => [...prev, { id: modelMessageId, sender: 'model', text: '' }]);
      
      for await (const chunk of result) {
        text += chunk.text;
        setMessages(prev => prev.map(m => m.id === modelMessageId ? { ...m, text } : m));
      }
    } catch (e) {
      const errorText = e instanceof Error ? e.message : 'An unknown error occurred.';
      const errorMessage : AIAgentMessage = { id: modelMessageId, sender: 'model', text: `Error: ${errorText}` }
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSendMessage]);

  const handleToolClick = (toolName: string) => {
    alert(`${toolName} functionality is coming soon!`);
  };

  return (
    <motion.div
      key="gemini-live-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-12rem)]"
    >
      <AnimatePresence>
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold font-display text-slate-800 dark:text-white">{t('gemini_live_title')}</h1>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-4xl flex-grow flex flex-col justify-end">
        {messages.length > 0 && (
          <div className="flex-grow overflow-y-auto mb-4 custom-scrollbar pr-2">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-4 mb-6">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${message.sender === 'user' ? 'bg-slate-700' : 'bg-indigo-500'}`}>
                  {message.sender === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
                </div>
                <div className="flex-grow pt-1">
                  {message.sender === 'user' ? (
                    <pre className="whitespace-pre-wrap font-sans text-base text-slate-800 dark:text-gray-200">{message.text}</pre>
                  ) : (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none leading-normal text-slate-800 dark:text-gray-200"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(message.text || '...') as string) }}
                    />
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length-1]?.sender === 'user' && (
                <div className="flex items-start space-x-4 mb-6">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex-shrink-0 flex items-center justify-center">
                        <Bot size={18} className="text-white" />
                    </div>
                     <div className="flex items-center space-x-2 pt-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        <div className="w-full">
            <div className="relative mb-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !(e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                }}
                placeholder={t('gemini_live_placeholder')}
                className="w-full bg-slate-200 dark:bg-[#1C1C1E] border border-slate-300 dark:border-white/20 rounded-2xl text-slate-900 dark:text-white p-4 pr-32 resize-none outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                rows={1}
                style={{ minHeight: '56px', maxHeight: '200px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                <button className="p-2 rounded-lg hover:bg-slate-300 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-gray-400">
                    <Plus size={20} />
                </button>
                <button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !prompt.trim()}
                    className="px-3 py-1.5 bg-slate-700 text-white rounded-lg flex items-center space-x-2 text-sm font-medium hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span>{t('gemini_live_run')}</span>
                    <Command size={12} />
                    <CornerDownLeft size={12} />
                </button>
              </div>
            </div>
            
            {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}
            
            <div className="flex items-center justify-center space-x-3">
                <button onClick={() => handleToolClick('Talk')} className="px-4 py-2 bg-slate-200 dark:bg-[#1C1C1E] border border-slate-300 dark:border-white/20 rounded-xl flex items-center space-x-2 text-sm text-slate-800 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">
                    <Mic size={16} />
                    <span>{t('gemini_live_talk')}</span>
                </button>
                 <button onClick={() => handleToolClick('Webcam')} className="px-4 py-2 bg-slate-200 dark:bg-[#1C1C1E] border border-slate-300 dark:border-white/20 rounded-xl flex items-center space-x-2 text-sm text-slate-800 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">
                    <Video size={16} />
                    <span>{t('gemini_live_webcam')}</span>
                </button>
                 <button onClick={() => handleToolClick('Share Screen')} className="px-4 py-2 bg-slate-200 dark:bg-[#1C1C1E] border border-slate-300 dark:border-white/20 rounded-xl flex items-center space-x-2 text-sm text-slate-800 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">
                    <ScreenShare size={16} />
                    <span>{t('gemini_live_share_screen')}</span>
                </button>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GeminiLiveView;