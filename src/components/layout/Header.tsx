import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Globe, LogOut, Sun, Moon, Palette } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { language, changeLanguage, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showLanguageMenu, setShowLanguageMenu] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const themeOptions = [
    { id: 'light' as Theme, name: 'Pristine Light', color: 'bg-blue-400' },
    { id: 'dark' as Theme, name: 'Deep Space', color: 'bg-violet-600' },
    { id: 'emerald' as Theme, name: 'Emerald Care', color: 'bg-emerald-500' },
    { id: 'sunset' as Theme, name: 'Sunset Glow', color: 'bg-orange-500' },
    { id: 'neon' as Theme, name: 'Cyber Neon', color: 'bg-fuchsia-500' },
  ];

  const languageOptions = [
    { id: 'en' as const, name: 'English', label: 'EN' },
    { id: 'hi' as const, name: 'हिन्दी', label: 'HI' },
    { id: 'hinglish' as const, name: 'Hinglish', label: 'HING' },
    { id: 'te' as const, name: 'తెలుగు', label: 'TE' },
    { id: 'gu' as const, name: 'ગુજરાતી', label: 'GU' },
    { id: 'es' as const, name: 'Español', label: 'ES' },
    { id: 'fr' as const, name: 'Français', label: 'FR' },
    { id: 'de' as const, name: 'Deutsch', label: 'DE' }
  ];

  const currentLanguageLabel = languageOptions.find(opt => opt.id === language)?.label || 'EN';

  return (
    <header className="bg-card-surface/80 border-b border-card-custom backdrop-blur-xl transition-colors duration-300 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate('/dashboard')}
          >
            <div className="bg-brand-gradient p-2 rounded-xl shadow-md border border-white/10 animate-pulse">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-brand-color">
              AROGYA CARE
            </h1>
          </motion.div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
              <span className="hidden sm:inline text-sm text-secondary-custom font-semibold">
                Welcome, {user.name}
              </span>
            )}
            

            {/* Language Selector Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-full bg-white/5 border border-card-custom hover:bg-white/10 text-primary-custom transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe className="h-4 w-4 text-secondary-custom" />
                <span className="text-sm font-semibold text-secondary-custom">
                  {currentLanguageLabel}
                </span>
              </motion.button>

              <AnimatePresence>
                {showLanguageMenu && (
                  <>
                    {/* Overlay to close menu */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowLanguageMenu(false)}
                    />
                    <motion.div
                      className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl p-2 z-50 overflow-hidden"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto pr-1">
                        {languageOptions.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              changeLanguage(opt.id);
                              setShowLanguageMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                              language === opt.id
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span>{opt.name}</span>
                              <span className="opacity-60 uppercase text-[10px]">{opt.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {user && (
              <motion.button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-bold">Logout</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;