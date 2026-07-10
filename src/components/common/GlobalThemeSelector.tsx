import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Heart } from 'lucide-react';
import { useTheme, Theme } from '../../contexts/ThemeContext';

const GlobalThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const themeOptions = [
    { id: 'light' as Theme, name: 'Pristine Light', color: 'bg-blue-400 border-blue-200' },
    { id: 'dark' as Theme, name: 'Deep Space', color: 'bg-violet-600 border-violet-400' },
    { id: 'emerald' as Theme, name: 'Emerald Care', color: 'bg-emerald-500 border-emerald-300' },
    { id: 'sunset' as Theme, name: 'Sunset Glow', color: 'bg-orange-500 border-orange-300' },
    { id: 'neon' as Theme, name: 'Cyber Neon', color: 'bg-fuchsia-500 border-fuchsia-300' },
  ];

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
              className="flex items-center space-x-2.5 bg-card-surface/90 backdrop-blur-2xl border border-card-custom rounded-full px-4.5 py-2.5 mr-3 shadow-2xl"
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`relative w-7 h-7 rounded-full ${opt.color} border-2 transition-all flex items-center justify-center cursor-pointer`}
                  title={opt.name}
                  whileHover={{ scale: 1.18 }}
                  whileTap={{ scale: 0.92 }}
                >
                  {theme === opt.id && (
                    <motion.div 
                      layoutId="activeThemeCheck"
                      className="absolute inset-0.5 rounded-full bg-white flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                    </motion.div>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Pill */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-full bg-brand-gradient text-white shadow-lg border border-white/10 flex items-center justify-center cursor-pointer"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          style={{ boxShadow: '0 4px 20px var(--glow-color)' }}
        >
          <Palette className="h-5 w-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default GlobalThemeSelector;
