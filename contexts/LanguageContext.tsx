import React, { createContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
  
  console.log('LanguageProvider - Current language:', language);
  console.log('LanguageProvider - setLanguage function:', typeof setLanguage);
  
  const handleSetLanguage = (newLanguage: Language) => {
    console.log('LanguageProvider - Setting language to:', newLanguage);
    setLanguage(newLanguage);
    console.log('LanguageProvider - Language set, should trigger re-render');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
