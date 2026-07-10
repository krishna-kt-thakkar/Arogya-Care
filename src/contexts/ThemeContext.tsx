import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'emerald' | 'sunset' | 'neon';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark'); // Default to classic premium dark mode
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');

  // Detect saved theme on first load
  useEffect(() => {
    const savedTheme = localStorage.getItem('arogya_theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('dark');
      localStorage.setItem('arogya_theme', 'dark');
    }
  }, []);

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all previous theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-emerald', 'theme-sunset', 'theme-neon');
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
    
    // Apply standard dark classes
    if (theme === 'light') {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    } else {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    }
  }, [theme]);

  const getThemeMessage = (t: Theme): string => {
    switch (t) {
      case 'light': return '☀️ Pristine Light: Crisp, clean, and legible.';
      case 'dark': return '🌙 Classic Dark: Deep space elegance.';
      case 'emerald': return '🌿 Emerald Forest: Restorative green energy.';
      case 'sunset': return '🌅 Sunset Glow: Energetic orange-rose warmth.';
      case 'neon': return '⚡ Cyberpunk Neon: High-contrast electric pulse.';
      default: return 'Theme Updated!';
    }
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('arogya_theme', newTheme);
    
    // Show toast message
    setMessageText(getThemeMessage(newTheme));
    setShowMessage(true);
    const timer = setTimeout(() => setShowMessage(false), 2500);
    return () => clearTimeout(timer);
  };

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'emerald', 'sunset', 'neon'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    changeTheme(themes[nextIndex]);
  };

  const isDark = theme !== 'light';

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme, toggleTheme, isDark }}>
      {children}
      
      {/* Dynamic Theme Change Notification Toast */}
      {showMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] animate-bounce-slow">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl shadow-black/45 flex items-center space-x-3">
            <span className="text-white font-bold text-sm tracking-wide">{messageText}</span>
          </div>
        </div>
      )}
    </ThemeContext.Provider>
  );
};