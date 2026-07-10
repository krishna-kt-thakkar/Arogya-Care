import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Globe, Check, Settings } from 'lucide-react';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../hooks/useLanguage';
import { Language } from '../../types';

const GlobalThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const themeOptions = [
    { id: 'light' as Theme, name: 'Pristine Light', color: 'bg-blue-500 border-blue-300' },
    { id: 'dark' as Theme, name: 'Deep Space', color: 'bg-violet-600 border-violet-400' },
    { id: 'emerald' as Theme, name: 'Emerald Care', color: 'bg-emerald-500 border-emerald-300' },
    { id: 'sunset' as Theme, name: 'Sunset Glow', color: 'bg-orange-500 border-orange-300' },
    { id: 'neon' as Theme, name: 'Cyber Neon', color: 'bg-fuchsia-500 border-fuchsia-300' },
  ];

  const languageOptions = [
    { id: 'en' as Language, name: 'English', label: 'EN' },
    { id: 'hi' as Language, name: 'हिन्दी', label: 'HI' },
    { id: 'hinglish' as Language, name: 'Hinglish', label: 'HING' },
    { id: 'te' as Language, name: 'తెలుగు', label: 'TE' },
    { id: 'gu' as Language, name: 'ગુજરાતી', label: 'GU' },
    { id: 'es' as Language, name: 'Español', label: 'ES' },
    { id: 'fr' as Language, name: 'Français', label: 'FR' },
    { id: 'de' as Language, name: 'Deutsch', label: 'DE' }
  ];

  const currentLanguageLabel = languageOptions.find(opt => opt.id === language)?.label || 'EN';

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="fixed top-3 right-4 z-[9999] flex items-center">
      <div className="relative flex items-center">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute right-0 mt-14 w-64 bg-card-surface/95 backdrop-blur-2xl border border-card-custom rounded-3xl p-5 shadow-2xl z-[10000]"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {/* Language Section */}
              <div className="mb-5">
                <div className="flex items-center space-x-2 mb-3">
                  <Globe className="h-4 w-4 text-brand-from" />
                  <span className="text-xs font-black uppercase tracking-wider text-primary-custom">
                    {t('language')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {languageOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        changeLanguage(opt.id);
                      }}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold text-center border transition-all ${
                        language === opt.id
                          ? 'bg-brand-gradient text-white border-transparent shadow-md'
                          : 'bg-white/5 border-card-custom text-secondary-custom hover:bg-white/10 hover:text-primary-custom'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-card-custom my-4" />

              {/* Theme Section */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Palette className="h-4 w-4 text-brand-from" />
                  <span className="text-xs font-black uppercase tracking-wider text-primary-custom">
                    {t('theme')}
                  </span>
                </div>
                <div className="flex items-center justify-between px-1">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTheme(opt.id);
                      }}
                      className={`relative w-8 h-8 rounded-full ${opt.color} border-2 transition-all flex items-center justify-center cursor-pointer`}
                      title={opt.name}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {theme === opt.id && (
                        <motion.div
                          layoutId="activeThemeCheck"
                          className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check className="h-4 w-4 text-white font-bold" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified Settings Selector Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3.5 py-2.5 rounded-full bg-brand-gradient text-white font-bold shadow-lg border border-white/10 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ boxShadow: '0 4px 20px var(--glow-color)' }}
        >
          <Settings className="h-4.5 w-4.5 animate-spin-slow" />
          <span className="text-xs tracking-wider font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded-md">
            {currentLanguageLabel}
          </span>
        </motion.button>
      </div>
    </div>
  );
};

export default GlobalThemeSelector;
