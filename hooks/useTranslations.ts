import { useLanguage } from './useLanguage';
import { translations } from '../lib/translations';

// Helper function to safely access nested properties of the translations object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getNestedTranslation = (obj: any, key: string): string | undefined => {
    return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};


export const useTranslations = () => {
  const { language } = useLanguage();
  
  const t = (key: string, replacements?: Record<string, string | number>): string => {
    let translation = getNestedTranslation(translations[language], key);
    
    // Fallback to English if the translation for the current language is missing
    if (!translation) {
      translation = getNestedTranslation(translations.en, key);
    }
    
    // Return the key itself as a last resort
    if (!translation) {
      return key; 
    }

    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            const regex = new RegExp(`\\{${rKey}\\}`, 'g');
            translation = translation!.replace(regex, String(replacements[rKey]));
        });
    }

    return translation;
  };

  return { t, language };
};