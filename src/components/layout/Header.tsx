import React from 'react';
import { motion } from 'framer-motion';
import { Heart, LogOut } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
                {t('welcomeBack')}, {user.name}
              </span>
            )}
            

            {user && (
              <motion.button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all duration-300 mr-14"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-bold">{t('logout')}</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;