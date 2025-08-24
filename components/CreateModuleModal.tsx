import React, { useState, useEffect } from 'react';
import type { Module } from '../types';
import { X } from 'lucide-react';
import { useTranslations } from '../hooks/useTranslations';

interface CreateModuleModalProps {
  onClose: () => void;
  onAddModule: (module: Omit<Module, 'id' | 'chatHistory'>) => void;
}

const CreateModuleModal: React.FC<CreateModuleModalProps> = ({ onClose, onAddModule }) => {
  const { t } = useTranslations();
  const [name, setName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && webhookUrl.trim()) {
      try {
        new URL(webhookUrl);
        onAddModule({ name, webhookUrl });
        onClose();
      } catch (_) {
        alert(t('modal_invalid_url_alert'));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-100 dark:bg-[#101010] border border-slate-300 dark:border-white/10 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 dark:text-gray-500 hover:text-slate-800 dark:hover:text-white transition-colors">
          <X size={24} />
        </button>
        <h2 className="font-display text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t('modal_create_module_title')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="module-name" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">
              {t('modal_module_name_label')}
            </label>
            <input
              type="text"
              id="module-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder={t('modal_module_name_placeholder')}
              required
            />
          </div>
          <div className="mb-8">
            <label htmlFor="webhook-url" className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">
              {t('modal_webhook_url_label')}
            </label>
            <input
              type="url"
              id="webhook-url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder={t('modal_webhook_url_placeholder')}
              required
            />
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
              {t('modal_webhook_url_note')}
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-white/20 transition-colors"
            >
              {t('modal_cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            >
              {t('modal_create_button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModuleModal;