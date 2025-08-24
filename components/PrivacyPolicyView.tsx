import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { TopLevelView } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface PrivacyPolicyViewProps {
    setView: (view: TopLevelView) => void;
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

const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ setView }) => {
  const { t } = useTranslations();

  return (
    <motion.div
      key="privacy-policy-view"
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h2 className="font-display text-4xl font-bold text-slate-900 dark:text-white">{t('privacy_title')}</h2>
          <button 
            onClick={() => setView('home')} 
            className="text-sm text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
              <ArrowLeft size={16} />
              <span>{t('button_back_to_home')}</span>
          </button>
      </div>
      
      <div className="bg-white dark:bg-[#101010] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p><em>Last Updated: October 26, 2023</em></p>
          
          <h3>1. Introduction</h3>
          <p>Welcome to the AI Dashboard. We are committed to protecting your privacy. This application is designed with a "privacy-first" approach. This Privacy Policy explains how your data is handled when you use our application.</p>
          
          <h3>2. Data Controller</h3>
          <p>
            Stellar AI Labs GmbH<br />
            Creative Suite 42<br />
            10115 Berlin, Germany<br />
            Email: privacy@stellarlabs.dev
          </p>
          
          <h3>3. Information We Collect and Store</h3>
          <p>This is a frontend-only application. We do not have a backend server, and we do not collect or store any of your personal data on our servers. All data you generate or configure is stored exclusively in your web browser's <strong>localStorage</strong>. This data includes:</p>
          <ul>
            <li><strong>API Keys:</strong> Your API keys for Make.com, Google Gemini, and OpenAI are stored in your browser's localStorage to allow the application to function. They are never transmitted to us.</li>
            <li><strong>Webhook Modules:</strong> The configuration of your Make.com webhook modules, including names and URLs.</li>
            <li><strong>Chat and Generation History:</strong> All your conversation logs with the AI Agent and webhooks, as well as the history of your generated images and videos, are saved locally so you can access them across sessions.</li>
          </ul>
          <p>This data remains on your computer and is not accessible by anyone else, including the developers of this application.</p>

          <h3>4. Use of Third-Party Services</h3>
          <p>To provide its core functionality, this application makes direct, client-side requests to third-party services using the API keys you provide. These services are:</p>
          <ul>
            <li><strong>Google Gemini (for AI Features):</strong> When you use the AI Agent, Image Generation, Video Generation, or Google Search modules, your prompts and configuration settings are sent directly from your browser to Google's servers. Your use of these features is subject to Google's Privacy Policy.</li>
            <li><strong>Make.com (for Webhook Chat):</strong> When you use the Webhook Chat module, your messages are sent directly from your browser to the Make.com webhook URL you configured. This is subject to Make.com's Privacy Policy.</li>
          </ul>
          <p>We do not act as an intermediary for these requests. We strongly recommend you review the privacy policies of these third-party services.</p>

          <h3>5. Data Security</h3>
          <p>The security of your data (like API keys and history) stored in localStorage depends on the security of your computer and browser. We recommend using a secure browser and keeping your system updated. The application itself does not add any extra layers of encryption to localStorage data.</p>
          
          <h3>6. Your Rights and Data Control</h3>
          <p>You have complete control over your data. You can access or delete your data at any time by:</p>
          <ul>
            <li>Using the "Clear History" or "Delete" buttons within the application's UI.</li>
            <li>Manually clearing your browser's localStorage for this website. Instructions for this can be found in your browser's help documentation.</li>
          </ul>

          <h3>7. Changes to This Privacy Policy</h3>
          <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically.</p>
          
          <h3>8. Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@stellarlabs.dev.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicyView;