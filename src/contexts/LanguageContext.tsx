import React, { createContext, useContext, useState, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('arogya_language');
    return (saved as Language) || 'en';
  });

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('arogya_language', lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    const langs: Language[] = ['en', 'hi', 'hinglish', 'te', 'gu', 'es', 'fr', 'de'];
    setLanguage(prev => {
      const idx = langs.indexOf(prev);
      const nextLang = langs[(idx + 1) % langs.length];
      localStorage.setItem('arogya_language', nextLang);
      return nextLang;
    });
  }, []);

  const t = useCallback((key: string) => {
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
