import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import type { Module } from '../types';
import CreateModuleModal from './CreateModuleModal';
import ModuleView from './ModuleView';
import { Plus, Trash2, Search, BotMessageSquare } from 'lucide-react';
import WebhookChatBackground from './backgrounds/WebhookChatBackground';
import { useTranslations } from '../hooks/useTranslations';

interface WebhookChatViewProps {
  modules: Module[];
  setModules: React.Dispatch<React.SetStateAction<Module[]>>;
  makeApiKey: string;
}

const pageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
     transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

const WebhookChatView: React.FC<WebhookChatViewProps> = ({ modules, setModules, makeApiKey }) => {
  const { t } = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModules = useMemo(() => {
    return modules.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [modules, searchTerm]);
  
  const handleAddModule = useCallback((module: Omit<Module, 'id' | 'chatHistory'>) => {
    setModules(prev => [{ ...module, id: `mod-${Date.now()}`, chatHistory: [] }, ...prev]);
  }, [setModules]);

  const handleDeleteModule = useCallback((id: string) => {
    setModules(prev => prev.filter(m => m.id !== id));
  }, [setModules]);
  
  const updateModuleChatHistory = useCallback((moduleId: string, newHistory: Module['chatHistory']) => {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, chatHistory: newHistory } : m));
  }, [setModules]);

  const selectedModule = useMemo(() => modules.find(m => m.id === selectedModuleId), [modules, selectedModuleId]);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(t('webhook_delete_confirm'))) {
      handleDeleteModule(id);
    }
  };
  
  if (selectedModule) {
    return (
      <motion.div
        key={`module-view-${selectedModule.id}`}
        variants={pageContainerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <ModuleView
          module={selectedModule}
          makeApiKey={makeApiKey}
          updateChatHistory={updateModuleChatHistory}
          onBack={() => setSelectedModuleId(null)}
        />
      </motion.div>
    );
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <motion.div
      key="webhook-chat-list-view"
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative isolate module-webhook_chat"
    >
       <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden blur-[120px] opacity-20 dark:opacity-30">
          <WebhookChatBackground />
       </div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h2 className="font-display text-4xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{t('webhook_title')}</h2>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder={t('webhook_search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white/80 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-full text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
      </div>
      
      <AnimatePresence>
        {modules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-20 px-6 bg-white/50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl"
          >
            <BotMessageSquare className="mx-auto h-16 w-16 text-slate-400 dark:text-gray-600" />
            <h3 className="mt-4 font-display text-2xl font-semibold text-slate-800 dark:text-white">{t('webhook_empty_title')}</h3>
            <p className="mt-2 text-slate-600 dark:text-gray-400">{t('webhook_empty_desc')}</p>
            <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-5 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center mx-auto shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              >
                <Plus size={20} className="mr-2" />
                {t('webhook_create_new_button')}
              </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/50 dark:bg-black/30 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl flex items-center justify-center cursor-pointer hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 min-h-[220px]"
                  onClick={() => setIsModalOpen(true)}
              >
                  <div className="text-center text-slate-500 dark:text-gray-500">
                      <Plus size={40} />
                      <span className="mt-2 block font-semibold">{t('webhook_create_new_card')}</span>
                  </div>
              </motion.div>
            {filteredModules.map((module, i) => {
               const lastMessage = module.chatHistory[module.chatHistory.length - 1];
               return (
                <motion.div
                  layout
                  key={module.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  onClick={() => setSelectedModuleId(module.id)}
                  className="bg-white dark:bg-[#101010] rounded-2xl shadow-lg border border-slate-200 dark:border-white/10 group cursor-pointer transition-all duration-300 hover:border-blue-500/50 hover:-translate-y-1 hover:shadow-2xl dark:hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] p-5 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white truncate transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">{module.name}</h3>
                    <div className="mt-4 border-t border-slate-200 dark:border-white/10 pt-3">
                      <p className="text-xs text-slate-500 dark:text-gray-400 font-semibold">{t('webhook_recent_activity')}</p>
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-1 h-8">
                        {lastMessage ? `"${lastMessage.text.substring(0, 40)}${lastMessage.text.length > 40 ? '...' : ''}"` : t('webhook_no_activity')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-xs text-slate-500 dark:text-gray-500">
                      {lastMessage ? new Date(lastMessage.timestamp).toLocaleDateString() : '—'}
                    </div>
                     <button 
                        onClick={(e) => handleDeleteClick(e, module.id)}
                        className="text-slate-500 dark:text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-500/10"
                        aria-label={`Delete ${module.name} module`}
                      >
                       <Trash2 size={16} />
                      </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </AnimatePresence>

      {isModalOpen && (
        <CreateModuleModal
          onClose={() => setIsModalOpen(false)}
          onAddModule={handleAddModule}
        />
      )}
    </motion.div>
  );
};

export default WebhookChatView;