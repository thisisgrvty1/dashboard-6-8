import React, { useState } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import type { ApiKeys } from '../types';
import { CheckCircle, Save } from 'lucide-react';
import { useTranslations } from '../hooks/useTranslations';
import { useDebug } from '../hooks/useDebug';

interface SettingsProps {
  apiKeys: ApiKeys;
  setApiKeys: React.Dispatch<React.SetStateAction<ApiKeys>>;
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


const Settings: React.FC<SettingsProps> = ({ apiKeys, setApiKeys }) => {
  const { t } = useTranslations();
  const { isDebugEnabled, setIsDebugEnabled } = useDebug();
  const [localKeys, setLocalKeys] = useState<ApiKeys>(apiKeys);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [enabledApis, setEnabledApis] = useState({
    make: !!apiKeys.make,
    openai: !!apiKeys.openai,
    gemini: !!apiKeys.gemini,
    suno: !!apiKeys.suno,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalKeys(prev => ({ ...prev, [name]: value }));
    setSaveStatus('idle');
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target as { name: keyof ApiKeys, checked: boolean };
    setEnabledApis(prev => ({ ...prev, [name]: checked }));

    if (!checked) {
      setLocalKeys(prev => ({ ...prev, [name]: '' }));
    }
    setSaveStatus('idle');
  };

  const handleSave = () => {
    try {
      setApiKeys(localKeys);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      setSaveStatus('error');
    }
  };

  const renderSaveMessage = () => {
    if (saveStatus === 'saved') {
      return (
        <div className="flex items-center space-x-2">
          <CheckCircle size={18} className="text-green-500 dark:text-green-400" />
          <span className="text-green-600 dark:text-green-400 text-sm">{t('settings_saved_message')}</span>
        </div>
      );
    }
    if (saveStatus === 'error') {
      return <span className="text-red-500 dark:text-red-400 text-sm">{t('settings_save_error')}</span>;
    }
    return null;
  };

  const apiKeySections: { key: keyof ApiKeys; label: string; placeholder: string; description: string }[] = [
    { key: 'gemini', label: t('settings_gemini_label'), placeholder: t('settings_gemini_placeholder'), description: t('settings_gemini_desc') },
    { key: 'make', label: t('settings_make_label'), placeholder: t('settings_make_placeholder'), description: t('settings_make_desc') },
    { key: 'suno', label: t('settings_suno_label'), placeholder: t('settings_suno_placeholder'), description: t('settings_suno_desc') },
    { key: 'openai', label: t('settings_openai_label'), placeholder: t('settings_openai_placeholder'), description: t('settings_openai_desc') },
  ];

  return (
    <motion.div
      key="settings-view"
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-3xl mx-auto"
    >
      <motion.h2 variants={itemVariants} className="font-display text-4xl font-bold mb-8 text-slate-900 dark:text-white">{t('settings_title')}</motion.h2>
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="space-y-6">
          {apiKeySections.map(({ key, label, placeholder, description }) => (
            <div key={key} className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={`enable-${key}`}
                  name={key}
                  checked={enabledApis[key]}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-black/40"
                />
                <label htmlFor={`enable-${key}`} className="font-medium text-slate-700 dark:text-gray-300 select-none">
                  {t('settings_enable_prefix')} {label}
                </label>
              </div>
              <AnimatePresence>
                {enabledApis[key] && (
                  <motion.div
                    key={`${key}-input`}
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="pl-7"
                  >
                    <input
                      type="password"
                      id={`${key}-key`}
                      name={key}
                      value={localKeys[key] || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      placeholder={placeholder}
                    />
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">{description}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          
          {/* Debug Settings Section */}
          <div className="border-t border-slate-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Developer Settings</h3>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enable-debug"
                checked={isDebugEnabled}
                onChange={(e) => setIsDebugEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-slate-100 dark:bg-black/40"
              />
              <label htmlFor="enable-debug" className="font-medium text-slate-700 dark:text-gray-300 select-none">
                Enable Debug Mode
              </label>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-2 ml-7">
              Shows debug panel with detailed logging for troubleshooting. Logs are stored locally and can be exported.
            </p>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-end space-x-4">
          {renderSaveMessage()}
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center space-x-2"
          >
            <Save size={18} />
            <span>{t('settings_save_button')}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Settings;