import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Globe, LogOut, Sun, Moon, Palette } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showThemeMenu, setShowThemeMenu] = React.useState(false);

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
            
            {/* Theme Dropdown Selector */}
            <div className="relative">
              <motion.button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-white/5 border border-card-custom hover:bg-white/10 text-primary-custom transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Palette className="h-4 w-4 text-brand-from" />
                <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider capitalize text-secondary-custom">
                  {theme}
                </span>
              </motion.button>

              <AnimatePresence>
                {showThemeMenu && (
                  <motion.div
                    className="absolute right-0 mt-2.5 w-48 rounded-2xl bg-card-surface/95 backdrop-blur-2xl border border-card-custom p-2 shadow-2xl z-50 overflow-hidden"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-secondary-custom/40 uppercase tracking-wider border-b border-card-custom mb-1">
                      Choose Theme Accent
                    </div>
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => { setTheme(opt.id); setShowThemeMenu(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors ${
                          theme === opt.id ? 'bg-brand-from/15 text-brand-from font-semibold' : 'text-secondary-custom hover:bg-white/5 hover:text-primary-custom'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${opt.color} border border-white/20`} />
                          <span>{opt.name}</span>
                        </div>
                        {theme === opt.id && <Heart className="h-3 w-3 text-brand-from fill-brand-from animate-pulse" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language Toggle */}
            <motion.button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-2 rounded-full bg-white/5 border border-card-custom hover:bg-white/10 text-primary-custom transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe className="h-4 w-4 text-secondary-custom" />
              <span className="text-sm font-semibold text-secondary-custom">
                {language === 'en' ? 'EN' : 'हिं'}
              </span>
            </motion.button>

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