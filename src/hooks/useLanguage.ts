import { useState, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  }, []);

  const t = useCallback((key: string) => {
    return translations[key]?.[language] || key;
  }, [language]);

  return { language, toggleLanguage, t };
};