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
  Zap,
  ChevronRight
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
  const [wellnessScore, setWellnessScore] = useState(72);
  const [activeTab, setActiveTab] = useState<'all' | 'trackers' | 'insights'>('all');

  useEffect(() => {
    if (!user) return;

    // Retrieve Steps Progress
    let stepsPercent = 60;
    const stepsDataRaw = localStorage.getItem('steps_tracker_data');
    if (stepsDataRaw) {
      try {
        const stepsData = JSON.parse(stepsDataRaw);
        stepsPercent = Math.min(((stepsData.steps || 0) / (stepsData.goal || 10000)) * 100, 100);
      } catch (e) {
        console.error('Error parsing steps data', e);
      }
    }

    // Retrieve Sleep Progress
    let sleepPercent = 75;
    const sleepDataRaw = localStorage.getItem('sleep_tracker_data');
    if (sleepDataRaw) {
      try {
        const sleepData = JSON.parse(sleepDataRaw);
        sleepPercent = Math.min(((sleepData.duration || 0) / 8) * 100, 100);
      } catch (e) {
        console.error('Error parsing sleep data', e);
      }
    }

    // Retrieve Water Progress
    let waterPercent = 50;
    const waterDataRaw = localStorage.getItem('water_tracker_data');
    if (waterDataRaw) {
      try {
        const waterData = JSON.parse(waterDataRaw);
        waterPercent = Math.min(((waterData.glasses_consumed || 0) / 8) * 100, 100);
      } catch (e) {
        console.error('Error parsing water data', e);
      }
    }

    // Calculate overall average wellness score
    const avg = Math.round((stepsPercent + sleepPercent + waterPercent) / 3);
    setWellnessScore(avg > 10 ? avg : 72);
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
    if (score >= 85) return 'Optimal Status';
    if (score >= 65) return 'Moderate Status';
    return 'Action Needed';
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-500';
    if (score >= 65) return 'text-brand-from';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-brand-bg text-primary-custom transition-colors duration-500 flex flex-col">
      <Header />
      
      {/* Background visual layout ornaments */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-brand-from/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-to/5 rounded-full blur-[140px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full relative z-10">
        
        {/* Guest Mode Alert Banner */}
        {user.isGuest && (
          <motion.div
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 backdrop-blur-md"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-bold text-primary-custom">
                Temporary Guest Mode Active
              </p>
              <p className="text-xs text-secondary-custom mt-0.5">
                Your logs and tracker metrics are only stored locally on this browser session.{' '}
                <button onClick={() => navigate('/')} className="font-bold text-brand-from hover:underline">
                  Create an account to persist progress
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* Dashboard Dynamic Grid Layout */}
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
              {/* Top ambient highlight gradient */}
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
                  {user.isGuest ? 'Guest Explorer' : 'Aarogya Member'}
                </p>

                <div className="mt-6 pt-6 border-t border-card-custom grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/5 border border-card-custom rounded-2xl">
                    <span className="block text-xl font-black text-brand-from">{wellnessScore}%</span>
                    <span className="text-[10px] text-secondary-custom uppercase tracking-wider font-bold">Health Index</span>
                  </div>
                  <div className="text-center p-3 bg-white/5 border border-card-custom rounded-2xl">
                    <span className="block text-xl font-black text-brand-to">Active</span>
                    <span className="text-[10px] text-secondary-custom uppercase tracking-wider font-bold">Status</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Action Navigation Dock */}
            <motion.div 
              className="glass-card p-4 border border-card-custom space-y-2 hidden lg:block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
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
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-secondary-custom hover:text-primary-custom transition-all text-sm font-semibold"
                >
                  <div className="flex items-center space-x-3">
                    <navItem.icon className="h-4.5 w-4.5 text-brand-from" />
                    <span>{navItem.name}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </button>
              ))}
            </motion.div>

            {/* Daily Goal Progress checklist */}
            <motion.div 
              className="glass-card p-5 border border-card-custom space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="text-xs font-bold text-secondary-custom uppercase tracking-wider border-b border-card-custom pb-2">Daily Progress Indicators</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-secondary-custom">Steps Completed</span>
                  <span className="text-primary-custom font-bold">Goal 10k</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-secondary-custom">Sleep Target</span>
                  <span className="text-primary-custom font-bold">Goal 8h</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-secondary-custom">Hydration Goal</span>
                  <span className="text-primary-custom font-bold">Goal 8 Glasses</span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Right Column (Col-span 3): Workspace Panel */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Header Greeting Banner & Health Score widget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              {/* Welcome text block */}
              <div className="md:col-span-2">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-primary-custom mb-2">
                  {sessionStorage.getItem('arogya_is_new_user') === 'true' 
                    ? `Welcome to Aarogya Care`
                    : t('welcomeBack')
                  }
                </h2>
                <p className="text-base text-secondary-custom leading-relaxed max-w-xl">
                  Your intelligent personal health portal is synchronized. Track diagnostics, schedule medications, and monitor vital markers seamlessly.
                </p>
                
                {/* Tabs to filter views */}
                <div className="flex items-center space-x-2 mt-6">
                  {['all', 'trackers', 'insights'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
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

              {/* 3D Radial Health Score Gauge Widget */}
              <div className="md:col-span-1 glass-card p-6 border border-card-custom flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-gradient opacity-[0.02] pointer-events-none" />
                <h4 className="text-xs font-bold text-secondary-custom uppercase tracking-wider mb-4">Aarogya Index</h4>
                
                {/* Radial score wheel */}
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

            {/* Main Interactive Live Trackers Grid */}
            {activeTab !== 'insights' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-brand-from" />
                  <h3 className="text-lg font-black uppercase tracking-wider text-primary-custom">Live Metric Diagnostics</h3>
                </div>
                
                {/* Grid contain layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StepsTracker />
                  <SleepTracker />
                  <div onClick={() => navigate('/water-tracker')}>
                    <WaterTracker />
                  </div>
                </div>
              </div>
            )}

            {/* Feature Modules Grid */}
            {activeTab !== 'trackers' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Compass className="h-5 w-5 text-brand-to" />
                  <h3 className="text-lg font-black uppercase tracking-wider text-primary-custom">Health Workspace Tools</h3>
                </div>

                {/* Grid for core tools */}
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

            {/* Streak & Achievements highlight area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Daily Streak display wrapper */}
              <div className="h-full">
                <StreakDisplay />
              </div>

              {/* Next achievement glass panel */}
              <motion.div 
                className="glass-card p-6 border border-card-custom relative flex flex-col justify-between overflow-hidden cursor-pointer"
                onClick={() => navigate('/achievements')}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                {/* Subtle radial shine glow */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-brand-to/5 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-brand-to/15 rounded-xl border border-brand-to/20">
                      <Trophy className="h-6 w-6 text-brand-to animate-pulse" />
                    </div>
                    <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-card-custom">
                      Rewards Panel
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-primary-custom">
                    Milestone Level Progress
                  </h4>
                  <p className="text-xs text-secondary-custom mt-1 leading-relaxed">
                    Build streaks to unlock exclusive badging credentials and verify MSME Ideas Hackathon achievements.
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs font-bold text-brand-to border-t border-card-custom pt-4">
                  <span>Open achievements index</span>
                  <ArrowRight className="h-4.5 w-4.5 hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>

            </div>

          </div>

        </div>

      </main>

      <Footer />
      <EmergencyButton />
    </div>
  );
};

export default Dashboard;