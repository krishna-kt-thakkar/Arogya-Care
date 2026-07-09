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
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      route: '/habit-tracker'
    },
    {
      title: t('bmiVitalStats'),
      description: t('bmiDescription'),
      icon: Scale,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      route: '/bmi'
    },
    {
      title: t('medicationReminder'),
      description: t('medicationDescription'),
      icon: Pill,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      route: '/medications'
    },
    {
      title: t('workoutDietPlans'),
      description: t('workoutDescription'),
      icon: Dumbbell,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
      route: '/workout'
    },
    {
      title: t('mentalWellness'),
      description: t('mentalDescription'),
      icon: Brain,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      route: '/mental-health'
    },
    {
      title: t('reportDecoder'),
      description: t('reportDescription'),
      icon: FileText,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20',
      route: '/reports'
    },
    {
      title: t('nearbyServices'),
      description: t('nearbyDescription'),
      icon: MapPin,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
      route: '/nearby'
    }
  ];

  // Add menstruation tracker for female users
  if (user.gender === 'female') {
    healthCards.splice(5, 0, {
      title: t('menstruationTracker'),
      description: t('menstruationDescription'),
      icon: Calendar,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
      route: '/menstruation'
    });
  }

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
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-black tracking-tight text-primary-custom mb-1">
            {t('welcomeBack')}, {user.name}! 👋
          </h2>
          <p className="text-sm font-medium text-secondary-custom">
            {t('readyToContinue')}
          </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {healthCards.map((card, index) => (
            <HealthCard
              key={card.title}
              title={card.title}
              description={card.description}
              icon={card.icon}
              color={card.color}
              bgColor={card.bgColor}
              delay={index * 0.1}
              onClick={() => navigate(card.route)}
            />
          ))}
        </div>

        {/* Achievements Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <motion.button
            onClick={() => navigate('/achievements')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-600 dark:to-orange-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center space-x-3 mx-auto"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trophy className="h-6 w-6" />
            <span>View Your Achievements</span>
            <span className="bg-white/20 px-2 py-1 rounded-full text-sm">🏆</span>
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