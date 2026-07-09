import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, Minus } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useHealthData } from '../../hooks/useHealthData';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { useStreak } from '../../contexts/StreakContext';

const WaterTracker: React.FC = () => {
  const [waterIntake, setWaterIntake] = useState(0);
  const [animateWater, setAnimateWater] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const { t } = useLanguage();
  const { user } = useSupabaseAuth();
  const { getWaterIntake, updateWaterIntake } = useHealthData();
  const { addActivity } = useStreak();
  const waterGoal = 8;
  const percentage = (waterIntake / waterGoal) * 100;

  // Load water intake data
  useEffect(() => {
    const loadWaterData = async () => {
      if (!user) return;
      
      try {
        const data = await getWaterIntake();
        if (data) {
          setWaterIntake(data.glasses_consumed);
        }
      } catch (error) {
        console.error('Error loading water data:', error);
        // Fallback to localStorage for offline support
        const today = new Date().toISOString().split('T')[0];
        const savedData = localStorage.getItem('water_tracker_data');
        
        if (savedData) {
          const data = JSON.parse(savedData);
          if (data.date === today) {
            setWaterIntake(data.intake);
          }
        }
      }
    };

    loadWaterData();
  }, [user, getWaterIntake]);

  // Save data to Supabase and localStorage as backup
  const saveWaterData = async (newIntake: number) => {
    try {
      if (user) {
        await updateWaterIntake(newIntake);
      }
      
      // Also save to localStorage as backup
      const today = new Date().toISOString().split('T')[0];
      const data = {
        date: today,
        intake: newIntake,
        goal: waterGoal,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('water_tracker_data', JSON.stringify(data));
      
      // Show save animation
      setShowSaveAnimation(true);
      setTimeout(() => setShowSaveAnimation(false), 2000);
      
      // Track activity for streak if goal reached
      if (newIntake >= waterGoal && waterIntake < waterGoal) {
        addActivity('water_goal');
      }
    } catch (error) {
      console.error('Error saving water data:', error);
      // Still save to localStorage if Supabase fails
      const today = new Date().toISOString().split('T')[0];
      const data = {
        date: today,
        intake: newIntake,
        goal: waterGoal,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('water_tracker_data', JSON.stringify(data));
    }
  };

  const addWater = async () => {
    if (waterIntake < waterGoal + 4) {
      const newIntake = waterIntake + 1;
      setWaterIntake(newIntake);
      await saveWaterData(newIntake);
      setAnimateWater(true);
      setTimeout(() => setAnimateWater(false), 500);
    }
  };

  const removeWater = async () => {
    if (waterIntake > 0) {
      const newIntake = waterIntake - 1;
      setWaterIntake(newIntake);
      await saveWaterData(newIntake);
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-2xl p-6 shadow-lg border border-sky-100 dark:border-sky-800/30 transition-colors duration-300 relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">{t('waterIntake')} 💧</h3>
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={removeWater}
            className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Minus className="h-4 w-4" />
          </motion.button>
          <motion.button
            onClick={addWater}
            className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <motion.div
            className="w-24 h-32 border-4 border-blue-300 dark:border-blue-600 rounded-b-full rounded-t-2xl relative overflow-hidden transition-colors duration-300"
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
              className="absolute top-2 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Droplets className="h-4 w-4 text-blue-500 dark:text-blue-400 transition-colors duration-300" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">
          {waterIntake}/{waterGoal}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('glasses')}</p>
        {waterIntake >= waterGoal && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 text-green-600 dark:text-green-400 font-semibold text-sm transition-colors duration-300"
          >
            🎉 Goal {t('completed')}!
          </motion.div>
        )}
      </div>

      {/* Save Animation */}
      {showSaveAnimation && (
        <motion.div
          className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium"
          initial={{ opacity: 0, scale: 0, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: -10 }}
        >
          ✓ Saved
        </motion.div>
      )}
    </motion.div>
  );
};

export default WaterTracker;