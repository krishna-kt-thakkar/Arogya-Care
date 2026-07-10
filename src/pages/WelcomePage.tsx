import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/useLanguage';


const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    // If no user, redirect to landing
    if (!user) {
      navigate('/', { replace: true });
      return;
    }

    // Show content after a brief logo animation
    const contentTimer = setTimeout(() => setShowContent(true), 600);
    // Enable the button after 1.5s so user can't skip instantly
    const proceedTimer = setTimeout(() => setCanProceed(true), 1500);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(proceedTimer);
    };
  }, [user, navigate]);

  const handleProceed = () => {
    // Mark welcome as seen so it never shows again on this device
    localStorage.setItem('arogya_hasSeenWelcome', 'true');
    sessionStorage.removeItem('arogya_is_new_user');
    navigate('/dashboard', { replace: true });
  };

  const isNewUser = sessionStorage.getItem('arogya_is_new_user') === 'true';
  const isGuest = user?.isGuest;
  const displayName = user?.name || 'Explorer';

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center relative overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-[15%] left-[10%] w-[400px] h-[400px] rounded-full bg-brand-from/15 blur-[100px]"
        animate={{ scale: [1, 1.3, 1], x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[15%] right-[10%] w-[500px] h-[500px] rounded-full bg-brand-to/10 blur-[120px]"
        animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />

      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
        {/* Animated Logo */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.3, rotateY: 90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}
        >
          <div className="relative" style={{ perspective: '600px' }}>
            <motion.div
              animate={{ rotateY: [0, 10, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 bg-brand-gradient rounded-3xl blur-2xl opacity-50 scale-150" />
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">
                <Heart className="h-16 w-16 text-white drop-shadow-xl" strokeWidth={2.5} />
                {/* Shine sweep */}
                <motion.div
                  className="absolute inset-0 rounded-3xl overflow-hidden"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                >
                  <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-primary-custom mb-3">
            {isGuest ? (
              <>{t('welcome')}, <span className="text-brand-color">{t('guestExplorer')}</span></>
            ) : isNewUser ? (
              <>{t('welcomeToArogya')}</>
            ) : (
              <>{t('welcomeBack')}</>
            )}
          </h1>

          <p className="text-base sm:text-lg text-secondary-custom leading-relaxed mb-8 max-w-md mx-auto">
            {isGuest
              ? t('guestDesc')
              : isNewUser
              ? t('newUserDesc').replace('{name}', displayName)
              : t('returnUserDesc').replace('{name}', displayName)}
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[
            { icon: Sparkles, label: t('aiHealthInsights') },
            { icon: Shield, label: t('securePrivate') },
            { icon: Zap, label: t('trackers12') },
          ].map((pill) => (
            <div
              key={pill.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-card-surface border border-card-custom text-xs font-semibold text-secondary-custom shadow-sm"
            >
              <pill.icon className="h-3.5 w-3.5 text-brand-from" />
              {pill.label}
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.button
            onClick={handleProceed}
            disabled={!canProceed}
            className="group px-10 py-4 rounded-full bg-brand-gradient text-white font-bold text-lg shadow-xl shadow-black/25 flex items-center gap-3 mx-auto border border-white/10 disabled:opacity-40 disabled:cursor-wait transition-opacity"
            whileHover={canProceed ? { scale: 1.05, y: -2 } : {}}
            whileTap={canProceed ? { scale: 0.95 } : {}}
          >
            Let's Go
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {!canProceed && (
            <motion.p
              className="text-[10px] text-secondary-custom/50 mt-3"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Preparing your dashboard...
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomePage;
