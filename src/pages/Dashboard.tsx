import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Dumbbell, 
  Brain, 
  Calendar,
  FileText,
  MapPin,
  Scale,
  Pill,
  Trophy,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import WaterTracker from '../components/dashboard/WaterTracker';
import HealthCard from '../components/common/HealthCard';
import StreakDisplay from '../components/dashboard/StreakDisplay';
import StepsTracker from '../components/dashboard/StepsTracker';
import SleepTracker from '../components/dashboard/SleepTracker';
import EmergencyButton from '../components/gamification/EmergencyButton';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;

  const healthCards = [
    {
      title: 'Habit Tracker',
      description: 'Build powerful daily habits that transform your life',
      icon: CheckSquare,
      color: 'from-fuchsia-500 to-purple-600',
      bgColor: 'rgba(217, 70, 239, 0.25)',
      route: '/habit-tracker'
    },
    {
      title: t('bmiVitalStats'),
      description: t('bmiDescription'),
      icon: Scale,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'rgba(59, 130, 246, 0.25)',
      route: '/bmi'
    },
    {
      title: t('medicationReminder'),
      description: t('medicationDescription'),
      icon: Pill,
      color: 'from-emerald-400 to-teal-600',
      bgColor: 'rgba(16, 185, 129, 0.25)',
      route: '/medications'
    },
    {
      title: t('workoutDietPlans'),
      description: t('workoutDescription'),
      icon: Dumbbell,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'rgba(245, 158, 11, 0.25)',
      route: '/workout'
    },
    {
      title: t('mentalWellness'),
      description: t('mentalDescription'),
      icon: Brain,
      color: 'from-violet-500 to-purple-700',
      bgColor: 'rgba(139, 92, 246, 0.25)',
      route: '/mental-health'
    },
    {
      title: t('menstruationTracker'),
      description: t('menstruationDescription'),
      icon: Calendar,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'rgba(236, 72, 153, 0.25)',
      route: '/menstruation'
    },
    {
      title: t('reportDecoder'),
      description: t('reportDescription'),
      icon: FileText,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'rgba(6, 182, 212, 0.25)',
      route: '/reports'
    },
    {
      title: t('nearbyServices'),
      description: t('nearbyDescription'),
      icon: MapPin,
      color: 'from-red-500 to-rose-700',
      bgColor: 'rgba(239, 68, 68, 0.25)',
      route: '/nearby'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-primary-custom transition-colors duration-500 flex flex-col">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 animate-slide-up">
        {/* Guest Mode Banner */}
        {user.isGuest && (
          <motion.div
            className="mb-6 p-4 bg-white/5 border border-card-custom rounded-2xl flex items-center space-x-3 backdrop-blur-md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 animate-bounce" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary-custom">
                You are currently in Guest Mode. Note: your data will not be persisted.
              </p>
              <p className="text-xs text-secondary-custom mt-0.5">
                <button onClick={() => navigate('/')} className="underline hover:no-underline font-semibold text-brand-from">
                  Sign up to save your progress →
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* Welcome Section */}
        <motion.div
          className="mb-8 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-brand-from/10 blur-2xl pointer-events-none" />
          {sessionStorage.getItem('arogya_is_new_user') === 'true' ? (
            <>
              <h2 className="text-3xl font-black tracking-tight text-primary-custom mb-1">
                Welcome to Arogya Care, <span className="text-brand-color">{user.name}</span>
              </h2>
              <p className="text-sm font-medium text-secondary-custom">
                We're excited to help you build healthy habits today.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-black tracking-tight text-primary-custom mb-1">
                {t('welcomeBack')}, <span className="text-brand-color">{user.name}</span>
              </h2>
              <p className="text-sm font-medium text-secondary-custom">
                {t('readyToContinue')}
              </p>
            </>
          )}
        </motion.div>

        {/* Streak Display */}
        <div className="mb-8">
          <StreakDisplay />
        </div>

        {/* Health Trackers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StepsTracker />
          <SleepTracker />
          <div onClick={() => navigate('/water-tracker')}>
            <WaterTracker />
          </div>
        </div>

        {/* Health Cards Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07 } }
          }}
        >
          {healthCards.map((card, index) => (
            <HealthCard
              key={card.title}
              title={card.title}
              description={card.description}
              icon={card.icon}
              color={card.color}
              bgColor={card.bgColor}
              delay={index * 0.07}
              onClick={() => navigate(card.route)}
            />
          ))}
        </motion.div>

        {/* Achievements Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <motion.button
            onClick={() => navigate('/achievements')}
            className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all flex items-center space-x-3 mx-auto overflow-hidden"
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.94 }}
            style={{ boxShadow: '0 8px 30px rgba(245, 158, 11, 0.35)' }}
          >
            {/* Glass reflection */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl pointer-events-none" />
            <div className="relative p-1.5 bg-white/20 rounded-lg">
              <Trophy className="h-5 w-5" />
            </div>
            <span className="relative">View Your Achievements</span>
          </motion.button>
        </motion.div>
      </main>

      <Footer />

      {/* Fixed Elements */}
      <EmergencyButton />
    </div>
  );
};

export default Dashboard;