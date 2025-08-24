import { useLanguage } from './useLanguage';
import { translations } from '../lib/translations';

export const useTranslations = () => {
  const { language } = useLanguage();
  
  const t = (key: string, replacements?: Record<string, string | number>): string => {
    let translation = translations[language]?.[key];
    
    // Fallback to English if the translation for the current language is missing
    if (!translation) {
      translation = translations.en?.[key];
    }
    
    // Return the key itself as a last resort
    if (!translation) {
      console.warn(`Missing translation for key: ${key} in language: ${language}`);
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