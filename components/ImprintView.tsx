import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { TopLevelView } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface ImprintViewProps {
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

const ImprintView: React.FC<ImprintViewProps> = ({ setView }) => {
  const { t } = useTranslations();

  return (
    <motion.div
      key="imprint-view"
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h2 className="font-display text-4xl font-bold text-slate-900 dark:text-white">{t('imprint_title')}</h2>
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
          <h3>Information according to § 5 TMG</h3>
          <p>
            Stellar AI Labs GmbH<br />
            Creative Suite 42<br />
            10115 Berlin<br />
            Germany
          </p>

          <h3>Represented by:</h3>
          <p>The Management Board</p>

          <h3>Contact:</h3>
          <p>
            Telephone: +49 (0) 30 123 456 78<br />
            Email: contact@stellarlabs.dev
          </p>

          <h3>Register entry:</h3>
          <p>
            Entry in the Handelsregister.<br />
            Registering court: Amtsgericht Charlottenburg<br />
            Registration number: HRB 98765 B
          </p>

          <h3>VAT ID:</h3>
          <p>
            VAT identification number according to §27a Value Added Tax Act: DE123456789
          </p>
          
          <h3>Disclaimer:</h3>
          <p>
            <strong>Liability for content</strong><br/>
            The contents of our pages have been created with the utmost care. However, we cannot guarantee the contents' accuracy, completeness or topicality. According to statutory provisions, we are furthermore responsible for our own content on these web pages. In this matter, please note that we are not obliged to monitor the transmitted or saved information of third parties, or investigate circumstances pointing to illegal activity. Our obligations to remove or block the use of information under generally applicable laws remain unaffected by this as per §§ 8 to 10 of the Telemedia Act (TMG).
          </p>
          <p>
            <strong>Liability for links</strong><br/>
            Responsibility for the content of external links (to web pages of third parties) lies solely with the operators of the linked pages. No violations were evident to us at the time of linking. Should any legal infringement become known to us, we will remove the respective link immediately.
          </p>
          <p>
            <strong>Copyright</strong><br/>
            Our web pages and their contents are subject to German copyright law. Unless expressly permitted by law, every form of utilizing, reproducing or processing works subject to copyright protection on our web pages requires the prior consent of the respective owner of the rights. Individual reproductions of a work are only allowed for private use. The materials from these pages are copyrighted and any unauthorized use may violate copyright laws.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ImprintView;