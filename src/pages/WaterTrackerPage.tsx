import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Droplets, Plus, Minus, Target, TrendingUp, CupSoda, GlassWater } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useStreak } from '../contexts/StreakContext';
import Header from '../components/layout/Header';

interface WaterData {
  date: string;
  intake: number;
  goal: number;
  lastUpdated: string;
}

const WaterTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addActivity } = useStreak();
  const [waterIntake, setWaterIntake] = useState(0);
  const [animateWater, setAnimateWater] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [weeklyData, setWeeklyData] = useState<WaterData[]>([]);
  const waterGoal = 8;
  const percentage = (waterIntake / waterGoal) * 100;

  // Load saved data on component mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem('water_tracker_data');
    const savedWeeklyData = localStorage.getItem('water_tracker_weekly');
    
    if (savedData) {
      const data = JSON.parse(savedData);
      // Check if data is from today
      if (data.date === today) {
        setWaterIntake(data.intake);
        setLastUpdated(data.lastUpdated);
      } else {
        // New day, reset counter but save the reset
        const newData = { 
          date: today, 
          intake: 0, 
          goal: waterGoal,
          lastUpdated: new Date().toISOString() 
        };
        localStorage.setItem('water_tracker_data', JSON.stringify(newData));
        setWaterIntake(0);
        setLastUpdated(newData.lastUpdated);
      }
    } else {
      // First time, initialize data
      const newData = { 
        date: today, 
        intake: 0, 
        goal: waterGoal,
        lastUpdated: new Date().toISOString() 
      };
      localStorage.setItem('water_tracker_data', JSON.stringify(newData));
      setLastUpdated(newData.lastUpdated);
    }

    // Load weekly data
    if (savedWeeklyData) {
      setWeeklyData(JSON.parse(savedWeeklyData));
    } else {
      // Initialize with mock weekly data
      const mockWeeklyData = [
        { date: getDateString(-6), intake: 7, goal: 8, lastUpdated: new Date().toISOString() },
        { date: getDateString(-5), intake: 8, goal: 8, lastUpdated: new Date().toISOString() },
        { date: getDateString(-4), intake: 6, goal: 8, lastUpdated: new Date().toISOString() },
        { date: getDateString(-3), intake: 9, goal: 8, lastUpdated: new Date().toISOString() },
        { date: getDateString(-2), intake: 7, goal: 8, lastUpdated: new Date().toISOString() },
        { date: getDateString(-1), intake: 8, goal: 8, lastUpdated: new Date().toISOString() },
        { date: today, intake: waterIntake, goal: 8, lastUpdated: new Date().toISOString() }
      ];
      localStorage.setItem('water_tracker_weekly', JSON.stringify(mockWeeklyData));
      setWeeklyData(mockWeeklyData);
    }
  }, []);

  const getDateString = (daysOffset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  };

  // Save data whenever waterIntake changes
  const saveWaterData = (newIntake: number) => {
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    
    const data = {
      date: today,
      intake: newIntake,
      goal: waterGoal,
      lastUpdated: timestamp
    };
    
    localStorage.setItem('water_tracker_data', JSON.stringify(data));
    setLastUpdated(timestamp);
    
    // Update weekly data
    const updatedWeeklyData = weeklyData.map(day => 
      day.date === today 
        ? { ...day, intake: newIntake, lastUpdated: timestamp }
        : day
    );
    localStorage.setItem('water_tracker_weekly', JSON.stringify(updatedWeeklyData));
    setWeeklyData(updatedWeeklyData);
    
    // Show save animation
    setShowSaveAnimation(true);
    setTimeout(() => setShowSaveAnimation(false), 2000);
    
    // Track activity for streak if goal reached
    if (newIntake >= waterGoal && waterIntake < waterGoal) {
      addActivity('water_goal');
    }
  };

  const addWater = () => {
    if (waterIntake < 12) {
      const newIntake = waterIntake + 1;
      setWaterIntake(newIntake);
      saveWaterData(newIntake);
      setAnimateWater(true);
      setTimeout(() => setAnimateWater(false), 500);
    }
  };

  const removeWater = () => {
    if (waterIntake > 0) {
      const newIntake = waterIntake - 1;
      setWaterIntake(newIntake);
      saveWaterData(newIntake);
    }
  };

  const addQuickWater = (amount: number) => {
    const newIntake = Math.min(waterIntake + amount, 12);
    setWaterIntake(newIntake);
    saveWaterData(newIntake);
    setAnimateWater(true);
    setTimeout(() => setAnimateWater(false), 500);
  };

  const formatLastUpdated = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-primary-custom">{t('waterIntake')}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Stay hydrated and track your daily water consumption</p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {formatLastUpdated(lastUpdated)}
              </p>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Water Tracker */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 relative transition-colors duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Save Animation */}
            {showSaveAnimation && (
              <motion.div
                className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                initial={{ opacity: 0, scale: 0, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: -10 }}
              >
                ✓ Data saved successfully
              </motion.div>
            )}

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">Today's Progress</h2>
              
              {/* Large Water Glass */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <motion.div
                    className="w-32 h-48 border-4 border-blue-300 dark:border-blue-600 rounded-b-full rounded-t-3xl relative overflow-hidden transition-colors duration-300"
                    animate={animateWater ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-300 dark:from-blue-500 dark:to-blue-400 rounded-b-full transition-colors duration-300"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute top-4 left-1/2 transform -translate-x-1/2"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Droplets className="h-6 w-6 text-blue-500 dark:text-blue-400 transition-colors duration-300" />
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Progress Text */}
              <div className="mb-8">
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 transition-colors duration-300">
                  {waterIntake}/{waterGoal}
                </p>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('glasses')} consumed</p>
                <p className="text-2xl font-semibold text-blue-500 dark:text-blue-400 mt-2 transition-colors duration-300">
                  {Math.round(percentage)}%
                </p>
                {waterIntake >= waterGoal && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 text-green-600 dark:text-green-400 font-semibold transition-colors duration-300"
                  >
                    {t('goal')} {t('completed')}!
                  </motion.div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-6">
                <motion.button
                  onClick={removeWater}
                  className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Minus className="h-6 w-6" />
                </motion.button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 transition-colors duration-300">Add Glass</p>
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center transition-colors duration-300">
                    <Droplets className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                <motion.button
                  onClick={addWater}
                  className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus className="h-6 w-6" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Weekly Progress */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center mb-6">
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Weekly Progress</h2>
            </div>

            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <motion.div
                  key={day.date}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300 w-12 transition-colors duration-300">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 transition-colors duration-300">
                      <motion.div
                        className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(day.intake / day.goal) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 w-16 text-right transition-colors duration-300">
                    {day.intake}/{day.goal}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Hydration Tips */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl transition-colors duration-300">
              <div className="flex items-center mb-2">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">Hydration Tips</h3>
              </div>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 transition-colors duration-300">
                <li>• Drink a glass when you wake up</li>
                <li>• Keep water visible as a reminder</li>
                <li>• Add lemon or mint for flavor</li>
                <li>• Drink before you feel thirsty</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="mt-8 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Quick Add</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { amount: 1, label: '1 Glass', icon: GlassWater, color: 'text-sky-500' },
              { amount: 2, label: '2 Glasses', icon: GlassWater, color: 'text-blue-500' },
              { amount: 3, label: '3 Glasses', icon: CupSoda, color: 'text-indigo-500' },
              { amount: 4, label: 'Bottle', icon: Droplets, color: 'text-teal-500' }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.button
                  key={item.label}
                  onClick={() => addQuickWater(item.amount)}
                  className="p-4 bg-white/5 border border-card-custom hover:bg-white/10 rounded-xl transition-all duration-300 text-center flex flex-col items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <IconComponent className={`h-8 w-8 mb-2 ${item.color}`} />
                  <p className="font-semibold text-primary-custom">{item.label}</p>
                  <p className="text-sm text-secondary-custom">+{item.amount}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default WaterTrackerPage;