import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Heart, 
  Droplets, 
  Coffee, 
  Wind, 
  Bell, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  Flower2,
  Sparkles,
  Moon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/layout/Header';

interface PeriodDay {
  date: string;
  flow: 'spotting' | 'light' | 'medium' | 'heavy' | null;
  symptoms: string[];
  notes?: string;
}

interface Cycle {
  id: string;
  startDate: string;
  endDate?: string;
  days: PeriodDay[];
  length?: number;
}

const MenstruationPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [showComfortScreen, setShowComfortScreen] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'insights' | 'comfort'>('calendar');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedCycles = localStorage.getItem('menstruation_cycles');
    const savedSettings = localStorage.getItem('menstruation_settings');
    
    if (savedCycles) {
      setCycles(JSON.parse(savedCycles));
    }
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setRemindersEnabled(settings.remindersEnabled ?? true);
      setIsPrivacyMode(settings.isPrivacyMode ?? false);
    }
  }, []);

  // Save data to localStorage
  const saveCycles = (newCycles: Cycle[]) => {
    setCycles(newCycles);
    localStorage.setItem('menstruation_cycles', JSON.stringify(newCycles));
  };

  const saveSettings = () => {
    const settings = { remindersEnabled, isPrivacyMode };
    localStorage.setItem('menstruation_settings', JSON.stringify(settings));
  };

  useEffect(() => {
    saveSettings();
  }, [remindersEnabled, isPrivacyMode]);

  // Calendar utilities
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Period tracking logic
  const getPeriodDay = (dateStr: string): PeriodDay | null => {
    for (const cycle of cycles) {
      const day = cycle.days.find(d => d.date === dateStr);
      if (day) return day;
    }
    return null;
  };

  const addPeriodDay = (dateStr: string, flow: PeriodDay['flow'], symptoms: string[] = []) => {
    const existingDay = getPeriodDay(dateStr);
    
    if (existingDay) {
      // Update existing day
      const newCycles = cycles.map(cycle => ({
        ...cycle,
        days: cycle.days.map(day => 
          day.date === dateStr 
            ? { ...day, flow, symptoms }
            : day
        )
      }));
      saveCycles(newCycles);
    } else {
      // Add new day
      let updatedCycles = [...cycles];
      const currentCycle = updatedCycles.find(cycle => !cycle.endDate);
      
      if (currentCycle && flow) {
        // Add to existing cycle
        currentCycle.days.push({ date: dateStr, flow, symptoms });
      } else if (flow) {
        // Start new cycle
        const newCycle: Cycle = {
          id: Date.now().toString(),
          startDate: dateStr,
          days: [{ date: dateStr, flow, symptoms }]
        };
        updatedCycles.push(newCycle);
      }
      
      saveCycles(updatedCycles);
    }

    // Show comfort screen for heavy flow or cramps
    if (flow === 'heavy' || symptoms.includes('cramps')) {
      setShowComfortScreen(true);
    }
  };

  // Prediction logic
  const getAverageCycleLength = () => {
    const completedCycles = cycles.filter(cycle => cycle.endDate);
    if (completedCycles.length === 0) return 28;
    
    const totalLength = completedCycles.reduce((sum, cycle) => {
      const start = new Date(cycle.startDate);
      const end = new Date(cycle.endDate!);
      return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    
    return Math.round(totalLength / completedCycles.length);
  };

  const getNextPeriodPrediction = () => {
    if (cycles.length === 0) return null;
    
    const lastCycle = cycles[cycles.length - 1];
    const avgLength = getAverageCycleLength();
    const lastStart = new Date(lastCycle.startDate);
    const nextStart = new Date(lastStart);
    nextStart.setDate(lastStart.getDate() + avgLength);
    
    return nextStart;
  };

  // Calendar rendering
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();
    const nextPeriod = getNextPeriodPrediction();

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = formatDate(date);
      const periodDay = getPeriodDay(dateStr);
      const isToday = formatDate(date) === formatDate(today);
      const isSelected = selectedDate === dateStr;
      const isPredicted = nextPeriod && Math.abs(date.getTime() - nextPeriod.getTime()) < 3 * 24 * 60 * 60 * 1000;

      days.push(
        <motion.div
          key={day}
          className={`h-12 w-12 rounded-full flex items-center justify-center cursor-pointer relative ${
            isToday ? 'ring-2 ring-pink-400' : ''
          } ${
            isSelected ? 'bg-pink-500 text-white' : ''
          } ${
            periodDay?.flow ? getFlowColor(periodDay.flow) : 'hover:bg-pink-50'
          } ${
            isPredicted && !periodDay ? 'bg-pink-100 border-2 border-dashed border-pink-300' : ''
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedDate(dateStr)}
          animate={periodDay?.flow === 'heavy' ? {
            scale: [1, 1.05, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: periodDay?.flow === 'heavy' ? Infinity : 0,
            repeatType: "reverse"
          }}
        >
          <span className={`text-sm font-medium ${
            isSelected ? 'text-white' : 
            periodDay?.flow ? 'text-white' : 
            isPredicted ? 'text-pink-600' : 'text-secondary-custom'
          }`}>
            {day}
          </span>
          
          {/* Flow indicators */}
          {periodDay?.flow && (
            <motion.div
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Droplets className="h-3 w-3 text-white" />
            </motion.div>
          )}
          
          {/* Prediction indicator */}
          {isPredicted && !periodDay && (
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-3 w-3 text-pink-400" />
            </motion.div>
          )}
        </motion.div>
      );
    }

    return days;
  };

  const getFlowColor = (flow: string) => {
    switch (flow) {
      case 'spotting': return 'bg-pink-200 text-pink-800';
      case 'light': return 'bg-pink-300 text-pink-900';
      case 'medium': return 'bg-pink-400 text-white';
      case 'heavy': return 'bg-pink-600 text-white';
      default: return '';
    }
  };

  const getFlowIcon = (flow: string) => {
    switch (flow) {
      case 'spotting': return '•';
      case 'light': return '••';
      case 'medium': return '•••';
      case 'heavy': return '••••';
      default: return '';
    }
  };

  // Comfort screen component
  const ComfortScreen = () => (
    <motion.div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card-surface dark:bg-slate-900/95 p-8 border border-card-custom max-w-md w-full shadow-2xl text-left rounded-3xl backdrop-blur-xl"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
      >
        <div className="text-center">
          {/* Animated comfort icon */}
          <motion.div
            className="mb-6"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="bg-brand-gradient/10 border border-brand-from/20 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
              <Heart className="h-12 w-12 text-brand-from" />
            </div>
          </motion.div>

          <motion.h2
            className="text-2xl font-black text-primary-custom mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Take Care of Yourself
          </motion.h2>

          <motion.p
            className="text-sm text-secondary-custom mb-6 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Take it slow, rest, hydrate, and breathe. You're doing great.
          </motion.p>

          {/* Self-care tips */}
          <motion.div
            className="space-y-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center space-x-3 p-3 bg-white/5 border border-card-custom rounded-xl">
              <Wind className="h-5 w-5 text-brand-from" />
              <span className="text-sm font-semibold text-primary-custom">Try gentle breathing exercises</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/5 border border-card-custom rounded-xl">
              <Coffee className="h-5 w-5 text-brand-to" />
              <span className="text-sm font-semibold text-primary-custom">Sip some herbal tea</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/5 border border-card-custom rounded-xl">
              <Moon className="h-5 w-5 text-brand-from" />
              <span className="text-sm font-semibold text-primary-custom">Rest and take it easy</span>
            </div>
          </motion.div>

          <motion.button
            onClick={() => setShowComfortScreen(false)}
            className="w-full bg-brand-gradient text-white py-3 rounded-xl font-bold shadow-lg cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            Thank You
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Insights component
  const InsightsView = () => {
    const avgCycleLength = getAverageCycleLength();
    const nextPeriod = getNextPeriodPrediction();
    const lastCycle = cycles[cycles.length - 1];
    
    return (
      <div className="space-y-6">
        {/* Next period prediction */}
        {nextPeriod && (
          <motion.div
            className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-3xl p-6 border border-pink-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 text-pink-600 mr-3" />
              <h3 className="text-lg font-semibold text-primary-custom">Next Period Prediction</h3>
            </div>
            <p className="text-2xl font-bold text-pink-600 mb-2">
              {nextPeriod.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-secondary-custom">
              Based on your {avgCycleLength}-day average cycle
            </p>
          </motion.div>
        )}

        {/* Cycle statistics */}
        <motion.div
          className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-primary-custom mb-4">Cycle Insights</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-pink-50 rounded-xl">
              <p className="text-2xl font-bold text-pink-600">{avgCycleLength}</p>
              <p className="text-sm text-secondary-custom">Average Cycle</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-600">{cycles.length}</p>
              <p className="text-sm text-secondary-custom">Cycles Tracked</p>
            </div>
          </div>
        </motion.div>

        {/* Recent cycles */}
        {cycles.length > 0 && (
          <motion.div
            className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-primary-custom mb-4">Recent Cycles</h3>
            <div className="space-y-3">
              {cycles.slice(-3).reverse().map((cycle, index) => (
                <div key={cycle.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium text-primary-custom">
                      {new Date(cycle.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-secondary-custom">
                      {cycle.days.length} days tracked
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    {cycle.days.slice(0, 5).map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 rounded-full ${
                          day.flow ? getFlowColor(day.flow) : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  if (isPrivacyMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          className="text-center p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Lock className="h-16 w-16 text-pink-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-custom mb-2">Privacy Mode Enabled</h2>
          <p className="text-secondary-custom mb-6">Your menstruation data is protected</p>
          <button
            onClick={() => setIsPrivacyMode(false)}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            <Eye className="h-5 w-5 inline mr-2" />
            Show Data
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-secondary-custom" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-primary-custom">{t('menstruationTracker')}</h1>
              <p className="text-secondary-custom mt-1">Track your cycle with care and comfort</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => setIsPrivacyMode(true)}
              className="p-2 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <EyeOff className="h-5 w-5 text-secondary-custom" />
            </motion.button>
            <motion.button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full bg-card-surface shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="h-5 w-5 text-secondary-custom" />
            </motion.button>
          </div>
        </motion.div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="mb-8 bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3 className="text-lg font-semibold text-primary-custom mb-4">Settings</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-pink-600" />
                  <span className="text-secondary-custom">Period Reminders</span>
                </div>
                <button
                  onClick={() => setRemindersEnabled(!remindersEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    remindersEnabled ? 'bg-pink-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-card-surface rounded-full shadow-md transform transition-transform ${
                      remindersEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <div className="flex bg-card-surface rounded-2xl p-1 mb-8 shadow-lg border border-card-custom">
          {[
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'insights', label: 'Insights', icon: Sparkles },
            { id: 'comfort', label: 'Comfort', icon: Heart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                  : 'text-secondary-custom hover:text-primary-custom hover:bg-white/5'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Calendar */}
              <div className="lg:col-span-2">
                <div className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-primary-custom">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigateMonth('prev')}
                        className="p-2 rounded-full hover:bg-pink-50 transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5 text-secondary-custom" />
                      </button>
                      <button
                        onClick={() => navigateMonth('next')}
                        className="p-2 rounded-full hover:bg-pink-50 transition-colors"
                      >
                        <ChevronRight className="h-5 w-5 text-secondary-custom" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="h-8 flex items-center justify-center">
                        <span className="text-sm font-medium text-secondary-custom">{day}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {renderCalendar()}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 flex flex-wrap items-center justify-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-pink-200 rounded-full"></div>
                      <span className="text-secondary-custom">Spotting</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-pink-300 rounded-full"></div>
                      <span className="text-secondary-custom">Light</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-pink-400 rounded-full"></div>
                      <span className="text-secondary-custom">Medium</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-pink-600 rounded-full"></div>
                      <span className="text-secondary-custom">Heavy</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Day Details Panel */}
              <div className="space-y-6">
                {selectedDate ? (
                  <motion.div
                    className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <h3 className="text-lg font-semibold text-primary-custom mb-4">
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>

                    {/* Flow Selection */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-secondary-custom mb-3">Flow Intensity</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'spotting', label: 'Spotting', color: 'bg-pink-200' },
                          { value: 'light', label: 'Light', color: 'bg-pink-300' },
                          { value: 'medium', label: 'Medium', color: 'bg-pink-400' },
                          { value: 'heavy', label: 'Heavy', color: 'bg-pink-600' }
                        ].map((flow) => (
                          <button
                            key={flow.value}
                            onClick={() => addPeriodDay(selectedDate, flow.value as any)}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              getPeriodDay(selectedDate)?.flow === flow.value
                                ? `${flow.color} border-pink-500 text-white`
                                : 'border-card-custom hover:border-pink-300 text-secondary-custom'
                            }`}
                          >
                            <div className="text-center">
                              <span className="block text-sm font-medium">{flow.label}</span>
                              <span className="text-xs">{getFlowIcon(flow.value)}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-secondary-custom mb-3">Symptoms</p>
                      <div className="flex flex-wrap gap-2">
                        {['cramps', 'headache', 'bloating', 'mood swings', 'fatigue'].map((symptom) => (
                          <button
                            key={symptom}
                            onClick={() => {
                              const currentDay = getPeriodDay(selectedDate);
                              const currentSymptoms = currentDay?.symptoms || [];
                              const newSymptoms = currentSymptoms.includes(symptom)
                                ? currentSymptoms.filter(s => s !== symptom)
                                : [...currentSymptoms, symptom];
                              addPeriodDay(selectedDate, currentDay?.flow || null, newSymptoms);
                            }}
                            className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                              getPeriodDay(selectedDate)?.symptoms?.includes(symptom)
                                ? 'bg-purple-500 text-white'
                                : 'bg-white/5 text-secondary-custom hover:bg-purple-100'
                            }`}
                          >
                            {symptom}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Day */}
                    <button
                      onClick={() => addPeriodDay(selectedDate, null, [])}
                      className="w-full py-2 text-sm text-secondary-custom hover:text-secondary-custom transition-colors"
                    >
                      Clear Day
                    </button>
                  </motion.div>
                ) : (
                  <div className="bg-card-surface rounded-3xl p-6 shadow-lg border border-card-custom text-center">
                    <Flower2 className="h-12 w-12 text-pink-300 mx-auto mb-4" />
                    <p className="text-secondary-custom">Select a date to track your period</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <InsightsView />
            </motion.div>
          )}

          {activeTab === 'comfort' && (
            <motion.div
              key="comfort"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Comfort Tips */}
              <div className="glass-card p-6 border border-card-custom">
                <div className="flex items-center mb-4">
                  <Heart className="h-6 w-6 text-brand-from mr-3 animate-pulse" />
                  <h3 className="text-lg font-black text-primary-custom">{t('selfCareTips')}</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: Wind, title: 'Breathing Exercise', desc: 'Try deep breathing for 5 minutes' },
                    { icon: Coffee, title: 'Herbal Tea', desc: 'Chamomile or ginger tea can help' },
                    { icon: Moon, title: 'Rest Well', desc: 'Get plenty of sleep and rest' },
                    { icon: Heart, title: 'Gentle Movement', desc: 'Light stretching or yoga' }
                  ].map((tip, index) => (
                    <motion.div
                      key={tip.title}
                      className="flex items-start space-x-3 p-3 bg-white/5 border border-card-custom rounded-xl"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <tip.icon className="h-5 w-5 text-brand-from mt-1" />
                      <div>
                        <p className="font-semibold text-primary-custom">{tip.title}</p>
                        <p className="text-xs text-secondary-custom">{tip.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Comfort Button */}
              <div className="glass-card p-6 border border-card-custom">
                <div className="text-center">
                  <motion.div
                    className="mb-6"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="bg-brand-gradient/10 border border-brand-from/20 rounded-full p-6 w-20 h-20 mx-auto flex items-center justify-center shadow-lg">
                      <Heart className="h-10 w-10 text-brand-from" />
                    </div>
                  </motion.div>
                  
                  <h3 className="text-xl font-black text-primary-custom mb-3">Need Some Comfort?</h3>
                  <p className="text-sm text-secondary-custom mb-6">
                    Having a tough day? We're here to support you with gentle reminders and care.
                  </p>
                  
                  <motion.button
                    onClick={() => setShowComfortScreen(true)}
                    className="w-full bg-brand-gradient text-white py-3 rounded-xl font-bold shadow-lg cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Enter Comfort Space
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Comfort Screen Modal */}
      <AnimatePresence>
        {showComfortScreen && <ComfortScreen />}
      </AnimatePresence>
    </div>
  );
};

export default MenstruationPage;