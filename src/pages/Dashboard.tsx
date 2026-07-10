import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  Activity,
  Heart,
  TrendingUp,
  User,
  Compass,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import WaterTracker from '../components/dashboard/WaterTracker';
import HealthCard from '../components/common/HealthCard';
import StepsTracker from '../components/dashboard/StepsTracker';
import SleepTracker from '../components/dashboard/SleepTracker';
import EmergencyButton from '../components/gamification/EmergencyButton';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../contexts/AuthContext';
import { useStreak } from '../contexts/StreakContext';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { streakData } = useStreak();
  const navigate = useNavigate();
  
  const [wellnessScore, setWellnessScore] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'trackers' | 'insights'>('all');

  useEffect(() => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    // Retrieve Steps Progress (REAL only, no mock defaults)
    let stepsPercent = 0;
    const stepsDataRaw = localStorage.getItem('steps_tracker_data');
    if (stepsDataRaw) {
      try {
        const stepsData = JSON.parse(stepsDataRaw);
        if (stepsData.date === today) {
          stepsPercent = Math.min(((stepsData.steps || 0) / (stepsData.goal || 10000)) * 100, 100);
        }
      } catch (e) {
        console.error('Error parsing steps data', e);
      }
    }

    // Retrieve Sleep Progress (REAL only, no mock defaults)
    let sleepPercent = 0;
    const sleepDataRaw = localStorage.getItem('sleep_tracker_data');
    if (sleepDataRaw) {
      try {
        const sleepData = JSON.parse(sleepDataRaw);
        if (sleepData.date === today) {
          sleepPercent = Math.min(((sleepData.duration || 0) / 8) * 100, 100);
        }
      } catch (e) {
        console.error('Error parsing sleep data', e);
      }
    }

    // Retrieve Water Progress (REAL only, no mock defaults)
    let waterPercent = 0;
    const waterDataRaw = localStorage.getItem('water_tracker_data');
    if (waterDataRaw) {
      try {
        const waterData = JSON.parse(waterDataRaw);
        if (waterData.date === today) {
          waterPercent = Math.min(((waterData.glasses_consumed || 0) / 8) * 100, 100);
        }
      } catch (e) {
        console.error('Error parsing water data', e);
      }
    }

    // Calculate overall average wellness score (REAL average of current activities)
    const avg = Math.round((stepsPercent + sleepPercent + waterPercent) / 3);
    setWellnessScore(avg);
  }, [user]);

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

  const getScoreMessage = (score: number) => {
    if (score >= 80) return `Optimal Health ${t('status')}`;
    if (score >= 50) return 'Moderate Activity';
    if (score > 0) return 'Initiating Diagnostics';
    return 'Awaiting Active Tracking';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-brand-from';
    if (score > 0) return 'text-amber-500';
    return 'text-secondary-custom';
  };

  // Filter out unlocked badges
  const unlockedBadges = (streakData.badges || []).filter(b => b.unlocked);

  return (
    <div className="min-h-screen bg-brand-bg text-primary-custom transition-colors duration-500 flex flex-col">
      <Header />
      
      {/* Background ambient orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-brand-from/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-to/5 rounded-full blur-[140px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full relative z-10">
        
        {/* Guest Mode Banner */}
        {user.isGuest && (
          <motion.div
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 backdrop-blur-md"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-bold text-primary-custom">
                {t('guestModeActive')}
              </p>
              <p className="text-xs text-secondary-custom mt-0.5">
                {t('guestModeDesc')}{' '}
                <button onClick={() => navigate('/')} className="font-bold text-brand-from hover:underline">
                  {t('createAccountPersist')}
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* Dashboard Dynamic Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Command & Identity Center */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 3D Identity Glass Card */}
            <motion.div 
              className="glass-card p-6 border border-card-custom relative overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Decorative top accent line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-from to-brand-to" />
              
              <div className="text-center relative">
                {/* 3D Pulsing Avatar Badge */}
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-brand-gradient rounded-full blur-md opacity-40 animate-pulse" />
                  <div className="relative z-10 w-full h-full rounded-full bg-card-surface border-2 border-card-custom flex items-center justify-center">
                    <User className="h-10 w-10 text-brand-from" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 z-20 bg-emerald-500 p-1.5 rounded-full border-2 border-slate-900 shadow-md">
                    <ShieldCheck className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-primary-custom truncate">
                  {user.name}
                </h3>
                <p className="text-xs text-secondary-custom font-semibold tracking-wider uppercase mt-0.5">
                  {user.isGuest ? t('guestExplorer') : t('aarogyaMember')}
                </p>

                <div className="mt-6 pt-6 border-t border-card-custom grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/5 border border-card-custom rounded-2xl">
                    <span className="block text-xl font-black text-brand-from">{wellnessScore}%</span>
                    <span className="text-[10px] text-secondary-custom uppercase tracking-wider font-bold">{t('healthIndex')}</span>
                  </div>
                  <div className="text-center p-3 bg-white/5 border border-card-custom rounded-2xl">
                    <span className="block text-xl font-black text-brand-to">{t('active')}</span>
                    <span className="text-[10px] text-secondary-custom uppercase tracking-wider font-bold">{t('status')}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Revamped 3D Flip-Calendar Streak Widget (REAL DATA - NO EMOJIS) */}
            <motion.div 
              className="glass-card p-4 border border-card-custom flex items-center space-x-4 cursor-pointer"
              onClick={() => navigate('/achievements')}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -2, scale: 1.01 }}
            >
              {/* Beautiful 3D flip-calendar structure */}
              <div className="relative w-12 h-14 bg-gradient-to-b from-brand-from to-brand-to rounded-xl shadow-lg border border-white/20 flex flex-col overflow-hidden select-none flex-shrink-0">
                <div className="bg-slate-950/20 py-0.5 text-[8px] font-black uppercase tracking-widest text-white text-center border-b border-white/10">
                  DAY
                </div>
                <div className="flex-1 flex items-center justify-center bg-white/10 backdrop-blur-md">
                  <span className="text-lg font-black text-white drop-shadow-md">
                    {streakData.currentStreak || 1}
                  </span>
                </div>
                {/* Visual binder rings */}
                <div className="absolute top-1 left-2.5 w-1 h-1 rounded-full bg-slate-900/40" />
                <div className="absolute top-1 right-2.5 w-1 h-1 rounded-full bg-slate-900/40" />
              </div>
              
              <div>
                <h4 className="text-sm font-black text-primary-custom">{t('consistencyStreak')}</h4>
                <p className="text-xs text-secondary-custom leading-tight">
                  {streakData.currentStreak === 0 
                    ? t('startTrackingProgress') 
                    : `${t('activeStreakDay')}: ${streakData.currentStreak}`
                  }
                </p>
              </div>
            </motion.div>

            {/* Quick Action Navigation Dock */}
            <motion.div 
              className="glass-card p-4 border border-card-custom space-y-2 hidden lg:block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <h4 className="text-xs font-bold text-secondary-custom uppercase tracking-wider px-3 mb-3">Quick Navigation</h4>
              {[
                { name: 'BMI Calculator', path: '/bmi', icon: Scale },
                { name: 'Achievements', path: '/achievements', icon: Trophy },
                { name: 'Habits Tracker', path: '/habit-tracker', icon: CheckSquare },
                { name: 'Hospital Finder', path: '/nearby', icon: MapPin },
              ].map((navItem) => (
                <button
                  key={navItem.name}
                  onClick={() => navigate(navItem.path)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-secondary-custom hover:text-primary-custom transition-all text-sm font-semibold cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <navItem.icon className="h-4.5 w-4.5 text-brand-from" />
                    <span>{navItem.name}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </button>
              ))}
            </motion.div>

          </div>

          {/* Right Column: Main Console Panel */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Header Greeting Banner & Health Score radial gauge */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              <div className="md:col-span-2">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-primary-custom mb-2">
                  Welcome back, {user.name}
                </h2>
                <p className="text-base text-secondary-custom leading-relaxed max-w-xl">
                  Your intelligent personal health portal is synchronized. Track diagnostics, schedule medications, and monitor vital markers seamlessly.
                </p>
                
                {/* View Tabs */}
                <div className="flex items-center space-x-2 mt-6">
                  {['all', 'trackers', 'insights'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        activeTab === tab 
                          ? 'bg-brand-gradient text-white border-transparent shadow-md'
                          : 'bg-card-surface/40 text-secondary-custom border-card-custom hover:border-brand-from/40'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Radial Health Score Widget (REAL DATA) */}
              <div className="md:col-span-1 glass-card p-6 border border-card-custom flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-gradient opacity-[0.02] pointer-events-none" />
                <h4 className="text-xs font-bold text-secondary-custom uppercase tracking-wider mb-4">Aarogya Index</h4>
                
                {/* Radial progress meter */}
                <div className="relative w-28 h-28 flex items-center justify-center mb-3">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#radialGlowGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 251.2" }}
                      animate={{ strokeDasharray: `${(wellnessScore / 100) * 251.2} 251.2` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="radialGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--brand-from)" />
                        <stop offset="100%" stopColor="var(--brand-to)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-primary-custom tracking-tighter">{wellnessScore}</span>
                    <span className="text-[9px] font-bold text-secondary-custom uppercase tracking-wider">Score</span>
                  </div>
                </div>

                <span className={`text-xs font-black uppercase tracking-widest ${getScoreColor(wellnessScore)}`}>
                  {getScoreMessage(wellnessScore)}
                </span>
              </div>

            </div>

            {/* Live Metric Diagnostics */}
            {activeTab !== 'insights' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-brand-from" />
                  <h3 className="text-lg font-black uppercase tracking-wider text-primary-custom">Live Metric Diagnostics</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StepsTracker />
                  <SleepTracker />
                  <div onClick={() => navigate('/water-tracker')}>
                    <WaterTracker />
                  </div>
                </div>
              </div>
            )}

            {/* Feature Modules */}
            {activeTab !== 'trackers' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Compass className="h-5 w-5 text-brand-to" />
                  <h3 className="text-lg font-black uppercase tracking-wider text-primary-custom">Health Workspace Tools</h3>
                </div>

                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.05 } }
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
                      delay={index * 0.05}
                      onClick={() => navigate(card.route)}
                    />
                  ))}
                </motion.div>
              </div>
            )}

            {/* Upcoming Updates / previews */}
            {activeTab !== 'trackers' && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500 animate-pulse" />
                  <h3 className="text-lg font-black uppercase tracking-wider text-primary-custom">Upcoming Updates (Beta Preview)</h3>
                </div>

                <motion.div 
                  onClick={() => navigate('/doctor-booking')}
                  className="glass-card p-6 border border-orange-500/20 hover:border-orange-500/40 relative flex flex-col md:flex-row items-center justify-between overflow-hidden cursor-pointer gap-6 transition-all"
                  whileHover={{ y: -3, scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-orange-500/[0.02] pointer-events-none" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between md:justify-start gap-4 mb-3">
                      <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <Calendar className="h-6 w-6 text-orange-500" />
                      </div>
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/25">
                        Development Preview
                      </span>
                    </div>

                    <h4 className="text-xl font-black text-primary-custom flex items-center gap-2">
                      AI Doctor Booking & Clinic Queue
                    </h4>
                    <p className="text-xs text-secondary-custom mt-1.5 leading-relaxed max-w-2xl">
                      Book clinic slots with top specialists, view live patient waiting tokens, check lunch hours, and get WhatsApp appointment confirmation redirections automatically.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-orange-500 border-t md:border-t-0 md:border-l border-card-custom pt-4 md:pt-0 md:pl-6 flex-shrink-0 w-full md:w-auto">
                    <span className="md:hidden">Check booking availability preview</span>
                    <div className="flex items-center space-x-2">
                      <span className="hidden md:inline font-extrabold uppercase tracking-wide text-[10px]">Configure Slots Preview</span>
                      <ArrowRight className="h-4.5 w-4.5" />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Achievements highlight section (REAL DATA ONLY - NO MOCK STUFF) */}
            <motion.div 
              className="glass-card p-6 border border-card-custom relative flex flex-col md:flex-row items-center justify-between overflow-hidden cursor-pointer gap-6"
              onClick={() => navigate('/achievements')}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              {/* Subtle visual lighting */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-to/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex-1">
                <div className="flex items-center justify-between md:justify-start gap-4 mb-3">
                  <div className="p-3 bg-brand-to/15 rounded-xl border border-brand-to/20">
                    <Trophy className="h-6 w-6 text-brand-to" />
                  </div>
                  <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-card-custom">
                    Milestone Panel
                  </span>
                </div>
                
                <h4 className="text-xl font-bold text-primary-custom">
                  Unlocked Health Achievements
                </h4>
                <p className="text-xs text-secondary-custom mt-1 leading-relaxed max-w-2xl">
                  {unlockedBadges.length === 0 
                    ? 'No achievements unlocked yet. Continue updating steps, tracking sleep and hydrations to claim custom MSME Idea Hackathon milestone badges!'
                    : `You have successfully unlocked ${unlockedBadges.length} milestone badges! Your resolve is inspiring.`
                  }
                </p>

                {/* Show real badge indicators if unlocked */}
                {unlockedBadges.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 mt-4">
                    {unlockedBadges.map((badge) => (
                      <span 
                        key={badge.id}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-to/10 border border-brand-to/20 text-brand-to rounded-full text-xs font-bold"
                      >
                        <span>{badge.name}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-brand-to border-t md:border-t-0 md:border-l border-card-custom pt-4 md:pt-0 md:pl-6 flex-shrink-0 w-full md:w-auto">
                <span className="md:hidden">Open achievements panel</span>
                <div className="flex items-center space-x-2">
                  <span className="hidden md:inline">Open achievements panel</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </div>
              </div>
            </motion.div>

          </div>

        </div>

      </main>

      <Footer />
      <EmergencyButton />
    </div>
  );
};

export default Dashboard;