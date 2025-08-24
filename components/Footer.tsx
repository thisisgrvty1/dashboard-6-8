import React from 'react';
import type { TopLevelView } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface FooterProps {
  setView: (view: TopLevelView) => void;
}

const Footer: React.FC<FooterProps> = ({ setView }) => {
  const { t } = useTranslations();
  return (
    <footer className="w-full border-t border-black/10 dark:border-white/10 mt-8">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-gray-500">
          <p>&copy; 2025 AI Dashboard. All rights reserved.</p>
          <div className="flex space-x-4">
            <button onClick={() => setView('imprint')} className="hover:text-slate-800 dark:hover:text-gray-300 transition-colors">{t('footer_imprint')}</button>
            <button onClick={() => setView('privacy_policy')} className="hover:text-slate-800 dark:hover:text-gray-300 transition-colors">{t('footer_privacy')}</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;