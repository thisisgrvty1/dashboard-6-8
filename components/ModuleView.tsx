import React, { useState, useRef, useEffect } from 'react';
import type { Module, Message } from '../types';
import { sendMessageToWebhook } from '../services/makeService';
import { ArrowLeft, Send } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useTranslations } from '../hooks/useTranslations';

interface ModuleViewProps {
  module: Module;
  makeApiKey: string;
  updateChatHistory: (moduleId: string, newHistory: Message[]) => void;
  onBack: () => void;
}

const ModuleView: React.FC<ModuleViewProps> = ({ module, makeApiKey, updateChatHistory, onBack }) => {
  const { t } = useTranslations();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [module.chatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...module.chatHistory, userMessage];
    updateChatHistory(module.id, newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToWebhook(module.webhookUrl, input, makeApiKey);
      const webhookMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'webhook',
        text: responseText,
        timestamp: new Date().toISOString(),
      };
      updateChatHistory(module.id, [...newHistory, webhookMessage]);
    } catch (error) {
       const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'webhook',
        text: error instanceof Error ? error.message : "An unexpected error occurred.",
        timestamp: new Date().toISOString(),
      };
      updateChatHistory(module.id, [...newHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl">
      <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-full transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{module.name}</h2>
            <p className="text-sm text-slate-500 dark:text-gray-500 truncate">{module.webhookUrl}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {module.chatHistory.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-[#181818] text-slate-800 dark:text-gray-200'}`}>
              {message.sender === 'user' ? (
                  <pre className="whitespace-pre-wrap font-sans text-sm">{message.text}</pre>
              ) : (
                  <div
                      className="prose prose-sm dark:prose-invert max-w-none leading-normal"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(message.text) as string) }}
                  />
              )}
            </div>
          </div>
        ))}
         {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md p-3 rounded-lg bg-slate-100 dark:bg-[#181818] text-slate-800 dark:text-gray-200">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-gray-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-gray-500 animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-gray-500 animate-pulse [animation-delay:0.4s]"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-white/10">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat_placeholder')}
            disabled={isLoading || !makeApiKey}
            className="w-full px-4 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-full text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !makeApiKey}
            className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-900/50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
         {!makeApiKey && (
          <p className="text-xs text-red-500 mt-2 text-center">
            {t('chat_make_api_key_error')}
          </p>
        )}
      </div>
    </div>
  );
};

export default ModuleView;