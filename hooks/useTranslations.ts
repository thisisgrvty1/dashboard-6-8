import { useLanguage } from './useLanguage';
import { translations } from '../lib/translations';

export const useTranslations = () => {
  const { language } = useLanguage();
  
  // Debug: Log current language and available translations
  console.log('useTranslations - Current language:', language);
  console.log('useTranslations - Available languages:', Object.keys(translations));
  console.log('useTranslations - German translations available:', !!translations.de);
  console.log('useTranslations - Sample German translation:', translations.de?.settings_title);
  
  const t = (key: string, replacements?: Record<string, string | number>): string => {
    console.log(`Translating key "${key}" for language "${language}"`);
    
    let translation = translations[language]?.[key];
    console.log(`Translation found: "${translation}"`);
    
    // Fallback to English if the translation for the current language is missing
    if (!translation) {
      translation = translations.en?.[key];
      console.log(`Fallback to English: "${translation}"`);
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

    console.log(`Final translation: "${translation}"`);
    return translation;
  };

  return { t, language };
};